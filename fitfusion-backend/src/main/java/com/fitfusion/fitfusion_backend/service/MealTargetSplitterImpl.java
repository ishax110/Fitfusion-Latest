package com.fitfusion.fitfusion_backend.service;

import com.fitfusion.fitfusion_backend.dto.recommendation.MealTarget;
import com.fitfusion.fitfusion_backend.dto.recommendation.NutritionTarget;
import org.springframework.stereotype.Service;

@Service
public class MealTargetSplitterImpl
        implements MealTargetSplitter {

    @Override
    public MealTarget createTarget(
            NutritionTarget dailyTarget,
            double percentage) {

        return new MealTarget(

                dailyTarget.getCalories()
                        * percentage,

                dailyTarget.getProtein()
                        * percentage,

                dailyTarget.getCarbs()
                        * percentage,

                dailyTarget.getFat()
                        * percentage
        );
    }
}