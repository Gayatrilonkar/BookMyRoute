package com.bookmyroute.repository;

import com.bookmyroute.entity.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {

    @Query("""
        SELECT bs FROM BookingSeat bs
        JOIN FETCH bs.seat
        WHERE bs.booking.schedule.id = :scheduleId
          AND bs.booking.status <> com.bookmyroute.enums.BookingStatus.CANCELLED
        """)
    List<BookingSeat> findConfirmedBookingSeatsBySchedule(@Param("scheduleId") Long scheduleId);

    @Query("""
        SELECT COUNT(bs) > 0 FROM BookingSeat bs
        WHERE bs.booking.schedule.id = :scheduleId
          AND bs.seat.id = :seatId
          AND bs.booking.status <> com.bookmyroute.enums.BookingStatus.CANCELLED
        """)
    boolean existsActiveBookingForSeat(@Param("scheduleId") Long scheduleId,
                                       @Param("seatId") Long seatId);

    @Query("SELECT COUNT(bs) > 0 FROM BookingSeat bs WHERE bs.seat.id = :seatId")
    boolean existsBySeatId(@Param("seatId") Long seatId);
}
