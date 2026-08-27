package com.fitfusion.fitfusion_backend.service;

import com.fitfusion.fitfusion_backend.dto.recommendation.Meal;
import com.fitfusion.fitfusion_backend.dto.recommendation.NutritionTarget;
import com.fitfusion.fitfusion_backend.dto.recommendation.RecommendationResponse;
import com.fitfusion.fitfusion_backend.entity.*;
import com.fitfusion.fitfusion_backend.repository.FitnessProfileRepository;
import com.fitfusion.fitfusion_backend.repository.UserRepository;
import com.fitfusion.fitfusion_backend.service.RecommendationService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

import static com.fitfusion.fitfusion_backend.entity.Goal.MUSCLE_GAIN;

@Service
public class RecommendationServiceImpl
        implements RecommendationService {

    private final UserRepository userRepository;
    private final FitnessProfileRepository fitnessProfileRepository;
    private final FoodNutritionService foodNutritionService;
    private final MealPlanService mealPlanService;


    public RecommendationServiceImpl(
            UserRepository userRepository, FitnessProfileRepository fitnessProfileRepository , FoodNutritionService foodNutritionService , MealPlanService mealPlanService) {

        this.userRepository = userRepository;
        this.fitnessProfileRepository = fitnessProfileRepository;
        this.foodNutritionService = foodNutritionService;
        this.mealPlanService = mealPlanService;
    }

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        UUID userId = UUID.fromString(
                authentication.getName()
        );

        return userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );
    }

    private FitnessProfile getCurrentProfile() {

        User currentUser = getCurrentUser();

        return fitnessProfileRepository
                .findByUser(currentUser)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Please complete your fitness profile first"
                        )
                );
    }

    //Calculate BMR
    private double calculateBmr(
            double weight,
            double height,
            int age,
            Gender gender) {

        double bmr =
                (10 * weight)
                        + (6.25 * height)
                        - (5 * age);

        if (gender == Gender.MALE) {
            bmr += 5;
        } else {
            bmr -= 161;
        }

        return bmr;
    }


    //TDE(Total Daily Energy Expenditure) Multiplier for ActivityLevel
    private double getActivityMultiplier(
            ActivityLevel activityLevel) {

        if (activityLevel == null) {
            return 1.2;
        }

        return switch (
                activityLevel
                ) {

            case SEDENTARY -> 1.2;
            case LIGHTLY_ACTIVE -> 1.375;
            case MODERATELY_ACTIVE -> 1.55;
            case VERY_ACTIVE -> 1.725;
            case EXTREMELY_ACTIVE -> 1.9;
        };
    }

    //Calculating TDE
    private double calculateTdee(
            double bmr,
            ActivityLevel activityLevel) {

        double multiplier =
                getActivityMultiplier(activityLevel);

        return bmr * multiplier;
    }

    //Example
