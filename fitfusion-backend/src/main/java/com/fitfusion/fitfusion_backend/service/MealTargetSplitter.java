package com.fitfusion.fitfusion_backend.service;

import com.fitfusion.fitfusion_backend.dto.recommendation.MealTarget;
import com.fitfusion.fitfusion_backend.dto.recommendation.NutritionTarget;

public interface MealTargetSplitter {

    MealTarget createTarget(
            NutritionTarget dailyTarget,
            double percentage
    );
}