// index.js - VULNERABLE APPLICATION (FOR EDUCATIONAL PURPOSES ONLY)
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const port = 3000;

// Import routes
const usersRoute = require('./routes/users.route');
const postsRoute = require('./routes/posts.route');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('X-Content-Security-Policy');
    next();
});

// VULNERABLE: CORS yang terlalu permissive untuk CSRF demo
app.use(cors({
  origin: function(origin, callback) {
    // Izinkan semua origin termasuk null (file://)
    callback(null, true);
  },
  credentials: true, // Izinkan cookie dikirim
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Route: Home
app.get('/', (req, res) => {
    res.send('Simple Social Media Backend - VULNERABLE VERSION');
});

// Routes
app.use('/', usersRoute);
app.use('/', postsRoute);

// Menjalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
    console.log('⚠️  WARNING: Aplikasi ini SENGAJA VULNERABLE untuk tujuan pembelajaran!');
    console.log('📁 Struktur: Controllers -> Repositories -> Database (PostgreSQL)');
});