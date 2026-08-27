package com.fitfusion.fitfusion_backend.dto.recommendation;

import java.util.List;

public class RecommendationResponse {

    private String goal;

    private Integer dailyCalories;
    private Integer proteinGrams;
    private Integer carbohydrateGrams;
    private Integer fatGrams;

    private List<String> workoutPlan;
    private List<Meal> mealPlan;

    public RecommendationResponse() {
    }

    public RecommendationResponse(
            String goal,
            Integer dailyCalories,
            Integer proteinGrams,
            Integer carbohydrateGrams,
            Integer fatGrams,
            List<String> workoutPlan,
            List<Meal> mealPlan) {

        this.goal = goal;
        this.dailyCalories = dailyCalories;
        this.proteinGrams = proteinGrams;
        this.carbohydrateGrams = carbohydrateGrams;
        this.fatGrams = fatGrams;
        this.workoutPlan = workoutPlan;
        this.mealPlan = mealPlan;
    }

    public String getGoal() {
        return goal;
    }

    public void setGoal(String goal) {
        this.goal = goal;
    }

    public Integer getDailyCalories() {
        return dailyCalories;
    }

    public void setDailyCalories(Integer dailyCalories) {
        this.dailyCalories = dailyCalories;
    }

    public Integer getProteinGrams() {
        return proteinGrams;
    }

    public void setProteinGrams(Integer proteinGrams) {
        this.proteinGrams = proteinGrams;
    }

    public Integer getCarbohydrateGrams() {
        return carbohydrateGrams;
    }

    public void setCarbohydrateGrams(Integer carbohydrateGrams) {
        this.carbohydrateGrams = carbohydrateGrams;
    }

    public Integer getFatGrams() {
        return fatGrams;
    }

    public void setFatGrams(Integer fatGrams) {
        this.fatGrams = fatGrams;
    }

    public List<String> getWorkoutPlan() {
        return workoutPlan;
    }

    public void setWorkoutPlan(List<String> workoutPlan) {
        this.workoutPlan = workoutPlan;
    }

    public List<Meal> getMealPlan() {
        return mealPlan;
    }

    public void setMealPlan(List<Meal> mealPlan) {
        this.mealPlan = mealPlan;
    }
}