package com.fitfusion.fitfusion_backend.service;

import com.fitfusion.fitfusion_backend.dto.WorkoutSessionResponse;
import com.fitfusion.fitfusion_backend.dto.WorkoutSessionSaveRequest;
import com.fitfusion.fitfusion_backend.entity.FitnessProfile;
import com.fitfusion.fitfusion_backend.entity.User;
import com.fitfusion.fitfusion_backend.entity.WorkoutSession;
import com.fitfusion.fitfusion_backend.repository.FitnessProfileRepository;
import com.fitfusion.fitfusion_backend.repository.UserRepository;
import com.fitfusion.fitfusion_backend.repository.WorkoutSessionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class WorkoutSessionServiceImpl implements WorkoutSessionService {

    private final WorkoutSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final FitnessProfileRepository profileRepository;
    private final RestTemplate restTemplate;
    private final String aiServiceBase;

    public WorkoutSessionServiceImpl(
            WorkoutSessionRepository sessionRepository,
            UserRepository userRepository,
            FitnessProfileRepository profileRepository,
            RestTemplate restTemplate,
            @Value("${ai.service.url:http://127.0.0.1:8000}") String aiServiceBase) {

        this.sessionRepository = sessionRepository;
        this.userRepository    = userRepository;
        this.profileRepository = profileRepository;
        this.restTemplate      = restTemplate;
        this.aiServiceBase     = aiServiceBase;
    }

    // ── Auth helper ───────────────────────────────────────────────────────

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UUID userId = UUID.fromString(auth.getName());
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    // ── Save session + ML prediction ─────────────────────────────────────

    @Override
    public WorkoutSessionResponse saveSession(WorkoutSessionSaveRequest request) {
        User user = getCurrentUser();

        WorkoutSession session = new WorkoutSession();
        session.setUser(user);
        session.setExercise(request.getExercise());
        session.setTargetReps(request.getTargetReps());
        session.setCompletedReps(request.getCompletedReps());
        session.setCorrectReps(request.getCorrectReps());
        session.setAverageFormScore(request.getAverageFormScore());
        session.setCompletionRate(request.getCompletionRate());
        session.setWorkoutDurationSeconds(request.getWorkoutDurationSeconds());

        // ── Run ML progression prediction ──────────────────────────────
        // Gather previous session data for the same exercise
        List<WorkoutSession> prevSessions =
                sessionRepository.findByUserAndExerciseOrderBySessionDateDesc(
                        user, request.getExercise());

        String progressionAction = "MAINTAIN";
        String progressionReason = "Current performance is appropriate.";

        try {
            Map<String, Object> mlPayload = buildMlPayload(request, prevSessions, user);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(mlPayload, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> mlResponse = restTemplate.postForObject(
                    aiServiceBase + "/predict", entity, Map.class);

            if (mlResponse != null) {
                Object action = mlResponse.get("next_difficulty_action");
                Object reason = mlResponse.get("reason");
                if (action != null) progressionAction = action.toString();
                if (reason != null) progressionReason = reason.toString();
            }
        } catch (Exception ignored) {
            // ML service unavailable — use defaults, don't fail the save
        }

        session.setProgressionAction(progressionAction);
        session.setProgressionReason(progressionReason);

        WorkoutSession saved = sessionRepository.save(session);
        return mapToResponse(saved);
    }

    // ── Queries ───────────────────────────────────────────────────────────

    @Override
    public List<WorkoutSessionResponse> getMySessions() {
        User user = getCurrentUser();
        return sessionRepository.findByUserOrderBySessionDateDesc(user)
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<WorkoutSessionResponse> getRecentSessions(int limit) {
        User user = getCurrentUser();
        return sessionRepository.findRecentByUser(user, PageRequest.of(0, limit))
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<WorkoutSessionResponse> getSessionsByExercise(String exercise) {
        User user = getCurrentUser();
        return sessionRepository
                .findByUserAndExerciseOrderBySessionDateDesc(user, exercise)
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    public long getSessionCount() {
        return sessionRepository.countByUser(getCurrentUser());
    }

    // ── ML payload builder ────────────────────────────────────────────────

    private Map<String, Object> buildMlPayload(
            WorkoutSessionSaveRequest request,
            List<WorkoutSession> history,
            User user) {

        // Resolve experience level from profile (fallback to BEGINNER)
        String experienceLevel = "BEGINNER";
        try {
            FitnessProfile profile = profileRepository.findByUser(user)
                    .orElse(null);
            if (profile != null && profile.getExperienceLevel() != null) {
                experienceLevel = profile.getExperienceLevel().name();
            }
        } catch (Exception ignored) {}

        // Derive current difficulty from experience level
        String currentDifficulty = switch (experienceLevel) {
            case "ADVANCED"     -> "HARD";
            case "INTERMEDIATE" -> "MEDIUM";
            default             -> "EASY";
        };

        // Previous session stats (or defaults for first session)
        double prevFormScore     = request.getAverageFormScore();
        double performanceTrend  = 0.0;
        int    sessionsCompleted = (int) Math.min(history.size(), 100);

        if (!history.isEmpty()) {
            WorkoutSession last = history.get(0);
            prevFormScore    = last.getAverageFormScore();
            performanceTrend = request.getAverageFormScore() - prevFormScore;
        }

        double correctRepPct = request.getTargetReps() > 0
                ? (request.getCorrectReps() * 100.0) / request.getTargetReps()
                : 0.0;

        Map<String, Object> payload = new HashMap<>();
        payload.put("experience_level",       experienceLevel);
        payload.put("current_difficulty",     currentDifficulty);
        payload.put("target_reps",            request.getTargetReps());
        payload.put("completed_reps",         request.getCompletedReps());
        payload.put("completion_rate",        request.getCompletionRate() / 100.0);
        payload.put("correct_rep_percentage", correctRepPct);
        payload.put("average_form_score",     request.getAverageFormScore());
        payload.put("previous_form_score",    prevFormScore);
        payload.put("performance_trend",      performanceTrend);
        payload.put("sessions_completed",     sessionsCompleted);
        payload.put("rpe",                    estimateRpe(request.getAverageFormScore(),
                                                           request.getCompletionRate()));
        return payload;
    }

    /**
     * Rough RPE estimate (1–10) from form score and completion rate.
     * High form + high completion = low RPE; low form or low completion = high RPE.
     */
    private int estimateRpe(double formScore, double completionRate) {
        double effort = 100.0 - ((formScore + completionRate) / 2.0);
        int rpe = (int) Math.round(effort / 10.0);
        return Math.max(1, Math.min(10, rpe));
    }

    // ── Mapper ────────────────────────────────────────────────────────────

    private WorkoutSessionResponse mapToResponse(WorkoutSession s) {
        WorkoutSessionResponse r = new WorkoutSessionResponse();
        r.setId(s.getId());
        r.setExercise(s.getExercise());
        r.setTargetReps(s.getTargetReps());
        r.setCompletedReps(s.getCompletedReps());
        r.setCorrectReps(s.getCorrectReps());
        r.setAverageFormScore(s.getAverageFormScore());
        r.setCompletionRate(s.getCompletionRate());
        r.setWorkoutDurationSeconds(s.getWorkoutDurationSeconds());
        r.setProgressionAction(s.getProgressionAction());
        r.setProgressionReason(s.getProgressionReason());
        r.setSessionDate(s.getSessionDate());
        return r;
    }
}
