# Deployment Guide

## Local Development

### Prerequisites
- Java 21 (Temurin), Node.js 20+, PostgreSQL 16, Docker

### 1. Database
```bash
psql -U postgres -c "CREATE DATABASE networking_db;"
```

### 2. Backend
```bash
cd backend
./gradlew bootRun
```
- API: http://localhost:8080/api
- Swagger: http://localhost:8080/api/swagger-ui.html

### 3. Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
- App: http://localhost:3000

### 4. Docker Compose (Full Stack)
```bash
docker-compose up -d
```

## AWS Deployment

### Step 1: Infrastructure
```bash
cd infrastructure/terraform
terraform init
terraform plan -var="db_password=your_secure_password"
terraform apply -var="db_password=your_secure_password"
```

### Step 2: ECR Repositories
```bash
aws ecr create-repository --repository-name wholesale-platform-backend
aws ecr create-repository --repository-name wholesale-platform-frontend
```

### Step 3: Push Docker Images
```bash
aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
docker build -t $ECR_REGISTRY/wholesale-platform-backend:latest ./backend
docker push $ECR_REGISTRY/wholesale-platform-backend:latest
docker build -t $ECR_REGISTRY/wholesale-platform-frontend:latest ./frontend
docker push $ECR_REGISTRY/wholesale-platform-frontend:latest
```

### Step 4: Configure RDS
Update application.properties with RDS endpoint from Terraform output.

### Step 5: CI/CD
Configure GitHub Secrets:
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ACCOUNT_ID`

## Monitoring

- CloudWatch Dashboard: `wholesale-platform-dashboard`
- Alarms: CPU > 80%, ALB 5xx > 10, RDS storage < 5GB
- Logs: Application logs via CloudWatch Logs Agent

## Rollback Strategy

1. GitHub Actions auto-rolls back on deployment failure
2. Manual: `aws ecs update-service --force-new-deployment` with previous task definition
3. RDS: Point-in-time recovery from automated backups
