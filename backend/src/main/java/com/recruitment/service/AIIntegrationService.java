package com.recruitment.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class AIIntegrationService {

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate;

    @Autowired
    public AIIntegrationService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(30))
                .setReadTimeout(Duration.ofSeconds(60))
                .build();
    }

    private final ObjectMapper objectMapper = new ObjectMapper();

    public JsonNode parseResume(MultipartFile resumeFile) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("resume", new ByteArrayResource(resumeFile.getBytes()) {
                @Override
                public String getFilename() {
                    return resumeFile.getOriginalFilename();
                }
            });

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    aiServiceUrl + "/parse",
                    java.util.Objects.requireNonNull(HttpMethod.POST),
                    requestEntity,
                    String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return objectMapper.readTree(response.getBody());
            }
            log.warn("AI service returned non-OK status or null body for resume parsing");
            return objectMapper.createObjectNode();

        } catch (IOException e) {
            log.error("Error parsing resume with AI service", e);
            return null;
        }
    }

    public String parseResumeAsString(MultipartFile resumeFile) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("resume", new ByteArrayResource(resumeFile.getBytes()) {
                @Override
                public String getFilename() {
                    return resumeFile.getOriginalFilename();
                }
            });

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    aiServiceUrl + "/parse",
                    java.util.Objects.requireNonNull(HttpMethod.POST),
                    requestEntity,
                    String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            }

            return null;

        } catch (Exception e) {
            log.error("Error calling AI service for resume parsing", e);
            throw new RuntimeException("Failed to parse resume with AI service: " + e.getMessage(), e);
        }
    }

    public JsonNode getJobRecommendations(JsonNode resumeData) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> request = new HashMap<>();
            request.put("resumeData", resumeData);
            request.put("useSemanticMatching", true);
            request.put("includeContextAwareMatching", true);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(request, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiServiceUrl + "/recommend-jobs",
                    requestEntity,
                    String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return objectMapper.readTree(response.getBody());
            }

            return objectMapper.createObjectNode();

        } catch (Exception e) {
            log.error("Error calling AI service for job recommendations", e);
            return objectMapper.createObjectNode();
        }
    }

    public JsonNode getSkillGapAnalysis(JsonNode resumeData, UUID jobPostingId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> request = new HashMap<>();
            request.put("resumeData", resumeData);
            request.put("jobPostingId", jobPostingId.toString());

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(request, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiServiceUrl + "/skill-gap-analysis",
                    requestEntity,
                    String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return objectMapper.readTree(response.getBody());
            }

            return objectMapper.createObjectNode();

        } catch (Exception e) {
            log.error("Error calling AI service for skill gap analysis", e);
            return objectMapper.createObjectNode();
        }
    }

    public JsonNode getCareerPathSuggestions(JsonNode resumeData) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> request = new HashMap<>();
            request.put("resumeData", resumeData);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(request, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiServiceUrl + "/career-path-suggestions",
                    requestEntity,
                    String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return objectMapper.readTree(response.getBody());
            }

            return objectMapper.createObjectNode();

        } catch (Exception e) {
            log.error("Error calling AI service for career path suggestions", e);
            return objectMapper.createObjectNode();
        }
    }

    public JsonNode screenCandidates(java.util.List<String> jobRequirements, Map<String, JsonNode> candidateResumes) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> request = new HashMap<>();
            // Join list items with newline for AI service
            String requirementsText = jobRequirements != null ? String.join("\n", jobRequirements) : "";
            request.put("jobRequirements", requirementsText);
            request.put("candidates", candidateResumes);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(request, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiServiceUrl + "/screen-candidates",
                    requestEntity,
                    String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return objectMapper.readTree(response.getBody());
            }

            return objectMapper.createObjectNode();

        } catch (Exception e) {
            log.error("Error calling AI service for candidate screening", e);
            return objectMapper.createObjectNode();
        }
    }

    public JsonNode searchCandidatePool(String query) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> request = new HashMap<>();
            request.put("query", query);
            request.put("top_k", 20); // Get top 20 results

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(request, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiServiceUrl + "/search-candidate-pool",
                    requestEntity,
                    String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return objectMapper.readTree(response.getBody());
            }

            return objectMapper.createObjectNode();

        } catch (Exception e) {
            log.error("Error calling AI service for global candidate search", e);
            return objectMapper.createObjectNode();
        }
    }

    public JsonNode matchTfidf(String jobDescription, java.util.List<String> resumes) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> request = new HashMap<>();
            request.put("jobDescription", jobDescription);
            request.put("resumes", resumes);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(request, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiServiceUrl + "/api/v1/match-tfidf",
                    requestEntity,
                    String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return objectMapper.readTree(response.getBody());
            }
            return objectMapper.createObjectNode();
        } catch (Exception e) {
            log.error("Error calling TF-IDF matching", e);
            return objectMapper.createObjectNode();
        }
    }

    public JsonNode matchBert(String jobDescription, java.util.List<String> resumes) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> request = new HashMap<>();
            request.put("jobDescription", jobDescription);
            request.put("resumes", resumes);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(request, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiServiceUrl + "/api/v1/match-bert",
                    requestEntity,
                    String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return objectMapper.readTree(response.getBody());
            }
            return objectMapper.createObjectNode();
        } catch (Exception e) {
            log.error("Error calling BERT matching", e);
            return objectMapper.createObjectNode();
        }
    }

    public JsonNode predictFit(Map<String, Object> features) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> request = new HashMap<>();
            request.put("features", features);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(request, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiServiceUrl + "/api/v1/predict-fit",
                    requestEntity,
                    String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return objectMapper.readTree(response.getBody());
            }
            return objectMapper.createObjectNode();
        } catch (Exception e) {
            log.error("Error calling fit prediction", e);
            return objectMapper.createObjectNode();
        }
    }

    public JsonNode getBusinessInsights() {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(
                    aiServiceUrl + "/api/v1/business-insights",
                    String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return objectMapper.readTree(response.getBody());
            }
            return objectMapper.createObjectNode();
        } catch (Exception e) {
            log.error("Error calling business insights", e);
            return objectMapper.createObjectNode();
        }
    }
}
