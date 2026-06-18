package com.bookmyroute.repository;

import com.bookmyroute.entity.Bus;
import com.bookmyroute.enums.BusType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusRepository extends JpaRepository<Bus, Long> {
    Optional<Bus> findByBusNumber(String busNumber);
    boolean existsByBusNumber(String busNumber);
    List<Bus> findAllByIsActiveTrue();
    List<Bus> findAllByBusType(BusType busType);
    long countByIsActiveTrue();
}
