package com.recruitment.controller;

import com.recruitment.dto.request.JobApplicationRequest;

import com.recruitment.dto.response.RecommendationResponse;
import com.recruitment.entity.JobApplication;
import com.recruitment.entity.JobSeeker;
import com.recruitment.entity.Resume;
import com.recruitment.security.UserPrincipal;
import com.recruitment.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobseeker")
@RequiredArgsConstructor
public class JobSeekerController {

    private final JobSeekerService jobSeekerService;
    private final ResumeService resumeService;
    private final ApplicationService applicationService;
    private final RecommendationService recommendationService;

    @GetMapping("/profile")
    public ResponseEntity<JobSeeker> getProfile(@AuthenticationPrincipal UserPrincipal userDetails) {
        JobSeeker jobSeeker = jobSeekerService.getJobSeekerByUserId(userDetails.getId());
        return ResponseEntity.ok(jobSeeker);
    }

    @PutMapping("/profile")
    public ResponseEntity<JobSeeker> updateProfile(
            @AuthenticationPrincipal UserPrincipal userDetails,
            @RequestBody JobSeeker updatedProfile) {
        JobSeeker jobSeeker = jobSeekerService.updateProfile(userDetails.getId(), updatedProfile);
        return ResponseEntity.ok(jobSeeker);
    }

    @PostMapping("/resume/upload")
    public ResponseEntity<?> uploadResume(
            @AuthenticationPrincipal(expression = "#this == 'anonymousUser' ? null : #this") UserPrincipal userDetails,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select a file to upload");
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !(contentType.equals("application/pdf") ||
                    contentType.equals("application/msword") ||
                    contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
                return ResponseEntity.badRequest().body("Only PDF, DOC and DOCX files are allowed");
            }

            UUID userId = (userDetails != null) ? userDetails.getId() : null;
            Resume resume = resumeService.uploadResume(userId, file);
            return ResponseEntity.ok(resume);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Error uploading file: " + e.getMessage());
        }
    }

    @GetMapping("/resumes")
    public ResponseEntity<?> getResumes(
            @AuthenticationPrincipal(expression = "#this == 'anonymousUser' ? null : #this") UserPrincipal userDetails) {
        try {
            // If user is not authenticated, return empty list
            if (userDetails == null) {
                return ResponseEntity.ok(List.of());
            }

            JobSeeker jobSeeker = jobSeekerService.getJobSeekerByUserId(userDetails.getId());
            List<Resume> resumes = resumeService.getResumesByJobSeeker(jobSeeker.getId());
            return ResponseEntity.ok(resumes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Error retrieving resumes: " + e.getMessage());
        }
    }

    @PostMapping("/apply")
    public ResponseEntity<JobApplication> applyForJob(
            @AuthenticationPrincipal UserPrincipal userDetails,
            @RequestBody JobApplicationRequest request) {
        JobApplication application = applicationService.applyForJob(userDetails.getId(), request);
        return ResponseEntity.ok(application);
    }

    @GetMapping("/applications")
    public ResponseEntity<List<JobApplication>> getApplications(
            @AuthenticationPrincipal UserPrincipal userDetails) {
        List<JobApplication> applications = applicationService.getApplicationsByJobSeeker(userDetails.getId());
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<RecommendationResponse>> getRecommendations(
            @AuthenticationPrincipal UserPrincipal userDetails) {
        List<RecommendationResponse> recommendations = recommendationService
                .getRecommendationsForJobSeeker(userDetails.getId());
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/skill-gap/{jobPostingId}")
    public ResponseEntity<?> getSkillGapAnalysis(
            @AuthenticationPrincipal UserPrincipal userDetails,
            @PathVariable UUID jobPostingId) {
        try {
            return ResponseEntity.ok(recommendationService.getSkillGapAnalysis(userDetails.getId(), jobPostingId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/resumes/{resumeId}")
    public ResponseEntity<?> deleteResume(
            @PathVariable UUID resumeId,
            @AuthenticationPrincipal UserPrincipal userDetails) {
        try {
            resumeService.deleteResume(resumeId, userDetails.getId());
            return ResponseEntity.ok().body("Resume deleted successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Error deleting resume: " + e.getMessage());
        }
    }

    @PutMapping("/resumes/{resumeId}/set-primary")
    public ResponseEntity<Resume> setResumeAsPrimary(
            @PathVariable UUID resumeId,
            @AuthenticationPrincipal UserPrincipal userDetails) {
        Resume resume = resumeService.setAsPrimary(resumeId, userDetails.getId());
        return ResponseEntity.ok(resume);
    }
}
