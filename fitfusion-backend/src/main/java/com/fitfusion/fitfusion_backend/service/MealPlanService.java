package com.fitfusion.fitfusion_backend.service;

import com.fitfusion.fitfusion_backend.dto.recommendation.Meal;
import com.fitfusion.fitfusion_backend.dto.recommendation.NutritionTarget;

import java.util.List;

public interface MealPlanService {

    List<Meal> generateMealPlan(
            NutritionTarget target
    );
}