# TENSECTRA CODING STANDARDS - HARD RULES

> **FOLLOW THESE RULES TO AVOID REPEATED ERRORS**

Based on actual bugs fixed during development. Every rule here exists because we spent tokens fixing it.

---

## ?? ** CRITICAL: NEVER DO THESE **

### **1. Character Encoding**

? **NEVER use these characters in code:**
- `?` (replacement character - encoding error)
- `…` (ellipsis - use `...` instead)
- `—` (em dash - use `-` or `--`)
- Emoji directly in JavaScript strings (`??`, `?`, `?`)

? **ALWAYS use:**
```javascript
// BAD
var icon = '??';
var dash = '—';
var ellipsis = '…';

// GOOD
var icon = 'Pay Link';  // Or use SVG
var dash = '-';
var ellipsis = '...';
```

---

### **2. Special Characters in Strings**

? **NEVER:**
```javascript
// BAD - These break in production
'?' + amount  // Encoding fails
'…'          // Becomes ?
'—'          // Becomes ?
```

? **ALWAYS:**
```javascript
// GOOD - Use HTML entities or plain text
'NGN ' + amount
'...'
'-'

// Or use proper Unicode escape
'\u20A6' + amount  // ? symbol
```

---

### **3. File Exports**

? **NEVER have multiple exports:**
```javascript
// BAD - File will crash
export default function handler() { }
// ... more code ...
export default function handler() { }  // DUPLICATE!
```

? **ALWAYS check:**
```bash
# Before saving, verify:
Select-String -Path "file.js" -Pattern "export default"
# Should return ONLY ONE match
```

---

### **4. Functions Called from HTML**

? **NEVER call functions that don't exist:**
```html
<!-- BAD - Function not defined yet -->
<button onclick="sendPayment()">Pay</button>

<script>
  // sendPayment() doesn't exist! Error!
</script>
```

? **ALWAYS define before using:**
```html
<button onclick="sendPayment()">Pay</button>

<script>
  function sendPayment() {
    // Implementation here
  }
</script>
```

**CHECKLIST BEFORE ADDING `onclick`:**
1. Function defined in same file? ?
2. Function defined BEFORE the HTML using it? ?
3. Function name spelled exactly the same? ?

---

### **5. Modal Display**

? **NEVER assume modals work:**
```javascript
// BAD - No error handling
document.getElementById('modal').style.display = 'flex';
```

? **ALWAYS verify element exists:**
```javascript
// GOOD
function openModal() {
  var modal = document.getElementById('payment-modal');
  if (!modal) {
    console.error('Modal not found!');
    return;
  }
  modal.style.display = 'flex';
  console.log('Modal opened');
}
```

---

### **6. API Calls - Authentication**

? **NEVER call API without auth token:**
```javascript
// BAD - No authorization header
fetch('/api/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

? **ALWAYS include session token:**
```javascript
// GOOD
var { data: { session } } = await window._supabase.auth.getSession();
if (!session) {
  alert('Please login again');
  return;
}

fetch('/api/endpoint', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + session.access_token
  },
  body: JSON.stringify(data)
});
```

---

### **7. API Field Names**

? **NEVER use camelCase for API fields:**
```javascript
// BAD - Backend expects snake_case
{
  recordId: '123',
  recordType: 'cohort',
  productName: 'Course'
}
```

? **ALWAYS use snake_case:**
```javascript
// GOOD
{
  record_id: '123',
  record_type: 'cohort',
  product_name: 'Course'
}
```

**RULE:** If API is in Node.js ? use `snake_case`  
If frontend JavaScript ? use `camelCase`, but convert before sending to API

---

### **8. Environment Variables**

? **NEVER assume env vars exist:**
```javascript
// BAD - Will crash if missing
const KEY = process.env.PAYSTACK_KEY;
fetch('https://api.paystack.co', {
  headers: { Authorization: `Bearer ${KEY}` }  // Undefined!
});
```

? **ALWAYS validate first:**
```javascript
// GOOD
const KEY = process.env.PAYSTACK_KEY;
if (!KEY) {
  console.error('Missing PAYSTACK_KEY environment variable');
  return res.status(500).json({ error: 'Server configuration error' });
}

