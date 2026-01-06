package com.recruitment.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruitment.dto.response.CandidateScreeningResponse;
import com.recruitment.dto.response.CandidateShortlistResponse;
import com.recruitment.entity.JobPosting;
import com.recruitment.entity.JobSeeker;
import com.recruitment.entity.Resume;
import com.recruitment.entity.User;
import com.recruitment.exception.ResourceNotFoundException;
import com.recruitment.repository.JobPostingRepository;

import com.recruitment.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RecruiterAIService {

    private final AIIntegrationService aiIntegrationService;
    private final JobPostingRepository jobPostingRepository;

    private final ResumeRepository resumeRepository;

    /**
     * Screen candidates for a specific job posting using AI
     * 
     * @param jobPostingId The job posting ID
     * @param recruiterId  The recruiter ID
     * @return List of candidates with screening results
     */
    @Transactional(readOnly = true)
    public List<CandidateScreeningResponse> screenCandidatesForJob(UUID jobPostingId, UUID recruiterId) {
        // Verify job posting belongs to recruiter
        JobPosting jobPosting = jobPostingRepository.findByIdAndRecruiterId(jobPostingId, recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("Job posting not found or not owned by recruiter"));

        // Get all resumes in the system
        List<Resume> allResumes = resumeRepository.findAllPrimaryResumes();

        try {
            // Filter resumes with parsed data and create a map of job seeker ID to resume
            // data
            Map<String, JsonNode> resumeDataMap = allResumes.stream()
                    .filter(r -> r.getParsedData() != null && r.getJobSeeker() != null)
                    .collect(Collectors.toMap(
                            r -> r.getJobSeeker().getId().toString(),
                            Resume::getParsedData));

            // Use AI to screen candidates
            JsonNode screeningResults = aiIntegrationService.screenCandidates(
                    convertRequirementsToList(jobPosting.getRequirements()),
                    resumeDataMap);

            // Process and return results
            return processScreeningResults(screeningResults, allResumes);

        } catch (Exception e) {
            log.error("Error screening candidates for job " + jobPostingId, e);
            throw new RuntimeException("Error screening candidates: " + e.getMessage(), e);
        }
    }

    private List<String> convertRequirementsToList(JsonNode requirements) {
        if (requirements == null || requirements.isNull()) {
            return Collections.emptyList();
        }
        List<String> list = new ArrayList<>();
        if (requirements.isArray()) {
            requirements.forEach(node -> list.add(node.asText()));
        } else if (requirements.isObject() && requirements.has("skills")) {
            JsonNode skills = requirements.get("skills");
            if (skills.isArray()) {
                skills.forEach(node -> list.add(node.asText()));
            } else {
                list.add(skills.asText());
            }
        } else {
            list.add(requirements.asText());
        }
        return list;
    }

    /**
     * Generate a shortlist of top candidates for a job posting
     * 
     * @param jobPostingId The job posting ID
     * @param recruiterId  The recruiter ID
     * @param limit        Maximum number of candidates to include
     * @return List of shortlisted candidates
     */
    public CandidateShortlistResponse shortlistCandidatesForJob(UUID jobPostingId, UUID recruiterId, int limit) {
        // Screen all candidates first
        List<CandidateScreeningResponse> screenedCandidates = screenCandidatesForJob(jobPostingId, recruiterId);

        // Sort by match score and take top candidates
        List<CandidateScreeningResponse> shortlistedCandidates = screenedCandidates.stream()
                .sorted(Comparator.comparing(CandidateScreeningResponse::getMatchScore).reversed())
                .limit(limit)
                .collect(Collectors.toList());

        // Group candidates by skill clusters
        Map<String, List<CandidateScreeningResponse>> skillClusters = groupCandidatesBySkillClusters(
                shortlistedCandidates);

        // Create shortlist response
        CandidateShortlistResponse response = new CandidateShortlistResponse();
        response.setJobPostingId(jobPostingId);
        response.setTotalCandidatesScreened(screenedCandidates.size());
        response.setShortlistedCandidates(shortlistedCandidates);
        response.setSkillClusters(skillClusters);

        return response;
    }

    /**
     * Group candidates by skill clusters for better visualization
     * 
     * @param candidates List of candidates
     * @return Map of skill cluster name to list of candidates
     */
    private Map<String, List<CandidateScreeningResponse>> groupCandidatesBySkillClusters(
            List<CandidateScreeningResponse> candidates) {
        // This would typically use AI to cluster candidates, but for simplicity
        // we'll use a basic approach based on top skills
        Map<String, List<CandidateScreeningResponse>> clusters = new HashMap<>();

        for (CandidateScreeningResponse candidate : candidates) {
            String topSkill = candidate.getKeySkills().isEmpty() ? "Other" : candidate.getKeySkills().get(0);

            if (!clusters.containsKey(topSkill)) {
                clusters.put(topSkill, new ArrayList<>());
            }

            clusters.get(topSkill).add(candidate);
        }

        return clusters;
    }

    // @SuppressWarnings("unchecked") removed as per lint warning

    private List<CandidateScreeningResponse> processScreeningResults(
            JsonNode screeningResults,
            List<Resume> allResumes) {

        List<CandidateScreeningResponse> results = new ArrayList<>();

        try {
            // Process each candidate result
            Iterator<Map.Entry<String, JsonNode>> fields = screeningResults.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();
                UUID jobSeekerId = UUID.fromString(entry.getKey());
                JsonNode candidateResult = entry.getValue();

                // Find the resume for this job seeker
                Optional<Resume> resumeOpt = allResumes.stream()
                        .filter(r -> r.getJobSeeker() != null && r.getJobSeeker().getId().equals(jobSeekerId))
                        .findFirst();

                if (resumeOpt.isPresent()) {
                    Resume resume = resumeOpt.get();
                    JobSeeker jobSeeker = resume.getJobSeeker();
                    if (jobSeeker == null || jobSeeker.getUser() == null) {
                        log.warn("Resume {} has null job seeker or user, skipping", resume.getId());
                        continue;
                    }
                    User user = jobSeeker.getUser();

                    CandidateScreeningResponse response = new CandidateScreeningResponse();
                    response.setJobSeekerId(jobSeekerId);
                    response.setName(user.getFullName());
                    response.setEmail(user.getEmail());

                    // Extract data from JSON response
                    if (candidateResult.has("matchScore")) {
                        response.setMatchScore(candidateResult.get("matchScore").asDouble());
                    }

                    if (candidateResult.has("strengths") && candidateResult.get("strengths").isArray()) {
                        List<String> strengths = new ArrayList<>();
                        candidateResult.get("strengths").forEach(node -> strengths.add(node.asText()));
                        response.setStrengths(strengths);
                    }

                    if (candidateResult.has("weaknesses") && candidateResult.get("weaknesses").isArray()) {
                        List<String> weaknesses = new ArrayList<>();
                        candidateResult.get("weaknesses").forEach(node -> weaknesses.add(node.asText()));
                        response.setWeaknesses(weaknesses);
                    }

                    if (candidateResult.has("culturalFitScore")) {
                        response.setCulturalFitScore(candidateResult.get("culturalFitScore").asDouble());
                    }

                    // Set default values for required fields if not present
                    if (response.getKeySkills() == null) {
                        response.setKeySkills(new ArrayList<>());
                    }
                    if (response.getExperienceYears() == null) {
                        response.setExperienceYears(0);
                    }

                    results.add(response);
                }
            }

            // Sort by match score (descending), handling null scores
            results.sort((r1, r2) -> {
                Double score1 = r1.getMatchScore() != null ? r1.getMatchScore() : 0.0;
                Double score2 = r2.getMatchScore() != null ? r2.getMatchScore() : 0.0;
                return Double.compare(score2, score1); // Descending order
            });

        } catch (Exception e) {
            log.error("Error processing screening results", e);
            throw new RuntimeException("Error processing screening results: " + e.getMessage(), e);
        }

        return results;
    }
}