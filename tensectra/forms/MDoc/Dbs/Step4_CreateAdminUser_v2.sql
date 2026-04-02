-- =====================================================
-- Tensectra Admin User Creation (Fixed for Supabase v2)
-- Run this ONCE in Supabase SQL Editor
-- =====================================================

-- STEP 1: Create the auth user with password
-- ⚠️ CHANGE 'YourSecurePassword123!' to your actual password
DELETE FROM admin_users WHERE email = 'tensectra.office@gmail.com';
DELETE FROM auth.users WHERE email = 'tensectra.office@gmail.com';




INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'tensectra.office@gmail.com',
  crypt('Adminx!2', gen_salt('bf')), -- ⚠️ CHANGE THIS PASSWORD
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
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

-- Expected result: 1 row with email_confirmed_at populated

-- =====================================================
-- TO ADD MORE ADMIN USERS LATER
-- =====================================================
-- Copy and modify this template:

/*
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'hr.tensectra@gmail.com',
  crypt('HrPassword456!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  NOW(), NOW(), '', '', '', ''
);

INSERT INTO admin_users (email, name, role, active)
VALUES ('hr.tensectra@gmail.com', 'HR Manager', 'hr', true);
*/

-- =====================================================
-- PASSWORD RESET (if you forget your password)
-- =====================================================

/*
UPDATE auth.users
SET 
  encrypted_password = crypt('NewPassword789!', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'tensectra.office@gmail.com';
*/

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

-- If you get "user already exists" error, delete first:
/*
DELETE FROM admin_users WHERE email = 'tensectra.office@gmail.com';
DELETE FROM auth.users WHERE email = 'tensectra.office@gmail.com';
*/
