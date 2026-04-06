# PRE-COMMIT CHECKLIST

> **Run this checklist BEFORE every git commit**

---

## ? **30-SECOND CHECKS**

### **1. Character Encoding**
```powershell
Select-String -Path "*.html","*.js" -Pattern "?|…|—" -Recursive
```
? **Should return:** NOTHING

---

### **2. Duplicate Exports**
```powershell
Select-String -Path "api/*.js" -Pattern "export default"
```
? **Should return:** ONE match per file ONLY

---

### **3. Syntax Errors**
```powershell
# Open in browser with DevTools (F12)
# Check Console tab
```
? **Should show:** NO red errors

---

### **4. Cache Version**
```powershell
Select-String -Path "admin/*.html" -Pattern "admin.css\?v=(\d+)"
```
? **Should show:** Same version number in ALL files

If you changed CSS/JS: **INCREMENT VERSION NUMBER**

---

### **5. Modal Functions**
Search for: `onclick="functionName"`

Then verify: `function functionName` exists in same file

---

## ?? **FULL CHECKLIST**

```
[ ] No ? characters anywhere
[ ] No emoji in JavaScript strings
[ ] All API files have ONE export default
[ ] All onclick functions defined
[ ] CSS version incremented if changed
[ ] Console shows no errors
[ ] Tested in incognito mode
[ ] All modals open/close correctly
[ ] All API calls include auth token
[ ] Environment variables validated
```

---

## ?? **Ready to Commit?**

```bash
git add .
git commit -m "descriptive message"
git push origin main
```

---

**IF ANY CHECK FAILS ? FIX IT FIRST**

See `CODING_STANDARDS.md` for detailed rules.
