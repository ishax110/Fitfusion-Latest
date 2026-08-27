package com.fitfusion.fitfusion_backend.service;

import com.fitfusion.fitfusion_backend.dto.AiWorkoutGenerateRequest;
import com.fitfusion.fitfusion_backend.dto.MediaPipeWorkoutRequest;
import com.fitfusion.fitfusion_backend.dto.MediaPipeWorkoutResponse;
import com.fitfusion.fitfusion_backend.dto.VideoTrackResponse;
import com.fitfusion.fitfusion_backend.dto.WorkoutRequest;
import com.fitfusion.fitfusion_backend.dto.WorkoutResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface WorkoutService {

    WorkoutResponse createWorkout(WorkoutRequest request);

    List<WorkoutResponse> getMyWorkouts();

    WorkoutResponse updateWorkout(Long workoutId, WorkoutRequest request);

    void deleteWorkout(Long workoutId);

    MediaPipeWorkoutResponse startAiWorkout(MediaPipeWorkoutRequest request);

    /**
     * Calls FastAPI /generate-workout with the current user's FitnessProfile
     * data + optional preferences. Returns the raw plan JSON as a Map so
     * the frontend receives the full Groq-generated plan unchanged.
     */
    Map<String, Object> generateAiWorkout(AiWorkoutGenerateRequest request);

    /**
     * Forwards the uploaded video to FastAPI /track-video for MediaPipe
     * pose analysis. Returns rep counts, form scores, and per-rep feedback.
     */
    VideoTrackResponse trackVideo(String exercise, int targetReps, MultipartFile video);
}
