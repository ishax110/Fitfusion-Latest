package com.fitfusion.fitfusion_backend.service;

import com.fitfusion.fitfusion_backend.dto.CreateProfileRequest;
import com.fitfusion.fitfusion_backend.dto.ProfileResponse;
import com.fitfusion.fitfusion_backend.dto.UpdateProfileRequest;
import org.springframework.stereotype.Service;

@Service
public interface FitnessProfileService {
    ProfileResponse createProfile(CreateProfileRequest request);

    ProfileResponse getMyProfile();

    ProfileResponse updateProfile(UpdateProfileRequest request);
}
