package com.bookmyroute.controller;

import com.bookmyroute.dto.request.AuthRequest;
import com.bookmyroute.dto.response.ApiResponse;
import com.bookmyroute.dto.response.AuthResponse;
import com.bookmyroute.entity.User;
import com.bookmyroute.enums.Role;
import com.bookmyroute.exception.BusinessException;
import com.bookmyroute.exception.ResourceNotFoundException;
import com.bookmyroute.repository.UserRepository;
import com.bookmyroute.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthService authService, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody AuthRequest.Register request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Registration successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody AuthRequest.Login request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    /**
     * GET /api/auth/me
     * Returns the current logged-in user's profile.
     * Used by the React frontend to restore session on page reload.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> me(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        AuthResponse response = AuthResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .tokenType("Bearer")
                .build();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<ApiResponse<AuthResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AuthRequest.UpdateProfile request) {
        User user = getAuthenticatedUser(userDetails);
        user.setName(request.getName().trim());
        user.setPhone(request.getPhone() == null || request.getPhone().isBlank()
                ? null
                : request.getPhone().trim());

        User saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(buildProfileResponse(saved), "Profile updated successfully"));
    }

    @PutMapping("/change-password")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AuthRequest.ChangePassword request) {
        User user = getAuthenticatedUser(userDetails);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BusinessException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully"));
    }

    private User getAuthenticatedUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("Authentication required");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private AuthResponse buildProfileResponse(User user) {
        return AuthResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .tokenType("Bearer")
                .build();
    }
}
