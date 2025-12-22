package com.recruitment.repository;

import com.recruitment.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {
    List<JobApplication> findByJobSeekerId(UUID jobSeekerId);
    List<JobApplication> findByJobPostingId(UUID jobPostingId);
    Optional<JobApplication> findByJobSeekerIdAndJobPostingId(UUID jobSeekerId, UUID jobPostingId);
    Boolean existsByJobSeekerIdAndJobPostingId(UUID jobSeekerId, UUID jobPostingId);
}
