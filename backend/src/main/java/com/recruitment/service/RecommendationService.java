package com.recruitment.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitment.dto.response.JobResponse;
import com.recruitment.dto.response.RecommendationResponse;
import com.recruitment.dto.response.SkillGapResponse;
import com.recruitment.dto.response.CareerPathResponse;
import com.recruitment.entity.AIRecommendation;
import com.recruitment.entity.JobSeeker;
import com.recruitment.entity.Resume;
import com.recruitment.entity.JobPosting;
import com.recruitment.exception.ResourceNotFoundException;
import com.recruitment.repository.AIRecommendationRepository;
import com.recruitment.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RecommendationService {

    private final AIRecommendationRepository recommendationRepository;
    private final JobSeekerService jobSeekerService;
    private final ResumeService resumeService;
    private final AIIntegrationService aiIntegrationService;
    private final JobPostingRepository jobPostingRepository;

    public List<RecommendationResponse> getRecommendationsForJobSeeker(UUID userId) {
        JobSeeker jobSeeker = jobSeekerService.getJobSeekerByUserId(userId);

        // Get the primary resume for the job seeker
        Resume resume = resumeService.getPrimaryResume(jobSeeker.getId());

        if (resume != null && resume.getParsedData() != null) {
            try {
                // Use AI service to get semantic-based recommendations
                JsonNode aiRecommendations = aiIntegrationService.getJobRecommendations(resume.getParsedData());

                if (aiRecommendations != null) {
                    // Process AI recommendations and save to database
                    processAndSaveAIRecommendations(aiRecommendations, jobSeeker.getId());
                }
            } catch (Exception e) {
                log.error("Error getting AI recommendations", e);
            }
        }

        // Get AI recommendations from database
        List<AIRecommendation> recommendations = recommendationRepository
                .findTopRecommendationsForJobSeeker(jobSeeker.getId());

        return recommendations.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public SkillGapResponse getSkillGapAnalysis(UUID userId, UUID jobPostingId) {
        JobSeeker jobSeeker = jobSeekerService.getJobSeekerByUserId(userId);
        JobPosting jobPosting = jobPostingRepository.findById(java.util.Objects.requireNonNull(jobPostingId))
                .orElseThrow(() -> new ResourceNotFoundException("Job posting not found"));

        // Get the primary resume for the job seeker
        Resume resume = resumeService.getPrimaryResume(jobSeeker.getId());

        if (resume != null && resume.getParsedData() != null) {
            try {
                // Use AI service to get skill gap analysis
                JsonNode skillGapData = aiIntegrationService.getSkillGapAnalysis(
                        resume.getParsedData(),
                        jobPosting.getId());

                return convertToSkillGapResponse(skillGapData, jobPostingId);

            } catch (Exception e) {
                log.error("Error getting skill gap analysis", e);
                throw new RuntimeException("Failed to get skill gap analysis", e);
            }
        }

        throw new ResourceNotFoundException("No resume found for skill gap analysis");
    }

    public List<CareerPathResponse> getCareerPathSuggestions(UUID userId) {
        JobSeeker jobSeeker = jobSeekerService.getJobSeekerByUserId(userId);

        // Get the primary resume for the job seeker
        Resume resume = resumeService.getPrimaryResume(jobSeeker.getId());

        if (resume != null && resume.getParsedData() != null) {
            try {
                // Use AI service to get career path suggestions
                JsonNode careerPathData = aiIntegrationService.getCareerPathSuggestions(
                        resume.getParsedData());

                return convertToCareerPathResponses(careerPathData);

            } catch (Exception e) {
                log.error("Error getting career path suggestions", e);
                throw new RuntimeException("Failed to get career path suggestions", e);
            }
        }

        throw new ResourceNotFoundException("No resume found for career path suggestions");
    }

    @Transactional
    protected void processAndSaveAIRecommendations(JsonNode aiRecommendations, UUID jobSeekerId) {
        // Get the job posting ID from the AI recommendations if available
        UUID jobPostingId = null;
        if (aiRecommendations.has("job_posting_id")) {
            try {
                jobPostingId = UUID.fromString(aiRecommendations.get("job_posting_id").asText());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid job posting ID format in AI recommendations", e);
            }
        }

        JobPosting jobPosting = null;
        if (jobPostingId != null) {
            jobPosting = jobPostingRepository.findById(jobPostingId).orElse(null);
            if (jobPosting == null) {
                log.warn("Job posting not found with ID: " + jobPostingId);
            }
        }
        try {
            List<AIRecommendation> recommendations = new ArrayList<>();
            ObjectMapper objectMapper = new ObjectMapper();

            if (aiRecommendations.has("jobs") && aiRecommendations.get("jobs").isArray()) {
                for (JsonNode jobNode : aiRecommendations.get("jobs")) {
                    try {
                        String jobTitle = jobNode.has("title") ? jobNode.get("title").asText() : null;
                        String company = jobNode.has("company") ? jobNode.get("company").asText() : null;
                        String reason = jobNode.has("reason") ? jobNode.get("reason").asText() : null;
                        String rawData = objectMapper.writeValueAsString(jobNode);

                        BigDecimal matchScore = null;
                        if (jobNode.has("score")) {
                            try {
                                matchScore = new BigDecimal(jobNode.get("score").asDouble());
                            } catch (NumberFormatException e) {
                                log.warn("Invalid score format in AI recommendation", e);
                            }
                        }

                        AIRecommendation recommendation = AIRecommendation.createRecommendation(
                                jobSeekerId, jobTitle, company, matchScore, reason, rawData, jobPosting);

                        recommendations.add(recommendation);
                    } catch (Exception e) {
                        log.error("Error processing AI recommendation: " + jobNode, e);
                    }
                }
            }

            // Save to database in a single transaction
            if (!recommendations.isEmpty()) {
                recommendationRepository.saveAll(recommendations);
            }

        } catch (Exception e) {
            log.error("Error processing AI recommendations", e);
            throw new RuntimeException("Failed to process AI recommendations", e);
        }
    }

    private RecommendationResponse convertToResponse(AIRecommendation recommendation) {
        RecommendationResponse response = new RecommendationResponse();
        response.setId(recommendation.getId());
        response.setMatchScore(
                recommendation.getMatchScore() != null ? recommendation.getMatchScore() : new BigDecimal("0.0"));
        response.setRecommendationReason(recommendation.getReason());

        // Create a basic job response with available information
        JobResponse jobResponse = new JobResponse();
        jobResponse.setTitle(recommendation.getJobTitle());
        jobResponse.setCompanyName(recommendation.getCompany());

        response.setJob(jobResponse);
        return response;
    }

    // @SuppressWarnings("unchecked") removed as per lint warning

    private SkillGapResponse convertToSkillGapResponse(JsonNode skillGapData, UUID jobPostingId) {
        SkillGapResponse response = new SkillGapResponse();
        response.setJobPostingId(jobPostingId);

        if (skillGapData.has("missingSkills") && skillGapData.get("missingSkills").isArray()) {
            List<String> missingSkills = new ArrayList<>();
            skillGapData.get("missingSkills").forEach(node -> missingSkills.add(node.asText()));
            response.setMissingSkills(missingSkills);
        } else {
            response.setMissingSkills(new ArrayList<>());
        }

        if (skillGapData.has("matchingSkills") && skillGapData.get("matchingSkills").isArray()) {
            List<String> matchingSkills = new ArrayList<>();
            skillGapData.get("matchingSkills").forEach(node -> matchingSkills.add(node.asText()));
            response.setMatchingSkills(matchingSkills);
        } else {
            response.setMatchingSkills(new ArrayList<>());
        }

        if (skillGapData.has("learningResources") && skillGapData.get("learningResources").isArray()) {
            List<Map<String, String>> learningResources = new ArrayList<>();
            skillGapData.get("learningResources").forEach(node -> {
                Map<String, String> resource = new HashMap<>();
                node.fields().forEachRemaining(entry -> resource.put(entry.getKey(), entry.getValue().asText()));
                learningResources.add(resource);
            });
            response.setLearningResources(learningResources);
        } else {
            response.setLearningResources(new ArrayList<>());
        }

        if (skillGapData.has("overallMatch")) {
            response.setOverallMatchPercentage(skillGapData.get("overallMatch").asDouble());
        } else {
            response.setOverallMatchPercentage(0.0);
        }

        return response;
    }

    private List<CareerPathResponse> convertToCareerPathResponses(JsonNode careerPathData) {
        List<CareerPathResponse> responses = new ArrayList<>();

        if (careerPathData.has("careerPaths") && careerPathData.get("careerPaths").isArray()) {
            for (JsonNode pathNode : careerPathData.get("careerPaths")) {
                CareerPathResponse response = new CareerPathResponse();

                if (pathNode.has("title")) {
                    response.setTitle(pathNode.get("title").asText());
                }

                if (pathNode.has("description")) {
                    response.setDescription(pathNode.get("description").asText());
                }

                if (pathNode.has("growthPotential")) {
                    response.setGrowthPotential(pathNode.get("growthPotential").asText());
                }

                if (pathNode.has("timeToAchieve")) {
                    response.setTimeToAchieve(pathNode.get("timeToAchieve").asText());
                }

                if (pathNode.has("requiredSkills") && pathNode.get("requiredSkills").isArray()) {
                    List<String> requiredSkills = new ArrayList<>();
                    pathNode.get("requiredSkills").forEach(node -> requiredSkills.add(node.asText()));
                    response.setRequiredSkills(requiredSkills);
                } else {
                    response.setRequiredSkills(new ArrayList<>());
                }

                responses.add(response);
            }
        }

        return responses;
    }
}
