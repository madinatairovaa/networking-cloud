# Wholesale Clothing Management Platform

Enterprise-grade, cloud-native wholesale clothing management system designed for AWS deployment and cloud networking demonstrations.

## 🏗️ Architecture

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, ShadCN UI |
| **Backend** | Java 21, Spring Boot 3, Spring Security, Spring Data JPA |
| **Database** | PostgreSQL 16 |
| **Authentication** | JWT (Access + Refresh Tokens), BCrypt |
| **API Documentation** | OpenAPI 3.0 / Swagger UI |
| **Containerization** | Docker, Docker Compose |
| **Infrastructure** | Terraform, AWS (VPC, ALB, ASG, RDS, S3, CloudFront) |
| **CI/CD** | GitHub Actions |
| **Monitoring** | CloudWatch, Actuator |

## 🚀 Quick Start

### Prerequisites
- Java 21, Node.js 20+, PostgreSQL 16, Docker

### Database Setup
```bash
# Create database
psql -U postgres -c "CREATE DATABASE networking_db;"
```

### Backend
```bash
cd backend
./gradlew bootRun
# API: http://localhost:8080/api
# Swagger: http://localhost:8080/api/swagger-ui.html
```

### Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
# App: http://localhost:3000
```

### Docker (Full Stack)
```bash
docker-compose up -d
```

## 👥 Default Accounts

| Role | Email | Password | Force Change |
|------|-------|----------|:---:|
| Admin | admin@company.com | Admin@123 | ✅ |
| Manager | manager@company.com | Manager@123 | ✅ |
| Seller | seller@company.com | Seller@123 | ✅ |

## 🔐 RBAC Permissions

- **ADMIN**: Full system access, user management, audit logs, security center, AWS monitoring
- **MANAGER**: Product/inventory/warehouse/order/customer management, reports
- **SELLER**: Product CRUD, categories, inventory viewing
- **USER**: Browse products, create/track orders, profile management

## 📁 Project Structure

```
├── backend/                    # Spring Boot 3 API
│   ├── src/main/java/com/wholesale/platform/
│   │   ├── config/            # Security, OpenAPI, Audit, Seeder
│   │   ├── controller/        # REST Controllers
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── entity/            # JPA Entities (17 tables)
│   │   ├── exception/         # Global Exception Handling
│   │   ├── repository/        # Spring Data JPA Repositories
│   │   ├── security/          # JWT, Filters, UserDetails
│   │   └── service/           # Business Logic
│   └── src/main/resources/    # application.properties
├── frontend/                   # Next.js 14 App
│   └── src/
│       ├── app/               # Pages (login, register, dashboards)
│       ├── components/        # ShadCN UI Components
│       ├── context/           # Auth Context
│       └── lib/               # API Client, Utilities
├── infrastructure/
│   └── terraform/             # AWS IaC
│       └── modules/           # VPC, ALB, ASG, RDS, S3, Monitoring
├── database/                  # SQL scripts
├── .github/workflows/         # CI/CD Pipeline
└── docker-compose.yml         # Local development
```

## ☁️ AWS Architecture

```
Internet → CloudFront (CDN)
         → ALB (Public Subnets)
            → EC2 Auto Scaling Group (Private Subnets)
               → RDS PostgreSQL Multi-AZ (Private Subnets)
            → S3 (Static Assets)
         
VPC (10.0.0.0/16)
├── Public Subnets (10.0.1.0/24, 10.0.2.0/24) - ALB, NAT Gateway
├── Private Subnets (10.0.10.0/24, 10.0.20.0/24) - EC2, RDS
├── Internet Gateway
├── NAT Gateway
├── Route Tables (Public → IGW, Private → NAT)
└── Security Groups (ALB→EC2→RDS chain)
```

## 🔒 Security Features

- BCrypt password hashing (strength 12)
- JWT access + refresh token authentication
- Permission-based RBAC (4 roles, 30+ permissions)
- Force password change for default accounts
- OTP verification for registration & password reset
- Account suspension & soft delete
- Comprehensive audit logging
- CORS, CSP, secure headers
- Input validation & sanitization

## 📊 API Endpoints

| Endpoint | Description | Access |
|----------|-------------|--------|
| `POST /v1/auth/login` | Login | Public |
| `POST /v1/auth/register` | Register | Public |
| `POST /v1/auth/verify-otp` | Verify OTP | Public |
| `POST /v1/auth/forgot-password` | Forgot password | Public |
| `POST /v1/auth/reset-password` | Reset password | Public |
| `POST /v1/auth/refresh-token` | Refresh token | Public |
| `GET /v1/users` | List users | Admin |
| `POST /v1/users` | Create user | Admin/Manager |
| `GET /v1/products` | List products | Authenticated |
| `POST /v1/products` | Create product | Seller+ |
| `GET /v1/orders` | List orders | Manager+ |
| `POST /v1/orders` | Create order | User |
| `GET /v1/dashboard/admin` | Admin stats | Admin |
| `GET /v1/audit-logs` | Audit logs | Admin |

## 📜 License

MIT License
# CI/CD Test
