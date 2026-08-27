package com.fitfusion.fitfusion_backend.controller;

import com.fitfusion.fitfusion_backend.dto.WorkoutRequest;
import com.fitfusion.fitfusion_backend.dto.WorkoutResponse;
import com.fitfusion.fitfusion_backend.entity.User;
import com.fitfusion.fitfusion_backend.entity.Workout;
import com.fitfusion.fitfusion_backend.repository.UserRepository;
import com.fitfusion.fitfusion_backend.repository.WorkoutRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Trainer-specific endpoints.
 * All require authentication; role check is enforced in logic.
 *
 * POST   /api/trainer/workouts          — create a workout plan template
 * GET    /api/trainer/workouts          — list all trainer's workout templates
 * PUT    /api/trainer/workouts/{id}     — edit a template
 * DELETE /api/trainer/workouts/{id}     — delete a template
 * GET    /api/trainer/stats             — trainer dashboard stats
 */
@RestController
@RequestMapping("/api/trainer")
public class TrainerController {

    private final UserRepository      userRepository;
    private final WorkoutRepository   workoutRepository;

    public TrainerController(
            UserRepository    userRepository,
            WorkoutRepository workoutRepository) {
        this.userRepository    = userRepository;
        this.workoutRepository = workoutRepository;
    }

    /* ── Auth helper ── */
    private User resolveTrainer(Authentication auth) {
        UUID userId = UUID.fromString(auth.getPrincipal().toString());
        User user   = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!"TRAINER".equals(user.getRole().name())) {
            throw new IllegalStateException("Access denied: Trainer role required");
        }
        return user;
    }

    /* ── Trainer dashboard stats ── */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(Authentication auth) {
        User trainer = resolveTrainer(auth);

        List<Workout> templates = workoutRepository.findByUser(trainer);

        long totalTemplates = templates.size();
        long strengthCount  = templates.stream().filter(w -> "STRENGTH".equals(w.getCategory())).count();
        long cardioCount    = templates.stream().filter(w -> "CARDIO".equals(w.getCategory())).count();
        long hiitCount      = templates.stream().filter(w -> "HIIT".equals(w.getCategory())).count();
        long flexCount      = templates.stream().filter(w -> "FLEXIBILITY".equals(w.getCategory())).count();

        return ResponseEntity.ok(Map.of(
                "trainerName",       trainer.getName(),
                "totalTemplates",    totalTemplates,
                "strengthTemplates", strengthCount,
                "cardioTemplates",   cardioCount,
                "hiitTemplates",     hiitCount,
                "flexibilityTemplates", flexCount
        ));
    }

    /* ── Create workout template ── */
    @PostMapping("/workouts")
    public ResponseEntity<WorkoutResponse> createTemplate(
            @RequestBody WorkoutRequest request,
            Authentication auth) {

        User trainer = resolveTrainer(auth);

        Workout w = new Workout();
        w.setName(request.getName());
        w.setCategory(request.getCategory());
        w.setDuration(request.getDuration());
        w.setCalories(request.getCalories());
        w.setDifficulty(request.getDifficulty());
        w.setUser(trainer);

        Workout saved = workoutRepository.save(w);
        return ResponseEntity.status(HttpStatus.CREATED).body(map(saved));
    }

    /* ── List trainer's workout templates ── */
    @GetMapping("/workouts")
    public ResponseEntity<List<WorkoutResponse>> getTemplates(Authentication auth) {
        User trainer = resolveTrainer(auth);
        return ResponseEntity.ok(
                workoutRepository.findByUser(trainer)
                        .stream().map(this::map).toList()
        );
    }

    /* ── Update template ── */
    @PutMapping("/workouts/{id}")
    public ResponseEntity<WorkoutResponse> updateTemplate(
            @PathVariable Long id,
            @RequestBody WorkoutRequest request,
            Authentication auth) {

        User trainer = resolveTrainer(auth);
        Workout w = workoutRepository.findByIdAndUser(id, trainer)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));

        w.setName(request.getName());
        w.setCategory(request.getCategory());
        w.setDuration(request.getDuration());
        w.setCalories(request.getCalories());
        w.setDifficulty(request.getDifficulty());

        return ResponseEntity.ok(map(workoutRepository.save(w)));
    }

    /* ── Delete template ── */
    @DeleteMapping("/workouts/{id}")
    public ResponseEntity<Void> deleteTemplate(
            @PathVariable Long id,
            Authentication auth) {

        User trainer = resolveTrainer(auth);
        Workout w = workoutRepository.findByIdAndUser(id, trainer)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));
        workoutRepository.delete(w);
        return ResponseEntity.noContent().build();
    }

    /* ── Mapper ── */
    private WorkoutResponse map(Workout w) {
        return new WorkoutResponse(
                w.getId(), w.getName(), w.getCategory(),
                w.getDuration(), w.getCalories(), w.getDifficulty()
        );
    }
}
