package com.bookmyroute.controller;

import com.bookmyroute.dto.request.PassengerProfileRequest;
import com.bookmyroute.dto.response.ApiResponse;
import com.bookmyroute.dto.response.PassengerProfileResponse;
import com.bookmyroute.service.PassengerProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/passengers")
public class PassengerProfileController {

    private final PassengerProfileService passengerProfileService;

    public PassengerProfileController(PassengerProfileService passengerProfileService) {
        this.passengerProfileService = passengerProfileService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PassengerProfileResponse>>> getMyProfiles(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                passengerProfileService.getUserProfiles(userDetails.getUsername())
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PassengerProfileResponse>> createProfile(
            @Valid @RequestBody PassengerProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                passengerProfileService.createProfile(request, userDetails.getUsername()),
                "Passenger profile created"
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PassengerProfileResponse>> updateProfile(
            @PathVariable Long id,
            @Valid @RequestBody PassengerProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                passengerProfileService.updateProfile(id, request, userDetails.getUsername()),
                "Passenger profile updated"
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        passengerProfileService.deleteProfile(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null, "Passenger profile deleted"));
    }
}
