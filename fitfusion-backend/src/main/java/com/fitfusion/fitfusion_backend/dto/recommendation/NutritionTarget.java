package com.fitfusion.fitfusion_backend.dto.recommendation;

public class NutritionTarget {

    private int calories;
    private int protein;
    private int carbs;
    private int fat;

    public NutritionTarget(
            int calories,
            int protein,
            int carbs,
            int fat) {

        this.calories = calories;
        this.protein = protein;
        this.carbs = carbs;
        this.fat = fat;
    }

    public int getCalories() {
        return calories;
    }

    public int getProtein() {
        return protein;
    }

    public int getCarbs() {
        return carbs;
    }

    public int getFat() {
        return fat;
    }
}