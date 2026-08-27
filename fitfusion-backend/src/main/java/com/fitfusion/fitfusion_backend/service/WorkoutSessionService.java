package com.fitfusion.fitfusion_backend.service;

import com.fitfusion.fitfusion_backend.dto.WorkoutSessionResponse;
import com.fitfusion.fitfusion_backend.dto.WorkoutSessionSaveRequest;

import java.util.List;

public interface WorkoutSessionService {

    /** Save a completed session and run ML progression prediction. */
    WorkoutSessionResponse saveSession(WorkoutSessionSaveRequest request);

    /** All sessions for the current user, newest first. */
    List<WorkoutSessionResponse> getMySessions();

    /** Recent N sessions for dashboard summary. */
    List<WorkoutSessionResponse> getRecentSessions(int limit);

    /** Sessions filtered by exercise name. */
    List<WorkoutSessionResponse> getSessionsByExercise(String exercise);

    /** Total session count for current user. */
    long getSessionCount();
}
