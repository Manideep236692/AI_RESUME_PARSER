package com.recruitment.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationRequest {
    
    @NotNull(message = "Job posting ID is required")
    private UUID jobPostingId;
    
    private String coverLetter;
}
