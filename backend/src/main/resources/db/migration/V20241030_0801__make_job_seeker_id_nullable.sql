-- Make job_seeker_id nullable in resumes table
ALTER TABLE resumes ALTER COLUMN job_seeker_id DROP NOT NULL;
