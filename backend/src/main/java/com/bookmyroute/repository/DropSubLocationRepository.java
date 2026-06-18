package com.bookmyroute.repository;

import com.bookmyroute.entity.DropSubLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DropSubLocationRepository extends JpaRepository<DropSubLocation, Long> {
}
