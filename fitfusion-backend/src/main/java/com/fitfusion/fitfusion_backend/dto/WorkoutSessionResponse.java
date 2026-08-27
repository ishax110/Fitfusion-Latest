package com.fitfusion.fitfusion_backend.dto;

import java.time.LocalDateTime;

/**
 * Response for a single saved workout session,
 * including the ML progression recommendation.
 */
public class WorkoutSessionResponse {

    private Long id;
    private String exercise;
    private Integer targetReps;
    private Integer completedReps;
    private Integer correctReps;
    private Double averageFormScore;
    private Double completionRate;
    private Double workoutDurationSeconds;
    private String progressionAction;
    private String progressionReason;
    private LocalDateTime sessionDate;

    public WorkoutSessionResponse() {}

    // ── Getters / Setters ─────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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
    public void setSessionDate(LocalDateTime sessionDate) { this.sessionDate = sessionDate; }
}
