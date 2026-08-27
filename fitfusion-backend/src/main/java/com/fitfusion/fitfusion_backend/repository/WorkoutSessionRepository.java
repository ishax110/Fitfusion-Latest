package com.fitfusion.fitfusion_backend.repository;

import com.fitfusion.fitfusion_backend.entity.User;
import com.fitfusion.fitfusion_backend.entity.WorkoutSession;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {

    /** All sessions for a user, newest first. */
    List<WorkoutSession> findByUserOrderBySessionDateDesc(User user);

    /** Sessions for a specific exercise. */
    List<WorkoutSession> findByUserAndExerciseOrderBySessionDateDesc(User user, String exercise);

    /** Count of sessions completed by a user. */
    long countByUser(User user);

    /** Most recent N sessions for the dashboard using Pageable. */
    @Query("SELECT ws FROM WorkoutSession ws WHERE ws.user = :user ORDER BY ws.sessionDate DESC")
    List<WorkoutSession> findRecentByUser(@Param("user") User user, Pageable pageable);
}
