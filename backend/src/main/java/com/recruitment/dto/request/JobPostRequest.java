package com.recruitment.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobPostRequest {

    @NotBlank(message = "Job title is required")
    private String title;

    @NotBlank(message = "Job description is required")
    private String description;

    private java.util.List<String> requirements;

    private String location;

    private BigDecimal salaryMin;

    private BigDecimal salaryMax;

    private String jobType;

    private java.time.LocalDate expiryDate;
}
