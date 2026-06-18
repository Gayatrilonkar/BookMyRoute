package com.bookmyroute.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class OtpRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String purpose;

    public OtpRequest() {}

    public OtpRequest(String email, String purpose) {
        this.email = email;
        this.purpose = purpose;
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
}
