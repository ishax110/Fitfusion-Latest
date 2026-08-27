package com.fitfusion.fitfusion_backend.controller;

import com.fitfusion.fitfusion_backend.dto.CreateProfileRequest;
import com.fitfusion.fitfusion_backend.dto.ProfileResponse;
import com.fitfusion.fitfusion_backend.dto.UpdateProfileRequest;
import com.fitfusion.fitfusion_backend.service.FitnessProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class FitnessProfileController {

    private final FitnessProfileService fitnessProfileService;

    public FitnessProfileController(
            FitnessProfileService fitnessProfileService) {
        this.fitnessProfileService = fitnessProfileService;
    }

    @PostMapping
    public ResponseEntity<ProfileResponse> createProfile(
            @Valid @RequestBody CreateProfileRequest request) {

        ProfileResponse response =
                fitnessProfileService.createProfile(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getMyProfile() {

        ProfileResponse response =
                fitnessProfileService.getMyProfile();

        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {

        ProfileResponse response =
                fitnessProfileService.updateProfile(request);

        return ResponseEntity.ok(response);
    }
}