//    BMR = 1789
//
//    Activity = MODERATELY_ACTIVE
//
//            Multiplier = 1.55
//
//    TDEE =
//            1789 × 1.55
//
//            ≈ 2773 kcal/day


    //Calculating the target calorie based on fitnees goal
    private int calculateTargetCalories(
            double tdee,
            Goal goal) {

        if (goal == null) {
            return (int) Math.round(tdee);
        }

        return switch (goal) {

            case WEIGHT_LOSS -> (int) Math.round(tdee - 400);

            case MUSCLE_GAIN -> (int) Math.round(tdee + 300);

            case MAINTENANCE -> (int) Math.round(tdee);

            case ENDURANCE -> (int) Math.round(tdee + 200);
        };
    }

    //Calculating Protien
    private int calculateProtein(
            double weight,
            Goal goal) {

        double proteinPerKg = switch (goal) {

            case WEIGHT_LOSS -> 1.8;

            case MUSCLE_GAIN -> 2.0;

            case MAINTENANCE -> 1.6;

            case ENDURANCE -> 1.6;
        };

        return (int) Math.round(
                weight * proteinPerKg
        );
    }


    //Calculating Fat based on Calories
    private int calculateFat(
            int dailyCalories) {

        double fatCalories =
                dailyCalories * 0.25;

        return (int) Math.round(
                fatCalories / 9
        );
    }

    //calculating carbohydrates
    private int calculateCarbohydrates(
            int dailyCalories,
            int proteinGrams,
            int fatGrams) {

        int proteinCalories =
                proteinGrams * 4;

        int fatCalories =
                fatGrams * 9;

        int remainingCalories =
                dailyCalories
                        - proteinCalories
                        - fatCalories;

        return (int) Math.round(
                remainingCalories / 4.0
        );
    }


    private List<String> generateWorkoutPlan(
            Goal goal,
            ExperienceLevel experienceLevel) {

        if (goal == null || experienceLevel == null) {
            throw new IllegalArgumentException(
                    "Goal and experience level are required"
            );
        }

        return switch (goal) {

            case WEIGHT_LOSS ->
                    generateWeightLossPlan(experienceLevel);

            case MUSCLE_GAIN ->
                    generateMuscleGainPlan(experienceLevel);

            case MAINTENANCE ->
                    generateMaintenancePlan(experienceLevel);

            case ENDURANCE ->
                    generateEndurancePlan(experienceLevel);
        };
    }

    private List<String> generateWeightLossPlan(
            ExperienceLevel level) {

        return switch (level) {

            case BEGINNER -> List.of(
                    "Monday - Full Body Strength",
                    "Tuesday - 30 min Brisk Walking",
                    "Wednesday - Rest",
                    "Thursday - Full Body Strength",
                    "Friday - 30 min Cardio",
                    "Saturday - Light Walking and Mobility",
                    "Sunday - Rest"
            );

            case INTERMEDIATE -> List.of(
                    "Monday - Upper Body Strength",
                    "Tuesday - 40 min Cardio",
                    "Wednesday - Lower Body Strength",
                    "Thursday - Active Recovery",
                    "Friday - Full Body Strength",
                    "Saturday - HIIT",
                    "Sunday - Rest"
            );

            case ADVANCED -> List.of(
                    "Monday - Upper Body Strength + Cardio",
                    "Tuesday - Lower Body Strength",
                    "Wednesday - HIIT",
                    "Thursday - Upper Body Strength",
                    "Friday - Lower Body Strength + Cardio",
                    "Saturday - Conditioning",
                    "Sunday - Rest"
            );
        };
    }


    private List<String> generateMuscleGainPlan(
            ExperienceLevel level) {

        return switch (level) {

            case BEGINNER -> List.of(
                    "Monday - Full Body Strength",
                    "Tuesday - Rest",
                    "Wednesday - Full Body Strength",
                    "Thursday - Rest",
                    "Friday - Full Body Strength",
                    "Saturday - Light Activity",
                    "Sunday - Rest"
            );

            case INTERMEDIATE -> List.of(
                    "Monday - Chest and Triceps",
                    "Tuesday - Back and Biceps",
                    "Wednesday - Rest",
                    "Thursday - Legs",
                    "Friday - Shoulders and Arms",
                    "Saturday - Light Activity",
                    "Sunday - Rest"
            );

            case ADVANCED -> List.of(
                    "Monday - Push",
                    "Tuesday - Pull",
                    "Wednesday - Legs",
                    "Thursday - Push",
                    "Friday - Pull",
                    "Saturday - Legs",
                    "Sunday - Rest"
            );
        };
    }


    private List<String> generateMaintenancePlan(
            ExperienceLevel level) {

        return switch (level) {

            case BEGINNER -> List.of(
                    "Monday - Full Body Strength",
                    "Tuesday - Light Cardio",
                    "Wednesday - Rest",
                    "Thursday - Full Body Strength",
                    "Friday - Walking",
                    "Saturday - Mobility",
                    "Sunday - Rest"
            );

            case INTERMEDIATE -> List.of(
                    "Monday - Upper Body",
                    "Tuesday - Lower Body",
                    "Wednesday - Cardio",
                    "Thursday - Rest",
                    "Friday - Full Body",
                    "Saturday - Light Activity",
                    "Sunday - Rest"
            );

            case ADVANCED -> List.of(
                    "Monday - Push",
                    "Tuesday - Pull",
                    "Wednesday - Legs",
                    "Thursday - Cardio and Mobility",
                    "Friday - Upper Body",
                    "Saturday - Lower Body",
                    "Sunday - Rest"
            );
        };
    }

    private List<String> generateEndurancePlan(
            ExperienceLevel level) {

        return switch (level) {

            case BEGINNER -> List.of(
                    "Monday - 25 min Easy Cardio",
                    "Tuesday - Full Body Strength",
                    "Wednesday - Rest",
                    "Thursday - 30 min Cardio",
                    "Friday - Mobility",
                    "Saturday - 35 min Easy Cardio",
                    "Sunday - Rest"
            );

            case INTERMEDIATE -> List.of(
                    "Monday - 40 min Steady Cardio",
                    "Tuesday - Full Body Strength",
                    "Wednesday - Interval Training",
                    "Thursday - Recovery Cardio",
                    "Friday - Full Body Strength",
                    "Saturday - 60 min Endurance Session",
                    "Sunday - Rest"
            );

            case ADVANCED -> List.of(
                    "Monday - Tempo Training",
                    "Tuesday - Strength Training",
                    "Wednesday - Interval Training",
                    "Thursday - Recovery Session",
                    "Friday - Strength and Conditioning",
                    "Saturday - Long Endurance Session",
                    "Sunday - Rest"
            );
        };
    }


    @Override
    public RecommendationResponse generateRecommendation() {

        FitnessProfile profile =
                getCurrentProfile();

        double bmr = calculateBmr(
                profile.getWeight(),
                profile.getHeight(),
                profile.getAge(),
                profile.getGender()
        );

        double tdee = calculateTdee(
                bmr,
                profile.getActivityLevel()
        );

        int dailyCalories =
                calculateTargetCalories(
                        tdee,
                        profile.getGoal()
                );

        int proteinGrams =
                calculateProtein(
                        profile.getWeight(),
                        profile.getGoal()
                );

        int fatGrams =
                calculateFat(dailyCalories);

        int carbohydrateGrams =
                calculateCarbohydrates(
                        dailyCalories,
                        proteinGrams,
                        fatGrams
                );

        List<String> workoutPlan =
                generateWorkoutPlan(
                        profile.getGoal(),
                        profile.getExperienceLevel()
                );

        NutritionTarget nutritionTarget =
                new NutritionTarget(
                        dailyCalories,
                        proteinGrams,
                        carbohydrateGrams,
                        fatGrams
                );

        List<Meal> mealPlan =
                mealPlanService.generateMealPlan(
                        nutritionTarget
                );

        return new RecommendationResponse(
                profile.getGoal().name(),
                dailyCalories,
                proteinGrams,
                carbohydrateGrams,
                fatGrams,
                workoutPlan,
                mealPlan
        );
    }
}