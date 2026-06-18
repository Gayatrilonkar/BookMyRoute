package com.bookmyroute.service.impl;

import com.bookmyroute.dto.request.BookingRequest;
import com.bookmyroute.dto.request.PaymentOrderRequest;
import com.bookmyroute.dto.request.PaymentVerifyRequest;
import com.bookmyroute.dto.response.BookingResponse;
import com.bookmyroute.dto.response.EmailDeliveryResponse;
import com.bookmyroute.dto.response.PaymentOrderResponse;
import com.bookmyroute.entity.*;
import com.bookmyroute.enums.BookingStatus;
import com.bookmyroute.enums.PaymentStatus;
import com.bookmyroute.exception.BusinessException;
import com.bookmyroute.exception.ResourceNotFoundException;
import com.bookmyroute.repository.*;
import com.bookmyroute.service.EmailService;
import com.bookmyroute.service.PaymentGatewayService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class PaymentGatewayServiceImpl implements PaymentGatewayService {

    private static final AtomicLong SEQ = new AtomicLong(1);

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.currency:INR}")
    private String currency;

    @Value("${razorpay.company.name:BookMyRoute}")
    private String companyName;

    private final RazorpayClient razorpayClient;
    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final RouteReviewRepository routeReviewRepository;
    private final EmailService emailService;
    private final PickupLocationRepository pickupLocationRepository;
    private final DropLocationRepository dropLocationRepository;
    private final PickupSubLocationRepository pickupSubLocationRepository;
    private final DropSubLocationRepository dropSubLocationRepository;

    public PaymentGatewayServiceImpl(RazorpayClient razorpayClient,
                                     UserRepository userRepository,
                                     ScheduleRepository scheduleRepository,
                                     SeatRepository seatRepository,
                                     BookingRepository bookingRepository,
                                     PaymentRepository paymentRepository,
                                     BookingSeatRepository bookingSeatRepository,
                                     RouteReviewRepository routeReviewRepository,
                                     EmailService emailService,
                                     PickupLocationRepository pickupLocationRepository,
                                     DropLocationRepository dropLocationRepository,
                                     PickupSubLocationRepository pickupSubLocationRepository,
                                     DropSubLocationRepository dropSubLocationRepository) {
        this.razorpayClient = razorpayClient;
        this.userRepository = userRepository;
        this.scheduleRepository = scheduleRepository;
        this.seatRepository = seatRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.routeReviewRepository = routeReviewRepository;
        this.emailService = emailService;
        this.pickupLocationRepository = pickupLocationRepository;
        this.dropLocationRepository = dropLocationRepository;
        this.pickupSubLocationRepository = pickupSubLocationRepository;
        this.dropSubLocationRepository = dropSubLocationRepository;
    }

    // ── 1. Create Razorpay Order ──────────────────────────────────────────

    @Override
    @Transactional
    public PaymentOrderResponse createOrder(PaymentOrderRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Schedule schedule = scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Schedule", request.getScheduleId()));

        if (!schedule.getIsActive()) {
            throw new BusinessException("Schedule is no longer active");
        }
        if (schedule.getAvailableSeats() < request.getPassengers().size()) {
            throw new BusinessException("Not enough seats available");
        }

        List<Seat> requestedSeats = validateRequestedSeats(schedule, request.getPassengers());
        BigDecimal total = requestedSeats.stream()
                .map(seat -> calculateFare(schedule, seat))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String origin      = schedule.getRoute().getOrigin();
        String destination = schedule.getRoute().getDestination();
        String custName    = user.getName();
        String custEmail   = user.getEmail();
        String custPhone   = user.getPhone() != null ? user.getPhone() : "";

        // Verify stops
        PickupLocation pickupLocation = null;
        if (request.getPickupLocationId() != null) {
            pickupLocation = pickupLocationRepository.findById(request.getPickupLocationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Pickup Location", request.getPickupLocationId()));
            if (!pickupLocation.getRoute().getId().equals(schedule.getRoute().getId())) {
                throw new BusinessException("Pickup location does not belong to this route");
            }
        }

        DropLocation dropLocation = null;
        if (request.getDropLocationId() != null) {
            dropLocation = dropLocationRepository.findById(request.getDropLocationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Drop Location", request.getDropLocationId()));
            if (!dropLocation.getRoute().getId().equals(schedule.getRoute().getId())) {
                throw new BusinessException("Drop location does not belong to this route");
            }
        }

        PickupSubLocation pickupSubLoc = null;
        if (request.getPickupSubLocationId() != null) {
            pickupSubLoc = pickupSubLocationRepository.findById(request.getPickupSubLocationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Pickup SubLocation", request.getPickupSubLocationId()));
            if (pickupLocation != null && !pickupSubLoc.getPickupLocation().getId().equals(pickupLocation.getId())) {
                throw new BusinessException("Pickup sub location does not belong to the selected pickup location");
            }
        }

        DropSubLocation dropSubLoc = null;
        if (request.getDropSubLocationId() != null) {
            dropSubLoc = dropSubLocationRepository.findById(request.getDropSubLocationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Drop SubLocation", request.getDropSubLocationId()));
            if (dropLocation != null && !dropSubLoc.getDropLocation().getId().equals(dropLocation.getId())) {
                throw new BusinessException("Drop sub location does not belong to the selected drop location");
            }
        }

        String orderId;
        if (razorpayKeyId.startsWith("rzp_test_T2Lz")) {
             // local mock bypass
             orderId = "order_mock_" + System.currentTimeMillis();
        } else {
             try {
                 JSONObject orderRequest = new JSONObject();
                 orderRequest.put("amount", total.multiply(BigDecimal.valueOf(100)).intValue()); // amount in the smallest currency unit
                 orderRequest.put("currency", currency);
                 orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

                 Order order = razorpayClient.orders.create(orderRequest);
                 orderId = order.get("id");
             } catch (RazorpayException e) {
                 throw new BusinessException("Failed to create Razorpay Order: " + e.getMessage());
             }
        }

        // Create PENDING_PAYMENT booking
        List<BookingSeat> bookingSeats = new ArrayList<>();
        for (int i = 0; i < request.getPassengers().size(); i++) {
            BookingRequest.PassengerSeat ps = request.getPassengers().get(i);
            Seat seat = requestedSeats.get(i);
            BigDecimal fare = calculateFare(schedule, seat);

            BookingSeat bs = BookingSeat.builder()
                    .seat(seat)
                    .passengerName(ps.getPassengerName())
                    .passengerAge(ps.getPassengerAge())
                    .passengerGender(ps.getPassengerGender())
                    .fare(fare)
                    .build();
            bookingSeats.add(bs);
        }

        Booking booking = Booking.builder()
                .user(user)
                .schedule(schedule)
                .bookingRef(generateRef())
                .totalAmount(total)
                .status(BookingStatus.PENDING_PAYMENT)
                .pickupLocation(pickupLocation)
                .dropLocation(dropLocation)
                .pickupSubLocation(pickupSubLoc)
                .dropSubLocation(dropSubLoc)
                .pickupLocationName(pickupLocation != null ? pickupLocation.getPickupName() : null)
                .dropLocationName(dropLocation != null ? dropLocation.getDropName() : null)
                .pickupSubLocationName(pickupSubLoc != null ? pickupSubLoc.getSubLocationName() : null)
                .dropSubLocationName(dropSubLoc != null ? dropSubLoc.getSubLocationName() : null)
                .build();

        bookingSeats.forEach(bs -> bs.setBooking(booking));
        booking.setBookingSeats(bookingSeats);

        // We don't create Payment record yet, until verification. Or we create it as PENDING.
        Payment payment = Payment.builder()
                .booking(booking)
                .paymentMethod(null) // Not known yet
                .razorpayOrderId(orderId)
                .userEmail(custEmail)
                .amount(total)
                .status(PaymentStatus.PENDING)
                .build();
        booking.setPayment(payment);

        bookingRepository.save(booking);

        return PaymentOrderResponse.builder()
                .orderId(orderId)
                .amount(total)
                .currency(currency)
                .keyId(razorpayKeyId)
                .companyName(companyName)
                .customerName(custName)
                .customerEmail(custEmail)
                .customerPhone(custPhone)
                .description(origin + " → " + destination)
                .build();
    }

    // ── 2. Verify Signature & Confirm Booking ─────────────────────────────

    @Override
    @Transactional
    public BookingResponse verifyAndConfirm(PaymentVerifyRequest request, String userEmail) {
        
        // Find the pending payment by Razorpay Order ID
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new BusinessException("Payment order not found"));
                
        Booking booking = payment.getBooking();
        
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new BusinessException("Access denied");
        }
        
        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new BusinessException("Booking is not in a pending payment state");
        }

        // 2a. Verify Razorpay signature
        if (!request.getRazorpayOrderId().startsWith("order_mock_")) {
            if (!verifySignature(request.getRazorpayOrderId(), request.getRazorpayPaymentId(), request.getRazorpaySignature())) {
                booking.setStatus(BookingStatus.FAILED_PAYMENT);
                payment.setStatus(PaymentStatus.FAILED);
                bookingRepository.save(booking);
                throw new BusinessException("Payment verification failed – invalid signature");
            }
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setTransactionId(request.getRazorpayPaymentId());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaidAt(LocalDateTime.now());

        Schedule schedule = booking.getSchedule();
        schedule.setAvailableSeats(schedule.getAvailableSeats() - booking.getBookingSeats().size());
        scheduleRepository.save(schedule);

        Booking saved = bookingRepository.save(booking);
        EmailDeliveryResponse emailDelivery = emailService.sendBookingConfirmation(saved);
        return toResponse(saved, emailDelivery);
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String generated = HexFormat.of().formatHex(hash);
            return generated.equals(signature);
        } catch (Exception e) {
            return false;
        }
    }

    private String generateRef() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "BMR-" + date + "-" + String.format("%05d", SEQ.getAndIncrement());
    }

    private List<Seat> validateRequestedSeats(Schedule schedule, List<BookingRequest.PassengerSeat> passengers) {
        Set<Long> seenSeatIds = new HashSet<>();
        List<Seat> requestedSeats = new ArrayList<>();
        for (BookingRequest.PassengerSeat passenger : passengers) {
            Long seatId = passenger.getSeatId();
            if (!seenSeatIds.add(seatId)) {
                throw new BusinessException("Seat selected more than once");
            }

            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new ResourceNotFoundException("Seat", seatId));
            if (!seat.getBus().getId().equals(schedule.getBus().getId())) {
                throw new BusinessException("Seat does not belong to this bus");
            }
            if (bookingSeatRepository.existsActiveBookingForSeat(schedule.getId(), seatId)) {
                throw new BusinessException("Seat " + seat.getSeatNumber() + " is already booked");
            }
            requestedSeats.add(seat);
        }
        return requestedSeats;
    }

    private BigDecimal calculateFare(Schedule schedule, Seat seat) {
        return schedule.getBaseFare();
    }

    private BookingResponse toResponse(Booking b, EmailDeliveryResponse emailDelivery) {
        List<BookingResponse.SeatDetail> seats = b.getBookingSeats().stream()
                .map(bs -> BookingResponse.SeatDetail.builder()
                        .seatNumber(bs.getSeat().getSeatNumber())
                        .seatType(bs.getSeat().getSeatType())
                        .passengerName(bs.getPassengerName())
                        .passengerAge(bs.getPassengerAge())
                        .fare(bs.getFare())
                        .build())
                .toList();

        Payment pay = b.getPayment();
        RouteReview review = routeReviewRepository.findByBookingId(b.getId()).orElse(null);

        return BookingResponse.builder()
                .bookingId(b.getId())
                .bookingRef(b.getBookingRef())
                .routeId(b.getSchedule().getRoute().getId())
                .customerName(b.getUser().getName())
                .customerEmail(b.getUser().getEmail())
                .origin(b.getSchedule().getRoute().getOrigin())
                .destination(b.getSchedule().getRoute().getDestination())
                .departureTime(b.getSchedule().getDepartureTime())
                .arrivalTime(b.getSchedule().getArrivalTime())
                .busName(b.getSchedule().getBus().getBusName())
                .totalAmount(b.getTotalAmount())
                .bookingStatus(b.getStatus())
                .paymentStatus(pay != null ? pay.getStatus() : null)
                .paymentMethod(pay != null ? pay.getPaymentMethod() : null)
                .bookedAt(b.getBookedAt())
                .seats(seats)
                .canReview(b.getStatus() == BookingStatus.COMPLETED && review == null)
                .reviewed(review != null)
                .reviewId(review != null ? review.getReviewId() : null)
                .notificationEmailSent(emailDelivery != null ? emailDelivery.isSent() : null)
                .notificationEmailMessage(emailDelivery != null ? emailDelivery.getMessage() : null)
                .build();
    }
}
