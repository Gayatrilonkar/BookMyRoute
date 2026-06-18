package com.bookmyroute.service.impl;

import com.bookmyroute.dto.request.AdminRouteRequest;
import com.bookmyroute.dto.request.AdminScheduleRequest;
import com.bookmyroute.dto.request.AdminUserUpdateRequest;
import com.bookmyroute.dto.response.AdminBusResponse;
import com.bookmyroute.dto.response.AdminDashboardResponse;
import com.bookmyroute.dto.response.AdminRouteResponse;
import com.bookmyroute.dto.response.AdminScheduleResponse;
import com.bookmyroute.dto.response.AdminUserResponse;
import com.bookmyroute.dto.response.BookingResponse;
import com.bookmyroute.dto.response.EmailDeliveryResponse;
import com.bookmyroute.entity.Bus;
import com.bookmyroute.entity.Booking;
import com.bookmyroute.entity.Payment;
import com.bookmyroute.entity.Route;
import com.bookmyroute.entity.PickupLocation;
import com.bookmyroute.entity.PickupSubLocation;
import com.bookmyroute.entity.DropLocation;
import com.bookmyroute.entity.DropSubLocation;
import com.bookmyroute.entity.Schedule;
import com.bookmyroute.entity.User;
import com.bookmyroute.enums.BookingStatus;
import com.bookmyroute.enums.PaymentStatus;
import com.bookmyroute.enums.Role;
import com.bookmyroute.exception.BusinessException;
import com.bookmyroute.exception.ResourceNotFoundException;
import com.bookmyroute.repository.BookingRepository;
import com.bookmyroute.repository.BusRepository;
import com.bookmyroute.repository.PaymentRepository;
import com.bookmyroute.repository.RouteRepository;
import com.bookmyroute.repository.ScheduleRepository;
import com.bookmyroute.repository.UserRepository;
import com.bookmyroute.service.AdminService;
import com.bookmyroute.service.EmailService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;
    private final ScheduleRepository scheduleRepository;
    private final EmailService emailService;
    private final com.bookmyroute.repository.SystemSettingRepository systemSettingRepository;
    private final com.bookmyroute.repository.AdminActionLogRepository adminActionLogRepository;

    public AdminServiceImpl(UserRepository userRepository,
                            BookingRepository bookingRepository,
                            PaymentRepository paymentRepository,
                            BusRepository busRepository,
                            RouteRepository routeRepository,
                            ScheduleRepository scheduleRepository,
                            EmailService emailService,
                            com.bookmyroute.repository.SystemSettingRepository systemSettingRepository,
                            com.bookmyroute.repository.AdminActionLogRepository adminActionLogRepository) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.busRepository = busRepository;
        this.routeRepository = routeRepository;
        this.scheduleRepository = scheduleRepository;
        this.emailService = emailService;
        this.systemSettingRepository = systemSettingRepository;
        this.adminActionLogRepository = adminActionLogRepository;
    }

    @Override
    @Transactional
    public AdminDashboardResponse getDashboard() {
        markPastBookingsCompleted();
        AdminDashboardResponse response = new AdminDashboardResponse();
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfWeek = now.toLocalDate().minusDays(now.getDayOfWeek().getValue() - 1).atStartOfDay();
        LocalDateTime startOfMonth = now.toLocalDate().withDayOfMonth(1).atStartOfDay();
        LocalDateTime startOfYear = now.toLocalDate().withDayOfYear(1).atStartOfDay();

        // User Analytics
        response.setTotalUsers(userRepository.count());
        response.setActiveUsers(userRepository.countByIsActiveTrue());
        response.setNewUsersToday(userRepository.countByCreatedAtAfter(startOfDay));
        response.setNewUsersThisMonth(userRepository.countByCreatedAtAfter(startOfMonth));

        // Booking Analytics
        response.setTotalBookings(bookingRepository.count());
        response.setTodaysBookings(bookingRepository.countByBookedAtBetween(startOfDay, now));
        response.setMonthlyBookings(bookingRepository.countByBookedAtBetween(startOfMonth, now));
        response.setCancelledBookings(bookingRepository.countByStatus(BookingStatus.CANCELLED));
        response.setCompletedBookings(bookingRepository.countByStatus(BookingStatus.COMPLETED));

        // Revenue Analytics
        response.setTodaysRevenue(calculateRevenueBetween(startOfDay, now));
        response.setWeeklyRevenue(calculateRevenueBetween(startOfWeek, now));
        response.setMonthlyRevenue(calculateRevenueBetween(startOfMonth, now));
        response.setYearlyRevenue(calculateRevenueBetween(startOfYear, now));
        response.setTotalRevenue(calculateRevenueBetween(null, null));

        // Operation Analytics
        response.setActiveBuses(busRepository.countByIsActiveTrue());
        response.setTotalRoutes(routeRepository.count());
        response.setActiveSchedules(scheduleRepository.countByIsActiveTrue());
        
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminBusResponse> getBuses(Boolean active) {
        return busRepository.findAll().stream()
                .filter(bus -> active == null || bus.getIsActive().equals(active))
                .map(this::toBusResponse)
                .toList();
    }

    @Override
    @Transactional
    public AdminBusResponse createBus(com.bookmyroute.dto.request.AdminBusRequest request) {
        if (busRepository.existsByBusNumber(request.getBusNumber())) {
            throw new com.bookmyroute.exception.BusinessException("Bus number already exists: " + request.getBusNumber());
        }

        Bus bus = Bus.builder()
                .busNumber(request.getBusNumber())
                .busName(request.getBusName())
                .busType(request.getBusType())
                .totalSeats(request.getTotalSeats())
                .amenities(request.getAmenities())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return toBusResponse(busRepository.save(bus));
    }

    @Override
    @Transactional
    public AdminBusResponse updateBus(Long busId, com.bookmyroute.dto.request.AdminBusRequest request) {
        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new com.bookmyroute.exception.ResourceNotFoundException("Bus", busId));

        if (!bus.getBusNumber().equalsIgnoreCase(request.getBusNumber()) &&
                busRepository.existsByBusNumber(request.getBusNumber())) {
            throw new com.bookmyroute.exception.BusinessException("Bus number already exists: " + request.getBusNumber());
        }

        bus.setBusNumber(request.getBusNumber());
        bus.setBusName(request.getBusName());
        bus.setBusType(request.getBusType());
        bus.setTotalSeats(request.getTotalSeats());
        bus.setAmenities(request.getAmenities());
        
        if (request.getIsActive() != null) {
            bus.setIsActive(request.getIsActive());
        }

        return toBusResponse(busRepository.save(bus));
    }

    @Override
    @Transactional
    public AdminBusResponse toggleBusStatus(Long busId) {
        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new com.bookmyroute.exception.ResourceNotFoundException("Bus", busId));
        
        bus.setIsActive(!bus.getIsActive());
        return toBusResponse(busRepository.save(bus));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminRouteResponse> getRoutes() {
        return routeRepository.findAll().stream()
                .map(this::toRouteResponse)
                .toList();
    }

    @Override
    @Transactional
    public AdminRouteResponse createRoute(AdminRouteRequest request) {
        Route route = Route.builder()
                .origin(request.getOrigin())
                .destination(request.getDestination())
                .distanceKm(request.getDistanceKm())
                .durationMins(request.getDurationMins())
                .isActive(request.getIsActive())
                .build();
        
        mapPickupDropLocations(route, request.getPickupLocations(), request.getDropLocations());

        return toRouteResponse(routeRepository.save(route));
    }

    @Override
    @Transactional
    public AdminRouteResponse updateRoute(Long routeId, AdminRouteRequest request) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route", routeId));
        route.setOrigin(request.getOrigin());
        route.setDestination(request.getDestination());
        route.setDistanceKm(request.getDistanceKm());
        route.setDurationMins(request.getDurationMins());
        if (request.getIsActive() != null) {
            route.setIsActive(request.getIsActive());
        }
        
        route.getPickupLocations().clear();
        route.getDropLocations().clear();
        mapPickupDropLocations(route, request.getPickupLocations(), request.getDropLocations());
        
        return toRouteResponse(routeRepository.save(route));
    }

    @Override
    @Transactional
    public void deleteRoute(Long routeId) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route", routeId));
        routeRepository.delete(route);
    }

    private void mapPickupDropLocations(Route route, 
            List<AdminRouteRequest.PickupLocationRequest> pickups,
            List<AdminRouteRequest.DropLocationRequest> drops) {
        if (pickups != null) {
            for (AdminRouteRequest.PickupLocationRequest pReq : pickups) {
                PickupLocation p = new PickupLocation();
                p.setPickupName(pReq.getPickupName());
                p.setPickupAddress(pReq.getPickupAddress());
                p.setLandmark(pReq.getLandmark());
                p.setPickupTime(pReq.getPickupTime());
                p.setSequenceOrder(pReq.getSequenceOrder());
                
                if (pReq.getSubLocations() != null) {
                    for (AdminRouteRequest.SubLocationRequest subReq : pReq.getSubLocations()) {
                        PickupSubLocation sub = new PickupSubLocation();
                        sub.setSubLocationName(subReq.getSubLocationName());
                        sub.setSequenceOrder(subReq.getSequenceOrder());
                        p.addSubLocation(sub);
                    }
                }
                route.addPickupLocation(p);
            }
        }

        if (drops != null) {
            for (AdminRouteRequest.DropLocationRequest dReq : drops) {
                DropLocation d = new DropLocation();
                d.setDropName(dReq.getDropName());
                d.setDropAddress(dReq.getDropAddress());
                d.setLandmark(dReq.getLandmark());
                d.setDropTime(dReq.getDropTime());
                d.setSequenceOrder(dReq.getSequenceOrder());
                
                if (dReq.getSubLocations() != null) {
                    for (AdminRouteRequest.SubLocationRequest subReq : dReq.getSubLocations()) {
                        DropSubLocation sub = new DropSubLocation();
                        sub.setSubLocationName(subReq.getSubLocationName());
                        sub.setSequenceOrder(subReq.getSequenceOrder());
                        d.addSubLocation(sub);
                    }
                }
                route.addDropLocation(d);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminScheduleResponse> getSchedules(Boolean active) {
        return scheduleRepository.findAdminSchedules(active).stream()
                .map(this::toScheduleResponse)
                .toList();
    }

    @Override
    @Transactional
    public AdminScheduleResponse createSchedule(AdminScheduleRequest request) {
        Bus bus = busRepository.findById(request.getBusId())
                .orElseThrow(() -> new ResourceNotFoundException("Bus", request.getBusId()));
        Route route = routeRepository.findById(request.getRouteId())
                .orElseThrow(() -> new ResourceNotFoundException("Route", request.getRouteId()));
        validateScheduleRequest(request, bus);

        List<Schedule> schedulesToSave = new java.util.ArrayList<>();
        LocalDateTime currentDep = request.getDepartureTime();
        LocalDateTime currentArr = request.getArrivalTime();
        
        long durationMins = java.time.Duration.between(currentDep, currentArr).toMinutes();

        String recType = request.getRecurrenceType() != null ? request.getRecurrenceType() : "NONE";
        java.time.LocalDate endDate = request.getRecurrenceEndDate() != null ? request.getRecurrenceEndDate() : currentDep.toLocalDate();

        while (!currentDep.toLocalDate().isAfter(endDate)) {
            if (scheduleRepository.hasConflict(bus.getId(), currentDep, currentArr, -1L)) {
                throw new BusinessException("Schedule conflict detected for bus on " + currentDep);
            }

            Schedule schedule = Schedule.builder()
                    .bus(bus)
                    .route(route)
                    .departureTime(currentDep)
                    .arrivalTime(currentArr)
                    .baseFare(request.getBaseFare())
                    .availableSeats(request.getAvailableSeats())
                    .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                    .build();
            
            schedulesToSave.add(schedule);

            if ("DAILY".equalsIgnoreCase(recType)) {
                currentDep = currentDep.plusDays(1);
            } else if ("WEEKLY".equalsIgnoreCase(recType)) {
                currentDep = currentDep.plusWeeks(1);
            } else {
                break;
            }
            currentArr = currentDep.plusMinutes(durationMins);
        }

        List<Schedule> saved = scheduleRepository.saveAll(schedulesToSave);
        return toScheduleResponse(saved.get(0));
    }

    @Override
    @Transactional
    public AdminScheduleResponse updateSchedule(Long scheduleId, AdminScheduleRequest request) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule", scheduleId));
        Bus bus = busRepository.findById(request.getBusId())
                .orElseThrow(() -> new ResourceNotFoundException("Bus", request.getBusId()));
        Route route = routeRepository.findById(request.getRouteId())
                .orElseThrow(() -> new ResourceNotFoundException("Route", request.getRouteId()));
        validateScheduleRequest(request, bus);

        if (scheduleRepository.hasConflict(bus.getId(), request.getDepartureTime(), request.getArrivalTime(), scheduleId)) {
            throw new BusinessException("Schedule conflict detected for bus on " + request.getDepartureTime());
        }

        schedule.setBus(bus);
        schedule.setRoute(route);
        schedule.setDepartureTime(request.getDepartureTime());
        schedule.setArrivalTime(request.getArrivalTime());
        schedule.setBaseFare(request.getBaseFare());
        schedule.setAvailableSeats(request.getAvailableSeats());
        schedule.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        return toScheduleResponse(scheduleRepository.save(schedule));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminUserResponse> getUsers(Role role, Boolean active) {
        return userRepository.findAll().stream()
                .filter(user -> role == null || user.getRole() == role)
                .filter(user -> active == null || user.getIsActive().equals(active))
                .map(this::toUserResponse)
                .toList();
    }

    @Override
    @Transactional
    public AdminUserResponse updateUser(Long userId, AdminUserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(user.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already registered: " + request.getEmail());
        }

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }

        return toUserResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public List<BookingResponse> getBookings(BookingStatus status, Long userId, LocalDateTime from, LocalDateTime to) {
        markPastBookingsCompleted();
        if (from != null && to != null && from.isAfter(to)) {
            throw new BusinessException("from must be before to");
        }
        return bookingRepository.findAdminBookings(status, userId, from, to).stream()
                .map(this::toBookingResponse)
                .toList();
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(String bookingRef) {
        markPastBookingsCompleted();
        Booking booking = bookingRepository.findByBookingRef(bookingRef)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingRef));

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

        return toBookingResponse(saved, emailDelivery);
    }

    private BigDecimal calculateRevenueBetween(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            return paymentRepository.findAllByStatus(PaymentStatus.SUCCESS).stream()
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        return paymentRepository.findAllByStatusAndPaidAtBetween(PaymentStatus.SUCCESS, start, end).stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void markPastBookingsCompleted() {
        bookingRepository.markPastBookingsCompleted(
                List.of(BookingStatus.CONFIRMED, BookingStatus.PENDING),
                BookingStatus.COMPLETED,
                LocalDateTime.now()
        );
    }

    private void validateScheduleRequest(AdminScheduleRequest request, Bus bus) {
        if (!request.getArrivalTime().isAfter(request.getDepartureTime())) {
            throw new BusinessException("Arrival time must be after departure time");
        }
        if (request.getAvailableSeats() > bus.getTotalSeats()) {
            throw new BusinessException("Available seats cannot exceed bus total seats");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.bookmyroute.entity.SystemSetting> getSettings() {
        return systemSettingRepository.findAll();
    }

    @Override
    @Transactional
    public List<com.bookmyroute.entity.SystemSetting> updateSettings(java.util.Map<String, String> settings) {
        settings.forEach((key, value) -> {
            com.bookmyroute.entity.SystemSetting setting = systemSettingRepository.findById(key)
                    .orElseGet(() -> {
                        com.bookmyroute.entity.SystemSetting s = new com.bookmyroute.entity.SystemSetting();
                        s.setSettingKey(key);
                        return s;
                    });
            setting.setSettingValue(value);
            systemSettingRepository.save(setting);
        });
        return systemSettingRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.bookmyroute.entity.AdminActionLog> getLogs() {
        return adminActionLogRepository.findAll();
    }

    private AdminBusResponse toBusResponse(Bus bus) {
        AdminBusResponse response = new AdminBusResponse();
        response.setBusId(bus.getId());
        response.setBusNumber(bus.getBusNumber());
        response.setBusName(bus.getBusName());
        response.setBusType(bus.getBusType());
        response.setTotalSeats(bus.getTotalSeats());
        response.setAmenities(bus.getAmenities());
        response.setIsActive(bus.getIsActive());
        return response;
    }

    private AdminRouteResponse toRouteResponse(Route route) {
        AdminRouteResponse response = new AdminRouteResponse();
        response.setRouteId(route.getId());
        response.setOrigin(route.getOrigin());
        response.setDestination(route.getDestination());
        response.setDistanceKm(route.getDistanceKm());
        response.setDurationMins(route.getDurationMins());
        response.setIsActive(route.getIsActive());
        response.setCreatedAt(route.getCreatedAt());
        response.setUpdatedAt(route.getUpdatedAt());
        // Initialize lazy collections
        if (route.getPickupLocations() != null) {
            route.getPickupLocations().forEach(loc -> {
                if (loc.getSubLocations() != null) loc.getSubLocations().size();
            });
        }
        if (route.getDropLocations() != null) {
            route.getDropLocations().forEach(loc -> {
                if (loc.getSubLocations() != null) loc.getSubLocations().size();
            });
        }

        response.setPickupLocations(route.getPickupLocations());
        response.setDropLocations(route.getDropLocations());
        return response;
    }

    private AdminScheduleResponse toScheduleResponse(Schedule schedule) {
        AdminScheduleResponse response = new AdminScheduleResponse();
        response.setScheduleId(schedule.getId());
        response.setBusId(schedule.getBus().getId());
        response.setBusNumber(schedule.getBus().getBusNumber());
        response.setBusName(schedule.getBus().getBusName());
        response.setBusType(schedule.getBus().getBusType());
        response.setRouteId(schedule.getRoute().getId());
        response.setOrigin(schedule.getRoute().getOrigin());
        response.setDestination(schedule.getRoute().getDestination());
        response.setDepartureTime(schedule.getDepartureTime());
        response.setArrivalTime(schedule.getArrivalTime());
        response.setBaseFare(schedule.getBaseFare());
        response.setAvailableSeats(schedule.getAvailableSeats());
        response.setIsActive(schedule.getIsActive());
        return response;
    }

    private AdminUserResponse toUserResponse(User user) {
        AdminUserResponse response = new AdminUserResponse();
        response.setUserId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole());
        response.setIsActive(user.getIsActive());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }

    private BookingResponse toBookingResponse(Booking booking) {
        return toBookingResponse(booking, null);
    }

    private BookingResponse toBookingResponse(Booking booking, EmailDeliveryResponse emailDelivery) {
        Payment payment = booking.getPayment();
        return BookingResponse.builder()
                .bookingId(booking.getId())
                .bookingRef(booking.getBookingRef())
                .customerName(booking.getUser().getName())
                .customerEmail(booking.getUser().getEmail())
                .origin(booking.getSchedule().getRoute().getOrigin())
                .destination(booking.getSchedule().getRoute().getDestination())
                .pickupStopName(booking.getPickupLocationName())
                .dropStopName(booking.getDropLocationName())
                .pickupSubLocationName(booking.getPickupSubLocationName())
                .dropSubLocationName(booking.getDropSubLocationName())
                .departureTime(booking.getSchedule().getDepartureTime())
                .arrivalTime(booking.getSchedule().getArrivalTime())
                .busName(booking.getSchedule().getBus().getBusName())
                .totalAmount(booking.getTotalAmount())
                .bookingStatus(booking.getStatus())
                .paymentStatus(payment != null ? payment.getStatus() : null)
                .paymentMethod(payment != null ? payment.getPaymentMethod() : null)
                .bookedAt(booking.getBookedAt())
                .seats(booking.getBookingSeats().stream()
                        .map(seat -> BookingResponse.SeatDetail.builder()
                                .seatNumber(seat.getSeat().getSeatNumber())
                                .seatType(seat.getSeat().getSeatType())
                                .passengerName(seat.getPassengerName())
                                .passengerAge(seat.getPassengerAge())
                                .fare(seat.getFare())
                                .build())
                        .toList())
                .notificationEmailSent(emailDelivery != null ? emailDelivery.isSent() : null)
                .notificationEmailMessage(emailDelivery != null ? emailDelivery.getMessage() : null)
                .build();
    }
}
