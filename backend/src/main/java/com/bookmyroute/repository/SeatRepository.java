package com.bookmyroute.repository;

import com.bookmyroute.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findAllByBusId(Long busId);

    @Query("""
        SELECT s FROM Seat s
        WHERE s.bus.id = :busId
          AND s.id NOT IN (
              SELECT bs.seat.id FROM BookingSeat bs
              WHERE bs.booking.schedule.id = :scheduleId
                AND bs.booking.status <> com.bookmyroute.enums.BookingStatus.CANCELLED
          )
        """)
    List<Seat> findAvailableSeatsBySchedule(@Param("busId") Long busId,
                                             @Param("scheduleId") Long scheduleId);
}
