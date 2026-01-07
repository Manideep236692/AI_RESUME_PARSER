package com.recruitment.controller;

import com.recruitment.dto.response.CandidateScreeningResponse;
import com.recruitment.dto.response.CandidateShortlistResponse;
import com.recruitment.entity.Recruiter;
import com.recruitment.security.CurrentUser;
import com.recruitment.security.UserPrincipal;
import com.recruitment.service.RecruiterAIService;
import com.recruitment.service.RecruiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recruiter/ai")
@RequiredArgsConstructor
public class RecruiterAIController {

    private final RecruiterAIService recruiterAIService;
    private final RecruiterService recruiterService;

    @GetMapping("/screen/{jobPostingId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<List<CandidateScreeningResponse>> screenCandidates(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID jobPostingId) {
        Recruiter recruiter = recruiterService.getRecruiterByUserId(currentUser.getId());
        List<CandidateScreeningResponse> screeningResults = 
                recruiterAIService.screenCandidatesForJob(jobPostingId, recruiter.getId());
        return ResponseEntity.ok(screeningResults);
    }

    @GetMapping("/shortlist/{jobPostingId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<CandidateShortlistResponse> shortlistCandidates(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID jobPostingId,
            @RequestParam(defaultValue = "10") int limit) {
        Recruiter recruiter = recruiterService.getRecruiterByUserId(currentUser.getId());
        CandidateShortlistResponse shortlistResponse = 
                recruiterAIService.shortlistCandidatesForJob(jobPostingId, recruiter.getId(), limit);
        return ResponseEntity.ok(shortlistResponse);
    }

    @GetMapping("/advanced-match/{jobPostingId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<com.fasterxml.jackson.databind.JsonNode> getAdvancedMatch(
            @PathVariable UUID jobPostingId,
            @RequestParam(defaultValue = "bert") String method) {
        return ResponseEntity.ok(recruiterAIService.getAdvancedMatching(jobPostingId, method));
    }

    @GetMapping("/predict-fit/{jobSeekerId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<com.fasterxml.jackson.databind.JsonNode> predictFit(@PathVariable UUID jobSeekerId) {
        return ResponseEntity.ok(recruiterAIService.predictFit(jobSeekerId));
    }

    @GetMapping("/clusters")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<com.fasterxml.jackson.databind.JsonNode> getClusters() {
        return ResponseEntity.ok(recruiterAIService.getCandidateClusters());
    }
}