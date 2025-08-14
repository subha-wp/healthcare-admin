-- Create admin users with proper roles
-- Run this script to set up initial admin accounts

-- Insert admin user
INSERT INTO "User" (id, email, "hashedPassword", role, "createdAt", "updatedAt")
VALUES (
  'admin-001',
  'admin@healthcare.com',
  '$2a$12$LQv3c1yqBWVHxkd0LQ1Gv.6FqB0dQjinQNdjxaOXAGy0dQXFf8PqS', -- password: admin123
  'ADMIN',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert admin profile
INSERT INTO "Admin" (id, "userId", name, phone, department)
VALUES (
  'admin-profile-001',
  'admin-001',
  'System Administrator',
  '+1234567890',
  'IT Department'
) ON CONFLICT ("userId") DO NOTHING;

-- Insert office manager user
INSERT INTO "User" (id, email, "hashedPassword", role, "createdAt", "updatedAt")
VALUES (
  'office-001',
  'office@healthcare.com',
  '$2a$12$LQv3c1yqBWVHxkd0LQ1Gv.6FqB0dQjinQNdjxaOXAGy0dQXFf8PqS', -- password: office123
  'OFFICE_MANAGER',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert office manager profile
INSERT INTO "Admin" (id, "userId", name, phone, department, permissions)
VALUES (
  'office-profile-001',
  'office-001',
  'Office Manager',
  '+1234567891',
  'Administration',
  '{"canCreateAppointments": true, "canViewReports": true, "canManageSchedules": true}'
) ON CONFLICT ("userId") DO NOTHING;