fetch('https://api.paystack.co', {
  headers: { Authorization: `Bearer ${KEY}` }
});
```

---

### **9. Error Responses**

? **NEVER return HTML from API:**
```javascript
// BAD - Frontend expects JSON
return res.status(500).send('<h1>Error</h1>');
```

? **ALWAYS return JSON:**
```javascript
// GOOD
return res.status(500).json({ 
  error: 'Something went wrong',
  details: err.message 
});
```

---

### **10. Browser Cache**

? **NEVER forget cache busting:**
```html
<!-- BAD - Browser caches forever -->
<link rel="stylesheet" href="style.css">
<script src="app.js"></script>
```

? **ALWAYS use version query param:**
```html
<!-- GOOD - Force reload when changed -->
<link rel="stylesheet" href="style.css?v=7">
<script src="app.js?v=7"></script>
```

**RULE:** Increment version number EVERY time you change CSS/JS

---

## ?? **MANDATORY CHECKLISTS**

### **Creating a New HTML Page**

```
[ ] No emoji in JavaScript strings
[ ] No special characters (—, …, etc)
[ ] All onclick functions defined in same file
[ ] Functions defined BEFORE HTML that uses them
[ ] CSS link has version: ?v=X
[ ] All text uses plain ASCII or proper HTML entities
[ ] Test in incognito mode (no cache)
[ ] Console has no errors
```

---

### **Creating a New API Endpoint**

```
[ ] Single export default statement (no duplicates)
[ ] Validates all environment variables exist
[ ] Returns JSON on all paths (never HTML)
[ ] Includes CORS headers
[ ] Validates authentication token
[ ] Uses snake_case for field names
[ ] Logs errors to console
[ ] Returns proper HTTP status codes:
    - 200: Success
    - 400: Bad request (missing fields)
    - 401: Unauthorized (no token)
    - 403: Forbidden (invalid token)
    - 500: Server error
```

---

### **Adding a Modal/Popup**

```
[ ] Modal HTML exists in same file as trigger
[ ] Modal has unique ID
[ ] Open function checks if element exists
[ ] Close function defined
[ ] CSS includes display: none by default
[ ] Test: Click button ? Modal shows
[ ] Test: Click close ? Modal hides
[ ] Test: Console has no errors
```

---

### **Making an API Call from Frontend**

```
[ ] Get session token first
[ ] Check if token exists (handle null)
[ ] Use correct HTTP method (POST/GET)
[ ] Send Authorization header
[ ] Use snake_case field names
[ ] Handle response.ok === false
[ ] Parse JSON response
[ ] Catch errors in try/catch
[ ] Show user feedback (toast/alert)
[ ] Log errors to console
```

---

## ?? **VERIFICATION COMMANDS**

Run these BEFORE committing code:

### **Check for Character Encoding Errors:**
```powershell
Select-String -Path "*.html" -Pattern "?|…|—" -Recursive
# Should return NOTHING
```

### **Check for Duplicate Exports:**
```powershell
Select-String -Path "api/*.js" -Pattern "export default"
# Each file should have ONLY ONE match
```

### **Check for Missing Functions:**
```powershell
# Search for onclick="functionName"
Select-String -Path "*.html" -Pattern "onclick=\"(\w+)"

# Then verify function exists in same file
Select-String -Path "*.html" -Pattern "function \1"
```

### **Check for Emoji in Code:**
```powershell
Select-String -Path "*.js","*.html" -Pattern "[^\x00-\x7F]"
# Review all non-ASCII characters
```

---

## **DATABASE RULES - HOW WE FIXED THE DB ERRORS**

These rules come from real bugs fixed in production. Follow them to avoid column errors.

---

### **RULE 1: Match payload exactly to table schema**

The REST API returns `PGRST204` if you send a field the table does not have.

**ALWAYS check the table schema before inserting:**
```sql
-- Run in Supabase SQL Editor to see all columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'your_table_name'
ORDER BY ordinal_position;
```

---

### **RULE 2: Never send timestamp fields manually**

If the column has `DEFAULT NOW()`, do NOT include it in your payload.
The database sets it automatically.

```javascript
// BAD - table uses downloaded_at DEFAULT NOW(), not submitted_at
fetch('/rest/v1/reference_card_downloads', {
  body: JSON.stringify({ name, email, submitted_at: new Date().toISOString() })
});

