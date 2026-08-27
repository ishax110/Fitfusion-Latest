package com.fitfusion.fitfusion_backend.controller;

import com.fitfusion.fitfusion_backend.entity.User;
import com.fitfusion.fitfusion_backend.repository.FitnessProfileRepository;
import com.fitfusion.fitfusion_backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final FitnessProfileRepository fitnessProfileRepository;

    public UserController(
            UserRepository userRepository,
            FitnessProfileRepository fitnessProfileRepository) {
        this.userRepository = userRepository;
        this.fitnessProfileRepository = fitnessProfileRepository;
    }

    /**
     * GET /api/users/me
     * Returns the currently authenticated user's name, email, role,
     * and whether they have a fitness profile set up.
     * Used by the Dashboard to personalise the greeting and stats.
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            Authentication authentication) {

        UUID userId = UUID.fromString(authentication.getPrincipal().toString());

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        boolean hasProfile = fitnessProfileRepository.existsByUser(user);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id",         user.getId());
        response.put("name",       user.getName());
        response.put("email",      user.getEmail());
        response.put("role",       user.getRole());
        response.put("hasProfile", hasProfile);
        response.put("createdAt",  user.getCreatedAt());

        return ResponseEntity.ok(response);
    }
}
