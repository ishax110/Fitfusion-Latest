package com.fitfusion.fitfusion_backend.dto.recommendation;

public class MealTarget {

    private double calories;
    private double protein;
    private double carbs;
    private double fat;

    public MealTarget(
            double calories,
            double protein,
            double carbs,
            double fat) {

        this.calories = calories;
        this.protein = protein;
        this.carbs = carbs;
        this.fat = fat;
    }

    public double getCalories() {
        return calories;
    }

    public double getProtein() {
        return protein;
    }

    public double getCarbs() {
        return carbs;
    }

    public double getFat() {
        return fat;
    }
}