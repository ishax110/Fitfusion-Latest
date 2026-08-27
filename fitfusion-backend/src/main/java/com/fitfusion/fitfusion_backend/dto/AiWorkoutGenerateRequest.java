package com.fitfusion.fitfusion_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request body for POST /api/workouts/generate-ai
 * The only field the user provides is optional free-text preferences
 * and days per week. All other fields are auto-filled from their
 * FitnessProfile by the service layer.
 */
public class AiWorkoutGenerateRequest {

    /**
     * Free-text preferences from the user,
     * e.g. "I prefer morning workouts, no equipment at home".
     */
    private String preferences;

    /**
     * Number of workout days per week (1-7). Defaults to 4.
     */
    @JsonProperty("days_per_week")
    private Integer daysPerWeek = 4;

    public AiWorkoutGenerateRequest() {}

    public String getPreferences() {
        return preferences;
    }

    public void setPreferences(String preferences) {
        this.preferences = preferences;
    }

    public Integer getDaysPerWeek() {
        return daysPerWeek;
    }

    public void setDaysPerWeek(Integer daysPerWeek) {
        this.daysPerWeek = daysPerWeek;
    }
}
