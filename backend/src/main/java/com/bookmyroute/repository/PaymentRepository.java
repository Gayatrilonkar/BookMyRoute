package com.bookmyroute.repository;

import com.bookmyroute.entity.Payment;
import com.bookmyroute.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBookingId(Long bookingId);
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    List<Payment> findAllByStatus(PaymentStatus status);
    List<Payment> findAllByStatusAndPaidAtBetween(PaymentStatus status, java.time.LocalDateTime start, java.time.LocalDateTime end);
}
