package com.bookmyroute.repository;

import com.bookmyroute.entity.Schedule;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    @Query("""
        SELECT s FROM Schedule s
        JOIN FETCH s.route r
        JOIN FETCH s.bus b
        WHERE s.departureTime BETWEEN :from AND :to
          AND s.isActive = true
          AND b.isActive = true
          AND s.availableSeats >= :seats
          AND (
               LOWER(r.origin) = LOWER(:origin) OR 
               EXISTS (SELECT 1 FROM PickupLocation pl WHERE pl.route = r AND LOWER(pl.pickupName) = LOWER(:origin)) OR
               EXISTS (SELECT 1 FROM PickupSubLocation psl JOIN psl.pickupLocation pl WHERE pl.route = r AND LOWER(psl.subLocationName) = LOWER(:origin)) OR
               EXISTS (SELECT 1 FROM DropLocation dl WHERE dl.route = r AND LOWER(dl.dropName) = LOWER(:origin)) OR
               EXISTS (SELECT 1 FROM DropSubLocation dsl JOIN dsl.dropLocation dl WHERE dl.route = r AND LOWER(dsl.subLocationName) = LOWER(:origin))
          )
          AND (
               LOWER(r.destination) = LOWER(:destination) OR 
               EXISTS (SELECT 1 FROM PickupLocation pl WHERE pl.route = r AND LOWER(pl.pickupName) = LOWER(:destination)) OR
               EXISTS (SELECT 1 FROM PickupSubLocation psl JOIN psl.pickupLocation pl WHERE pl.route = r AND LOWER(psl.subLocationName) = LOWER(:destination)) OR
               EXISTS (SELECT 1 FROM DropLocation dl WHERE dl.route = r AND LOWER(dl.dropName) = LOWER(:destination)) OR
               EXISTS (SELECT 1 FROM DropSubLocation dsl JOIN dsl.dropLocation dl WHERE dl.route = r AND LOWER(dsl.subLocationName) = LOWER(:destination))
          )
        ORDER BY s.departureTime
        """)
    List<Schedule> searchSchedules(@Param("origin")      String origin,
                                   @Param("destination") String destination,
                                   @Param("from")        LocalDateTime from,
                                   @Param("to")          LocalDateTime to,
                                   @Param("seats")       int seats);

    List<Schedule> findAllByBusId(Long busId);

    long countByIsActiveTrue();

    @Query("""
        SELECT s FROM Schedule s
        JOIN FETCH s.bus
        JOIN FETCH s.route
        WHERE (:active IS NULL OR s.isActive = :active)
        ORDER BY s.departureTime DESC
        """)
    List<Schedule> findAdminSchedules(@Param("active") Boolean active);

    @Query("""
        SELECT s FROM Schedule s
        JOIN FETCH s.bus b
        JOIN FETCH s.route r
        WHERE s.isActive = true
          AND b.isActive = true
          AND s.departureTime >= :from
        ORDER BY s.departureTime
        """)
    List<Schedule> findUpcomingActiveSchedules(@Param("from") LocalDateTime from, Pageable pageable);

    @Query("""
        SELECT COUNT(s) > 0 FROM Schedule s
        WHERE s.bus.id = :busId
          AND s.isActive = true
          AND s.id != :excludeScheduleId
          AND s.departureTime < :newArrival
          AND s.arrivalTime > :newDeparture
        """)
    boolean hasConflict(@Param("busId") Long busId,
                        @Param("newDeparture") LocalDateTime newDeparture,
                        @Param("newArrival") LocalDateTime newArrival,
                        @Param("excludeScheduleId") Long excludeScheduleId);

    @Query("""
        SELECT COUNT(s) > 0 FROM Schedule s
        WHERE s.bus.id = :busId
          AND s.isActive = true
          AND s.departureTime < :newArrival
          AND s.arrivalTime > :newDeparture
        """)
    boolean hasConflictNew(@Param("busId") Long busId,
                           @Param("newDeparture") LocalDateTime newDeparture,
                           @Param("newArrival") LocalDateTime newArrival);
}
