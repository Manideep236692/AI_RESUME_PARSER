-- Smart Recruitment Platform Database Schema
-- PostgreSQL Database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('JOB_SEEKER', 'RECRUITER', 'ADMIN')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job seekers profile
CREATE TABLE job_seekers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    location VARCHAR(255),
    total_experience INTEGER,
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recruiters profile
CREATE TABLE recruiters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    company_name VARCHAR(255),
    company_description TEXT,
    company_size VARCHAR(50),
    company_website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resumes with AI parsed data
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    parsed_data JSONB,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_primary BOOLEAN DEFAULT true
);

-- Job postings
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id UUID REFERENCES recruiters(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements JSONB,
    location VARCHAR(255),
    salary_min DECIMAL(10,2),
    salary_max DECIMAL(10,2),
    job_type VARCHAR(50),
    posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Skills master table
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50)
);

-- Job seeker skills mapping
CREATE TABLE job_seeker_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE NOT NULL,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
    proficiency VARCHAR(20) CHECK (proficiency IN ('BEGINNER', 'INTERMEDIATE', 'EXPERT')),
    UNIQUE(job_seeker_id, skill_id)
);

-- Job applications
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE NOT NULL,
    job_posting_id UUID REFERENCES job_postings(id) ON DELETE CASCADE NOT NULL,
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'APPLIED' NOT NULL,
    ai_match_score DECIMAL(3,2),
    cover_letter TEXT,
    UNIQUE(job_seeker_id, job_posting_id)
);

-- AI Recommendations log
CREATE TABLE ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE NOT NULL,
    job_posting_id UUID REFERENCES job_postings(id) ON DELETE CASCADE NOT NULL,
    match_score DECIMAL(3,2),
    recommendation_reason TEXT,
    generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_seeker_id, job_posting_id)
);

-- Skill gap analysis
CREATE TABLE skill_gap_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE NOT NULL,
    job_posting_id UUID REFERENCES job_postings(id) ON DELETE CASCADE NOT NULL,
    missing_skills JSONB,
    matching_skills JSONB,
    learning_resources JSONB,
    overall_match_percentage DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_seeker_id, job_posting_id)
);

-- Career path suggestions
CREATE TABLE career_path_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    required_skills JSONB,
    growth_potential VARCHAR(255),
    time_to_achieve VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidate screening results
CREATE TABLE candidate_screenings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_seeker_id UUID REFERENCES job_seekers(id) ON DELETE CASCADE NOT NULL,
    job_posting_id UUID REFERENCES job_postings(id) ON DELETE CASCADE NOT NULL,
    match_score DECIMAL(5,2),
    key_skills JSONB,
    experience_years INTEGER,
    strengths JSONB,
    weaknesses JSONB,
    cultural_fit_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_seeker_id, job_posting_id)
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_job_seekers_user_id ON job_seekers(user_id);
CREATE INDEX idx_recruiters_user_id ON recruiters(user_id);
CREATE INDEX idx_resumes_job_seeker_id ON resumes(job_seeker_id);
CREATE INDEX idx_job_postings_recruiter_id ON job_postings(recruiter_id);
CREATE INDEX idx_job_postings_active ON job_postings(is_active);
CREATE INDEX idx_job_applications_job_seeker_id ON job_applications(job_seeker_id);
CREATE INDEX idx_job_applications_job_posting_id ON job_applications(job_posting_id);
CREATE INDEX idx_ai_recommendations_job_seeker_id ON ai_recommendations(job_seeker_id);
CREATE INDEX idx_ai_recommendations_match_score ON ai_recommendations(match_score DESC);
CREATE INDEX idx_skill_gap_analyses_job_seeker_id ON skill_gap_analyses(job_seeker_id);
CREATE INDEX idx_skill_gap_analyses_job_posting_id ON skill_gap_analyses(job_posting_id);
CREATE INDEX idx_career_path_suggestions_job_seeker_id ON career_path_suggestions(job_seeker_id);
CREATE INDEX idx_candidate_screenings_job_posting_id ON candidate_screenings(job_posting_id);
CREATE INDEX idx_candidate_screenings_match_score ON candidate_screenings(match_score DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
