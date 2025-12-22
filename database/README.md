# Database Setup Instructions

## Prerequisites
- PostgreSQL 12 or higher installed
- PostgreSQL user with database creation privileges

## Setup Steps

### 1. Create Database
```bash
psql -U postgres
CREATE DATABASE recruitment_db;
\c recruitment_db
```

### 2. Run Schema
```bash
psql -U postgres -d recruitment_db -f schema.sql
```

### 3. Verify Installation
```sql
\dt  -- List all tables
\d users  -- Describe users table
```

## Database Configuration

Update the `application.properties` file in the Spring Boot backend:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/recruitment_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

## Tables Overview

- **users**: Main user authentication table
- **job_seekers**: Job seeker profile information
- **recruiters**: Recruiter/company profile information
- **resumes**: Uploaded resumes with AI-parsed data
- **job_postings**: Job listings created by recruiters
- **skills**: Master list of skills
- **job_seeker_skills**: Skills associated with job seekers
- **job_applications**: Applications submitted by job seekers
- **ai_recommendations**: AI-generated job recommendations

## Sample Data (Optional)

You can insert sample data for testing:

```sql
-- Insert sample user (password: password123)
INSERT INTO users (email, password_hash, role) 
VALUES ('jobseeker@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'JOB_SEEKER');

INSERT INTO users (email, password_hash, role) 
VALUES ('recruiter@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'RECRUITER');
```
