package com.recruitment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillGapResponse {
    private UUID jobPostingId;
    private List<String> missingSkills;
    private List<String> matchingSkills;
    private List<Map<String, String>> learningResources;
    private Double overallMatchPercentage;
}