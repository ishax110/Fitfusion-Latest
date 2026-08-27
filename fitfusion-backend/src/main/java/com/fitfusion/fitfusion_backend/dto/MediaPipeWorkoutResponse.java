package com.fitfusion.fitfusion_backend.dto;

public class MediaPipeWorkoutResponse {

    private int completedReps;
    private int correctReps;
    private double averageFormScore;
    private double completionRate;
    private double workoutDuration;

    public MediaPipeWorkoutResponse() {
    }

    public int getCompletedReps() {
        return completedReps;
    }

    public void setCompletedReps(int completedReps) {
        this.completedReps = completedReps;
    }

    public int getCorrectReps() {
        return correctReps;
    }

    public void setCorrectReps(int correctReps) {
        this.correctReps = correctReps;
    }

    public double getAverageFormScore() {
        return averageFormScore;
    }

    public void setAverageFormScore(double averageFormScore) {
        this.averageFormScore = averageFormScore;
    }

    public double getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }

    public double getWorkoutDuration() {
        return workoutDuration;
    }

    public void setWorkoutDuration(double workoutDuration) {
        this.workoutDuration = workoutDuration;
    }
}