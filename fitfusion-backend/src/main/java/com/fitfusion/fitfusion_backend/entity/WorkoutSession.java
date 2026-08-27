package com.fitfusion.fitfusion_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Stores one completed workout tracking session.
 * Created when a user finishes a video-tracked workout.
 */
@Entity
@Table(name = "workout_sessions")
public class WorkoutSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user who performed the session. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Exercise name e.g. "squat", "pushup". */
    @Column(nullable = false, length = 100)
    private String exercise;

    @Column(nullable = false)
    private Integer targetReps;

    @Column(nullable = false)
    private Integer completedReps;

    @Column(nullable = false)
    private Integer correctReps;

    /** Average form score 0–100. */
    @Column(nullable = false)
    private Double averageFormScore;

    /** Percentage of target reps completed. */
    @Column(nullable = false)
    private Double completionRate;

    /** Video duration in seconds. */
    private Double workoutDurationSeconds;

    /**
     * ML model recommendation after this session:
     * INCREASE / MAINTAIN / DECREASE
     */
    @Column(length = 20)
    private String progressionAction;

    /** Human-readable reason from the ML model. */
    @Column(length = 500)
    private String progressionReason;

    @Column(nullable = false, updatable = false)
    private LocalDateTime sessionDate;

    public WorkoutSession() {}

    @PrePersist
    protected void onCreate() {
        this.sessionDate = LocalDateTime.now();
    }

    // ── Getters / Setters ─────────────────────────────────────────────────

    public Long getId() { return id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getExercise() { return exercise; }
    public void setExercise(String exercise) { this.exercise = exercise; }

    public Integer getTargetReps() { return targetReps; }
    public void setTargetReps(Integer targetReps) { this.targetReps = targetReps; }

    public Integer getCompletedReps() { return completedReps; }
    public void setCompletedReps(Integer completedReps) { this.completedReps = completedReps; }

    public Integer getCorrectReps() { return correctReps; }
    public void setCorrectReps(Integer correctReps) { this.correctReps = correctReps; }

    public Double getAverageFormScore() { return averageFormScore; }
    public void setAverageFormScore(Double averageFormScore) { this.averageFormScore = averageFormScore; }

    public Double getCompletionRate() { return completionRate; }
    public void setCompletionRate(Double completionRate) { this.completionRate = completionRate; }

    public Double getWorkoutDurationSeconds() { return workoutDurationSeconds; }
    public void setWorkoutDurationSeconds(Double workoutDurationSeconds) { this.workoutDurationSeconds = workoutDurationSeconds; }

    public String getProgressionAction() { return progressionAction; }
    public void setProgressionAction(String progressionAction) { this.progressionAction = progressionAction; }

    public String getProgressionReason() { return progressionReason; }
    public void setProgressionReason(String progressionReason) { this.progressionReason = progressionReason; }

    public LocalDateTime getSessionDate() { return sessionDate; }
}
