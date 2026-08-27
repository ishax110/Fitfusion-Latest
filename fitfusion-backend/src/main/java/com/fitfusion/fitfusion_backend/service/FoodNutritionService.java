package com.fitfusion.fitfusion_backend.service;

import com.fitfusion.fitfusion_backend.dto.recommendation.FoodData;
import com.fitfusion.fitfusion_backend.dto.recommendation.FoodItem;

public interface FoodNutritionService {

    FoodItem createFoodItem(
            FoodData food,
            double quantity
    );
}