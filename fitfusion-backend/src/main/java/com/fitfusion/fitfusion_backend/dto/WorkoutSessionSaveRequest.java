package com.fitfusion.fitfusion_backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Body for POST /api/sessions — saves a completed workout session.
 * The backend also triggers ML progression prediction and stores the result.
 */
public class WorkoutSessionSaveRequest {

    @NotBlank(message = "Exercise name is required")
    private String exercise;

    @NotNull(message = "Target reps is required")
    @Min(value = 1, message = "Target reps must be at least 1")
    private Integer targetReps;

    @NotNull(message = "Completed reps is required")
    private Integer completedReps;

    @NotNull(message = "Correct reps is required")
    private Integer correctReps;

    @NotNull(message = "Average form score is required")
    private Double averageFormScore;

    @NotNull(message = "Completion rate is required")
    private Double completionRate;

    private Double workoutDurationSeconds;

    public WorkoutSessionSaveRequest() {}

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
}
