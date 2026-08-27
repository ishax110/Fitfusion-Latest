package com.fitfusion.fitfusion_backend.service;

import com.fitfusion.fitfusion_backend.dto.recommendation.FoodCategory;
import com.fitfusion.fitfusion_backend.dto.recommendation.FoodData;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class FoodSelectorImpl implements FoodSelector {

    private final FoodCatalog foodCatalog;

    public FoodSelectorImpl(FoodCatalog foodCatalog) {
        this.foodCatalog = foodCatalog;
    }

    @Override
    public FoodData selectFood(FoodCategory category) {
        List<FoodData> foods = foodCatalog.findByCategory(category);

        if (foods.isEmpty()) {
            throw new IllegalArgumentException(
                    "No food available for category: " + category);
        }

        // Pick a random item from the category so every
        // recommendation call produces a different meal plan.
        int index = ThreadLocalRandom.current().nextInt(foods.size());
        return foods.get(index);
    }

    @Override
    public List<FoodData> getFoodsByCategory(FoodCategory category) {
        return foodCatalog.findByCategory(category);
    }
}
