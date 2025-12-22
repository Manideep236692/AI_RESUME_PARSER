package com.recruitment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CandidateScreeningResponse {
    private UUID jobSeekerId;
    private String name;
    private String email;
    private Double matchScore;
    private List<String> keySkills;
    private Integer experienceYears;
    private List<String> strengths;
    private List<String> weaknesses;
    private Double culturalFitScore;
}