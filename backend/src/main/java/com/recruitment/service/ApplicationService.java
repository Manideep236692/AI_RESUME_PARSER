package com.recruitment.service;

import com.recruitment.dto.request.JobApplicationRequest;
import com.recruitment.entity.JobApplication;
import com.recruitment.entity.JobPosting;
import com.recruitment.entity.JobSeeker;
import com.recruitment.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final JobSeekerService jobSeekerService;
    private final JobService jobService;
    private final ResumeService resumeService;
    private final AIIntegrationService aiIntegrationService;

    @Transactional
    public JobApplication applyForJob(UUID userId, JobApplicationRequest request) {
        JobSeeker jobSeeker = jobSeekerService.getJobSeekerByUserId(userId);
        JobPosting jobPosting = jobService.getJobById(request.getJobPostingId());

        if (applicationRepository.existsByJobSeekerIdAndJobPostingId(
                jobSeeker.getId(), jobPosting.getId())) {
            throw new RuntimeException("Already applied for this job");
        }

        JobApplication application = new JobApplication();
        application.setJobSeeker(jobSeeker);
        application.setJobPosting(jobPosting);
        application.setStatus("APPLIED");
        application.setCoverLetter(request.getCoverLetter());

        // Calculate AI match score automatically during application
        try {
            com.recruitment.entity.Resume resume = resumeService.getPrimaryResume(jobSeeker.getId());
            if (resume != null && resume.getParsedData() != null) {
                com.fasterxml.jackson.databind.JsonNode skillGapData = aiIntegrationService.getSkillGapAnalysis(
                        resume.getParsedData(),
                        jobPosting.getId());
                
                if (skillGapData != null && skillGapData.has("overallMatch")) {
                    application.setAiMatchScore(java.math.BigDecimal.valueOf(skillGapData.get("overallMatch").asDouble()));
                }
            }
        } catch (Exception e) {
            // Log error but don't fail the application process
            System.err.println("Error calculating AI match score during application: " + e.getMessage());
        }

        return applicationRepository.save(application);
    }

    public List<JobApplication> getApplicationsByJobSeeker(UUID userId) {
        JobSeeker jobSeeker = jobSeekerService.getJobSeekerByUserId(userId);
        return applicationRepository.findByJobSeekerId(jobSeeker.getId());
    }

    public List<JobApplication> getApplicationsForJob(UUID jobId) {
        return applicationRepository.findByJobPostingId(jobId);
    }

    @Transactional
    public JobApplication updateApplicationStatus(UUID applicationId, String status) {
        JobApplication application = applicationRepository.findById(java.util.Objects.requireNonNull(applicationId))
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(status);
        return applicationRepository.save(application);
    }
}
