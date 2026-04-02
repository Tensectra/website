# Password-Based Admin Login Setup

## ? What Changed

**Before:** Magic link (email OTP) authentication  
**After:** Email + password login (no email rate limits)

---

## ?? Setup Instructions

### Step 1: Create Your First Admin User

1. Go to: https://supabase.com/dashboard/project/ahcfozfntvqbfgbinxwr
2. **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the contents of `forms/MDoc/Dbs/Step4_CreateAdminUser.sql`
5. **?? IMPORTANT:** Change line 28:
   ```sql
   crypt('YourSecurePassword123!', gen_salt('bf')),
   ```
   Replace `YourSecurePassword123!` with your actual password (8+ characters)

6. Click **Run** (or press `Ctrl+Enter`)
7. You should see: `Success. 1 row(s) affected`

### Step 2: Verify User Was Created

Run this query in Supabase SQL Editor:

```sql
SELECT 
  u.email,
  u.email_confirmed_at,
  a.role,
  a.active
FROM auth.users u
LEFT JOIN admin_users a ON u.email = a.email
WHERE u.email = 'tensectra.office@gmail.com';
```

You should see one row with:
- `email_confirmed_at`: timestamp
- `role`: `admin`
- `active`: `true`

### Step 3: Test Login

1. Go to: https://www.tensectra.com/admin/
2. Enter:
   - **Email:** `tensectra.office@gmail.com`
   - **Password:** (the password you set in Step 1)
3. Click **Sign In**
4. You should be redirected to `/admin/dashboard`

---

## ?? Managing Admin Users

### Add a New Admin User

Use the template in `Step4_CreateAdminUser.sql` (lines 53-72):

```sql
-- Change these values:
INSERT INTO auth.users (...)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'hr.tensectra@gmail.com', -- ? Change email
  crypt('HrPassword456!', gen_salt('bf')), -- ? Change password
  NOW(), NOW(), NOW(), NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  NOW(), NOW(), false
);

INSERT INTO admin_users (email, name, role, active)
VALUES (
  'hr.tensectra@gmail.com', -- ? Change email
  'HR Manager',             -- ? Change name
  'hr',                     -- ? Change role: admin | sales | hr
  true
);
```

### Reset a Password

If you forget your password, run this in Supabase SQL Editor:

```sql
UPDATE auth.users
SET encrypted_password = crypt('NewPassword789!', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'tensectra.office@gmail.com';
```

### Deactivate a User

```sql
UPDATE admin_users
SET active = false
WHERE email = 'old.admin@tensectra.com';
```

---

## ??? Security Notes

1. **Never commit passwords** to Git — always use the SQL script directly in Supabase
2. **Use strong passwords** — minimum 12 characters, mix of uppercase, lowercase, numbers, symbols
3. **Different passwords per user** — don't reuse passwords across accounts
4. **Supabase Auth handles**:
   - Password hashing (bcrypt)
   - Session management
   - JWT token generation
   - Automatic expiry (1 hour)

---

## ?? Reverting to Magic Links (if needed)

If you want to go back to magic link authentication:

1. Restore the old `admin/index.html` from Git history
2. The `js/admin-auth.js` file works with both methods (no changes needed)

---

## ?? Admin Roles Reference

| Role | Permissions |
|------|-------------|
| `admin` | Full access to all panels |
| `sales` | Consultancy + Payments |
| `hr` | Applications + Scholarship |

Role checks are enforced in each admin page's inline script.

---

## ? Quick Test Checklist

- [ ] Admin user created in Supabase
- [ ] Login at `/admin/` works
- [ ] Dashboard loads with correct user name
- [ ] Consultancy page loads (admin/sales only)
- [ ] Applications page loads (admin/hr only)
- [ ] Payments page loads (admin only)
- [ ] Logout button works
- [ ] Refresh page maintains session
