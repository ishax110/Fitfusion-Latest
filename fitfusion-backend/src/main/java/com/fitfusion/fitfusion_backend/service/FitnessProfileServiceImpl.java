package com.fitfusion.fitfusion_backend.service;

import com.fitfusion.fitfusion_backend.dto.CreateProfileRequest;
import com.fitfusion.fitfusion_backend.dto.ProfileResponse;
import com.fitfusion.fitfusion_backend.dto.UpdateProfileRequest;
import com.fitfusion.fitfusion_backend.entity.FitnessProfile;
import com.fitfusion.fitfusion_backend.entity.User;
import com.fitfusion.fitfusion_backend.repository.FitnessProfileRepository;
import com.fitfusion.fitfusion_backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class FitnessProfileServiceImpl implements FitnessProfileService {
    private final FitnessProfileRepository profileRepository;
    private final UserRepository userRepository;

    public FitnessProfileServiceImpl(
            FitnessProfileRepository profileRepository,
            UserRepository userRepository) {

        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    @Override
    public ProfileResponse createProfile(CreateProfileRequest request) {
        User user = getCurrentUser();
        if(profileRepository.existsByUser(user)) {
            throw new IllegalArgumentException(
                     "Profile already created with this userID"
            );
        }
        FitnessProfile profile = new FitnessProfile();
        profile.setUser(user);
        profile.setAge(request.getAge());
        profile.setGender(request.getGender());
        profile.setHeight(request.getHeight());
        profile.setWeight(request.getWeight());
        profile.setGoal(request.getGoal());
        profile.setActivityLevel(request.getActivityLevel());
        profile.setExperienceLevel(request.getExperienceLevel());
        profile.setMedicalConditions(request.getMedicalConditions());



        double bmi = calculateBmi(
                request.getWeight(),
                request.getHeight()
        );

        profile.setBmi(bmi);

        FitnessProfile savedProfile =
                profileRepository.save(profile);

        return mapToResponse(savedProfile);

    }

    @Override
    public ProfileResponse getMyProfile() {
        User user = getCurrentUser();

        FitnessProfile profile =
                profileRepository.findByUser(user)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Fitness profile not found"
                                )
                        );

        return mapToResponse(profile);
    }

    @Override
    public ProfileResponse updateProfile(UpdateProfileRequest request) {

            User user = getCurrentUser();

            FitnessProfile profile =
                    profileRepository.findByUser(user)
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "Fitness profile not found"
                                    )
                            );

            profile.setAge(request.getAge());
            profile.setGender(request.getGender());
            profile.setHeight(request.getHeight());
            profile.setWeight(request.getWeight());
            profile.setGoal(request.getGoal());
            profile.setActivityLevel(request.getActivityLevel());
            profile.setExperienceLevel(request.getExperienceLevel());
            profile.setMedicalConditions(request.getMedicalConditions());

            double bmi = calculateBmi(
                    request.getWeight(),
                    request.getHeight()
            );

            profile.setBmi(bmi);

            FitnessProfile updatedProfile =
                    profileRepository.save(profile);

            return mapToResponse(updatedProfile);

        }

    private double calculateBmi(Double weightKg, Double heightCm) {

            double heightMeters =
                    heightCm / 100.0;

            double bmi =
                    weightKg /
                            (heightMeters * heightMeters);

            return Math.round(bmi * 100.0) / 100.0;
    }

    private ProfileResponse mapToResponse(FitnessProfile profile) {
        ProfileResponse response = new ProfileResponse();

        response.setUserId(profile.getUser().getId()
        );

        response.setName(
                profile.getUser().getName()
        );

        response.setEmail(
                profile.getUser().getEmail()
        );

        response.setAge(profile.getAge());
        response.setGender(profile.getGender());
        response.setHeight(profile.getHeight());
        response.setWeight(profile.getWeight());
        response.setBmi(profile.getBmi());
        response.setGoal(profile.getGoal());

        response.setActivityLevel(
                profile.getActivityLevel()
        );

        response.setExperienceLevel(
                profile.getExperienceLevel()
        );

        response.setMedicalConditions(
                profile.getMedicalConditions()
        );
        return response;
    }

    private User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new IllegalStateException(
                    "User is not authenticated"
            );
        }

        UUID userId =
                UUID.fromString(authentication.getName());

        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Authenticated user not found"
                        ));
    }
}
