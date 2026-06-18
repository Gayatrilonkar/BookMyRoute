package com.bookmyroute.repository;

import com.bookmyroute.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Google OAuth
    Optional<User> findByGoogleSub(String googleSub);

    // Used by AdminServiceImpl.getDashboard()
    long countByIsActiveTrue();
    long countByCreatedAtAfter(java.time.LocalDateTime date);
}