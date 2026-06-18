package com.bookmyroute.repository;

import com.bookmyroute.entity.DropLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DropLocationRepository extends JpaRepository<DropLocation, Long> {
    List<DropLocation> findByRouteIdOrderBySequenceOrderAsc(Long routeId);
}
