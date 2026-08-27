package com.fitfusion.fitfusion_backend.repository;

import com.fitfusion.fitfusion_backend.entity.FitnessProfile;
import com.fitfusion.fitfusion_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FitnessProfileRepository extends JpaRepository<FitnessProfile, UUID> {

    Optional<FitnessProfile> findByUser(User user);

    boolean existsByUser(User user);
}