# Smart Recruitment Platform - Backend

Spring Boot backend for the Smart Recruitment Platform with AI integration.

## Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Separate permissions for Job Seekers and Recruiters
- **Resume Parsing**: AI-powered resume analysis
- **Job Matching**: Intelligent job recommendations
- **RESTful API**: Well-documented REST endpoints
- **PostgreSQL Database**: Robust data persistence

## Tech Stack

- **Spring Boot 3.1.5** - Application framework
- **Spring Security** - Authentication & authorization
- **Spring Data JPA** - Database access
- **PostgreSQL** - Database
- **JWT** - Token-based authentication
- **Maven** - Build tool
- **Swagger/OpenAPI** - API documentation

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.6+
- PostgreSQL 12+

### Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE recruitment_db;
```

2. Run the schema:
```bash
psql -U postgres -d recruitment_db -f ../database/schema.sql
```

3. Update `application.properties` with your database credentials:
```properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Running the Application

1. Build the project:
```bash
mvn clean install
```

2. Run the application:
```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

## API Documentation

Once the application is running, access the Swagger UI at:
```
http://localhost:8080/swagger-ui.html
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Job Seeker
- `GET /api/jobseeker/profile` - Get profile
- `PUT /api/jobseeker/profile` - Update profile
- `POST /api/jobseeker/resume/upload` - Upload resume
- `GET /api/jobseeker/resumes` - Get all resumes
- `POST /api/jobseeker/apply` - Apply for job
- `GET /api/jobseeker/applications` - Get applications
- `GET /api/jobseeker/recommendations` - Get AI recommendations

### Recruiter
- `GET /api/recruiter/profile` - Get profile
- `PUT /api/recruiter/profile` - Update profile
- `POST /api/recruiter/jobs` - Create job posting
- `GET /api/recruiter/jobs` - Get all jobs
- `PUT /api/recruiter/jobs/{id}` - Update job
- `DELETE /api/recruiter/jobs/{id}` - Delete job
- `GET /api/recruiter/jobs/{id}/applications` - Get job applications
- `PUT /api/recruiter/applications/{id}/status` - Update application status

### Public
- `GET /api/jobs/all` - Get all active jobs
- `GET /api/jobs/{id}` - Get job by ID
- `GET /api/jobs/search` - Search jobs
- `GET /api/jobs/filter` - Filter jobs

## Configuration

Key configuration properties in `application.properties`:

```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/recruitment_db

# JWT
app.jwt.secret=your-secret-key
app.jwt.expiration-ms=86400000

# AI Service
ai.service.url=http://localhost:5000/api/v1

# File Upload
spring.servlet.multipart.max-file-size=10MB
```

## Project Structure

```
src/main/java/com/recruitment/
├── config/              # Configuration classes
├── controller/          # REST controllers
├── dto/                 # Data Transfer Objects
├── entity/              # JPA entities
├── repository/          # Data repositories
├── security/            # Security configuration
└── service/             # Business logic
```

## Security

- Passwords are encrypted using BCrypt
- JWT tokens expire after 24 hours
- Role-based access control on all endpoints
- CORS configured for frontend origin

## Testing

Run tests:
```bash
mvn test
```

## Building for Production

```bash
mvn clean package
java -jar target/smart-recruitment-platform-1.0.0.jar
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
