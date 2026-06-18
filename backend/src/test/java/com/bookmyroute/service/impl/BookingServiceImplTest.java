package com.bookmyroute.service.impl;

import com.bookmyroute.dto.request.BookingSearchRequest;
import com.bookmyroute.dto.response.PagedResponse;
import com.bookmyroute.entity.Booking;
import com.bookmyroute.entity.Bus;
import com.bookmyroute.entity.Route;
import com.bookmyroute.entity.Schedule;
import com.bookmyroute.entity.User;
import com.bookmyroute.enums.BookingStatus;
import com.bookmyroute.exception.BusinessException;
import com.bookmyroute.repository.BookingRepository;
import com.bookmyroute.repository.BookingSeatRepository;
import com.bookmyroute.repository.PaymentRepository;
import com.bookmyroute.repository.RouteReviewRepository;
import com.bookmyroute.repository.ScheduleRepository;
import com.bookmyroute.repository.SeatRepository;
import com.bookmyroute.repository.UserRepository;
import com.bookmyroute.service.EmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ScheduleRepository scheduleRepository;

    @Mock
    private SeatRepository seatRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private RouteReviewRepository routeReviewRepository;

    @Mock
    private BookingSeatRepository bookingSeatRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private BookingServiceImpl bookingService;

    @Test
    void searchMyBookingsAppliesOwnerStatusDateRangeAndPagination() {
        User user = user(7L, "passenger@example.com");
        Booking booking = booking(user, BookingStatus.CONFIRMED);
        BookingSearchRequest request = new BookingSearchRequest(
                BookingStatus.CONFIRMED,
                LocalDate.of(2026, 5, 1),
                LocalDate.of(2026, 5, 20),
                1,
                5,
                "departureTime",
                "asc"
        );

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(bookingRepository.findMyBookings(
                eq(7L),
                eq(BookingStatus.CONFIRMED),
                eq(LocalDateTime.of(2026, 5, 1, 0, 0)),
                any(LocalDateTime.class),
                any(Pageable.class)
        )).thenReturn(new PageImpl<>(List.of(booking)));
        when(routeReviewRepository.findByBookingId(booking.getId())).thenReturn(Optional.empty());

        PagedResponse<?> response = bookingService.searchMyBookings(request, user.getEmail());

        assertThat(response.getContent()).hasSize(1);
        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        ArgumentCaptor<LocalDateTime> toCaptor = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(bookingRepository).findMyBookings(
                eq(7L),
                eq(BookingStatus.CONFIRMED),
                eq(LocalDateTime.of(2026, 5, 1, 0, 0)),
                toCaptor.capture(),
                pageableCaptor.capture()
        );
        assertThat(toCaptor.getValue().toLocalDate()).isEqualTo(LocalDate.of(2026, 5, 20));
        assertThat(pageableCaptor.getValue().getPageNumber()).isEqualTo(1);
        assertThat(pageableCaptor.getValue().getPageSize()).isEqualTo(5);
        assertThat(pageableCaptor.getValue().getSort().getOrderFor("schedule.departureTime")).isNotNull();
    }

    @Test
    void searchMyBookingsRejectsDateRangeWhenFromDateIsAfterToDate() {
        User user = user(7L, "passenger@example.com");
        BookingSearchRequest request = new BookingSearchRequest(
                null,
                LocalDate.of(2026, 5, 21),
                LocalDate.of(2026, 5, 20),
                0,
                10,
                "bookedAt",
                "desc"
        );

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> bookingService.searchMyBookings(request, user.getEmail()))
                .isInstanceOf(BusinessException.class)
                .hasMessage("From date cannot be after to date");
        verifyNoInteractions(routeReviewRepository);
    }

    private User user(Long id, String email) {
        User user = new User();
        user.setId(id);
        user.setName("Passenger One");
        user.setEmail(email);
        return user;
    }

    private Booking booking(User user, BookingStatus status) {
        Route route = new Route();
        route.setId(12L);
        route.setOrigin("Pune");
        route.setDestination("Mumbai");

        Bus bus = new Bus();
        bus.setId(21L);
        bus.setBusName("BookMyRoute Express");

        Schedule schedule = new Schedule();
        schedule.setId(33L);
        schedule.setRoute(route);
        schedule.setBus(bus);
        schedule.setDepartureTime(LocalDateTime.of(2026, 5, 22, 9, 30));
        schedule.setArrivalTime(LocalDateTime.of(2026, 5, 22, 13, 30));

        Booking booking = new Booking();
        booking.setId(44L);
        booking.setUser(user);
        booking.setSchedule(schedule);
        booking.setBookingRef("BMR-20260520-00001");
        booking.setStatus(status);
        booking.setTotalAmount(BigDecimal.valueOf(1200));
        booking.setBookedAt(LocalDateTime.of(2026, 5, 20, 8, 0));
        return booking;
    }
}
