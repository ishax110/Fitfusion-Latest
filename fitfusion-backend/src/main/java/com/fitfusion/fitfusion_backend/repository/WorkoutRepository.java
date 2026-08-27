package com.fitfusion.fitfusion_backend.repository;

import com.fitfusion.fitfusion_backend.entity.User;
import com.fitfusion.fitfusion_backend.entity.Workout;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkoutRepository
        extends JpaRepository<Workout, Long> {

    List<Workout> findByUser(User user);

    Optional<Workout> findByIdAndUser(
            Long id,
            User user
    );
}