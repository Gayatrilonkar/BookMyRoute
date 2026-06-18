package com.bookmyroute.repository;

import com.bookmyroute.entity.OtpRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpRecordRepository extends JpaRepository<OtpRecord, Long> {
    Optional<OtpRecord> findTopByEmailAndPurposeOrderByCreatedAtDesc(String email, String purpose);
}
