package com.fitfusion.fitfusion_backend.controller;

import com.fitfusion.fitfusion_backend.dto.WorkoutSessionResponse;
import com.fitfusion.fitfusion_backend.dto.WorkoutSessionSaveRequest;
import com.fitfusion.fitfusion_backend.service.WorkoutSessionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
public class WorkoutSessionController {

    private final WorkoutSessionService sessionService;

    public WorkoutSessionController(WorkoutSessionService sessionService) {
        this.sessionService = sessionService;
    }

    /**
     * POST /api/sessions
     * Save a completed video-tracked workout session.
     * Automatically triggers ML progression prediction.
     */
    @PostMapping
    public ResponseEntity<WorkoutSessionResponse> saveSession(
            @Valid @RequestBody WorkoutSessionSaveRequest request) {

        WorkoutSessionResponse response = sessionService.saveSession(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/sessions
     * All sessions for the current user, newest first.
     */
    @GetMapping
    public ResponseEntity<List<WorkoutSessionResponse>> getMySessions() {
        return ResponseEntity.ok(sessionService.getMySessions());
    }

    /**
     * GET /api/sessions/recent?limit=5
     * Recent sessions for the dashboard.
     */
    @GetMapping("/recent")
    public ResponseEntity<List<WorkoutSessionResponse>> getRecentSessions(
            @RequestParam(defaultValue = "5") int limit) {

        return ResponseEntity.ok(sessionService.getRecentSessions(limit));
    }

    /**
     * GET /api/sessions/exercise/{exercise}
     * Sessions filtered by exercise name for progress charts.
     */
    @GetMapping("/exercise/{exercise}")
    public ResponseEntity<List<WorkoutSessionResponse>> getByExercise(
            @PathVariable String exercise) {

        return ResponseEntity.ok(sessionService.getSessionsByExercise(exercise));
    }

    /**
     * GET /api/sessions/count
     * Total sessions completed — used on the dashboard streak counter.
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getSessionCount() {
        return ResponseEntity.ok(Map.of("count", sessionService.getSessionCount()));
    }
}
