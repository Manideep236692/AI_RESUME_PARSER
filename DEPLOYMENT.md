# Deployment Guide - Smart Recruitment Platform

Complete guide for deploying the Smart Recruitment Platform to production.

## 📋 Pre-Deployment Checklist

### Security
- [ ] Change JWT secret key in production
- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable SQL injection protection
- [ ] Implement proper input validation
- [ ] Use secure password policies
- [ ] Set up firewall rules

### Performance
- [ ] Enable database connection pooling
- [ ] Configure caching (Redis)
- [ ] Set up CDN for static assets
- [ ] Enable Gzip compression
- [ ] Optimize database queries
- [ ] Add database indexes
- [ ] Configure load balancing

### Monitoring
- [ ] Set up application logging
- [ ] Configure error tracking (Sentry)
- [ ] Set up performance monitoring
- [ ] Configure uptime monitoring
- [ ] Set up database monitoring
- [ ] Configure alerts

### Backup
- [ ] Set up automated database backups
- [ ] Configure file storage backups
- [ ] Test restore procedures
- [ ] Document backup schedule

## 🚀 Deployment Options

### Option 1: Docker Deployment (Recommended)

#### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- Domain name (optional)
- SSL certificate (optional)

#### Steps

1. **Clone Repository**
```bash
git clone <repository-url>
cd smart-recruitment-platform
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with production values
```

3. **Update Docker Compose for Production**

Create `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: recruitment-db-prod
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    networks:
      - recruitment-network
    restart: always

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: recruitment-backend-prod
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/${DB_NAME}
      SPRING_DATASOURCE_USERNAME: ${DB_USERNAME}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}
    depends_on:
      - postgres
    networks:
      - recruitment-network
    restart: always
    volumes:
      - ./uploads:/app/uploads

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=${API_URL}
    container_name: recruitment-frontend-prod
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - recruitment-network
    restart: always
    volumes:
      - ./ssl:/etc/nginx/ssl

volumes:
  postgres_data:

networks:
  recruitment-network:
    driver: bridge
```

4. **Build and Deploy**
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

5. **Verify Deployment**
```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

### Option 2: AWS Deployment

#### Architecture
```
┌─────────────────┐
│   CloudFront    │ (CDN)
└────────┬────────┘
         │
┌────────▼────────┐
│   S3 Bucket     │ (Frontend)
└─────────────────┘

┌─────────────────┐
│  Route 53       │ (DNS)
└────────┬────────┘
         │
┌────────▼────────┐
│   ALB           │ (Load Balancer)
└────────┬────────┘
         │
┌────────▼────────┐
│   EC2 / ECS     │ (Backend)
└────────┬────────┘
         │
┌────────▼────────┐
│   RDS           │ (PostgreSQL)
└─────────────────┘
```

#### Steps

**1. Database Setup (RDS)**
```bash
# Create PostgreSQL RDS instance
aws rds create-db-instance \
  --db-instance-identifier recruitment-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <password> \
  --allocated-storage 20
```

**2. Backend Deployment (EC2)**
```bash
# Launch EC2 instance
# SSH into instance
ssh -i key.pem ec2-user@<instance-ip>

# Install Java
sudo yum install java-17-amazon-corretto

