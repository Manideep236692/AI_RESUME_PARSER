package com.recruitment.controller;

import com.recruitment.dto.response.CareerPathResponse;
import com.recruitment.dto.response.RecommendationResponse;
import com.recruitment.dto.response.SkillGapResponse;
import com.recruitment.security.CurrentUser;
import com.recruitment.security.UserPrincipal;
import com.recruitment.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobseeker/ai")
@RequiredArgsConstructor
public class JobSeekerAIController {

    private final RecommendationService recommendationService;

    @GetMapping("/recommendations")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<List<RecommendationResponse>> getRecommendations(@CurrentUser UserPrincipal currentUser) {
        List<RecommendationResponse> recommendations = 
                recommendationService.getRecommendationsForJobSeeker(currentUser.getId());
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/skill-gap/{jobPostingId}")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<SkillGapResponse> getSkillGapAnalysis(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID jobPostingId) {
        SkillGapResponse skillGapResponse = 
                recommendationService.getSkillGapAnalysis(currentUser.getId(), jobPostingId);
        return ResponseEntity.ok(skillGapResponse);
    }

    @GetMapping("/career-path")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<List<CareerPathResponse>> getCareerPathSuggestions(
            @CurrentUser UserPrincipal currentUser) {
        List<CareerPathResponse> careerPathResponses = 
                recommendationService.getCareerPathSuggestions(currentUser.getId());
        return ResponseEntity.ok(careerPathResponses);
    }
}