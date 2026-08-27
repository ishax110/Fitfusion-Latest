package com.fitfusion.fitfusion_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class MediaPipeWorkoutRequest {

    private String exercise;

    @JsonProperty("target_reps")
    private int targetReps;

    public MediaPipeWorkoutRequest() {
    }

    public MediaPipeWorkoutRequest(String exercise, int targetReps) {
        this.exercise = exercise;
        this.targetReps = targetReps;
    }

    public String getExercise() {
        return exercise;
    }

    public void setExercise(String exercise) {
        this.exercise = exercise;
    }

    public int getTargetReps() {
        return targetReps;
    }

    public void setTargetReps(int targetReps) {
        this.targetReps = targetReps;
    }
}