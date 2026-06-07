# =============================================
# Wholesale Platform - AWS Infrastructure
# Terraform Main Configuration
# =============================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket         = "wholesale-platform-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "wholesale-platform"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# =============================================
# VPC & Networking
# =============================================
module "vpc" {
  source = "./modules/vpc"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = var.availability_zones
}

# =============================================
# Security Groups
# =============================================
module "security_groups" {
  source = "./modules/security-groups"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
}

# =============================================
# Application Load Balancer
# =============================================
module "alb" {
  source = "./modules/alb"

  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  alb_sg_id         = module.security_groups.alb_sg_id
}

# =============================================
# RDS PostgreSQL
# =============================================
module "rds" {
  source = "./modules/rds"

  project_name       = var.project_name
  environment        = var.environment
  private_subnet_ids = module.vpc.private_subnet_ids
  rds_sg_id          = module.security_groups.rds_sg_id
  db_name            = var.db_name
  db_username        = var.db_username
  db_password        = var.db_password
}

# =============================================
# Auto Scaling Group & EC2
# =============================================
module "asg" {
  source = "./modules/asg"

  project_name       = var.project_name
  environment        = var.environment
  private_subnet_ids = module.vpc.private_subnet_ids
  ec2_sg_id          = module.security_groups.ec2_sg_id
  target_group_arn   = module.alb.target_group_arn
  instance_type      = var.instance_type
  key_name           = var.key_name
  min_size           = var.asg_min_size
  max_size           = var.asg_max_size
  desired_capacity   = var.asg_desired_capacity
  aws_region         = var.aws_region
}

# =============================================
# S3 & CloudFront
# =============================================
module "s3" {
  source = "./modules/s3"

  project_name = var.project_name
  environment  = var.environment
}

# =============================================
# CloudWatch Monitoring
# =============================================
module "monitoring" {
  source = "./modules/monitoring"

  project_name    = var.project_name
  environment     = var.environment
  asg_name        = module.asg.asg_name
  alb_arn_suffix  = module.alb.alb_arn_suffix
  rds_instance_id = module.rds.db_instance_id
  alarm_email     = var.alarm_email
}
