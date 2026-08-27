package com.fitfusion.fitfusion_backend.service;

import com.fitfusion.fitfusion_backend.dto.recommendation.FoodData;

import java.util.List;

public interface MealFoodSelector {

    List<List<FoodData>> generateMealCandidates(
            String mealName
    );
}