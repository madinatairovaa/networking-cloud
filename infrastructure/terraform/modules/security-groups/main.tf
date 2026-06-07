# Security Groups Module

variable "project_name" { type = string }
variable "environment" { type = string }
variable "vpc_id" { type = string }

# ALB Security Group (Public)
resource "aws_security_group" "alb" {
  name_prefix = "${var.project_name}-alb-"
  vpc_id      = var.vpc_id

  ingress { from_port = 80  to_port = 80  protocol = "tcp" cidr_blocks = ["0.0.0.0/0"] description = "HTTP" }
  ingress { from_port = 443 to_port = 443 protocol = "tcp" cidr_blocks = ["0.0.0.0/0"] description = "HTTPS" }
  egress  { from_port = 0   to_port = 0   protocol = "-1"  cidr_blocks = ["0.0.0.0/0"] }

  tags = { Name = "${var.project_name}-alb-sg" }
}

# EC2 Security Group (Private - only from ALB)
resource "aws_security_group" "ec2" {
  name_prefix = "${var.project_name}-ec2-"
  vpc_id      = var.vpc_id

  ingress { from_port = 8080 to_port = 8080 protocol = "tcp" security_groups = [aws_security_group.alb.id] description = "Backend from ALB" }
  ingress { from_port = 3000 to_port = 3000 protocol = "tcp" security_groups = [aws_security_group.alb.id] description = "Frontend from ALB" }
  ingress { from_port = 22   to_port = 22   protocol = "tcp" cidr_blocks = ["10.0.0.0/16"] description = "SSH from VPC" }
  egress  { from_port = 0    to_port = 0    protocol = "-1"  cidr_blocks = ["0.0.0.0/0"] }

  tags = { Name = "${var.project_name}-ec2-sg" }
}

# RDS Security Group (Private - only from EC2)
resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-rds-"
  vpc_id      = var.vpc_id

  ingress { from_port = 5432 to_port = 5432 protocol = "tcp" security_groups = [aws_security_group.ec2.id] description = "PostgreSQL from EC2" }
  egress  { from_port = 0    to_port = 0    protocol = "-1"  cidr_blocks = ["0.0.0.0/0"] }

  tags = { Name = "${var.project_name}-rds-sg" }
}

output "alb_sg_id" { value = aws_security_group.alb.id }
output "ec2_sg_id" { value = aws_security_group.ec2.id }
output "rds_sg_id" { value = aws_security_group.rds.id }
