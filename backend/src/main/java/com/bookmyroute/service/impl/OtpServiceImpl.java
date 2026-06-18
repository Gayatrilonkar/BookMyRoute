package com.bookmyroute.service.impl;

import com.bookmyroute.entity.OtpRecord;
import com.bookmyroute.exception.BusinessException;
import com.bookmyroute.repository.OtpRecordRepository;
import com.bookmyroute.service.EmailService;
import com.bookmyroute.service.OtpService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class OtpServiceImpl implements OtpService {

    private final OtpRecordRepository otpRecordRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom random = new SecureRandom();

    public OtpServiceImpl(OtpRecordRepository otpRecordRepository, EmailService emailService, PasswordEncoder passwordEncoder) {
        this.otpRecordRepository = otpRecordRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void requestOtp(String email, String purpose) {
        // Check cooldown
        otpRecordRepository.findTopByEmailAndPurposeOrderByCreatedAtDesc(email, purpose)
                .ifPresent(record -> {
                    if (record.getCreatedAt().plusSeconds(60).isAfter(LocalDateTime.now())) {
                        throw new BusinessException("Please wait 60 seconds before requesting a new OTP");
                    }
                });

        // Generate 6 digit OTP
        int otpInt = 100000 + random.nextInt(900000);
        String otp = String.valueOf(otpInt);

        OtpRecord newRecord = new OtpRecord();
        newRecord.setEmail(email);
        newRecord.setPurpose(purpose);
        newRecord.setOtpHash(passwordEncoder.encode(otp));
        newRecord.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        newRecord.setAttempts(0);
        newRecord.setVerified(false);
        
        otpRecordRepository.save(newRecord);
        emailService.sendTestEmail(email); // In real scenario, use custom OTP template. using test for now
        System.out.println("Generated OTP for " + email + ": " + otp); // For testing
    }

    @Override
    @Transactional
    public boolean verifyOtp(String email, String purpose, String otp) {
        OtpRecord record = otpRecordRepository.findTopByEmailAndPurposeOrderByCreatedAtDesc(email, purpose)
                .orElseThrow(() -> new BusinessException("No OTP requested"));

        if (record.isVerified()) {
            return true; // Already verified
        }

        if (record.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException("OTP has expired");
        }

        if (record.getAttempts() >= 3) {
            throw new BusinessException("Maximum OTP attempts exceeded");
        }

        record.setAttempts(record.getAttempts() + 1);

        if (!passwordEncoder.matches(otp, record.getOtpHash())) {
            otpRecordRepository.save(record);
            throw new BusinessException("Invalid OTP");
        }

        record.setVerified(true);
        otpRecordRepository.save(record);
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isVerified(String email, String purpose) {
        return otpRecordRepository.findTopByEmailAndPurposeOrderByCreatedAtDesc(email, purpose)
                .map(r -> r.isVerified() && r.getExpiresAt().isAfter(LocalDateTime.now()))
                .orElse(false);
    }

    @Override
    @Transactional
    public void clearVerification(String email, String purpose) {
        otpRecordRepository.findTopByEmailAndPurposeOrderByCreatedAtDesc(email, purpose)
                .ifPresent(r -> {
                    r.setVerified(false);
                    r.setExpiresAt(LocalDateTime.now().minusMinutes(1));
                    otpRecordRepository.save(r);
                });
    }
}
