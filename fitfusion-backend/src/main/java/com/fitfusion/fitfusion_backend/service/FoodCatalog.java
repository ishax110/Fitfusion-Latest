package com.fitfusion.fitfusion_backend.service;

import com.fitfusion.fitfusion_backend.dto.recommendation.FoodCategory;
import com.fitfusion.fitfusion_backend.dto.recommendation.FoodData;
import com.fitfusion.fitfusion_backend.dto.recommendation.MealType;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class FoodCatalog {

    private final List<FoodData> foods;

    public FoodCatalog() {

        foods = List.of(

                // PROTEIN

                new FoodData(
                        "Chicken Breast",
                        31,
                        0,
                        3.6,
                        FoodCategory.PROTEIN,
                        100,
                        200,
                        Set.of(
                                MealType.LUNCH,
                                MealType.DINNER
                        )
                ),

                new FoodData(
                        "Egg",
                        12.6,
                        0.7,
                        9.5,
                        FoodCategory.PROTEIN,
                        50,
                        150,
                        Set.of(
                                MealType.BREAKFAST,
                                MealType.LUNCH,
                                MealType.DINNER
                        )
                ),

                new FoodData(
                        "Paneer",
                        18,
                        6,
                        20,
                        FoodCategory.PROTEIN,
                        50,
                        150,
                        Set.of(
                                MealType.LUNCH,
                                MealType.DINNER
                        )
                ),

                new FoodData(
                        "Greek Yogurt",
                        10,
                        3.6,
                        0.4,
                        FoodCategory.PROTEIN,
                        100,
                        200,
                        Set.of(
                                MealType.BREAKFAST,
                                MealType.SNACK
                        )
                ),

                // CARBOHYDRATE

                new FoodData(
                        "Cooked Rice",
                        2.7,
                        28,
                        0.3,
                        FoodCategory.CARBOHYDRATE,
                        100,
                        250,
                        Set.of(
                                MealType.LUNCH,
                                MealType.DINNER
                        )
                ),

                new FoodData(
                        "Oats",
                        16.9,
                        66.3,
                        6.9,
                        FoodCategory.CARBOHYDRATE,
                        40,
                        100,
                        Set.of(
                                MealType.BREAKFAST,
                                MealType.SNACK
                        )
                ),

                new FoodData(
                        "Boiled Potato",
                        1.9,
                        20.1,
                        0.1,
                        FoodCategory.CARBOHYDRATE,
                        100,
                        250,
                        Set.of(
                                MealType.LUNCH,
                                MealType.DINNER
                        )
                ),

                new FoodData(
                        "Whole Wheat Chapati",
                        11,
                        55,
                        7,
                        FoodCategory.CARBOHYDRATE,
                        40,
                        120,
                        Set.of(
                                MealType.BREAKFAST,
                                MealType.LUNCH,
                                MealType.DINNER
                        )
                ),

                // FAT

                new FoodData(
                        "Peanut Butter",
                        25,
                        20,
                        50,
                        FoodCategory.FAT,
                        10,
                        30,
                        Set.of(
                                MealType.BREAKFAST,
                                MealType.SNACK
                        )
                ),

                new FoodData(
                        "Almonds",
                        21.2,
                        21.6,
                        49.9,
                        FoodCategory.FAT,
                        10,
                        30,
                        Set.of(
                                MealType.BREAKFAST,
                                MealType.SNACK,
                                MealType.LUNCH,
                                MealType.DINNER
                        )
                ),

                // VEGETABLE

                new FoodData(
                        "Broccoli",
                        2.4,
                        7.2,
                        0.4,
                        FoodCategory.VEGETABLE,
                        50,
                        150,
                        Set.of(
                                MealType.LUNCH,
                                MealType.DINNER
                        )
                ),

                new FoodData(
                        "Carrot",
                        0.9,
                        9.6,
                        0.2,
                        FoodCategory.VEGETABLE,
                        50,
                        150,
                        Set.of(
                                MealType.LUNCH,
                                MealType.DINNER
                        )
                ),

                //Fruits

                new FoodData(
                        "Banana",
                        1.1,
                        22.8,
                        0.3,
                        FoodCategory.FRUIT,
                        80,
                        150,
                        Set.of(
                                MealType.BREAKFAST,
                                MealType.SNACK
                        )
                ),

                new FoodData(
                        "Apple",
                        0.3,
                        13.8,
                        0.2,
                        FoodCategory.FRUIT,
                        100,
                        200,
                        Set.of(
                                MealType.BREAKFAST,
                                MealType.SNACK
                        )
                )

        );


    }

    public List<FoodData> getAllFoods() {
        return foods;
    }

    public List<FoodData> findByCategory(
            FoodCategory category) {

        return foods.stream()
                .filter(food ->
                        food.getCategory() == category
                )
                .toList();
    }
}