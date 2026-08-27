package com.fitfusion.fitfusion_backend.service;

import com.fitfusion.fitfusion_backend.dto.AiWorkoutGenerateRequest;
import com.fitfusion.fitfusion_backend.dto.MediaPipeWorkoutRequest;
import com.fitfusion.fitfusion_backend.dto.MediaPipeWorkoutResponse;
import com.fitfusion.fitfusion_backend.dto.VideoTrackResponse;
import com.fitfusion.fitfusion_backend.dto.WorkoutRequest;
import com.fitfusion.fitfusion_backend.dto.WorkoutResponse;
import com.fitfusion.fitfusion_backend.entity.FitnessProfile;
import com.fitfusion.fitfusion_backend.entity.User;
import com.fitfusion.fitfusion_backend.entity.Workout;
import com.fitfusion.fitfusion_backend.repository.FitnessProfileRepository;
import com.fitfusion.fitfusion_backend.repository.UserRepository;
import com.fitfusion.fitfusion_backend.repository.WorkoutRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class WorkoutServiceImpl implements WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final UserRepository userRepository;
    private final FitnessProfileRepository fitnessProfileRepository;
    private final RestTemplate restTemplate;
    private final String aiServiceBase;

    public WorkoutServiceImpl(
            WorkoutRepository workoutRepository,
            UserRepository userRepository,
            FitnessProfileRepository fitnessProfileRepository,
            RestTemplate restTemplate,
            @Value("${ai.service.url:http://127.0.0.1:8000}") String aiServiceBase) {

        this.workoutRepository        = workoutRepository;
        this.userRepository           = userRepository;
        this.fitnessProfileRepository = fitnessProfileRepository;
        this.restTemplate             = restTemplate;
        this.aiServiceBase            = aiServiceBase;
    }

    // ── Auth helpers ──────────────────────────────────────────────────────

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("User is not authenticated");
        }
        UUID userId = UUID.fromString(auth.getName());
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    private FitnessProfile getCurrentProfile() {
        User user = getCurrentUser();
        return fitnessProfileRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Please complete your fitness profile first before generating a workout plan."));
    }

    // ── CRUD ──────────────────────────────────────────────────────────────

    @Override
    public WorkoutResponse createWorkout(WorkoutRequest request) {
        User currentUser = getCurrentUser();
        Workout workout = new Workout();
        workout.setName(request.getName());
        workout.setCategory(request.getCategory());
        workout.setDuration(request.getDuration());
        workout.setCalories(request.getCalories());
        workout.setDifficulty(request.getDifficulty());
        workout.setUser(currentUser);
        return mapToResponse(workoutRepository.save(workout));
    }

    @Override
    public List<WorkoutResponse> getMyWorkouts() {
        User currentUser = getCurrentUser();
        return workoutRepository.findByUser(currentUser)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public WorkoutResponse updateWorkout(Long workoutId, WorkoutRequest request) {
        User currentUser = getCurrentUser();
        Workout workout = workoutRepository.findByIdAndUser(workoutId, currentUser)
                .orElseThrow(() -> new IllegalArgumentException("Workout not found"));
        workout.setName(request.getName());
        workout.setCategory(request.getCategory());
        workout.setDuration(request.getDuration());
        workout.setCalories(request.getCalories());
        workout.setDifficulty(request.getDifficulty());
        return mapToResponse(workoutRepository.save(workout));
    }

    @Override
    public void deleteWorkout(Long workoutId) {
        User currentUser = getCurrentUser();
        Workout workout = workoutRepository.findByIdAndUser(workoutId, currentUser)
                .orElseThrow(() -> new IllegalArgumentException("Workout not found"));
        workoutRepository.delete(workout);
    }

    // ── Existing MediaPipe proxy ───────────────────────────────────────────

    @Override
    public MediaPipeWorkoutResponse startAiWorkout(MediaPipeWorkoutRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<MediaPipeWorkoutRequest> entity = new HttpEntity<>(request, headers);
        try {
            return restTemplate.postForObject(
                    aiServiceBase + "/start-workout", entity, MediaPipeWorkoutResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to connect to AI Workout Service", e);
        }
    }

    // ── Groq AI workout plan generation ──────────────────────────────────

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> generateAiWorkout(AiWorkoutGenerateRequest request) {
        FitnessProfile profile = getCurrentProfile();

        Map<String, Object> payload = new HashMap<>();
        payload.put("goal",               profile.getGoal().name());
        payload.put("experience_level",   profile.getExperienceLevel().name());
        payload.put("activity_level",     profile.getActivityLevel().name());
        payload.put("age",                profile.getAge());
        payload.put("gender",             profile.getGender().name());
        payload.put("weight_kg",          profile.getWeight());
        payload.put("height_cm",          profile.getHeight());
        payload.put("medical_conditions", profile.getMedicalConditions());
        payload.put("preferences",        request.getPreferences());
        payload.put("days_per_week",
                request.getDaysPerWeek() != null ? request.getDaysPerWeek() : 4);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        try {
            Map<String, Object> response = restTemplate.postForObject(
                    aiServiceBase + "/generate-workout", entity, Map.class);
            if (response == null) {
                throw new RuntimeException("Empty response from AI service");
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException(
                    "AI workout generation failed: " + e.getMessage(), e);
        }
    }

    // ── Video upload + MediaPipe tracking ─────────────────────────────────
    // Uses LinkedMultiValueMap (plain Spring MVC) — NO reactive streams required.

    @Override
    public VideoTrackResponse trackVideo(String exercise, int targetReps, MultipartFile video) {
        try {
            byte[] videoBytes = video.getBytes();
            String filename   = video.getOriginalFilename() != null
                                ? video.getOriginalFilename() : "upload.mp4";
            String mimeType   = video.getContentType() != null
                                ? video.getContentType() : "video/mp4";

            // Wrap the video bytes in a named ByteArrayResource
            ByteArrayResource videoResource = new ByteArrayResource(videoBytes) {
                @Override
                public String getFilename() { return filename; }
            };

            // Build multipart body using standard LinkedMultiValueMap
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("exercise",    exercise);
            body.add("target_reps", String.valueOf(targetReps));

            // The video part needs its own Content-Type header
            HttpHeaders videoPart = new HttpHeaders();
            videoPart.setContentType(MediaType.parseMediaType(mimeType));
            body.add("video", new HttpEntity<>(videoResource, videoPart));

            // Outer request headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity =
                    new HttpEntity<>(body, headers);

            ResponseEntity<VideoTrackResponse> response = restTemplate.postForEntity(
                    aiServiceBase + "/track-video", requestEntity, VideoTrackResponse.class);

            if (response.getBody() == null) {
                throw new RuntimeException("Empty response from tracking service");
            }
            return response.getBody();

        } catch (RuntimeException e) {
            throw e; // already wrapped
        } catch (Exception e) {
            throw new RuntimeException("Video tracking failed: " + e.getMessage(), e);
        }
    }

    // ── Mapper ────────────────────────────────────────────────────────────

    private WorkoutResponse mapToResponse(Workout workout) {
        return new WorkoutResponse(
                workout.getId(),
                workout.getName(),
                workout.getCategory(),
                workout.getDuration(),
                workout.getCalories(),
                workout.getDifficulty()
        );
    }
}
