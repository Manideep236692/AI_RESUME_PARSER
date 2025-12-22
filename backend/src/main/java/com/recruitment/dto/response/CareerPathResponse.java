package com.recruitment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CareerPathResponse {
    private String title;
    private String description;
    private List<String> requiredSkills;
    private String growthPotential;
    private String timeToAchieve;
}