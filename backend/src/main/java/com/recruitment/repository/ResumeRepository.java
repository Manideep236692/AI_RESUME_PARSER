package com.recruitment.repository;

import com.recruitment.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, UUID> {
    List<Resume> findByJobSeekerId(UUID jobSeekerId);
    Optional<Resume> findByJobSeekerIdAndIsPrimaryTrue(UUID jobSeekerId);
    List<Resume> findByIsPrimaryTrue();
    
    @Query("SELECT r FROM Resume r WHERE r.isPrimary = true")
    List<Resume> findAllPrimaryResumes();
}
