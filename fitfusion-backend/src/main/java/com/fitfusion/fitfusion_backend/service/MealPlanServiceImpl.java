package com.fitfusion.fitfusion_backend.service;

import com.fitfusion.fitfusion_backend.dto.recommendation.DailyNutritionSummary;
import com.fitfusion.fitfusion_backend.dto.recommendation.FoodData;
import com.fitfusion.fitfusion_backend.dto.recommendation.Meal;
import com.fitfusion.fitfusion_backend.dto.recommendation.MealTarget;
import com.fitfusion.fitfusion_backend.dto.recommendation.NutritionTarget;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MealPlanServiceImpl
        implements MealPlanService {

    private final PortionOptimizer portionOptimizer;
    private final MealTargetSplitter mealTargetSplitter;
    private final MealFoodSelector mealFoodSelector;

    public MealPlanServiceImpl(
            PortionOptimizer portionOptimizer,
            MealTargetSplitter mealTargetSplitter,
            MealFoodSelector mealFoodSelector) {

        this.portionOptimizer = portionOptimizer;
        this.mealTargetSplitter = mealTargetSplitter;
        this.mealFoodSelector = mealFoodSelector;
    }

    @Override
    public List<Meal> generateMealPlan(
            NutritionTarget target) {

        // ---------------------------------
        // 1. Split daily nutrition target
        // ---------------------------------

        MealTarget breakfastTarget =
                mealTargetSplitter.createTarget(
                        target,
                        0.25
                );

        MealTarget lunchTarget =
                mealTargetSplitter.createTarget(
                        target,
                        0.35
                );

        MealTarget snackTarget =
                mealTargetSplitter.createTarget(
                        target,
                        0.10
                );

        MealTarget dinnerTarget =
                mealTargetSplitter.createTarget(
                        target,
                        0.30
                );

        // ---------------------------------
        // 2. Generate best meal
        // ---------------------------------

        Meal breakfast =
                generateBestMeal(
                        "Breakfast",
                        breakfastTarget
                );

        Meal lunch =
                generateBestMeal(
                        "Lunch",
                        lunchTarget
                );

        Meal snack =
                generateBestMeal(
                        "Snack",
                        snackTarget
                );

        Meal dinner =
                generateBestMeal(
                        "Dinner",
                        dinnerTarget
                );

        List<Meal> meals =
                List.of(
                        breakfast,
                        lunch,
                        snack,
                        dinner
                );

        // ---------------------------------
        // 3. Calculate complete daily total
        // ---------------------------------

        DailyNutritionSummary summary =
                calculateDailyTotals(meals);

        return meals;
    }

    // =====================================
    // FIND BEST FOOD COMBINATION
    // =====================================

    private Meal generateBestMeal(
            String mealName,
            MealTarget target) {

        List<List<FoodData>> candidates =
                mealFoodSelector
                        .generateMealCandidates(
                                mealName
                        );

        Meal bestMeal = null;

        double bestScore =
                Double.MAX_VALUE;

        for (List<FoodData> candidate
                : candidates) {

            Meal meal =
                    portionOptimizer.optimizeMeal(
                            mealName,
                            candidate,
                            target
                    );

            double score =
                    portionOptimizer
                            .calculateMealScore(
                                    meal,
                                    target
                            );

            if (score < bestScore) {

                bestScore = score;
                bestMeal = meal;
            }
        }

        if (bestMeal == null) {

            throw new IllegalStateException(
                    "Unable to generate meal: "
                            + mealName
            );
        }

        return bestMeal;
    }

    // =====================================
    // DAILY TOTAL CALCULATION
    // =====================================

    private DailyNutritionSummary calculateDailyTotals(List<Meal> meals) {

        double calories = 0;
        double protein = 0;
        double carbs = 0;
        double fat = 0;

        for (Meal meal : meals) {

            calories +=
                    meal.getTotalCalories();

            protein +=
                    meal.getTotalProtein();

            carbs +=
                    meal.getTotalCarbs();

            fat +=
                    meal.getTotalFat();
        }

        return new DailyNutritionSummary(
                calories,
                protein,
                carbs,
                fat
        );
    }

}