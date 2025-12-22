package com.recruitment.controller;

import com.recruitment.dto.response.JobResponse;
import com.recruitment.entity.JobPosting;
import com.recruitment.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {
    
    private final JobService jobService;
    
    @GetMapping("/all")
    public ResponseEntity<List<JobResponse>> getAllJobs() {
        List<JobResponse> jobs = jobService.getAllActiveJobs();
        return ResponseEntity.ok(jobs);
    }
    
    @GetMapping("/{jobId}")
    public ResponseEntity<JobPosting> getJobById(@PathVariable UUID jobId) {
        JobPosting job = jobService.getJobById(jobId);
        return ResponseEntity.ok(job);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<JobResponse>> searchJobs(@RequestParam String keyword) {
        List<JobResponse> jobs = jobService.searchJobs(keyword);
        return ResponseEntity.ok(jobs);
    }
    
    @GetMapping("/filter")
    public ResponseEntity<List<JobResponse>> filterJobs(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String jobType) {
        List<JobResponse> jobs = jobService.filterJobs(location, jobType);
        return ResponseEntity.ok(jobs);
    }
}
