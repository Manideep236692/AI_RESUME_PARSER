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
        // Verify job posting
        JobPosting jobPosting = jobPostingRepository.findByIdAndRecruiterId(jobPostingId, recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("Job posting not found"));

        // Get all resumes
        List<Resume> allResumes = resumeRepository.findAllPrimaryResumes();
        List<String> resumeTexts = allResumes.stream()
                .map(r -> r.getParsedData() != null ? r.getParsedData().get("text").asText() : "")
                .collect(Collectors.toList());

        // Use BERT for better ranking
        JsonNode bertResults = aiIntegrationService.matchBert(jobPosting.getDescription(), resumeTexts);
        
        List<CandidateScreeningResponse> screenedCandidates = processAdvancedResults(bertResults, allResumes);

        // Sort and limit
        List<CandidateScreeningResponse> shortlistedCandidates = screenedCandidates.stream()
                .sorted(Comparator.comparing(CandidateScreeningResponse::getMatchScore).reversed())
                .limit(limit)
                .collect(Collectors.toList());

        // Group by skill clusters
        Map<String, List<CandidateScreeningResponse>> skillClusters = groupCandidatesBySkillClusters(shortlistedCandidates);

        CandidateShortlistResponse response = new CandidateShortlistResponse();
        response.setJobPostingId(jobPostingId);
        response.setTotalCandidatesScreened(screenedCandidates.size());
        response.setShortlistedCandidates(shortlistedCandidates);
        response.setSkillClusters(skillClusters);

        return response;
    }

    private List<CandidateScreeningResponse> processAdvancedResults(JsonNode aiResults, List<Resume> allResumes) {
        List<CandidateScreeningResponse> results = new ArrayList<>();
        if (aiResults.has("matches") && aiResults.get("matches").isArray()) {
            aiResults.get("matches").forEach(match -> {
                int index = match.get("index").asInt();
                double score = match.get("score").asDouble();
                
                if (index < allResumes.size()) {
                    Resume resume = allResumes.get(index);
                    if (resume.getJobSeeker() != null && resume.getJobSeeker().getUser() != null) {
                        CandidateScreeningResponse res = new CandidateScreeningResponse();
                        res.setJobSeekerId(resume.getJobSeeker().getId());
                        res.setName(resume.getJobSeeker().getUser().getFullName());
                        res.setEmail(resume.getJobSeeker().getUser().getEmail());
                        res.setMatchScore(score * 100);
                        res.setKeySkills(new ArrayList<>()); // Add logic to extract skills if needed
                        results.add(res);
                    }
                }
            });
        }
        return results;
    }

    public JsonNode getAdvancedMatching(UUID jobPostingId, String method) {
        JobPosting jobPosting = jobPostingRepository.findById(jobPostingId)
                .orElseThrow(() -> new ResourceNotFoundException("Job posting not found"));
        
        List<Resume> allResumes = resumeRepository.findAllPrimaryResumes();
        List<String> resumeTexts = allResumes.stream()
                .map(r -> r.getParsedData() != null ? r.getParsedData().get("text").asText() : "")
                .collect(Collectors.toList());

        if ("bert".equalsIgnoreCase(method)) {
            return aiIntegrationService.matchBert(jobPosting.getDescription(), resumeTexts);
        } else {
            return aiIntegrationService.matchTfidf(jobPosting.getDescription(), resumeTexts);
        }
    }

    public JsonNode predictFit(UUID jobSeekerId) {
        Resume resume = resumeRepository.findByJobSeekerId(jobSeekerId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
        
        JsonNode parsed = resume.getParsedData();
        Map<String, Object> features = new HashMap<>();
        if (parsed != null) {
            features.put("skills_count", parsed.has("skills") ? parsed.get("skills").size() : 0);
            features.put("experience", 5); // Placeholder or extract from text
            features.put("education", "Bachelor"); // Placeholder
        }
        
        return aiIntegrationService.predictFit(features);
    }

    public JsonNode getCandidateClusters() {
        return aiIntegrationService.clusterCandidates();
    }

    public JsonNode getBusinessInsights() {
        return aiIntegrationService.getBusinessInsights();
    }
}