# Upload JAR file
scp -i key.pem target/*.jar ec2-user@<instance-ip>:~/

# Run application
java -jar app.jar \
  --spring.datasource.url=jdbc:postgresql://<rds-endpoint>:5432/recruitment_db \
  --spring.datasource.username=admin \
  --spring.datasource.password=<password>
```

**3. Frontend Deployment (S3 + CloudFront)**
```bash
# Build frontend
cd frontend
npm run build

# Create S3 bucket
aws s3 mb s3://recruitment-platform-frontend

# Upload build files
aws s3 sync dist/ s3://recruitment-platform-frontend

# Configure S3 for static website hosting
aws s3 website s3://recruitment-platform-frontend \
  --index-document index.html \
  --error-document index.html

# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name recruitment-platform-frontend.s3.amazonaws.com
```

### Option 3: Heroku Deployment

#### Backend (Heroku)
```bash
# Login to Heroku
heroku login

# Create app
heroku create recruitment-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
cd backend
git init
heroku git:remote -a recruitment-backend
git add .
git commit -m "Deploy"
git push heroku master
```

#### Frontend (Netlify)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

### Option 4: DigitalOcean Deployment

#### Using App Platform

1. **Create App**
   - Go to DigitalOcean App Platform
   - Connect GitHub repository
   - Configure build settings

2. **Database**
   - Create Managed PostgreSQL database
   - Note connection details

3. **Environment Variables**
   - Add all required environment variables
   - Configure secrets

4. **Deploy**
   - Click "Deploy"
   - Monitor build logs

## 🔒 SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Nginx Configuration with SSL

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Monitoring Setup

### Application Monitoring (Spring Boot Actuator)

Add to `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

Configure in `application.properties`:
```properties
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=always
```

### Error Tracking (Sentry)

**Backend:**
```xml
<dependency>
    <groupId>io.sentry</groupId>
    <artifactId>sentry-spring-boot-starter</artifactId>
    <version>6.30.0</version>
</dependency>
```

```properties
sentry.dsn=https://your-dsn@sentry.io/project-id
```

**Frontend:**
```bash
npm install @sentry/react
```

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://your-dsn@sentry.io/project-id",
  environment: "production"
});
```

### Logging (ELK Stack)

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.10.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.10.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf

  kibana:
    image: docker.elastic.co/kibana/kibana:8.10.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          
      - name: Run Backend Tests
        run: |
          cd backend
          mvn test
          
      - name: Run Frontend Tests
        run: |
          cd frontend
          npm install
          npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and Push Docker Images
        run: |
          docker build -t recruitment-backend:latest ./backend
          docker build -t recruitment-frontend:latest ./frontend
          docker push recruitment-backend:latest
          docker push recruitment-frontend:latest
          
      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /app
            docker-compose pull
            docker-compose up -d
```

## 🗄️ Database Migration

### Backup Before Deployment

```bash
# Backup database
pg_dump -U postgres -d recruitment_db > backup_$(date +%Y%m%d).sql

# Restore if needed
psql -U postgres -d recruitment_db < backup_20240101.sql
```

### Flyway Migration (Recommended)

Add to `pom.xml`:
```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
```

Create migration files in `src/main/resources/db/migration/`:
- `V1__Initial_schema.sql`
- `V2__Add_new_features.sql`

## 📈 Performance Optimization

### Database
```sql
-- Add indexes
CREATE INDEX idx_job_postings_active ON job_postings(is_active);
CREATE INDEX idx_job_applications_status ON job_applications(status);

-- Analyze tables
ANALYZE job_postings;
ANALYZE job_applications;
```

### Backend
```properties
# Connection pooling
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5

# Caching
spring.cache.type=redis
spring.redis.host=localhost
spring.redis.port=6379
```

### Frontend
```javascript
// Code splitting
const Dashboard = lazy(() => import('./components/Dashboard'));

// Image optimization
<img loading="lazy" src="..." alt="..." />
```

## 🔐 Security Hardening

### Backend
```properties
# Security headers
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.same-site=strict

# Rate limiting
bucket4j.enabled=true
bucket4j.filters[0].rate-limits[0].bandwidths[0].capacity=100
bucket4j.filters[0].rate-limits[0].bandwidths[0].time=1
bucket4j.filters[0].rate-limits[0].bandwidths[0].unit=minutes
```

### Nginx
```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20;
```

## 📞 Post-Deployment

### Verification Checklist
- [ ] Application is accessible
- [ ] Database connection working
- [ ] Authentication working
- [ ] File uploads working
- [ ] Email notifications working (if configured)
- [ ] SSL certificate valid
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Logs accessible

### Rollback Plan
```bash
# Rollback to previous version
docker-compose down
docker-compose -f docker-compose.prod.yml up -d --build <previous-version>

# Restore database if needed
psql -U postgres -d recruitment_db < backup_previous.sql
```

## 📚 Additional Resources

- [Spring Boot Production Best Practices](https://docs.spring.io/spring-boot/docs/current/reference/html/deployment.html)
- [React Production Build](https://reactjs.org/docs/optimizing-performance.html)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)

---

**Last Updated**: 2024
**Version**: 1.0.0
