package com.fitfusion.fitfusion_backend.dto;

public class WorkoutResponse {

    private Long id;
    private String name;
    private String category;
    private Integer duration;
    private Integer calories;
    private String difficulty;

    public WorkoutResponse() {
    }

    public WorkoutResponse(
            Long id,
            String name,
            String category,
            Integer duration,
            Integer calories,
            String difficulty) {

        this.id = id;
        this.name = name;
        this.category = category;
        this.duration = duration;
        this.calories = calories;
        this.difficulty = difficulty;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public Integer getCalories() {
        return calories;
    }

    public void setCalories(Integer calories) {
        this.calories = calories;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }
}