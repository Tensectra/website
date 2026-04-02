# ADMIN PANEL FIXES - 3 Critical Issues

## ? **Issues Found**

### 1. Mobile Menu Not Showing
**Problem:** Sidebar disappears on mobile (`transform: translateX(-100%)`) but there's no hamburger button to open it.

**Symptoms:**
- Menu invisible on screens < 900px
- No way to access navigation on mobile
- Users can't switch between pages

---

### 2. "Send Payment Link" Button Broken
**Problem:** Multiple issues in `admin/applications.html`:
- `openPaymentLinkModal()` function doesn't exist
- Icons showing as `?` placeholders (emoji not rendering)
- Clicking button shows error: `Unexpected token '<'`
- Missing modal HTML for payment link generation

**Symptoms:**
- Can't send payment links from admin panel
- Action buttons show `?` instead of icons
- Console error when clicking

---

### 3. Waitlist Tab Missing
**Problem:** No waitlist viewing functionality in admin panel

**Symptoms:**
- Form submissions from `/forms/waitlist` go to Supabase
- No admin page to view/manage waitlist entries
- Newsletter page doesn't show waitlist subscribers

---

## ? **FIXES TO IMPLEMENT**

### FIX 1: Add Mobile Menu Toggle

**Files to modify:**
1. `css/admin.css` - Add hamburger styles + mobile overlay
2. All admin HTML files - Add hamburger button to header

**Changes:**

#### A. Add to `css/admin.css`:

```css
/* Mobile menu toggle */
.mobile-menu-toggle {
  display: none;
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 200;
  width: 40px;
  height: 40px;
  background: #0A1628;
  border: 1px solid #0D2040;
  border-radius: 6px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: background .15s;
}

.mobile-menu-toggle:hover {
  background: rgba(0,204,255,0.1);
}

.mobile-menu-toggle svg {
  width: 20px;
  height: 20px;
  stroke: #E6EDF3;
}

/* Mobile overlay */
.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 99;
}

.mobile-overlay.active {
  display: block;
}

/* Show hamburger on mobile */
@media (max-width: 900px) {
  .mobile-menu-toggle {
    display: flex;
  }
  
  .admin-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 101;
  }
  
  .admin-sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .admin-main {
    margin-left: 0;
  }
}
```

#### B. Add to each admin HTML file (after `<aside>` closes):

```html
<!-- Mobile menu toggle -->
<button class="mobile-menu-toggle" id="mobile-menu-btn" aria-label="Toggle menu">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
</button>
<div class="mobile-overlay" id="mobile-overlay"></div>

<script>
// Mobile menu toggle
(function() {
  var sidebar = document.querySelector('.admin-sidebar');
  var toggle = document.getElementById('mobile-menu-btn');
  var overlay = document.getElementById('mobile-overlay');
  
  function closeMobile() {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
  }
  
  toggle.addEventListener('click', function() {
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('active');
  });
  
  overlay.addEventListener('click', closeMobile);
  
  // Close on nav click
  document.querySelectorAll('.sidebar-nav a').forEach(function(link) {
    link.addEventListener('click', closeMobile);
  });
})();
</script>
```

---

### FIX 2: Complete Applications Page

**Missing components:**
1. `openPaymentLinkModal()` function
2. Payment link modal HTML
3. `updateStatus()` utility function
4. `showToast()` notification function
5. Icon fix (use SVG instead of emoji)

**Add to `admin/applications.html` before `</body>`:**

