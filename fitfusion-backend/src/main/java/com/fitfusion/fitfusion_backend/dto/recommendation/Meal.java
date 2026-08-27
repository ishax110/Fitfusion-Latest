package com.fitfusion.fitfusion_backend.dto.recommendation;

import java.util.List;

public class Meal {

    private String mealName;
    private List<FoodItem> foods;

    private double totalCalories;
    private double totalProtein;
    private double totalCarbs;
    private double totalFat;

    public Meal(
            String mealName,
            List<FoodItem> foods) {

        this.mealName = mealName;
        this.foods = foods;

        calculateTotals();
    }

    private void calculateTotals() {

        totalCalories = foods.stream()
                .mapToDouble(FoodItem::getCalories)
                .sum();

        totalProtein = foods.stream()
                .mapToDouble(FoodItem::getProtein)
                .sum();

        totalCarbs = foods.stream()
                .mapToDouble(FoodItem::getCarbs)
                .sum();

        totalFat = foods.stream()
                .mapToDouble(FoodItem::getFat)
                .sum();
    }

    public String getMealName() {
        return mealName;
    }

    public List<FoodItem> getFoods() {
        return foods;
    }

    public double getTotalCalories() {
        return totalCalories;
    }

    public double getTotalProtein() {
        return totalProtein;
    }

    public double getTotalCarbs() {
        return totalCarbs;
    }

    public double getTotalFat() {
        return totalFat;
    }
}