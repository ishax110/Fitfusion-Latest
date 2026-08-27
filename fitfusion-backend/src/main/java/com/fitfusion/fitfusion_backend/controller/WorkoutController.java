package com.fitfusion.fitfusion_backend.controller;

import com.fitfusion.fitfusion_backend.dto.AiWorkoutGenerateRequest;
import com.fitfusion.fitfusion_backend.dto.MediaPipeWorkoutRequest;
import com.fitfusion.fitfusion_backend.dto.MediaPipeWorkoutResponse;
import com.fitfusion.fitfusion_backend.dto.VideoTrackResponse;
import com.fitfusion.fitfusion_backend.dto.WorkoutRequest;
import com.fitfusion.fitfusion_backend.dto.WorkoutResponse;
import com.fitfusion.fitfusion_backend.service.WorkoutService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    private final WorkoutService workoutService;

    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    // ── Existing CRUD ─────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<WorkoutResponse> createWorkout(
            @RequestBody WorkoutRequest request) {

        WorkoutResponse response = workoutService.createWorkout(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<WorkoutResponse>> getMyWorkouts() {
        return ResponseEntity.ok(workoutService.getMyWorkouts());
    }

    @PutMapping("/{workoutId}")
    public ResponseEntity<WorkoutResponse> updateWorkout(
            @PathVariable Long workoutId,
            @RequestBody WorkoutRequest request) {

        return ResponseEntity.ok(workoutService.updateWorkout(workoutId, request));
    }

    @DeleteMapping("/{workoutId}")
    public ResponseEntity<Void> deleteWorkout(@PathVariable Long workoutId) {
        workoutService.deleteWorkout(workoutId);
        return ResponseEntity.noContent().build();
    }

    // ── Existing MediaPipe proxy ───────────────────────────────────────────

    @PostMapping("/start-ai")
    public ResponseEntity<MediaPipeWorkoutResponse> startAiWorkout(
            @RequestBody MediaPipeWorkoutRequest request) {

        return ResponseEntity.ok(workoutService.startAiWorkout(request));
    }

    // ── NEW: Groq AI workout plan generation ─────────────────────────────
    /**
     * POST /api/workouts/generate-ai
     * Body: { "preferences": "...", "days_per_week": 4 }
     *
     * Reads the current user's FitnessProfile, calls FastAPI /generate-workout
     * via Groq LLM, and returns the full personalised plan as JSON.
     * Returns 503 if the AI service is unavailable.
     */
    @PostMapping("/generate-ai")
    public ResponseEntity<?> generateAiWorkout(
            @RequestBody(required = false) AiWorkoutGenerateRequest request) {

        if (request == null) {
            request = new AiWorkoutGenerateRequest();
        }

        try {
            Map<String, Object> plan = workoutService.generateAiWorkout(request);
            return ResponseEntity.ok(plan);
        } catch (IllegalArgumentException e) {
            // Profile not found → 400
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            // AI service down or Groq error → 503
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ── NEW: Video upload + MediaPipe pose tracking ───────────────────────
    /**
     * POST /api/workouts/track-video   (multipart/form-data)
     * Parts:
     *   exercise    – String  e.g. "squat"
     *   target_reps – int
     *   video       – binary video file (mp4/webm/mov/avi)
     *
     * Forwards to FastAPI /track-video, returns tracking results.
     */
    @PostMapping(value = "/track-video", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> trackVideo(
            @RequestParam("exercise")    String exercise,
            @RequestParam("target_reps") int targetReps,
            @RequestParam("video")       MultipartFile video) {

        if (video.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Video file is required."));
        }

        try {
            VideoTrackResponse result = workoutService.trackVideo(exercise, targetReps, video);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
