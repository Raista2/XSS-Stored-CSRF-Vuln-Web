
# 🔒 Simple Social Media - SECURED Web Application

**✅ STATUS: SECURED - Proteksi XSS Stored & CSRF sudah diimplementasikan!**

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

XSS Stored adalah serangan di mana script berbahaya disimpan di server (database) dan dieksekusi setiap kali halaman dimuat oleh user lain.

Proteksi dilakukan dengan sanitasi input di backend (middleware/xss.middleware.js) dan output di frontend (DOMPurify di App.jsx).

**Testing XSS Protection:**
- Payload `<script>alert('XSS')</script>` akan dihapus
- Payload `<img src=x onerror="alert('XSS')">` event handler dihapus
- Payload `<iframe src="javascript:alert('XSS')"></iframe>` dihapus

---

## 🔐 Proteksi CSRF (Cross-Site Request Forgery)

CSRF adalah serangan yang memaksa user melakukan aksi yang tidak diinginkan pada aplikasi di mana mereka sudah terautentikasi.

Proteksi dilakukan dengan custom CSRF token (backend/middleware/csrf.middleware.js) dan validasi token di setiap request mutating (POST/PUT/DELETE) dari frontend.

**Testing CSRF Protection:**
- Request tanpa token: 403 Forbidden
- Request dengan token salah: 403 Forbidden
- Request dengan token valid: 200 OK

---

## 🛠️ Implementasi Keamanan Tambahan

- Helmet.js: Security headers (CSP, HSTS, X-Frame-Options, dll)
- Rate Limiting: Express rate limit (100 requests/15 menit)
- Strict CORS: Hanya origin frontend yang sah
- Secure Cookie: HttpOnly, SameSite=Strict, Secure

---

## 🧪 Cara Testing Keamanan

### XSS
1. Buat post dengan payload `<script>alert('XSS')</script>` → tag dihapus
2. Buat post dengan payload `<img src=x onerror="alert('XSS')">` → event handler dihapus
3. Coba payload lain dari XSS-PAYLOADS.md

### CSRF
1. Kirim request POST tanpa CSRF token → 403 Forbidden
2. Coba serangan dari attacker-csrf.html → gagal
3. Request dengan token valid → berhasil

### Security Headers
1. Cek response headers di browser DevTools
2. Pastikan CSP, HSTS, X-Frame-Options, dll aktif

### Rate Limiting
1. Spam request >100x dalam 15 menit → 429 Too Many Requests

---

## 🔄 Migrasi dari Versi Vulnerable

### Backend
- index.js: Tambah Helmet, Rate Limit, CSRF middleware
- middleware/csrf.middleware.js: Baru (CSRF protection)
- middleware/xss.middleware.js: Baru (XSS sanitization)
- controllers/users.controller.js: Cookie aman, CSRF cleanup
- controllers/posts.controller.js: Input otomatis disanitasi
- routes/users.route.js & posts.route.js: Tambah CSRF protection
- package.json: Tambah dependencies keamanan

### Frontend
- src/App.jsx: CSRF token handling, DOMPurify sanitization
- package.json: Tambah dompurify

### Cara Migrasi
1. Install dependencies
2. Update file backend & frontend
3. Test semua endpoint dan payload

---

## 📚 Referensi

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Helmet.js](https://helmetjs.github.io/)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)

---

## ⚠️ Disclaimer

Aplikasi ini untuk tujuan edukasi. Jangan gunakan untuk production atau data sensitif.

## 📝 License

MIT License
