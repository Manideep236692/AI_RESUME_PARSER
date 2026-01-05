package com.recruitment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobResponse {
    private UUID id;
    private String title;
    private String description;
    private java.util.List<String> requirements;
    private String location;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String jobType;
    private LocalDateTime postedDate;
    private Boolean isActive;
    private String companyName;
    private UUID recruiterId;
}
