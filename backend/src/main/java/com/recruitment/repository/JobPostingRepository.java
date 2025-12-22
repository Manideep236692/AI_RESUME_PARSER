package com.recruitment.repository;

import com.recruitment.entity.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, UUID> {
    List<JobPosting> findByRecruiterId(UUID recruiterId);
    Optional<JobPosting> findByIdAndRecruiterId(UUID id, UUID recruiterId);
    List<JobPosting> findByIsActiveTrue();
    
    @Query("SELECT j FROM JobPosting j WHERE j.isActive = true AND " +
           "(LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<JobPosting> searchByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT j FROM JobPosting j WHERE j.isActive = true AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:jobType IS NULL OR j.jobType = :jobType)")
    List<JobPosting> findByFilters(@Param("location") String location, 
                                   @Param("jobType") String jobType);
}
