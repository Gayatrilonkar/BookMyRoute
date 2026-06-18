package com.bookmyroute.service.impl;

import com.bookmyroute.dto.request.BookingRequest;
import com.bookmyroute.dto.request.BookingSearchRequest;
import com.bookmyroute.dto.response.BookingResponse;
import com.bookmyroute.dto.response.EmailDeliveryResponse;
import com.bookmyroute.dto.response.PagedResponse;
import com.bookmyroute.entity.*;
import com.bookmyroute.enums.BookingStatus;
import com.bookmyroute.enums.PaymentStatus;
import com.bookmyroute.enums.SeatType;
import com.bookmyroute.exception.BusinessException;
import com.bookmyroute.exception.ResourceNotFoundException;
import com.bookmyroute.repository.*;
import com.bookmyroute.service.BookingService;
import com.bookmyroute.service.EmailService;
import com.bookmyroute.service.ScheduleService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class BookingServiceImpl implements BookingService {
    private static final AtomicLong SEQ = new AtomicLong(1);
    private static final int MAX_BOOKING_PAGE_SIZE = 50;
    private static final Map<String, String> BOOKING_SORT_FIELDS = Map.of(
            "bookedAt", "bookedAt",
            "departureTime", "schedule.departureTime",
            "totalAmount", "totalAmount",
            "status", "status",
            "bookingStatus", "status"
    );

    public BookingServiceImpl(BookingRepository bookingRepository,
                              ScheduleRepository scheduleRepository,
                              SeatRepository seatRepository,
                              UserRepository userRepository,
                              PaymentRepository paymentRepository,
                              RouteReviewRepository routeReviewRepository,
                              BookingSeatRepository bookingSeatRepository,
                              PickupLocationRepository pickupLocationRepository,
                              DropLocationRepository dropLocationRepository,
                              PickupSubLocationRepository pickupSubLocationRepository,
                              DropSubLocationRepository dropSubLocationRepository,
                              EmailService emailService,
                              ScheduleService scheduleService) {
        this.bookingRepository = bookingRepository;
        this.scheduleRepository = scheduleRepository;
        this.seatRepository = seatRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.routeReviewRepository = routeReviewRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.pickupLocationRepository = pickupLocationRepository;
        this.dropLocationRepository = dropLocationRepository;
        this.pickupSubLocationRepository = pickupSubLocationRepository;
        this.dropSubLocationRepository = dropSubLocationRepository;
        this.emailService = emailService;
        this.scheduleService = scheduleService;
    }

    private final BookingRepository bookingRepository;
    private final ScheduleRepository scheduleRepository;
    private final SeatRepository seatRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final RouteReviewRepository routeReviewRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final PickupLocationRepository pickupLocationRepository;
    private final DropLocationRepository dropLocationRepository;
    private final PickupSubLocationRepository pickupSubLocationRepository;
    private final DropSubLocationRepository dropSubLocationRepository;
    private final EmailService emailService;
    private final ScheduleService scheduleService;

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request, String userEmail) {
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

        validateRequestedSeats(schedule, request.getPassengers());

        PickupLocation pickupLocation = null;
        if (request.getPickupLocationId() != null) {
            pickupLocation = pickupLocationRepository.findById(request.getPickupLocationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Pickup Location", request.getPickupLocationId()));
        }

        DropLocation dropLocation = null;
        if (request.getDropLocationId() != null) {
            dropLocation = dropLocationRepository.findById(request.getDropLocationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Drop Location", request.getDropLocationId()));
        }

        PickupSubLocation pickupSubLoc = null;
        if (request.getPickupSubLocationId() != null) {
            pickupSubLoc = pickupSubLocationRepository.findById(request.getPickupSubLocationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Pickup SubLocation", request.getPickupSubLocationId()));
        }

        DropSubLocation dropSubLoc = null;
        if (request.getDropSubLocationId() != null) {
            dropSubLoc = dropSubLocationRepository.findById(request.getDropSubLocationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Drop SubLocation", request.getDropSubLocationId()));
        }

        List<BookingSeat> bookingSeats = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (BookingRequest.PassengerSeat ps : request.getPassengers()) {
            Seat seat = seatRepository.findById(ps.getSeatId())
                    .orElseThrow(() -> new ResourceNotFoundException("Seat", ps.getSeatId()));

            BookingSeat bs = BookingSeat.builder()
                    .seat(seat)
                    .passengerName(ps.getPassengerName())
                    .passengerAge(ps.getPassengerAge())
                    .passengerGender(ps.getPassengerGender())
                    .fare(calculateFare(schedule, seat))
                    .build();
            bookingSeats.add(bs);
            total = total.add(calculateFare(schedule, seat));
        }

        Booking booking = Booking.builder()
                .user(user)
                .schedule(schedule)
                .bookingRef(generateRef())
                .totalAmount(total)
                .status(BookingStatus.CONFIRMED)
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

        Payment payment = Payment.builder()
                .booking(booking)
                .paymentMethod(request.getPaymentMethod())
                .amount(total)
                .status(PaymentStatus.SUCCESS)
                .paidAt(LocalDateTime.now())
                .build();
        booking.setPayment(payment);

        schedule.setAvailableSeats(schedule.getAvailableSeats() - request.getPassengers().size());
        scheduleRepository.save(schedule);

        Booking saved = bookingRepository.save(booking);
        EmailDeliveryResponse emailDelivery = emailService.sendBookingConfirmation(saved);

        try {
            scheduleService.broadcastSeatUpdates(schedule.getId());
        } catch (Exception ignored) {
        }

        return toResponse(saved, emailDelivery);
    }

    @Override
    @Transactional
    public BookingResponse getBookingByRef(String bookingRef, String userEmail) {
        markPastBookingsCompleted();
        Booking booking = bookingRepository.findByBookingRef(bookingRef)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingRef));
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new BusinessException("Access denied to this booking");
        }
        return toResponse(booking);
    }

    @Override
    @Transactional
    public List<BookingResponse> getMyBookings(String userEmail) {
        markPastBookingsCompleted();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return bookingRepository.findAllByUserId(user.getId())
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public PagedResponse<BookingResponse> searchMyBookings(BookingSearchRequest request, String userEmail) {
        markPastBookingsCompleted();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        validateDateRange(request.getFromDate(), request.getToDate());

        Pageable pageable = buildBookingPageable(request);
        Page<Booking> bookings = bookingRepository.findMyBookings(
                user.getId(),
                request.getStatus(),
                startOfDay(request.getFromDate()),
                endOfDay(request.getToDate()),
                pageable
        );

        return new PagedResponse<>(
                bookings.getContent().stream().map(this::toResponse).toList(),
                bookings.getNumber(),
                bookings.getSize(),
                bookings.getTotalElements(),
                bookings.getTotalPages(),
                bookings.isLast()
        );
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(String bookingRef, String userEmail) {
        markPastBookingsCompleted();
        Booking booking = bookingRepository.findByBookingRef(bookingRef)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingRef));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new BusinessException("Access denied to this booking");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessException("Booking is already cancelled");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BusinessException("Completed bookings cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);

        Schedule schedule = booking.getSchedule();
        schedule.setAvailableSeats(schedule.getAvailableSeats() + booking.getBookingSeats().size());
        scheduleRepository.save(schedule);

        if (booking.getPayment() != null) {
            booking.getPayment().setStatus(PaymentStatus.REFUNDED);
        }

        Booking saved = bookingRepository.save(booking);
        EmailDeliveryResponse emailDelivery = emailService.sendBookingCancellation(saved);

        try {
            scheduleService.broadcastSeatUpdates(schedule.getId());
        } catch (Exception ignored) {
        }

        return toResponse(saved, emailDelivery);
    }

    @Override
    @Transactional
    public List<BookingResponse> getAllBookings() {
        markPastBookingsCompleted();
        return bookingRepository.findAll().stream().map(this::toResponse).toList();
    }

    private String generateRef() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "BMR-" + date + "-" + String.format("%05d", SEQ.getAndIncrement());
    }

    private void markPastBookingsCompleted() {
        bookingRepository.markPastBookingsCompleted(
                List.of(BookingStatus.CONFIRMED, BookingStatus.PENDING),
                BookingStatus.COMPLETED,
                LocalDateTime.now()
        );
    }

    private void validateDateRange(LocalDate fromDate, LocalDate toDate) {
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new BusinessException("From date cannot be after to date");
        }
    }

    private void validateRequestedSeats(Schedule schedule, List<BookingRequest.PassengerSeat> passengers) {
        Set<Long> seenSeatIds = new HashSet<>();
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
        }
    }

    private BigDecimal calculateFare(Schedule schedule, Seat seat) {
        return schedule.getBaseFare();
    }

    private LocalDateTime startOfDay(LocalDate date) {
        return date == null ? null : date.atStartOfDay();
    }

    private LocalDateTime endOfDay(LocalDate date) {
        return date == null ? null : date.atTime(LocalTime.MAX);
    }

    private Pageable buildBookingPageable(BookingSearchRequest request) {
        int safePage = Math.max(request.getPage(), 0);
        int safeSize = Math.min(Math.max(request.getSize(), 1), MAX_BOOKING_PAGE_SIZE);
        String sortProperty = BOOKING_SORT_FIELDS.getOrDefault(request.getSortBy(), "bookedAt");
        Sort.Direction direction = "asc".equalsIgnoreCase(request.getSortDir()) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(safePage, safeSize, Sort.by(direction, sortProperty));
    }

    private BookingResponse toResponse(Booking b) {
        return toResponse(b, null);
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
                .pickupStopName(b.getPickupLocationName())
                .dropStopName(b.getDropLocationName())
                .pickupSubLocationName(b.getPickupSubLocationName())
                .dropSubLocationName(b.getDropSubLocationName())
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
