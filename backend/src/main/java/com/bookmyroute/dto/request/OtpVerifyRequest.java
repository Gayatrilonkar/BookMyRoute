package com.bookmyroute.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class OtpVerifyRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String purpose;

    @NotBlank
    private String otp;

    public OtpVerifyRequest() {}

    public OtpVerifyRequest(String email, String purpose, String otp) {
        this.email = email;
        this.purpose = purpose;
        this.otp = otp;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}