// GOOD - let database handle the timestamp
fetch('/rest/v1/reference_card_downloads', {
  body: JSON.stringify({ name, email })
});
```

---

### **RULE 3: When adding a new form, audit ALL field names first**

Open the HTML form and list every `name=""` attribute.
Then create the SQL table with matching column names.

```bash
# Quick audit command - list all form field names
Select-String -Path "forms\yourform.html" -Pattern 'name="(\w+)"' | ForEach-Object { $_.Matches.Groups[1].Value }
```

---

### **RULE 4: Use the working consultancy form as the template**

The `forms/consultancy-enquiry.html` form is proven to work. When creating a new form:

1. Copy its script loading order exactly:
```html
<script src="../js/theme-toggle.js"></script>
<script src="../js/main.js"></script>
<script src="../js/location.js"></script>
<script src="../js/supabase-config.js"></script>
<script src="../js/form-handler.js"></script>
<script>
  initForm('your-form-id', 'your_table_name', 'Your success message.');
</script>
```

2. Do NOT add the Supabase CDN. `form-handler.js` uses the REST API directly via `window.SUPABASE_URL` and `window.SUPABASE_ANON_KEY` set in `supabase-config.js`.

3. Do NOT add `method="POST"` or `netlify` attributes to the form tag.

---

### **RULE 5: Recreate tables cleanly when schema changes**

If you get `PGRST204: column not found`, the table schema is out of sync.
Always use `DROP TABLE IF EXISTS` before recreating:

```sql
-- CORRECT pattern for SQL files
DROP TABLE IF EXISTS your_table CASCADE;

CREATE TABLE your_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- all columns here
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);
```

Do NOT use `ALTER TABLE ADD COLUMN` unless you are sure the table exists with the old schema.

---

### **RULE 6: Grant INSERT to anon role on every public form table**

Without this, anonymous users (not logged in) cannot submit forms:

```sql
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert" ON your_table
  FOR INSERT WITH CHECK (true);

GRANT INSERT ON your_table TO anon;
GRANT SELECT, INSERT ON your_table TO authenticated;
```

---

### **RULE 7: One SQL file per table, kept in forms/MDoc/Dbs/**

```
forms/MDoc/Dbs/
  waitlist_table.sql          -- waitlist_submissions
  Step4_CRM_Tracking.sql      -- kit_purchase_requests + reference_card_downloads
  course_notifications.sql    -- course_notifications
  Step3_AdminSchema.sql       -- admin setup
```

Each file must be self-contained: DROP + CREATE + POLICIES + GRANTS.
Run one file at a time in Supabase SQL Editor.

---

### **RULE 8: Test new tables with test-forms.html**

Before testing the real form, use `http://localhost:49350/test-forms.html` to verify:
1. Config is loaded (SUPABASE_URL and ANON_KEY)
2. The table accepts an INSERT
3. No column mismatch errors

This saves 20 back-and-forth debugging cycles.

Before pushing to production:

```
[ ] All environment variables set in Vercel
[ ] Vercel.json has correct configuration
[ ] No console.log() with sensitive data
[ ] No hardcoded API keys in code
[ ] All API endpoints tested locally
[ ] All API endpoints tested on Vercel
[ ] Browser cache cleared for testing
[ ] Tested in incognito mode
[ ] No syntax errors in console
[ ] All forms submit successfully
[ ] All modals open/close correctly
```

---

## ?? **CODING PATTERNS - USE THESE**

