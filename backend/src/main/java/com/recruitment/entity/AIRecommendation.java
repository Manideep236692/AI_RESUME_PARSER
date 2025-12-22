package com.recruitment.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class AIRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "job_seeker_id", nullable = false)
    private UUID jobSeekerId;

    @Column(name = "job_title")
    private String jobTitle;

    @Column
    private String company;

    @Column(name = "match_score", precision = 5, scale = 2)
    private BigDecimal matchScore;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "raw_data", columnDefinition = "TEXT")
    private String rawData;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_posting_id")
    @ToString.Exclude
    private JobPosting jobPosting;

    // Helper method to create a new recommendation
    public static AIRecommendation createRecommendation(UUID jobSeekerId, String jobTitle, String company,
            BigDecimal matchScore, String reason, String rawData,
            JobPosting jobPosting) {
        AIRecommendation recommendation = new AIRecommendation();
        recommendation.setJobSeekerId(jobSeekerId);
        recommendation.setJobTitle(jobTitle);
        recommendation.setCompany(company);
        recommendation.setMatchScore(matchScore);
        recommendation.setReason(reason);
        recommendation.setRawData(rawData);
        recommendation.setJobPosting(jobPosting);
        return recommendation;
    }
}