```html
<!-- Payment Link Modal -->
<div class="modal" id="payment-link-modal">
  <div class="modal-content" style="max-width: 500px;">
    <div class="modal-header">
      <h3>Send Payment Link</h3>
      <button class="modal-close" onclick="document.getElementById('payment-link-modal').style.display='none'">&times;</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label>Student</label>
        <input type="text" class="form-input" id="pay-student-name" readonly>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" class="form-input" id="pay-student-email" readonly>
      </div>
      <div class="form-group">
        <label>Course</label>
        <input type="text" class="form-input" id="pay-course" readonly>
      </div>
      <div class="form-group">
        <label>Amount</label>
        <div style="display:flex;gap:8px;">
          <input type="number" class="form-input" id="pay-amount" style="flex:1;" step="0.01">
          <select class="form-input" id="pay-currency" style="width:100px;">
            <option value="USD">USD</option>
            <option value="NGN">NGN</option>
            <option value="GHS">GHS</option>
            <option value="KES">KES</option>
            <option value="ZAR">ZAR</option>
          </select>
        </div>
        <small class="muted">Amount will be converted to kobo/cents for Paystack</small>
      </div>
      <input type="hidden" id="pay-record-id">
      <input type="hidden" id="pay-record-type">
    </div>
    <div class="modal-footer">
      <button class="btn-cancel" onclick="document.getElementById('payment-link-modal').style.display='none'">Cancel</button>
      <button class="btn-primary" onclick="sendPaymentLink()">Generate & Send Link</button>
    </div>
  </div>
</div>

<!-- Toast Notification -->
<div id="toast-container" style="position:fixed;top:20px;right:20px;z-index:9999;"></div>

<script>
// Utility: Show toast notification
function showToast(message, type) {
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + (type || 'info');
  toast.textContent = message;
  toast.style.cssText = 'background:#0A1628;border:1px solid ' + (type === 'error' ? '#FF4444' : '#00CCFF') + ';color:#E6EDF3;padding:12px 20px;border-radius:6px;margin-bottom:10px;box-shadow:0 4px 12px rgba(0,0,0,0.3);animation:slideIn 0.3s ease;';
  document.getElementById('toast-container').appendChild(toast);
  setTimeout(function() {
    toast.style.animation = 'fadeOut 0.3s ease';
    setTimeout(function() { toast.remove(); }, 300);
  }, 3000);
}

// Utility: Update status
async function updateStatus(table, id, newStatus, callback) {
  if (!confirm('Update status to "' + newStatus + '"?')) return;
  var client = window._supabase;
  var { error } = await client.from(table).update({
    status: newStatus,
    reviewed_at: new Date().toISOString(),
    reviewed_by: window.ADMIN_USER.email
  }).eq('id', id);
  if (error) {
    showToast('Update failed: ' + error.message, 'error');
  } else {
    showToast('Status updated to ' + newStatus, 'success');
    if (callback) callback();
  }
}

// Open payment link modal
var currentPaymentRecord = null;

function openPaymentLinkModal(record, type, defaultPrice) {
  currentPaymentRecord = record;
  document.getElementById('pay-student-name').value = record.name || '';
  document.getElementById('pay-student-email').value = record.email || '';
  document.getElementById('pay-course').value = record.course || record.tier || '';
  document.getElementById('pay-amount').value = (defaultPrice.amount / 100).toFixed(2);
  document.getElementById('pay-currency').value = defaultPrice.currency || 'USD';
  document.getElementById('pay-record-id').value = record.id;
  document.getElementById('pay-record-type').value = type;
  document.getElementById('payment-link-modal').style.display = 'flex';
}

// Send payment link
async function sendPaymentLink() {
  var email = document.getElementById('pay-student-email').value;
  var amount = parseFloat(document.getElementById('pay-amount').value);
  var currency = document.getElementById('pay-currency').value;
  var recordId = document.getElementById('pay-record-id').value;
  var recordType = document.getElementById('pay-record-type').value;
  
  if (!email || !amount) {
    showToast('Please fill all fields', 'error');
    return;
  }
  
  var amountCents = Math.round(amount * 100);
  
  try {
    var response = await fetch('/api/send-payment-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        name: currentPaymentRecord.name,
        amount: amountCents,
        currency: currency,
        recordType: recordType,
        recordId: recordId,
        productName: currentPaymentRecord.course || currentPaymentRecord.tier,
        sentBy: window.ADMIN_USER.email
      })
    });
    
    if (!response.ok) throw new Error('API call failed');
    
    var data = await response.json();
    showToast('Payment link sent to ' + email, 'success');
    document.getElementById('payment-link-modal').style.display = 'none';
    loadData();
  } catch (err) {
    showToast('Failed to send link: ' + err.message, 'error');
  }
}

// Application detail modal
function openApplicationDetail(record) {
  alert('Detail view coming soon!\n\nName: ' + record.name + '\nEmail: ' + record.email + '\nCourse: ' + record.course + '\nExperience: ' + record.experience + '\nScholarship: ' + (record.is_scholarship ? 'Yes' : 'No'));
}
</script>

<style>
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes fadeOut {
  to { opacity: 0; transform: translateY(-10px); }
}

.modal {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #0A1628;
  border: 1px solid #0D2040;
  border-radius: 8px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #0D2040;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6E7D9A;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
}

.modal-close:hover {
  color: #E6EDF3;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #0D2040;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>
```

