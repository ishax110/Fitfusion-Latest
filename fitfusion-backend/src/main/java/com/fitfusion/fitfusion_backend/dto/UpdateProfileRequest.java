package com.fitfusion.fitfusion_backend.dto;

import com.fitfusion.fitfusion_backend.entity.ActivityLevel;
import com.fitfusion.fitfusion_backend.entity.ExperienceLevel;
import com.fitfusion.fitfusion_backend.entity.Gender;
import com.fitfusion.fitfusion_backend.entity.Goal;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {

    @NotNull
    @Min(13)
    @Max(100)
    private Integer age;

    @NotNull
    private Gender gender;

    @NotNull
    @Min(100)
    @Max(250)
    private Double height;

    @NotNull
    @Min(20)
    @Max(300)
    private Double weight;

    @NotNull
    private Goal goal;

    @NotNull
    private ActivityLevel activityLevel;

    @NotNull
    private ExperienceLevel experienceLevel;

    @Size(max = 500)
    private String medicalConditions;

    public UpdateProfileRequest() {
    }

    // Generate Getters and Setters

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public Double getHeight() {
        return height;
    }

    public void setHeight(Double height) {
        this.height = height;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public Goal getGoal() {
        return goal;
    }

    public void setGoal(Goal goal) {
        this.goal = goal;
    }

    public ActivityLevel getActivityLevel() {
        return activityLevel;
    }

    public void setActivityLevel(ActivityLevel activityLevel) {
        this.activityLevel = activityLevel;
    }

    public ExperienceLevel getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(ExperienceLevel experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public String getMedicalConditions() {
        return medicalConditions;
    }

    public void setMedicalConditions(String medicalConditions) {
        this.medicalConditions = medicalConditions;
    }
}