package com.fitfusion.fitfusion_backend.service;

import com.fitfusion.fitfusion_backend.dto.recommendation.FoodCategory;
import com.fitfusion.fitfusion_backend.dto.recommendation.FoodData;

import java.util.List;

public interface FoodSelector {

    FoodData selectFood(
            FoodCategory category
    );

    List<FoodData> getFoodsByCategory(
            FoodCategory category
    );
}