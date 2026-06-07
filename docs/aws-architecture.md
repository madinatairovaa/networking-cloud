# AWS Cloud Architecture

## Architecture Diagram Description

```
                        ┌─────────────────────────────────────┐
                        │           INTERNET                   │
                        └──────────────┬──────────────────────┘
                                       │
                        ┌──────────────┴──────────────────────┐
                        │      Amazon CloudFront (CDN)         │
                        │   Static assets, caching, SSL/TLS    │
                        └──────────────┬──────────────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                │              AWS VPC (10.0.0.0/16)           │
                │                                              │
                │  ┌──────────── PUBLIC SUBNETS ──────────┐    │
                │  │                                      │    │
                │  │  ┌──────────────────────────────┐    │    │
                │  │  │  Application Load Balancer   │    │    │
                │  │  │  (Internet-facing, HTTPS)    │    │    │
                │  │  └──────────┬───────────────────┘    │    │
                │  │             │                        │    │
                │  │  ┌──────────┴───────────────────┐    │    │
                │  │  │      NAT Gateway             │    │    │
                │  │  │  (Outbound for private)      │    │    │
                │  │  └──────────────────────────────┘    │    │
                │  │                                      │    │
                │  │  Subnet-A: 10.0.1.0/24 (us-east-1a) │    │
                │  │  Subnet-B: 10.0.2.0/24 (us-east-1b) │    │
                │  └──────────────────────────────────────┘    │
                │                      │                       │
                │  ┌──────────── PRIVATE SUBNETS ─────────┐    │
                │  │                   │                   │    │
                │  │  ┌────────────────┴──────────────┐    │    │
                │  │  │   Auto Scaling Group          │    │    │
                │  │  │   ┌────────┐  ┌────────┐      │    │    │
                │  │  │   │ EC2-1  │  │ EC2-2  │      │    │    │
                │  │  │   │Backend │  │Backend │      │    │    │
                │  │  │   │Frontend│  │Frontend│      │    │    │
                │  │  │   └────────┘  └────────┘      │    │    │
                │  │  │   Min: 2 | Max: 6 | Scale     │    │    │
                │  │  └───────────────────────────────┘    │    │
                │  │                   │                   │    │
                │  │  ┌────────────────┴──────────────┐    │    │
                │  │  │   Amazon RDS PostgreSQL       │    │    │
                │  │  │   ┌─────────┐ ┌──────────┐    │    │    │
                │  │  │   │Primary  │ │ Standby  │    │    │    │
                │  │  │   │(1a)     │ │ (1b)     │    │    │    │
                │  │  │   └─────────┘ └──────────┘    │    │    │
                │  │  │   Multi-AZ | Encrypted        │    │    │
                │  │  └───────────────────────────────┘    │    │
                │  │                                       │    │
                │  │  Subnet-A: 10.0.10.0/24 (us-east-1a)│    │
                │  │  Subnet-B: 10.0.20.0/24 (us-east-1b)│    │
                │  └───────────────────────────────────────┘    │
                └──────────────────────────────────────────────┘

        ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐
        │  Amazon S3   │  │  CloudWatch  │  │   IAM / Secrets  │
        │  Assets      │  │  Monitoring  │  │   Manager        │
        └─────────────┘  └──────────────┘  └──────────────────┘
```

## Cloud Networking Concepts Demonstrated

### Network Layer
| Concept | Implementation |
|---------|---------------|
| **VPC** | 10.0.0.0/16 - Isolated virtual network |
| **Public Subnets** | 10.0.1.0/24, 10.0.2.0/24 - ALB & NAT |
| **Private Subnets** | 10.0.10.0/24, 10.0.20.0/24 - EC2 & RDS |
| **Internet Gateway** | Provides internet to public subnets |
| **NAT Gateway** | Allows private subnet outbound access |
| **Route Tables** | Public→IGW, Private→NAT routing |
| **Network ACLs** | Subnet-level firewall rules |

### Security Layer
| Concept | Implementation |
|---------|---------------|
| **Security Groups** | ALB (80/443), EC2 (8080/3000), RDS (5432) |
| **IAM Roles** | EC2 instance roles for ECR, CloudWatch, SSM |
| **SSL/TLS** | Certificate Manager + CloudFront HTTPS |
| **Secrets Manager** | Database credentials, JWT secrets |

### Application Layer
| Concept | Implementation |
|---------|---------------|
| **ALB** | Layer 7 load balancing with health checks |
| **Auto Scaling** | Min 2, Max 6 instances based on CPU |
| **EC2** | t3.medium in private subnets |
| **High Availability** | Multi-AZ deployment across 2 AZs |

### Data Layer
| Concept | Implementation |
|---------|---------------|
| **RDS** | PostgreSQL 16, Multi-AZ, encrypted |
| **Backups** | 7-day retention, automated snapshots |
| **S3** | Static assets with versioning |
| **CloudFront** | CDN with global edge locations |

### Monitoring
| Concept | Implementation |
|---------|---------------|
| **CloudWatch** | Metrics, alarms, dashboards |
| **SNS** | Email alerts for critical alarms |
| **Health Checks** | ALB + application-level checks |

## Security Architecture

Backend services run exclusively in **private subnets**. Only the **ALB is publicly accessible**. Traffic flow:

1. User → CloudFront → ALB (public subnet)
2. ALB → EC2 instances (private subnet) via Security Group rules
3. EC2 → RDS (private subnet) via Security Group rules
4. EC2 → Internet via NAT Gateway (software updates, external APIs)

## High Availability Strategy

- **Multi-AZ**: Resources spread across 2 Availability Zones
- **Auto Scaling**: Automatic capacity adjustment (2-6 instances)
- **RDS Multi-AZ**: Automatic failover standby database
- **ALB Health Checks**: Unhealthy instances automatically replaced
- **CloudFront**: Global CDN reduces origin load

## Scalability Strategy

- Horizontal scaling via Auto Scaling Groups
- Database vertical scaling + read replicas
- CloudFront caching reduces backend load
- Stateless application design enables easy scaling