### **Safe API Call Pattern:**
```javascript
async function callAPI(endpoint, data) {
  try {
    // 1. Get session token
    var { data: { session } } = await window._supabase.auth.getSession();
    if (!session) {
      showToast('Please login again', 'error');
      return null;
    }

    // 2. Make request
    var response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + session.access_token
      },
      body: JSON.stringify(data)
    });

    // 3. Check response
    if (!response.ok) {
      var errorData = await response.json();
      throw new Error(errorData.error || 'Request failed');
    }

    // 4. Parse and return
    var result = await response.json();
    return result;

  } catch (err) {
    console.error('API Error:', err);
    showToast(err.message, 'error');
    return null;
  }
}
```

---

### **Safe Modal Pattern:**
```javascript
function openModal(modalId, data) {
  var modal = document.getElementById(modalId);
  if (!modal) {
    console.error('Modal not found:', modalId);
    return;
  }
  
  // Populate fields if needed
  if (data) {
    for (var key in data) {
      var input = document.getElementById(key);
      if (input) input.value = data[key];
    }
  }
  
  modal.style.display = 'flex';
  console.log('Modal opened:', modalId);
}

function closeModal(modalId) {
  var modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    console.log('Modal closed:', modalId);
  }
}
```

---

### **Safe Environment Variable Pattern:**
```javascript
// API file
const requiredEnvVars = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  PAYSTACK_KEY: process.env.PAYSTACK_SECRET_KEY,
  RESEND_KEY: process.env.RESEND_API_KEY
};

// Validate all exist
for (var [name, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    console.error(`Missing environment variable: ${name}`);
    return res.status(500).json({ 
      error: 'Server configuration error',
      missing: name
    });
  }
}

// Now safe to use
const { SUPABASE_URL, SUPABASE_KEY, PAYSTACK_KEY, RESEND_KEY } = requiredEnvVars;
```

---

## ?? **COMMON ERRORS & FIXES**

| Error | Cause | Fix |
|-------|-------|-----|
| `Unexpected token '?'` | Character encoding issue | Use plain ASCII characters |
| `Unexpected token '}' ` | Syntax error (often emoji) | Remove special characters |
| `X is not defined` | Function called before defined | Define function before HTML |
| `Cannot read property 'style' of null` | Element doesn't exist | Check `getElementById()` result |
| `Failed to fetch` | CORS or auth issue | Add CORS headers + auth token |
| `500 Internal Server Error` | API crashed | Check Vercel logs for details |
| `Unexpected token '<'` | API returned HTML not JSON | Fix API to return JSON |
| Modal not showing | CSS or JavaScript error | Check console for errors |
| Cached old code | Browser cached | Increment `?v=X` version |

---

## ?? **FILE-SPECIFIC RULES**

### **Admin Panel HTML Files:**
1. Always include mobile menu toggle
2. Always include mobile menu script
3. CSS version must match across all files
4. All loading text: "Loading..." (not "Loading?")
5. All onclick functions must exist in same file

### **API Files (api/*.js):**
1. ONE export default statement per file
2. Validate ALL environment variables at start
3. Always return JSON (never HTML)
4. Always include CORS headers
5. Always verify admin authentication
6. Use snake_case for all field names

### **CSS Files:**
1. No special characters in comments
2. Use plain ASCII only
3. Version in HTML link must increment on change

---

## ?? **GOLDEN RULE**

> **If you're not sure, TEST IT FIRST**

1. Test locally before pushing
2. Test in incognito (no cache)
3. Test with DevTools console open
4. Fix ALL errors before committing
5. Increment cache version number

---

## ?? **REFERENCES**

- Character encoding: Use `UTF-8` everywhere
- API specs: `snake_case` for Node.js, `camelCase` for frontend
- HTTP codes: https://httpstatuses.com/
- JavaScript style: https://standardjs.com/

---

**SAVE THIS FILE. READ IT BEFORE CREATING ANYTHING NEW.**

Every rule here cost us debugging time. Follow them to ship faster.
