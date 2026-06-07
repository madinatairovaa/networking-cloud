-- =============================================
-- Wholesale Clothing Management Platform
-- Database Initialization Script
-- =============================================

-- Create database (if running manually)
-- CREATE DATABASE networking_db;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- NOTE: Tables are auto-created by JPA/Hibernate
-- This script provides indexes and optimizations
-- =============================================

-- Performance indexes (applied after JPA creates tables)
-- These complement the JPA-defined indexes

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_status_deleted ON users(status, is_deleted);
CREATE INDEX IF NOT EXISTS idx_products_status_deleted ON products(status, is_deleted);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory((quantity - reserved_quantity), reorder_level);

-- Full-text search support
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_email_trgm ON users USING gin(email gin_trgm_ops);

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE networking_db TO postgres;
