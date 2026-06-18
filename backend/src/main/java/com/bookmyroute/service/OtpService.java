package com.bookmyroute.service;

public interface OtpService {
    void requestOtp(String email, String purpose);
    boolean verifyOtp(String email, String purpose, String otp);
    boolean isVerified(String email, String purpose);
    void clearVerification(String email, String purpose);
}
