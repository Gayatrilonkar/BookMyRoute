package com.bookmyroute.repository;

import com.bookmyroute.entity.PickupSubLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PickupSubLocationRepository extends JpaRepository<PickupSubLocation, Long> {
}
