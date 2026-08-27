package com.fitfusion.fitfusion_backend.service;

import com.fitfusion.fitfusion_backend.dto.recommendation.FoodData;
import com.fitfusion.fitfusion_backend.dto.recommendation.FoodItem;
import org.springframework.stereotype.Service;

@Service
public class FoodNutritionServiceImpl
        implements FoodNutritionService {

    @Override
    public FoodItem createFoodItem(
            FoodData food,
            double quantity) {

        double factor = quantity / 100.0;

        double calories =
                food.getCaloriesPer100g() * factor;

        double protein =
                food.getProteinPer100g() * factor;

        double carbs =
                food.getCarbsPer100g() * factor;

        double fat =
                food.getFatPer100g() * factor;

        return new FoodItem(
                food.getName(),
                quantity,
                "g",
                round(calories),
                round(protein),
                round(carbs),
                round(fat)
        );
    }

    private double round(double value) {

        return Math.round(value * 10.0) / 10.0;
    }
}