**Fix icon placeholders (replace emoji with SVG):**

Change line 148 from:
```html
+ '<button class="btn-action btn-pay" onclick="openPaymentLinkModal(...">??</button>'
```

To:
```html
+ '<button class="btn-action btn-pay" onclick="openPaymentLinkModal(..." title="Send Payment Link"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></button>'
```

And similarly for ? and ? emojis:
```html
? ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00FF88" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
? ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF4444" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
```

---

### FIX 3: Add Waitlist Viewer

**Option A: Add to Newsletter page**

Add a tab to `admin/newsletter.html` to show waitlist subscribers:

```html
<!-- Add tab button -->
<button class="tab-btn" data-tab="waitlist">Waitlist</button>

<!-- Add tab content -->
<div id="tab-waitlist" class="tab-content">
  <table class="data-table">
    <thead>
      <tr>
        <th>Email</th>
        <th>Name</th>
        <th>Country</th>
        <th>Submitted</th>
      </tr>
    </thead>
    <tbody id="waitlist-tbody"></tbody>
  </table>
</div>

<script>
// Load waitlist
async function loadWaitlist() {
  var client = window._supabase;
  var { data, error } = await client.from('waitlist_submissions')
    .select('*').order('submitted_at', { ascending: false });
  if (error) { console.error(error); return; }
  document.getElementById('waitlist-tbody').innerHTML = (data || []).map(function(w) {
    return '<tr><td>' + w.email + '</td><td>' + (w.name || '-') + '</td><td>' + (w.country_name || '-') + '</td><td>' + fmtDate(w.submitted_at) + '</td></tr>';
  }).join('');
}
</script>
```

**Option B: Create separate waitlist page**

Create `admin/waitlist.html` (copy structure from newsletter.html)

---

## ?? **IMPLEMENTATION PRIORITY**

1. ? **FIX 1 (Mobile Menu)** - Critical, breaks usability
2. ? **FIX 2 (Payment Links)** - Critical, core feature broken
3. ?? **FIX 3 (Waitlist)** - Important but not blocking

---

## ?? **TESTING AFTER FIXES**

### Test Mobile Menu:
1. Open admin panel on mobile (< 900px width)
2. See hamburger button in top-left
3. Click ? sidebar slides in
4. Click overlay ? sidebar closes
5. Click nav link ? sidebar auto-closes

### Test Payment Links:
1. Go to Applications page
2. Click "Send Payment Link" button
3. Modal opens with pre-filled data
4. Adjust amount/currency
5. Click "Generate & Send Link"
6. Toast notification appears
7. API call succeeds (check Network tab)

### Test Waitlist:
1. Submit waitlist form at `/forms/waitlist`
2. Go to admin/newsletter (or admin/waitlist if created)
3. Click Waitlist tab
4. See submission in table

---

## ??? **FILES TO CREATE/MODIFY**

**Modify:**
- `css/admin.css` (add mobile menu styles)
- `admin/dashboard.html` (add hamburger + script)
- `admin/applications.html` (complete with modal + functions)
- `admin/consultancy.html` (add hamburger + script)
- `admin/payments.html` (add hamburger + script)
- `admin/newsletter.html` (add hamburger + waitlist tab)

**Create:**
- `admin/waitlist.html` (optional, if separate page preferred)

---

## ?? **ESTIMATED TIME**

- FIX 1: 30 minutes
- FIX 2: 1 hour
- FIX 3: 30 minutes
**Total: ~2 hours**

---

**Shall I implement these fixes now?**
