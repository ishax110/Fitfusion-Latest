package com.fitfusion.fitfusion_backend.service;

import com.fitfusion.fitfusion_backend.dto.recommendation.FoodCategory;
import com.fitfusion.fitfusion_backend.dto.recommendation.FoodData;
import com.fitfusion.fitfusion_backend.dto.recommendation.MealType;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MealFoodSelectorImpl
        implements MealFoodSelector {

    private final FoodSelector foodSelector;

    public MealFoodSelectorImpl(
            FoodSelector foodSelector) {

        this.foodSelector = foodSelector;
    }

    @Override
    public List<List<FoodData>> generateMealCandidates(
            String mealName) {

        MealType mealType =
                MealType.valueOf(
                        mealName.toUpperCase()
                );

        List<FoodData> proteins =
                foodSelector.getFoodsByCategory(
                        FoodCategory.PROTEIN
                );

        List<FoodData> carbs =
                foodSelector.getFoodsByCategory(
                        FoodCategory.CARBOHYDRATE
                );

        List<FoodData> fats =
                foodSelector.getFoodsByCategory(
                        FoodCategory.FAT
                );

        List<FoodData> fruits =
                foodSelector.getFoodsByCategory(
                        FoodCategory.FRUIT
                );

        List<FoodData> vegetables =
                foodSelector.getFoodsByCategory(
                        FoodCategory.VEGETABLE
                );

        //Filtering the retrieved foods based on mealtype

        proteins =
                filterByMeal(
                        proteins,
                        mealType
                );

        carbs =
                filterByMeal(
                        carbs,
                        mealType
                );

        fats =
                filterByMeal(
                        fats,
                        mealType
                );

        fruits =
                filterByMeal(
                        fruits,
                        mealType
                );

        vegetables =
                filterByMeal(
                        vegetables,
                        mealType
                );

        return switch (mealName.toUpperCase()) {

            case "BREAKFAST" ->
                    generateBreakfastCandidates(
                            proteins,
                            carbs,
                            fats,
                            fruits
                    );

            case "LUNCH", "DINNER" ->
                    generateMainMealCandidates(
                            proteins,
                            carbs,
                            fats,
                            vegetables
                    );

            case "SNACK" ->
                    generateSnackCandidates(
                            proteins,
                            fats,
                            fruits
                    );

            default ->
                    throw new IllegalArgumentException(
                            "Unknown meal: " + mealName
                    );
        };
    }

    private List<List<FoodData>>
    generateBreakfastCandidates(
            List<FoodData> proteins,
            List<FoodData> carbs,
            List<FoodData> fats,
            List<FoodData> fruits) {

        List<List<FoodData>> candidates =
                new ArrayList<>();

        for (FoodData protein : proteins) {

            for (FoodData carb : carbs) {

                for (FoodData fruit : fruits) {

                    for (FoodData fat : fats) {

                        candidates.add(
                                List.of(
                                        protein,
                                        carb,
                                        fruit,
                                        fat
                                )
                        );
                    }
                }
            }
        }

        return candidates;
    }

    private List<List<FoodData>>
    generateMainMealCandidates(
            List<FoodData> proteins,
            List<FoodData> carbs,
            List<FoodData> fats,
            List<FoodData> vegetables) {

        List<List<FoodData>> candidates =
                new ArrayList<>();

        for (FoodData protein : proteins) {

            for (FoodData carb : carbs) {

                for (FoodData fat : fats) {

                    for (FoodData vegetable : vegetables) {

                        candidates.add(
                                List.of(
                                        protein,
                                        carb,
                                        fat,
                                        vegetable
                                )
                        );

                        // Also allow two carbohydrate
                        // sources when needed.
                        for (FoodData secondCarb : carbs) {

                            if (secondCarb != carb) {

                                candidates.add(
                                        List.of(
                                                protein,
                                                carb,
                                                secondCarb,
                                                fat,
                                                vegetable
                                        )
                                );
                            }
                        }
                    }
                }
            }
        }

        return candidates;
    }

    private List<FoodData> filterByMeal(
            List<FoodData> foods,
            MealType mealType) {

        return foods.stream()
                .filter(food ->
                        food.isSuitableFor(mealType)
                )
                .toList();
    }

    private List<List<FoodData>>
    generateSnackCandidates(
            List<FoodData> proteins,
            List<FoodData> fats,
            List<FoodData> fruits) {

        List<List<FoodData>> candidates =
                new ArrayList<>();

        for (FoodData protein : proteins) {

            for (FoodData fruit : fruits) {

                for (FoodData fat : fats) {

                    candidates.add(
                            List.of(
                                    protein,
                                    fruit,
                                    fat
                            )
                    );
                }
            }
        }

        return candidates;
    }
}