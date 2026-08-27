package com.fitfusion.fitfusion_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

/**
 * Response from POST /api/workouts/track-video
 * mirrors the FastAPI /track-video response.
 */
public class VideoTrackResponse {

    private String exercise;

    @JsonProperty("target_reps")
    private int targetReps;

    @JsonProperty("completed_reps")
    private int completedReps;

    @JsonProperty("correct_reps")
    private int correctReps;

    @JsonProperty("average_form_score")
    private double averageFormScore;

    @JsonProperty("completion_rate")
    private double completionRate;

    @JsonProperty("workout_duration_s")
    private double workoutDurationS;

    private double fps;

    @JsonProperty("rep_details")
    private List<Map<String, Object>> repDetails;

    private String summary;

    public VideoTrackResponse() {}

    public String getExercise() { return exercise; }
    public void setExercise(String exercise) { this.exercise = exercise; }

    public int getTargetReps() { return targetReps; }
    public void setTargetReps(int targetReps) { this.targetReps = targetReps; }

    public int getCompletedReps() { return completedReps; }
    public void setCompletedReps(int completedReps) { this.completedReps = completedReps; }

    public int getCorrectReps() { return correctReps; }
    public void setCorrectReps(int correctReps) { this.correctReps = correctReps; }

    public double getAverageFormScore() { return averageFormScore; }
    public void setAverageFormScore(double averageFormScore) { this.averageFormScore = averageFormScore; }

    public double getCompletionRate() { return completionRate; }
    public void setCompletionRate(double completionRate) { this.completionRate = completionRate; }

    public double getWorkoutDurationS() { return workoutDurationS; }
    public void setWorkoutDurationS(double workoutDurationS) { this.workoutDurationS = workoutDurationS; }

    public double getFps() { return fps; }
    public void setFps(double fps) { this.fps = fps; }

    public List<Map<String, Object>> getRepDetails() { return repDetails; }
    public void setRepDetails(List<Map<String, Object>> repDetails) { this.repDetails = repDetails; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
}
