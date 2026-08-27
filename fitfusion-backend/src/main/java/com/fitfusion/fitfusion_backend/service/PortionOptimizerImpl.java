package com.fitfusion.fitfusion_backend.service;

import com.fitfusion.fitfusion_backend.dto.recommendation.FoodData;
import com.fitfusion.fitfusion_backend.dto.recommendation.FoodItem;
import com.fitfusion.fitfusion_backend.dto.recommendation.Meal;
import com.fitfusion.fitfusion_backend.dto.recommendation.MealTarget;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PortionOptimizerImpl
        implements PortionOptimizer {

    private static final double STEP_SIZE = 10.0;

    private final FoodNutritionService foodNutritionService;

    public PortionOptimizerImpl(
            FoodNutritionService foodNutritionService) {

        this.foodNutritionService =
                foodNutritionService;
    }

    @Override
    public Meal optimizeMeal(
            String mealName,
            List<FoodData> foods,
            MealTarget target) {

        if (foods == null || foods.isEmpty()) {
            throw new IllegalArgumentException(
                    "Foods cannot be empty"
            );
        }

        OptimizationResult result =
                findBestCombination(
                        foods,
                        target,
                        0,
                        new ArrayList<>()
                );

        return new Meal(
                mealName,
                result.foodItems
        );
    }

    private OptimizationResult findBestCombination(
            List<FoodData> foods,
            MealTarget target,
            int index,
            List<FoodItem> currentItems) {

        if (index == foods.size()) {

            double score =
                    calculateScore(
                            currentItems,
                            target
                    );

            return new OptimizationResult(
                    new ArrayList<>(currentItems),
                    score
            );
        }

        FoodData food = foods.get(index);

        OptimizationResult bestResult = null;

        for (double quantity = food.getMinServing();
             quantity <= food.getMaxServing();
             quantity += STEP_SIZE) {

            FoodItem item =
                    foodNutritionService.createFoodItem(
                            food,
                            quantity
                    );

            currentItems.add(item);

            OptimizationResult result =
                    findBestCombination(
                            foods,
                            target,
                            index + 1,
                            currentItems
                    );

            currentItems.remove(
                    currentItems.size() - 1
            );

            if (bestResult == null ||
                    result.score < bestResult.score) {

                bestResult = result;
            }
        }

        return bestResult;
    }

    private double calculateScore(
            List<FoodItem> items,
            MealTarget target) {

        double calories = 0;
        double protein = 0;
        double carbs = 0;
        double fat = 0;

        for (FoodItem item : items) {

            calories += item.getCalories();
            protein += item.getProtein();
            carbs += item.getCarbs();
            fat += item.getFat();
        }

        double calorieError =
                normalizedError(
                        calories,
                        target.getCalories()
                );

        double proteinError =
                normalizedError(
                        protein,
                        target.getProtein()
                );

        double carbError =
                normalizedError(
                        carbs,
                        target.getCarbs()
                );

        double fatError =
                normalizedError(
                        fat,
                        target.getFat()
                );

        return calorieError
                + proteinError
                + carbError
                + fatError;
    }

    private double normalizedError(
            double actual,
            double target) {

        if (target == 0) {
            return Math.abs(actual);
        }

        return Math.abs(actual - target)
                / target;
    }

    private static class OptimizationResult {

        private final List<FoodItem> foodItems;
        private final double score;

        private OptimizationResult(
                List<FoodItem> foodItems,
                double score) {

            this.foodItems = foodItems;
            this.score = score;
        }
    }
    @Override
    public double calculateMealScore(
            Meal meal,
            MealTarget target) {

        double calorieError =
                normalizedError(
                        meal.getTotalCalories(),
                        target.getCalories()
                );

        double proteinError =
                normalizedError(
                        meal.getTotalProtein(),
                        target.getProtein()
                );

        double carbError =
                normalizedError(
                        meal.getTotalCarbs(),
                        target.getCarbs()
                );

        double fatError =
                normalizedError(
                        meal.getTotalFat(),
                        target.getFat()
                );

        return calorieError
                + proteinError
                + carbError
                + fatError;
    }
}