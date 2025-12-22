# Quick Start Guide - Smart Recruitment Platform

Get the application running in 5 minutes!

## Prerequisites Check

Run these commands to verify you have everything installed:

```bash
java -version        # Should be 17+
mvn -version         # Should be 3.6+
node -version        # Should be 16+
npm -version         # Should be 8+
psql --version       # Should be 12+
```

## 🚀 Quick Setup (3 Steps)

### Step 1: Database Setup (2 minutes)

```bash
# Create database
psql -U postgres -c "CREATE DATABASE recruitment_db;"

# Run schema
cd database
psql -U postgres -d recruitment_db -f schema.sql
```

**Update backend database password:**
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.password=YOUR_POSTGRES_PASSWORD
```

### Step 2: Start Backend (1 minute)

```bash
cd backend
mvn spring-boot:run
```

Wait for: `Started RecruitmentApplication in X seconds`

### Step 3: Start Frontend (1 minute)

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

## ✅ Verify Installation

1. **Backend API**: Open http://localhost:8080/swagger-ui.html
2. **Frontend**: Open http://localhost:3000
3. **Database**: Run `psql -U postgres -d recruitment_db -c "\dt"`

## 🎯 Test the Application

### Create Job Seeker Account

1. Go to http://localhost:3000
2. Click **"Sign Up"**
3. Select **"Job Seeker"**
4. Fill in:
   - Email: `test@jobseeker.com`
   - Password: `password123`
   - First Name: `John`
   - Last Name: `Doe`
5. Click **"Create account"**

### Create Recruiter Account

1. Logout
2. Click **"Sign Up"**
3. Select **"Recruiter"**
4. Fill in:
   - Email: `test@recruiter.com`
   - Password: `password123`
   - Company Name: `Tech Corp`
5. Click **"Create account"**

### Post a Job (as Recruiter)

1. Navigate to **"Post Job"**
2. Fill in job details
3. Click **"Post Job"**

### Apply for Job (as Job Seeker)

1. Logout and login as job seeker
2. Go to **"Browse Jobs"**
3. Click on a job
4. Click **"Apply Now"**

## 🐳 Docker Quick Start (Alternative)

If you have Docker installed:

```bash
# Start everything with one command
docker-compose up -d

# Wait 30 seconds for services to start
# Then open http://localhost:3000
```

## 📝 Default Ports

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080
- **Database**: localhost:5432
- **Swagger UI**: http://localhost:8080/swagger-ui.html

## 🔧 Common Issues

### Port Already in Use

**Backend (8080):**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8080 | xargs kill -9
```

**Frontend (3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
# Windows
sc query postgresql-x64-14

# Mac
brew services list

# Linux
sudo systemctl status postgresql
```

### Maven Build Fails

```bash
# Clear cache and rebuild
mvn clean install -U
```

### npm Install Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 📚 Next Steps

- Read the full [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions
- Check [README.md](README.md) for feature documentation
- Review API docs at http://localhost:8080/swagger-ui.html

## 🆘 Need Help?

1. Check the [SETUP_GUIDE.md](SETUP_GUIDE.md) troubleshooting section
2. Review backend logs in the terminal
3. Check browser console for frontend errors
4. Verify all services are running

## 🎉 Success!

If you see the homepage at http://localhost:3000, you're all set!

**Happy Recruiting! 🚀**
