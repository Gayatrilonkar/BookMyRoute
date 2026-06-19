package com.bookmyroute.service;

import com.bookmyroute.dto.request.PassengerProfileRequest;
import com.bookmyroute.dto.response.PassengerProfileResponse;
import com.bookmyroute.entity.PassengerProfile;
import com.bookmyroute.entity.User;
import com.bookmyroute.exception.ResourceNotFoundException;
import com.bookmyroute.exception.UnauthorizedException;
import com.bookmyroute.repository.PassengerProfileRepository;
import com.bookmyroute.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PassengerProfileService {

    private final PassengerProfileRepository passengerProfileRepository;
    private final UserRepository userRepository;

    public PassengerProfileService(PassengerProfileRepository passengerProfileRepository, UserRepository userRepository) {
        this.passengerProfileRepository = passengerProfileRepository;
        this.userRepository = userRepository;
    }

    public List<PassengerProfileResponse> getUserProfiles(String userEmail) {
        return passengerProfileRepository.findByUserEmailOrderByCreatedAtDesc(userEmail)
                .stream()
                .map(PassengerProfileResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public PassengerProfileResponse createProfile(PassengerProfileRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.isDefault()) {
            passengerProfileRepository.resetDefaultFlagForUser(user.getId());
        }

        PassengerProfile profile = new PassengerProfile(
                user, request.getFullName(), request.getAge(), request.getGender(), request.isDefault()
        );
        return PassengerProfileResponse.fromEntity(passengerProfileRepository.save(profile));
    }

    @Transactional
    public PassengerProfileResponse updateProfile(Long id, PassengerProfileRequest request, String userEmail) {
        PassengerProfile profile = passengerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Passenger profile not found"));

        if (!profile.getUser().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("You are not authorized to update this profile");
        }

        if (request.isDefault() && !profile.isDefault()) {
            passengerProfileRepository.resetDefaultFlagForUser(profile.getUser().getId());
        }

        profile.setFullName(request.getFullName());
        profile.setAge(request.getAge());
        profile.setGender(request.getGender());
        profile.setDefault(request.isDefault());

        return PassengerProfileResponse.fromEntity(passengerProfileRepository.save(profile));
    }

    @Transactional
    public void deleteProfile(Long id, String userEmail) {
        PassengerProfile profile = passengerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Passenger profile not found"));

        if (!profile.getUser().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("You are not authorized to delete this profile");
        }

        passengerProfileRepository.delete(profile);
    }
}
