package com.recruitment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {
    private UUID id;
    private JobResponse job;
    private BigDecimal matchScore;
    private String recommendationReason;
}
