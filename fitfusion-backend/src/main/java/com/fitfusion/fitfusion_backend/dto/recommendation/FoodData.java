package com.fitfusion.fitfusion_backend.dto.recommendation;

import java.util.Set;

public class FoodData {

    private String name;

    private double proteinPer100g;
    private double carbsPer100g;
    private double fatPer100g;

    private FoodCategory category;

    private double minServing;
    private double maxServing;

    private Set<MealType> suitableMeals;

    public FoodData(
            String name,
            double proteinPer100g,
            double carbsPer100g,
            double fatPer100g,
            FoodCategory category,
            double minServing,
            double maxServing,
            Set<MealType> suitableMeals) {

        this.name = name;
        this.proteinPer100g = proteinPer100g;
        this.carbsPer100g = carbsPer100g;
        this.fatPer100g = fatPer100g;
        this.category = category;
        this.minServing = minServing;
        this.maxServing = maxServing;
        this.suitableMeals = suitableMeals;
    }

    public String getName() {
        return name;
    }

    public double getCaloriesPer100g() {

        return (proteinPer100g * 4)
                + (carbsPer100g * 4)
                + (fatPer100g * 9);
    }

    public double getProteinPer100g() {
        return proteinPer100g;
    }

    public double getCarbsPer100g() {
        return carbsPer100g;
    }

    public double getFatPer100g() {
        return fatPer100g;
    }

    public FoodCategory getCategory() {
        return category;
    }

    public double getMinServing() {
        return minServing;
    }

    public double getMaxServing() {
        return maxServing;
    }

    public Set<MealType> getSuitableMeals() {
        return suitableMeals;
    }

    public boolean isSuitableFor(MealType mealType) {
        return suitableMeals.contains(mealType);
    }
}