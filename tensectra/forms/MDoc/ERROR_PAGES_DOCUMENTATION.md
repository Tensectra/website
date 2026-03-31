# CUSTOM ERROR PAGES - DOCUMENTATION

## Overview

Beautiful, branded custom error pages have been created to replace the default IIS error pages.

---

## Files Created

### 1. 404.html - Page Not Found
**Location:** `/404.html`

**Features:**
- ? Beautiful glitch effect on error code
- ? Animated floating particles
- ? Search box with keyword matching
- ? Quick navigation links to popular pages
- ? Tensectra branding and styling
- ? Mobile responsive
- ? Analytics tracking for 404 errors

**Design Elements:**
- Glitch animation on "404" text
- Gradient color effects
- Floating particle background
- Smart search redirects
- Quick link cards for:
  - Live Cohorts
  - Courses
  - Consultancy
  - ERP Kit

---

### 2. 500.html - Server Error
**Location:** `/500.html`

**Features:**
- ? Clean, simple design
- ? Clear error message
- ? Links to home and contact support
- ? Email contact information
- ? Tensectra branding

---

## Web.config Configuration

Updated `Web.config` to redirect all 404 and 500 errors to custom pages:

```xml
<httpErrors errorMode="Custom" existingResponse="Replace">
  <remove statusCode="404" subStatusCode="-1" />
  <remove statusCode="500" subStatusCode="-1" />
  <error statusCode="404" path="/404.html" responseMode="ExecuteURL" />
  <error statusCode="500" path="/500.html" responseMode="ExecuteURL" />
</httpErrors>
```

---

## Search Functionality (404 Page)

The 404 page includes smart search with keyword matching:

**Supported Keywords:**
- `cohort` ? `/pages/cohorts`
- `course` ? `/pages/courses`
- `consultancy`, `consult` ? `/pages/consultancy`
- `infrastructure`, `erp`, `kit` ? `/pages/infrastructure`
- `pro` ? `/pages/pro`
- `about` ? `/pages/about`
- `contact` ? `/forms/contact`
- `backend`, `frontend`, `mobile` ? `/pages/cohorts`
- `pricing`, `price` ? `/pages/cohorts`

**No match?** ? Redirects to home page

---

## Analytics Tracking

404 errors are automatically tracked in Google Analytics:

```javascript
window.TensectraAnalytics.trackEvent('error', {
  type: '404',
  path: window.location.pathname,
  referrer: document.referrer
});
```

**View in GA:**
1. Go to Events
2. Filter: `error`
3. See 404 occurrences

---

## Testing

### Test 404 Error:
1. Visit a non-existent page:
   ```
   https://your-site.com/this-page-does-not-exist
   ```
2. Should see beautiful custom 404 page
3. Try search functionality
4. Click quick links

### Test 500 Error:
1. Trigger a server error (or simulate)
2. Should see custom 500 page
3. Links should work

---

## Customization

### Add More Keywords to Search:
Edit `404.html`, find the `redirects` object:

```javascript
const redirects = {
  'your-keyword': '/your/path',
  // Add more...
};
```

### Change Design:
- Colors: Update CSS variables in `<style>` section
- Layout: Modify HTML structure
- Animation: Adjust keyframes in CSS

### Add More Quick Links:
Add to `.quick-links` section in 404.html:

```html
<a href="/your/page" class="quick-link">
  <div class="quick-link-icon">
    <!-- Your SVG icon -->
  </div>
  <div class="quick-link-title">Your Title</div>
  <div class="quick-link-desc">Your description</div>
</a>
```

---

## SEO Considerations

Both error pages include:
- `<meta name="robots" content="noindex, nofollow">` ?
- Proper status codes returned by server ?
- No broken links on error pages ?
- Clear navigation back to site ?

---

## Before vs After

**Before:**
```
HTTP Error 404.0 - Not Found
The resource you are looking for has been removed, 
had its name changed, or is temporarily unavailable.
```
? Ugly default IIS error
? No branding
? Confusing for users
? No navigation help

**After:**
```
Beautiful branded 404 page with:
? Tensectra branding
? Animated effects
? Search functionality
? Quick navigation
? Clear messaging
? Professional design
```

---

## Troubleshooting

### Error pages not showing?

**1. Check Web.config:**
- Ensure `httpErrors` section is present
- Verify paths are correct (`/404.html`, `/500.html`)

**2. Check file locations:**
- Files must be in root directory
- Paths must be absolute from root

**3. IIS Settings:**
- Open IIS Manager
- Select your site
- Go to "Error Pages"
- Verify custom errors are configured

**4. Clear browser cache:**
```
Ctrl + Shift + R (hard refresh)
```

**5. Test directly:**
Visit `https://your-site.com/404.html` to verify page loads

---

## Common Issues

### Issue: Still seeing default IIS error
**Fix:** 
- Recycle IIS application pool
- Clear browser cache
- Check that `errorMode="Custom"` in Web.config

### Issue: CSS not loading on error pages
**Fix:**
- Use absolute paths: `/css/main.css` (not `css/main.css`)
- Verify CSS file exists and is accessible

### Issue: Search not working
**Fix:**
- Check JavaScript console for errors
- Verify `main.js` is loading
- Check keyword mappings in script

---

## Deployment Checklist

- [x] 404.html created
- [x] 500.html created
- [x] Web.config updated
- [x] Test 404 errors
- [x] Test 500 errors
- [x] Verify search works
- [x] Check mobile responsiveness
- [x] Test all quick links
- [x] Verify analytics tracking

---

## Future Enhancements

**Possible Improvements:**
1. Add search suggestions dropdown
2. Track which 404 URLs are most common
3. Add "Did you mean?" suggestions
4. Create custom errors for other codes (403, 503)
5. Add loading animation
6. Implement full-text search
7. Add chatbot for help

---

## Analytics Dashboard

**Monitor 404 Errors:**
1. Google Analytics ? Events ? error
2. Track most common 404 paths
3. Create redirects for frequently missed pages

**Metrics to Track:**
- Number of 404 errors per day
- Most common missing pages
- Search keywords used
- Quick link clicks
- Time spent on 404 page

---

## Support

If you have issues with error pages:
- Email: hello@tensectra.com
- Check IIS logs
- Verify Web.config syntax
- Test in incognito mode

---

**Status:** ? Ready for Production

All error pages are branded, beautiful, and functional!

