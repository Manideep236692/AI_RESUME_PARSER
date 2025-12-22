package com.recruitment.repository;

import com.recruitment.entity.AIRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AIRecommendationRepository extends JpaRepository<AIRecommendation, UUID> {
    List<AIRecommendation> findByJobSeekerId(UUID jobSeekerId);
    
    @Query("SELECT r FROM AIRecommendation r WHERE r.jobSeekerId = :jobSeekerId " +
           "ORDER BY r.matchScore DESC")
    List<AIRecommendation> findTopRecommendationsForJobSeeker(@Param("jobSeekerId") UUID jobSeekerId);
}
