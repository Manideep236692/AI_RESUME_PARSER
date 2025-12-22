export const API_BASE_URL = 'http://localhost:8081/api';

export const ROLES = {
  JOB_SEEKER: 'JOB_SEEKER',
  RECRUITER: 'RECRUITER',
  ADMIN: 'ADMIN'
};

export const JOB_TYPES = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FREELANCE', label: 'Freelance' }
];

export const APPLICATION_STATUS = {
  APPLIED: 'Applied',
  VIEWED: 'Viewed',
  SHORTLISTED: 'Shortlisted',
  REJECTED: 'Rejected',
  INTERVIEW: 'Interview Scheduled',
  OFFERED: 'Offer Extended'
};

export const EXPERIENCE_LEVELS = [
  { value: 0, label: 'Fresher' },
  { value: 1, label: '1+ years' },
  { value: 2, label: '2+ years' },
  { value: 3, label: '3+ years' },
  { value: 5, label: '5+ years' },
  { value: 10, label: '10+ years' }
];
