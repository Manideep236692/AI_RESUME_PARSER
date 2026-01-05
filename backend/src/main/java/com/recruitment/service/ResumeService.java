package com.recruitment.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruitment.entity.JobSeeker;
import com.recruitment.entity.Resume;
import com.recruitment.exception.ResourceNotFoundException;
import com.recruitment.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final JobSeekerService jobSeekerService;
    private final AIIntegrationService aiIntegrationService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Transactional
    public Resume uploadResume(UUID userId, MultipartFile file) {
        try {
            // Validate file size before processing (10MB limit)
            long maxFileSize = 10 * 1024 * 1024; // 10MB
            if (file.getSize() > maxFileSize) {
                throw new RuntimeException("File size exceeds maximum limit of 10MB");
            }

            JobSeeker jobSeeker = null;
            if (userId != null) {
                try {
                    jobSeeker = jobSeekerService.getJobSeekerByUserId(userId);
                } catch (ResourceNotFoundException e) {
                    log.warn("No job seeker found for user ID: " + userId);
                }
            }

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.trim().isEmpty()) {
                throw new RuntimeException("File name cannot be empty");
            }
            String filename = UUID.randomUUID().toString() + "_" + originalFilename;
            Path filePath = uploadPath.resolve(filename);

            // Save file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Parse resume with AI service
            JsonNode parsedData = null;
            try {
                parsedData = aiIntegrationService.parseResume(file);
                if (parsedData == null || parsedData.isEmpty()) {
                    log.warn("AI service returned empty or null parsed data, creating empty node");
                    parsedData = new com.fasterxml.jackson.databind.ObjectMapper().createObjectNode();
                }
            } catch (Exception e) {
                log.error("Failed to parse resume with AI service", e);
                // Create empty parsed data instead of throwing exception to allow resume upload
                parsedData = new com.fasterxml.jackson.databind.ObjectMapper().createObjectNode();
                log.info("Continuing with empty parsed data due to AI service failure");
            }

            // Only set existing resumes as non-primary if jobSeeker is not null
            if (jobSeeker != null) {
                List<Resume> existingResumes = resumeRepository.findByJobSeekerId(jobSeeker.getId());
                if (!existingResumes.isEmpty()) {
                    existingResumes.forEach(r -> r.setIsPrimary(false));
                    resumeRepository.saveAll(existingResumes);
                }
            }

            // Create resume entity
            Resume resume = new Resume();
            if (jobSeeker != null) {
                resume.setJobSeeker(jobSeeker);
                resume.setIsPrimary(true);
            } else {
                resume.setIsPrimary(false);
            }
            resume.setFileName(originalFilename);
            resume.setFilePath(filePath.toString());
            resume.setParsedData(parsedData);

            return resumeRepository.save(resume);

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    public List<Resume> getResumesByJobSeeker(UUID jobSeekerId) {
        return resumeRepository.findByJobSeekerId(jobSeekerId);
    }

    public Resume getPrimaryResume(UUID jobSeekerId) {
        return resumeRepository.findByJobSeekerIdAndIsPrimaryTrue(jobSeekerId)
                .orElseThrow(() -> new ResourceNotFoundException("No primary resume found for user: " + jobSeekerId));
    }

    public Optional<Resume> findById(UUID resumeId) {
        return resumeRepository.findById(java.util.Objects.requireNonNull(resumeId));
    }

    @Transactional
    public void deleteResume(UUID resumeId, UUID userId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        // Verify ownership
        if (resume.getJobSeeker() != null && !resume.getJobSeeker().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this resume");
        }

        // Delete file from filesystem
        try {
            Path filePath = Paths.get(resume.getFilePath());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        } catch (IOException e) {
            log.warn("Failed to delete file from filesystem: " + resume.getFilePath(), e);
        }

        // Delete from database
        resumeRepository.delete(resume);
    }

    @Transactional
    public Resume setAsPrimary(UUID resumeId, UUID userId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        // Verify ownership
        if (resume.getJobSeeker() == null || !resume.getJobSeeker().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to update this resume");
        }

        // Set all other resumes as non-primary
        List<Resume> allResumes = resumeRepository.findByJobSeekerId(resume.getJobSeeker().getId());
        allResumes.forEach(r -> r.setIsPrimary(false));
        resumeRepository.saveAll(allResumes);

        // Set this resume as primary
        resume.setIsPrimary(true);
        return resumeRepository.save(resume);
    }
}
