package com.recruitment.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "recruiters")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Recruiter {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "company_description", columnDefinition = "TEXT")
    private String companyDescription;

    @Column(name = "company_size")
    private String companySize;

    @Column(name = "company_website")
    private String companyWebsite;

    @Column(name = "industry")
    private String industry;

    @Column(name = "location")
    private String location;

    @OneToMany(mappedBy = "recruiter", cascade = CascadeType.ALL)
    private List<JobPosting> jobPostings = new ArrayList<>();

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
