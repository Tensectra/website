# PAYMENT LINK API - DEPLOYMENT FIX

## ? **Error You're Getting**

```
POST https://tensectra.com/api/send-payment-link 500 (Internal Server Error)
FUNCTION_INVOCATION_FAILED
```

**Cause:** Environment variables not set in Vercel production

---

## ? **IMMEDIATE FIX - Set Environment Variables in Vercel**

### **Step 1: Go to Vercel Dashboard**

1. Open: https://vercel.com/dashboard
2. Select your **tensectra** project
3. Click **Settings** (top nav)
4. Click **Environment Variables** (left sidebar)

---

### **Step 2: Add These 4 Variables**

Add each one individually:

#### **Variable 1: SUPABASE_URL**
```
Name: SUPABASE_URL
Value: https://ahcfozfntvqbfgbinxwr.supabase.co
Environment: Production, Preview, Development (check all 3)
```

#### **Variable 2: SUPABASE_SERVICE_ROLE_KEY**
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoY2ZvemZudHZxYmZnYmlueHdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ4NTY4MiwiZXhwIjoyMDkwMDYxNjgyfQ.LzKrQDzjFgHnSN4tipLOtiCVUJsdx8U8QBguV64cvSM
Environment: Production, Preview, Development (check all 3)
```

#### **Variable 3: PAYSTACK_SECRET_KEY**
```
Name: PAYSTACK_SECRET_KEY
Value: sk_test_42e267ba94e493687be820c5083991438dc9cd30
Environment: Production, Preview, Development (check all 3)
```

#### **Variable 4: RESEND_API_KEY**
```
Name: RESEND_API_KEY
Value: re_2cqgLRBK_NLK1SaJuchuXFsKmX1mKgt7n
Environment: Production, Preview, Development (check all 3)
```

#### **Variable 5: APP_URL** (Optional but recommended)
```
Name: APP_URL
Value: https://www.tensectra.com
Environment: Production (only)
```

---

### **Step 3: Redeploy**

After adding all variables:

1. **Option A - Force Redeploy:**
   - Go to **Deployments** tab
   - Click the **...** menu on latest deployment
   - Click **Redeploy**
   - Wait 1-2 minutes

2. **Option B - Push a Change:**
   ```bash
   cd C:\Websites\t2\tensectra
   git add .
   git commit -m "fix: API environment variables"
   git push origin main
   ```

---

### **Step 4: Test Again**

1. Wait for deployment to complete (green checkmark)
2. Go to: https://www.tensectra.com/admin/applications
3. Click payment link button
4. Should work now!

---

## ?? **How to Verify Variables Are Set**

In Vercel dashboard, you should see:

```
Environment Variables (5)
? SUPABASE_URL
? SUPABASE_SERVICE_ROLE_KEY
? PAYSTACK_SECRET_KEY
? RESEND_API_KEY
? APP_URL
```

---

## ?? **What I Fixed in Code**

1. **Better error handling** - Now returns proper JSON errors
2. **CORS headers** - Allows API calls from admin panel
3. **Environment variable validation** - Checks if keys are set
4. **Detailed logging** - Shows exactly where it fails
5. **Character encoding** - Fixed emoji in email subject

---

## ?? **Test Payment Link (After Deploying)**

### **Test Steps:**

1. **Go to:** https://www.tensectra.com/admin/applications
2. **Click:** Payment link button (??)
3. **Modal opens** with student details
4. **Adjust amount** if needed (e.g., 299)
5. **Click:** "Generate & Send Link"

### **Expected Result:**

**Console shows:**
```
[Payment Link] Creating Paystack transaction: { email, amount, currency }
[Payment Link] Paystack URL created: https://checkout.paystack.com/...
[Payment Link] Sending email to: student@example.com
[Payment Link] Email sent successfully
[Payment Link] Success! { reference, email }
```

**Toast notification:**
```
? Payment link sent to student@example.com
```

**Email arrives:**
- To: student@example.com
- From: Tensectra <hello@tensectra.com>
- Subject: "You're accepted - complete your enrolment for Backend Engineer Cohort"
- Body: Beautiful HTML email with payment button

---

## ?? **If Still Not Working**

### **Check Vercel Logs:**

1. Go to Vercel dashboard
2. Click **Functions** tab
3. Look for `/api/send-payment-link`
4. Check logs for errors

### **Common Issues:**

| Error | Cause | Fix |
|-------|-------|-----|
| "Missing API keys" | Variables not set | Add in Vercel dashboard |
| "Not authorised as admin" | Admin user not in DB | Run admin SQL script |
| "Paystack error" | Invalid Paystack key | Check key is correct |
| "Email failed" | Invalid Resend key | Verify domain in Resend |

---

## ?? **Next Steps (After Vercel Variables Set)**

1. ? **Add environment variables** to Vercel
2. ? **Redeploy** (wait 1-2 minutes)
3. ? **Test** payment link from admin panel
4. ? **Check email** inbox for test message
5. ? **Verify** Paystack transaction created

---

## ?? **Quick Checklist**

Before testing payment links:

- [ ] Vercel has all 5 environment variables
- [ ] Latest code deployed to production
- [ ] Resend domain verified (tensectra.com)
- [ ] Paystack account active
- [ ] Admin user exists in Supabase
- [ ] Logged into admin panel

---

## ?? **Security Notes**

? **Safe:** Environment variables are encrypted in Vercel
? **Safe:** Service role key only accessible to API functions
? **Safe:** Admin authentication verified before API call
?? **Important:** Never commit `.env` file to Git

---

**Set the environment variables in Vercel now, then test!** The API will work once the variables are configured.
