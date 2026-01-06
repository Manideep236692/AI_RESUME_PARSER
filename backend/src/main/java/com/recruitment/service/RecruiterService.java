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
    private final AIIntegrationService aiIntegrationService;

    public Recruiter getRecruiterByUserId(UUID userId) {
        return recruiterRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found"));
    }

    public Recruiter getRecruiterById(UUID id) {
        return recruiterRepository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));
    }

    @Transactional
    public Recruiter updateProfile(UUID userId, Recruiter updatedRecruiter) {
        Recruiter existingRecruiter = getRecruiterByUserId(userId);

        existingRecruiter.setCompanyName(updatedRecruiter.getCompanyName());
        existingRecruiter.setCompanyWebsite(updatedRecruiter.getCompanyWebsite());
        existingRecruiter.setCompanyDescription(updatedRecruiter.getCompanyDescription());
        existingRecruiter.setIndustry(updatedRecruiter.getIndustry());
        existingRecruiter.setLocation(updatedRecruiter.getLocation());

        return recruiterRepository.save(existingRecruiter); // User is cascaded
    }

    public com.fasterxml.jackson.databind.JsonNode searchCandidatePool(String query) {
        return aiIntegrationService.searchCandidatePool(query);
    }
}
