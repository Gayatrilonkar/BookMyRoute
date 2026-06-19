package com.bookmyroute.repository;

import com.bookmyroute.entity.PassengerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PassengerProfileRepository extends JpaRepository<PassengerProfile, Long> {

    List<PassengerProfile> findByUserEmailOrderByCreatedAtDesc(String email);

    @Modifying
    @Query("UPDATE PassengerProfile p SET p.isDefault = false WHERE p.user.id = :userId")
    void resetDefaultFlagForUser(Long userId);
}
