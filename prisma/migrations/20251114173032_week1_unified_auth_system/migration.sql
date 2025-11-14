-- Week 1: Unified Authentication System with Admin Approval Workflow
-- This migration adds support for student/faculty/admin roles with approval workflow

-- Modify users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'student';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_super_admin" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "account_status" TEXT NOT NULL DEFAULT 'active';

-- Student fields
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "major" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "graduation_year" INTEGER;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "academic_interests" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Faculty fields
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "department" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "research_area" TEXT;

-- Add indexes for users table
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");
CREATE INDEX IF NOT EXISTS "users_account_status_idx" ON "users"("account_status");
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");

-- Create faculty_requests table
CREATE TABLE IF NOT EXISTS "faculty_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "request_statement" TEXT NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approval_status" TEXT NOT NULL DEFAULT 'pending',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "admin_note" TEXT,
    "decline_reason" TEXT,

    CONSTRAINT "faculty_requests_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint and indexes for faculty_requests
CREATE UNIQUE INDEX IF NOT EXISTS "faculty_requests_user_id_key" ON "faculty_requests"("user_id");
CREATE INDEX IF NOT EXISTS "faculty_requests_approval_status_idx" ON "faculty_requests"("approval_status");
CREATE INDEX IF NOT EXISTS "faculty_requests_requested_at_idx" ON "faculty_requests"("requested_at");
CREATE INDEX IF NOT EXISTS "faculty_requests_reviewed_by_idx" ON "faculty_requests"("reviewed_by");

-- Add foreign keys for faculty_requests
ALTER TABLE "faculty_requests" ADD CONSTRAINT "faculty_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "faculty_requests" ADD CONSTRAINT "faculty_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create admin_audit_logs table
CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target_type" TEXT,
    "target_id" TEXT,
    "reason" TEXT,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- Add indexes for admin_audit_logs
CREATE INDEX IF NOT EXISTS "admin_audit_logs_admin_id_idx" ON "admin_audit_logs"("admin_id");
CREATE INDEX IF NOT EXISTS "admin_audit_logs_action_idx" ON "admin_audit_logs"("action");
CREATE INDEX IF NOT EXISTS "admin_audit_logs_created_at_idx" ON "admin_audit_logs"("created_at");
CREATE INDEX IF NOT EXISTS "admin_audit_logs_target_type_target_id_idx" ON "admin_audit_logs"("target_type", "target_id");

-- Add foreign key for admin_audit_logs
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
