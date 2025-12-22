package com.recruitment.service;

import com.recruitment.entity.JobSeeker;
import com.recruitment.repository.JobSeekerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JobSeekerService {

    private final JobSeekerRepository jobSeekerRepository;

    public JobSeeker getJobSeekerByUserId(UUID userId) {
        return jobSeekerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Job seeker profile not found"));
    }

    public JobSeeker getJobSeekerById(UUID id) {
        return jobSeekerRepository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Job seeker not found"));
    }

    @Transactional
    public JobSeeker updateProfile(UUID userId, JobSeeker updatedProfile) {
        JobSeeker jobSeeker = getJobSeekerByUserId(userId);

        jobSeeker.setFirstName(updatedProfile.getFirstName());
        jobSeeker.setLastName(updatedProfile.getLastName());
        jobSeeker.setPhone(updatedProfile.getPhone());
        jobSeeker.setLocation(updatedProfile.getLocation());
        jobSeeker.setTotalExperience(updatedProfile.getTotalExperience());
        jobSeeker.setSummary(updatedProfile.getSummary());

        return jobSeekerRepository.save(jobSeeker);
    }
}
