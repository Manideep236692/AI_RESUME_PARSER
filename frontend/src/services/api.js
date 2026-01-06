import axios from 'axios';
import { storage } from './storage';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      storage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Job Seeker APIs
export const getJobSeekerProfile = () => api.get('/jobseeker/profile');
export const updateJobSeekerProfile = (data) => api.put('/jobseeker/profile', data);
export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/jobseeker/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json'
    },
    withCredentials: true
  });
};
export const getResumes = () => api.get('/jobseeker/resumes');
export const deleteResume = (resumeId) => api.delete(`/jobseeker/resumes/${resumeId}`);
export const setResumeAsPrimary = (resumeId) => api.put(`/jobseeker/resumes/${resumeId}/set-primary`);
export const applyForJob = (data) => api.post('/jobseeker/apply', data);
export const getApplications = () => api.get('/jobseeker/applications');
export const getRecommendations = () => api.get('/jobseeker/recommendations');
export const getSkillGapAnalysis = (jobId) => api.get(`/jobseeker/skill-gap/${jobId}`);

// Recruiter APIs
export const getRecruiterProfile = () => api.get('/recruiter/profile');
export const updateRecruiterProfile = (data) => api.put('/recruiter/profile', data);
export const createJob = (data) => api.post('/recruiter/jobs', data);
export const searchCandidatePool = (query) => api.post('/recruiter/search-candidates', { query });
export const getRecruiterJobs = () => api.get('/recruiter/jobs');
export const updateJob = (jobId, data) => api.put(`/recruiter/jobs/${jobId}`, data);
export const deleteJob = (jobId) => api.delete(`/recruiter/jobs/${jobId}`);
export const getJobApplications = (jobId) => api.get(`/recruiter/jobs/${jobId}/applications`);
export const updateApplicationStatus = (applicationId, status) =>
  api.put(`/recruiter/applications/${applicationId}/status`, null, { params: { status } });

// Public Job APIs
export const getAllJobs = () => api.get('/jobs/all');
export const getJobById = (jobId) => api.get(`/jobs/${jobId}`);
export const searchJobs = (keyword) => api.get('/jobs/search', { params: { keyword } });
export const filterJobs = (location, jobType) =>
  api.get('/jobs/filter', { params: { location, jobType } });

export default api;
