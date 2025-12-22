package com.recruitment.controller;

import com.recruitment.dto.request.JobPostRequest;
import com.recruitment.dto.response.JobResponse;
import com.recruitment.dto.response.MessageResponse;
import com.recruitment.entity.JobApplication;
import com.recruitment.entity.JobPosting;
import com.recruitment.entity.Recruiter;
import com.recruitment.security.UserPrincipal;
import com.recruitment.service.ApplicationService;
import com.recruitment.service.JobService;
import com.recruitment.service.RecruiterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recruiter")
@RequiredArgsConstructor
public class RecruiterController {
    
    private final RecruiterService recruiterService;
    private final JobService jobService;
    private final ApplicationService applicationService;
    
    @GetMapping("/profile")
    public ResponseEntity<Recruiter> getProfile(@AuthenticationPrincipal UserPrincipal userDetails) {
        Recruiter recruiter = recruiterService.getRecruiterByUserId(userDetails.getId());
        return ResponseEntity.ok(recruiter);
    }
    
    @PutMapping("/profile")
    public ResponseEntity<Recruiter> updateProfile(
            @AuthenticationPrincipal UserPrincipal userDetails,
            @RequestBody Recruiter updatedProfile) {
        Recruiter recruiter = recruiterService.updateProfile(userDetails.getId(), updatedProfile);
        return ResponseEntity.ok(recruiter);
    }
    
    @PostMapping("/jobs")
    public ResponseEntity<JobPosting> createJob(
            @AuthenticationPrincipal UserPrincipal userDetails,
            @Valid @RequestBody JobPostRequest request) {
        JobPosting job = jobService.createJob(userDetails.getId(), request);
        return ResponseEntity.ok(job);
    }
    
    @GetMapping("/jobs")
    public ResponseEntity<List<JobResponse>> getMyJobs(
            @AuthenticationPrincipal UserPrincipal userDetails) {
        List<JobResponse> jobs = jobService.getJobsByRecruiter(userDetails.getId());
        return ResponseEntity.ok(jobs);
    }
    
    @PutMapping("/jobs/{jobId}")
    public ResponseEntity<JobPosting> updateJob(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal UserPrincipal userDetails,
            @Valid @RequestBody JobPostRequest request) {
        JobPosting job = jobService.updateJob(jobId, userDetails.getId(), request);
        return ResponseEntity.ok(job);
    }
    
    @DeleteMapping("/jobs/{jobId}")
    public ResponseEntity<MessageResponse> deleteJob(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal UserPrincipal userDetails) {
        jobService.deleteJob(jobId, userDetails.getId());
        return ResponseEntity.ok(new MessageResponse("Job deleted successfully"));
    }
    
    @GetMapping("/jobs/{jobId}/applications")
    public ResponseEntity<List<JobApplication>> getJobApplications(@PathVariable UUID jobId) {
        List<JobApplication> applications = applicationService.getApplicationsForJob(jobId);
        return ResponseEntity.ok(applications);
    }
    
    @PutMapping("/applications/{applicationId}/status")
    public ResponseEntity<JobApplication> updateApplicationStatus(
            @PathVariable UUID applicationId,
            @RequestParam String status) {
        JobApplication application = applicationService.updateApplicationStatus(applicationId, status);
        return ResponseEntity.ok(application);
    }
}
