# Contributing to Smart Recruitment Platform

Thank you for your interest in contributing to the Smart Recruitment Platform! This document provides guidelines and instructions for contributing.

## 🤝 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:
- Java 17+
- Node.js 16+
- PostgreSQL 12+
- Maven 3.6+
- Git

### Setting Up Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/smart-recruitment-platform.git
   cd smart-recruitment-platform
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/smart-recruitment-platform.git
   ```

4. **Set up the project**
   ```bash
   # Follow SETUP_GUIDE.md
   ```

## 📝 How to Contribute

### Reporting Bugs

Before creating a bug report:
- Check existing issues to avoid duplicates
- Gather relevant information (OS, versions, error messages)

**Bug Report Template:**
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 120]
- Backend Version: [e.g., 1.0.0]
- Frontend Version: [e.g., 1.0.0]
```

### Suggesting Features

**Feature Request Template:**
```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Any alternative solutions or features you've considered.

**Additional context**
Any other context or screenshots about the feature request.
```

### Pull Requests

1. **Create a branch**
   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b fix/bug-fix
   ```

2. **Make your changes**
   - Follow coding standards
   - Write tests
   - Update documentation

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Create Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Fill in the PR template

## 📋 Coding Standards

### Backend (Java/Spring Boot)

**Code Style:**
- Follow Java naming conventions
- Use meaningful variable names
- Add JavaDoc for public methods
- Keep methods small and focused

**Example:**
```java
/**
 * Creates a new job posting.
 *
 * @param userId the ID of the recruiter
 * @param request the job posting details
 * @return the created job posting
 * @throws ResourceNotFoundException if recruiter not found
 */
@Transactional
public JobPosting createJob(UUID userId, JobPostRequest request) {
    Recruiter recruiter = recruiterService.getRecruiterByUserId(userId);
    
    JobPosting job = new JobPosting();
    job.setRecruiter(recruiter);
    job.setTitle(request.getTitle());
    // ... more fields
    
    return jobPostingRepository.save(job);
}
```

**Testing:**
```java
@Test
void testCreateJob_Success() {
    // Given
    UUID userId = UUID.randomUUID();
    JobPostRequest request = new JobPostRequest();
    request.setTitle("Software Engineer");
    
    // When
    JobPosting result = jobService.createJob(userId, request);
    
    // Then
    assertNotNull(result);
    assertEquals("Software Engineer", result.getTitle());
}
```

### Frontend (React)

**Code Style:**
- Use functional components with hooks
- Follow React naming conventions
- Use PropTypes or TypeScript
- Keep components small and reusable

**Example:**
```javascript
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * JobCard component displays a job posting summary
 */
const JobCard = ({ job, onApply }) => {
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onApply(job.id);
    } catch (error) {
      console.error('Application failed:', error);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="card">
      <h3>{job.title}</h3>
      <p>{job.company}</p>
      <button onClick={handleApply} disabled={isApplying}>
        {isApplying ? 'Applying...' : 'Apply Now'}
      </button>
    </div>
  );
};

JobCard.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    company: PropTypes.string.isRequired,
  }).isRequired,
  onApply: PropTypes.func.isRequired,
};

export default JobCard;
```

### Database

**Naming Conventions:**
- Tables: lowercase with underscores (e.g., `job_postings`)
- Columns: lowercase with underscores (e.g., `created_at`)
- Indexes: `idx_table_column` (e.g., `idx_users_email`)

**Migrations:**
```sql
-- V3__Add_job_categories.sql
CREATE TABLE job_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_categories_name ON job_categories(name);
```

## 🧪 Testing Guidelines

### Backend Tests

**Unit Tests:**
```java
@SpringBootTest
class JobServiceTest {
    
    @Autowired
    private JobService jobService;
    
    @MockBean
    private JobPostingRepository jobPostingRepository;
    
    @Test
    void testGetAllActiveJobs() {
        // Test implementation
    }
}
```

**Integration Tests:**
```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class JobControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void testGetAllJobs_ReturnsOk() throws Exception {
        mockMvc.perform(get("/api/jobs/all"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }
}
```

### Frontend Tests

**Component Tests:**
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import JobCard from './JobCard';

test('renders job card with title', () => {
  const job = {
    id: '1',
    title: 'Software Engineer',
    company: 'Tech Corp'
  };
  
  render(<JobCard job={job} onApply={() => {}} />);
  
  expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  expect(screen.getByText('Tech Corp')).toBeInTheDocument();
});

test('calls onApply when button clicked', () => {
  const job = { id: '1', title: 'Test', company: 'Test' };
  const mockApply = jest.fn();
  
  render(<JobCard job={job} onApply={mockApply} />);
  
  fireEvent.click(screen.getByText('Apply Now'));
  
  expect(mockApply).toHaveBeenCalledWith('1');
});
```

## 📚 Documentation

### Code Documentation

**Backend:**
- Add JavaDoc for all public methods
- Document complex algorithms
- Explain business logic

**Frontend:**
- Add JSDoc for utility functions
- Document component props
- Explain complex state management

### README Updates

When adding features, update:
- Feature list
- API endpoints
- Configuration options
- Setup instructions

## 🔄 Git Workflow

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```bash
feat(auth): add password reset functionality

Implement password reset flow with email verification.
Users can now request password reset via email.

Closes #123

---

fix(jobs): resolve search filter bug

Fixed issue where location filter was not applied correctly.

Fixes #456

---

docs(api): update authentication endpoints

Added examples for JWT token usage in API documentation.
```

### Branch Naming

```
feature/feature-name
fix/bug-description
docs/documentation-update
refactor/code-improvement
test/test-description
```

### Pull Request Process

1. **Update documentation**
2. **Add/update tests**
3. **Ensure all tests pass**
4. **Update CHANGELOG.md**
5. **Request review**

**PR Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Closes #issue_number
```

## 🏗️ Project Structure

When adding new features, follow the existing structure:

### Backend
```
src/main/java/com/recruitment/
├── controller/     # Add new REST endpoints
├── service/        # Add business logic
├── repository/     # Add data access
├── entity/         # Add new entities
├── dto/            # Add request/response DTOs
├── config/         # Add configurations
└── security/       # Add security components
```

### Frontend
```
src/
├── components/     # Add new components
├── pages/          # Add new pages
├── services/       # Add API services
├── context/        # Add context providers
├── utils/          # Add utility functions
└── styles/         # Add styles
```

## 🐛 Debugging Tips

### Backend
```properties
# Enable debug logging
logging.level.com.recruitment=DEBUG
logging.level.org.springframework.security=DEBUG
```

### Frontend
```javascript
// Add console logs
console.log('Debug:', data);

// Use React DevTools
// Use Redux DevTools (if using Redux)
```

## 📦 Dependencies

### Adding New Dependencies

**Backend (pom.xml):**
```xml
<!-- Add with comment explaining why -->
<!-- Used for PDF generation -->
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itextpdf</artifactId>
    <version>5.5.13</version>
</dependency>
```

**Frontend (package.json):**
```bash
# Add with specific version
npm install --save package-name@version

# Update package.json with comment
```

## 🎯 Feature Development Workflow

1. **Discuss** - Open an issue to discuss the feature
2. **Design** - Plan the implementation
3. **Implement** - Write code following standards
4. **Test** - Add comprehensive tests
5. **Document** - Update documentation
6. **Review** - Submit PR for review
7. **Deploy** - Merge after approval

## 📞 Getting Help

- **Documentation**: Check README.md and SETUP_GUIDE.md
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions
- **Email**: contact@smartrecruit.com

## 🎉 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Smart Recruitment Platform! 🚀
