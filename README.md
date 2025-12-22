# Smart Recruitment Platform

An AI-powered recruitment platform that connects job seekers with employers through intelligent matching and recommendations.

## 🚀 Features

### For Job Seekers
- **AI-Powered Resume Parsing**: Upload your resume and let AI extract your skills and experience
- **Smart Job Recommendations**: Get personalized job suggestions based on your profile
- **Easy Application Process**: Apply to multiple jobs with one click
- **Application Tracking**: Monitor the status of all your applications
- **Profile Management**: Maintain a comprehensive professional profile

### For Recruiters
- **Job Posting Management**: Create and manage job listings
- **AI Candidate Matching**: Get AI-powered candidate recommendations
- **Application Management**: Review and manage candidate applications
- **Dashboard Analytics**: Track job performance and application metrics

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls
- Lucide React for icons

### Backend
- Spring Boot 3.1.5
- Spring Security with JWT
- Spring Data JPA
- PostgreSQL database
- Maven build tool

### Database
- PostgreSQL 12+
- JSONB for flexible data storage
- Full-text search capabilities

## 📋 Prerequisites

- **Node.js** 16+ and npm
- **Java** 17+
- **Maven** 3.6+
- **PostgreSQL** 12+

## 🔧 Installation

### 1. Database Setup

```bash
# Create database
createdb recruitment_db

# Run schema
psql -U postgres -d recruitment_db -f database/schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Update application.properties with your database credentials
# Build and run
mvn clean install
mvn spring-boot:run
```

Backend will run on `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
smart-recruitment-platform/
├── backend/                 # Spring Boot backend
│   ├── src/
│   │   └── main/
│   │       ├── java/com/recruitment/
│   │       │   ├── config/
│   │       │   ├── controller/
│   │       │   ├── dto/
│   │       │   ├── entity/
│   │       │   ├── repository/
│   │       │   ├── security/
│   │       │   └── service/
│   │       └── resources/
│   └── pom.xml
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── common/
│   │   │   ├── jobseeker/
│   │   │   ├── recruiter/
│   │   │   └── jobs/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   └── package.json
└── database/                # Database schemas
    └── schema.sql
```

## 🔐 Authentication

The platform uses JWT (JSON Web Tokens) for authentication:

1. Register as a Job Seeker or Recruiter
2. Login to receive a JWT token
3. Token is stored in localStorage
4. Token is sent with each API request in the Authorization header

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Job Seeker Endpoints
- `GET /api/jobseeker/profile` - Get profile
- `POST /api/jobseeker/resume/upload` - Upload resume
- `GET /api/jobseeker/recommendations` - Get AI recommendations
- `POST /api/jobseeker/apply` - Apply for job

### Recruiter Endpoints
- `POST /api/recruiter/jobs` - Create job posting
- `GET /api/recruiter/jobs` - Get all jobs
- `GET /api/recruiter/jobs/{id}/applications` - View applications

### Public Endpoints
- `GET /api/jobs/all` - Browse all jobs
- `GET /api/jobs/search?keyword=` - Search jobs

Full API documentation available at: `http://localhost:8080/swagger-ui.html`

## 🎨 UI Screenshots

### Home Page
Landing page with hero section and feature highlights

### Job Seeker Dashboard
- AI-recommended jobs
- Application status
- Profile completion

### Recruiter Dashboard
- Job posting management
- Application tracking
- Candidate overview

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Building for Production

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
# Serve the dist folder with your preferred web server
```

## 🔒 Security Features

- Password encryption with BCrypt
- JWT token-based authentication
- Role-based access control (RBAC)
- CORS configuration
- Input validation
- SQL injection prevention

## 🚧 Future Enhancements

- [ ] Real-time notifications
- [ ] Video interview scheduling
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] Social media integration
- [ ] Chat functionality
- [ ] Email notifications
- [ ] Resume builder tool

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- React team for the amazing library
- Tailwind CSS for the utility-first CSS framework
- All contributors who help improve this project

## 📞 Support

For support, email support@smartrecruit.com or open an issue in the repository.

---

Made with ❤️ by the SmartRecruit Team
