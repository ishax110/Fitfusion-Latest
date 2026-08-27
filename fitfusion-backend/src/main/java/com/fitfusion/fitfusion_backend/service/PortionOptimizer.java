package com.fitfusion.fitfusion_backend.service;

import com.fitfusion.fitfusion_backend.dto.recommendation.FoodData;
import com.fitfusion.fitfusion_backend.dto.recommendation.Meal;
import com.fitfusion.fitfusion_backend.dto.recommendation.MealTarget;

import java.util.List;

public interface PortionOptimizer {

    Meal optimizeMeal(
            String mealName,
            List<FoodData> foods,
            MealTarget target
    );

    double calculateMealScore(
            Meal meal,
            MealTarget target
    );
}