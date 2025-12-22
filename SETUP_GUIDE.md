# Smart Recruitment Platform - Complete Setup Guide

This guide will walk you through setting up the complete Smart Recruitment Platform from scratch.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Testing the Application](#testing-the-application)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Java Development Kit (JDK) 17 or higher**
   - Download from: https://www.oracle.com/java/technologies/downloads/
   - Verify installation: `java -version`

2. **Maven 3.6 or higher**
   - Download from: https://maven.apache.org/download.cgi
   - Verify installation: `mvn -version`

3. **Node.js 16 or higher and npm**
   - Download from: https://nodejs.org/
   - Verify installation: `node -version` and `npm -version`

4. **PostgreSQL 12 or higher**
   - Download from: https://www.postgresql.org/download/
   - Verify installation: `psql --version`

5. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/downloads

## Database Setup

### Step 1: Start PostgreSQL

Ensure PostgreSQL service is running:

**Windows:**
```bash
# Start PostgreSQL service
net start postgresql-x64-14
```

**macOS/Linux:**
```bash
sudo service postgresql start
# or
brew services start postgresql
```

### Step 2: Create Database

Open PostgreSQL command line:

```bash
psql -U postgres
```

Create the database:

```sql
CREATE DATABASE recruitment_db;
\q
```

### Step 3: Run Database Schema

Navigate to the database folder and run the schema:

```bash
cd database
psql -U postgres -d recruitment_db -f schema.sql
```

Verify tables were created:

```bash
psql -U postgres -d recruitment_db
\dt
```

You should see all tables listed (users, job_seekers, recruiters, etc.)

### Step 4: Update Database Credentials

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/recruitment_db
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD_HERE
```

Replace `YOUR_PASSWORD_HERE` with your PostgreSQL password.

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
mvn clean install
```

This will download all required dependencies. First time may take 5-10 minutes.

### Step 3: Configure Application Properties

Verify `src/main/resources/application.properties` has correct settings:

```properties
# Server Configuration
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/recruitment_db
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD

# JWT Configuration (change in production!)
app.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
app.jwt.expiration-ms=86400000

# File Upload
spring.servlet.multipart.max-file-size=10MB
file.upload-dir=./uploads/resumes

# CORS
app.cors.allowed-origins=http://localhost:3000,http://localhost:5173
```

### Step 4: Create Upload Directory

```bash
mkdir -p uploads/resumes
```

### Step 5: Run Backend

```bash
mvn spring-boot:run
```

Backend should start on `http://localhost:8080`

Verify by visiting: `http://localhost:8080/swagger-ui.html`

## Frontend Setup

### Step 1: Navigate to Frontend Directory

Open a new terminal and navigate to frontend:

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required npm packages.

### Step 3: Configure API URL (Optional)

The frontend is already configured to connect to `http://localhost:8080/api`

If you need to change this, edit `src/utils/constants.js`:

```javascript
export const API_BASE_URL = 'http://localhost:8080/api';
```

### Step 4: Run Frontend

```bash
npm run dev
```

Frontend should start on `http://localhost:3000`

## Running the Application

### Start All Services

You need 3 terminals running:

**Terminal 1 - PostgreSQL:**
```bash
# Should already be running
# Verify with: psql -U postgres -c "SELECT version();"
```

**Terminal 2 - Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Testing the Application

### 1. Register a Job Seeker Account

1. Click "Sign Up" button
2. Select "Job Seeker"
3. Fill in the registration form:
   - Email: `jobseeker@test.com`
   - Password: `password123`
   - First Name: `John`
   - Last Name: `Doe`
   - Location: `New York, NY`
4. Click "Create account"

### 2. Upload Resume

1. Navigate to "Resume" from the dashboard
2. Drag and drop a PDF resume or click "Choose File"
3. Wait for upload confirmation

### 3. Browse Jobs

1. Click "Browse Jobs" in the navigation
2. Use filters to search for jobs
3. Click on a job to view details

### 4. Register a Recruiter Account

1. Logout from job seeker account
2. Click "Sign Up"
3. Select "Recruiter"
4. Fill in the registration form:
   - Email: `recruiter@test.com`
   - Password: `password123`
   - Company Name: `Tech Corp`
   - Company Size: `51-200`
5. Click "Create account"

### 5. Post a Job

1. Navigate to "Post Job"
2. Fill in job details:
   - Title: `Senior Software Engineer`
   - Description: `We are looking for...`
   - Location: `San Francisco, CA`
   - Job Type: `Full Time`
   - Salary: `$100,000 - $150,000`
3. Click "Post Job"

### 6. View Applications

1. Navigate to "My Jobs"
2. Click "View Applications" on a job
3. Review candidate applications
4. Update application status

## API Testing with Swagger

Access the Swagger UI at:
```
http://localhost:8080/swagger-ui.html
```

### Test Authentication

1. Click on "auth-controller"
2. Try POST `/api/auth/register`
3. Click "Try it out"
4. Enter request body:
```json
{
  "email": "test@example.com",
  "password": "password123",
  "role": "JOB_SEEKER",
  "firstName": "Test",
  "lastName": "User"
}
```
5. Click "Execute"
6. Copy the JWT token from the response

### Authorize Swagger

1. Click the "Authorize" button at the top
2. Enter: `Bearer YOUR_JWT_TOKEN`
3. Click "Authorize"
4. Now you can test protected endpoints

## Troubleshooting

### Backend Issues

**Problem: Port 8080 already in use**
```
Solution: Change port in application.properties
server.port=8081
```

**Problem: Database connection failed**
```
Solution: 
1. Verify PostgreSQL is running
2. Check credentials in application.properties
3. Ensure database exists: psql -U postgres -l
```

**Problem: Maven build fails**
```
Solution:
1. Clear Maven cache: mvn clean
2. Delete ~/.m2/repository
3. Run: mvn clean install -U
```

### Frontend Issues

**Problem: Port 3000 already in use**
```
Solution: 
1. Kill process on port 3000
2. Or change port in vite.config.js
```

**Problem: API calls failing (CORS)**
```
Solution:
1. Verify backend is running
2. Check CORS configuration in backend
3. Ensure frontend URL is in allowed origins
```

**Problem: npm install fails**
```
Solution:
1. Delete node_modules and package-lock.json
2. Run: npm cache clean --force
3. Run: npm install
```

### Database Issues

**Problem: Cannot connect to PostgreSQL**
```
Solution:
1. Check if PostgreSQL is running
2. Verify port (default 5432)
3. Check pg_hba.conf for connection settings
```

**Problem: Schema creation fails**
```
Solution:
1. Drop and recreate database
2. Check for syntax errors in schema.sql
3. Ensure user has CREATE privileges
```

## Building for Production

### Backend

```bash
cd backend
mvn clean package
java -jar target/smart-recruitment-platform-1.0.0.jar
```

### Frontend

```bash
cd frontend
npm run build
# Serve the dist folder with nginx or any web server
```

## Environment Variables

### Backend (.env or application-prod.properties)

```properties
SPRING_DATASOURCE_URL=jdbc:postgresql://your-db-host:5432/recruitment_db
SPRING_DATASOURCE_USERNAME=your_username
SPRING_DATASOURCE_PASSWORD=your_password
JWT_SECRET=your-secure-secret-key
```

### Frontend (.env.production)

```env
VITE_API_URL=https://your-api-domain.com/api
```

## Next Steps

1. **Configure AI Service**: Set up the Python AI service for resume parsing
2. **Email Notifications**: Configure SMTP for email notifications
3. **Cloud Deployment**: Deploy to AWS, Azure, or Google Cloud
4. **SSL Certificates**: Set up HTTPS for production
5. **Monitoring**: Add application monitoring and logging

## Support

For issues or questions:
- Check the README.md files in backend and frontend folders
- Review the API documentation at `/swagger-ui.html`
- Open an issue on the repository

## Security Notes

⚠️ **Important for Production:**

1. Change the JWT secret key
2. Use environment variables for sensitive data
3. Enable HTTPS
4. Configure proper CORS origins
5. Set up rate limiting
6. Enable SQL injection protection
7. Implement proper input validation
8. Use secure password policies

---

Happy Coding! 🚀
