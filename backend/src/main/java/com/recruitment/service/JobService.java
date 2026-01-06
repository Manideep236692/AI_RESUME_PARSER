package com.recruitment.service;

import com.recruitment.dto.request.JobPostRequest;
import com.recruitment.dto.response.JobResponse;
import com.recruitment.entity.JobPosting;
import com.recruitment.entity.Recruiter;
import com.recruitment.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobPostingRepository jobPostingRepository;
    private final RecruiterService recruiterService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    @Transactional
    public JobPosting createJob(UUID userId, JobPostRequest request) {
        Recruiter recruiter = recruiterService.getRecruiterByUserId(userId);

        JobPosting job = new JobPosting();
        job.setRecruiter(recruiter);
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        if (request.getRequirements() != null) {
            job.setRequirements(objectMapper.valueToTree(request.getRequirements()));
        }
        job.setLocation(request.getLocation());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setJobType(request.getJobType());
        if (request.getExpiryDate() != null) {
            job.setExpiryDate(request.getExpiryDate().atStartOfDay());
        }
        job.setIsActive(true);

        return jobPostingRepository.save(job);
    }

    public List<JobResponse> getAllActiveJobs() {
        return jobPostingRepository.findByIsActiveTrue().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<JobResponse> getJobsByRecruiter(UUID userId) {
        Recruiter recruiter = recruiterService.getRecruiterByUserId(userId);
        return jobPostingRepository.findByRecruiterId(recruiter.getId()).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public JobPosting getJobById(UUID jobId) {
        return jobPostingRepository.findById(java.util.Objects.requireNonNull(jobId))
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }

    public List<JobResponse> searchJobs(String keyword) {
        return jobPostingRepository.searchByKeyword(keyword).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<JobResponse> filterJobs(String location, String jobType) {
        return jobPostingRepository.findByFilters(location, jobType).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public JobPosting updateJob(UUID jobId, UUID userId, JobPostRequest request) {
        JobPosting job = getJobById(jobId);
        Recruiter recruiter = recruiterService.getRecruiterByUserId(userId);

        if (job.getRecruiter() == null || !job.getRecruiter().getId().equals(recruiter.getId())) {
            throw new RuntimeException("Unauthorized to update this job");
        }

        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        if (request.getRequirements() != null) {
            job.setRequirements(objectMapper.valueToTree(request.getRequirements()));
        }
        job.setLocation(request.getLocation());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setJobType(request.getJobType());
        if (request.getExpiryDate() != null) {
            job.setExpiryDate(request.getExpiryDate().atStartOfDay());
        }

        return jobPostingRepository.save(job);
    }

    @Transactional
    public void deleteJob(UUID jobId, UUID userId) {
        JobPosting job = getJobById(jobId);
        Recruiter recruiter = recruiterService.getRecruiterByUserId(userId);

        if (job.getRecruiter() == null || !job.getRecruiter().getId().equals(recruiter.getId())) {
            throw new RuntimeException("Unauthorized to delete this job");
        }

        job.setIsActive(false);
        jobPostingRepository.save(job);
    }

    private JobResponse convertToResponse(JobPosting job) {
        JobResponse response = new JobResponse();
        response.setId(job.getId());
        response.setTitle(job.getTitle());
        response.setDescription(job.getDescription());
        response.setRequirements(job.getRequirements());
        response.setLocation(job.getLocation());
        response.setSalaryMin(job.getSalaryMin());
        response.setSalaryMax(job.getSalaryMax());
        response.setJobType(job.getJobType());
        response.setPostedDate(job.getPostedDate());
        response.setIsActive(job.getIsActive());
        if (job.getRecruiter() != null) {
            response.setCompanyName(job.getRecruiter().getCompanyName());
            response.setRecruiterId(job.getRecruiter().getId());
        }
        return response;
    }
}
