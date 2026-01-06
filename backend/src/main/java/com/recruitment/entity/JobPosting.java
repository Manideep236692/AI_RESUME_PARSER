package com.recruitment.entity;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import org.hibernate.annotations.Type;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "job_postings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class JobPosting {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private Recruiter recruiter;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "requirements")
    private com.fasterxml.jackson.databind.JsonNode requirements;

    private String location;

    @Column(name = "salary_min")
    private BigDecimal salaryMin;

    @Column(name = "salary_max")
    private BigDecimal salaryMax;

    @Column(name = "job_type")
    private String jobType;

    @CreatedDate
    @Column(name = "posted_date", nullable = false, updatable = false)
    private LocalDateTime postedDate;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "jobPosting", cascade = CascadeType.ALL)
    private List<JobApplication> applications = new ArrayList<>();

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "jobPosting", cascade = CascadeType.ALL)
    private List<AIRecommendation> recommendations = new ArrayList<>();
}
