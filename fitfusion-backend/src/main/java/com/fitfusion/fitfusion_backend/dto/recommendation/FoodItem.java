package com.fitfusion.fitfusion_backend.dto.recommendation;

public class FoodItem {

    private String name;
    private double quantity;
    private String unit;

    private double calories;
    private double protein;
    private double carbs;
    private double fat;

    public FoodItem(
            String name,
            double quantity,
            String unit,
            double calories,
            double protein,
            double carbs,
            double fat) {

        this.name = name;
        this.quantity = quantity;
        this.unit = unit;
        this.calories = calories;
        this.protein = protein;
        this.carbs = carbs;
        this.fat = fat;
    }

    public String getName() {
        return name;
    }

    public double getQuantity() {
        return quantity;
    }

    public String getUnit() {
        return unit;
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