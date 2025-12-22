import React, { createContext, useState, useContext } from 'react';

const JobContext = createContext(null);

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    jobType: ''
  });

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      location: '',
      jobType: ''
    });
  };

  const value = {
    jobs,
    setJobs,
    selectedJob,
    setSelectedJob,
    filters,
    updateFilters,
    clearFilters
  };

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};

export const useJob = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJob must be used within a JobProvider');
  }
  return context;
};
