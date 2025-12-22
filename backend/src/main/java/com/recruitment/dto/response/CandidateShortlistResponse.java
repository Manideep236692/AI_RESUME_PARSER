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
public class CandidateShortlistResponse {
    private UUID jobPostingId;
    private int totalCandidatesScreened;
    private List<CandidateScreeningResponse> shortlistedCandidates;
    private Map<String, List<CandidateScreeningResponse>> skillClusters;
}