-- =====================================================
-- Tensectra Admin User Creation Script
-- Run this ONCE in Supabase SQL Editor
-- =====================================================

-- STEP 1: Create the auth user with password
-- Replace 'YourSecurePassword123!' with your actual password
-- This creates the user in Supabase Auth

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  confirmed_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  is_super_admin
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'tensectra.office@gmail.com',
  crypt('YourSecurePassword123!', gen_salt('bf')), -- ?? CHANGE THIS PASSWORD
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  NOW(),
  NOW(),
  false
);

-- STEP 2: Add to admin_users table
-- This enables access to the admin panel

INSERT INTO admin_users (email, name, role, active)
VALUES ('tensectra.office@gmail.com', 'Tensectra Admin', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- VERIFICATION
-- Run this to confirm the user was created:
-- =====================================================

SELECT 
  u.email,
  u.email_confirmed_at,
  a.role,
  a.active,
  a.created_at
FROM auth.users u
LEFT JOIN admin_users a ON u.email = a.email
WHERE u.email = 'tensectra.office@gmail.com';

-- =====================================================
-- TO ADD MORE ADMIN USERS LATER
-- =====================================================
-- Use this template and change email/password/name/role:

/*
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_sent_at, confirmed_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_super_admin
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'new.admin@tensectra.com',
  crypt('NewPassword456!', gen_salt('bf')),
  NOW(), NOW(), NOW(), NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  NOW(), NOW(), false
);

INSERT INTO admin_users (email, name, role, active)
VALUES ('new.admin@tensectra.com', 'New Admin', 'sales', true);
*/

-- =====================================================
-- PASSWORD RESET (if you forget your password)
-- =====================================================
-- Update the encrypted_password field:

/*
UPDATE auth.users
SET encrypted_password = crypt('NewPassword789!', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'tensectra.office@gmail.com';
*/
