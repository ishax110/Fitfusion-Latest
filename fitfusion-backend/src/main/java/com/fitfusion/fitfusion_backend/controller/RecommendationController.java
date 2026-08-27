package com.fitfusion.fitfusion_backend.controller;

import com.fitfusion.fitfusion_backend.dto.recommendation.RecommendationResponse;
import com.fitfusion.fitfusion_backend.service.RecommendationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(
            RecommendationService recommendationService) {

        this.recommendationService =
                recommendationService;
    }

    @GetMapping
    public ResponseEntity<RecommendationResponse>
            getRecommendation() {

        RecommendationResponse response =
                recommendationService
                        .generateRecommendation();

        return ResponseEntity.ok(response);
    }
}