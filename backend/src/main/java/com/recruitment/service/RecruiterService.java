package com.recruitment.service;

import com.recruitment.entity.Recruiter;
import com.recruitment.repository.RecruiterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecruiterService {

    private final RecruiterRepository recruiterRepository;

    public Recruiter getRecruiterByUserId(UUID userId) {
        return recruiterRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found"));
    }

    public Recruiter getRecruiterById(UUID id) {
        return recruiterRepository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));
    }

    @Transactional
    public Recruiter updateProfile(UUID userId, Recruiter updatedProfile) {
        Recruiter recruiter = getRecruiterByUserId(userId);

        recruiter.setCompanyName(updatedProfile.getCompanyName());
        recruiter.setCompanyDescription(updatedProfile.getCompanyDescription());
        recruiter.setCompanySize(updatedProfile.getCompanySize());
        recruiter.setCompanyWebsite(updatedProfile.getCompanyWebsite());

        return recruiterRepository.save(recruiter);
    }
}
