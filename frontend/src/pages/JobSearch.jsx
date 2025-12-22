import React, { useState, useEffect } from 'react';
import { getAllJobs, searchJobs, filterJobs } from '../services/api';
import { useJob } from '../context/JobContext';
import JobList from '../components/jobs/JobList';
import JobFilters from '../components/jobs/JobFilters';

const JobSearch = () => {
  const { filters, updateFilters, clearFilters } = useJob();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, [filters]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      let response;
      
      if (filters.keyword) {
        response = await searchJobs(filters.keyword);
      } else if (filters.location || filters.jobType) {
        response = await filterJobs(filters.location, filters.jobType);
      } else {
        response = await getAllJobs();
      }
      
      setJobs(response.data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="text-gray-600 mt-2">
          {loading ? 'Loading...' : `${jobs.length} jobs available`}
        </p>
      </div>

      <JobFilters
        filters={filters}
        onFilterChange={updateFilters}
        onClearFilters={clearFilters}
      />

      <JobList jobs={jobs} loading={loading} />
    </div>
  );
};

export default JobSearch;
