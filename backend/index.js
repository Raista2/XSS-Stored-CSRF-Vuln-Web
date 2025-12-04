// index.js - SECURED APPLICATION
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();
const port = 3000;

// Import routes
const usersRoute = require('./routes/users.route');
const postsRoute = require('./routes/posts.route');

// Import security middleware
const { sanitizeInput } = require('./middleware/xss.middleware');
const { csrfTokenMiddleware, getCsrfToken } = require('./middleware/csrf.middleware');

// Security Headers dengan Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 100, // limit 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// XSS Sanitization Middleware - harus setelah body parser
app.use(sanitizeInput);

// SECURED: CORS yang ketat
app.use(cors({
  origin: 'http://localhost:5173', // Hanya izinkan frontend yang sah
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'Authorization']
}));

// CSRF Token Middleware
app.use(csrfTokenMiddleware);


// Route: Home
app.get('/', (req, res) => {
    res.send('Simple Social Media Backend - SECURED VERSION');
});

// CSRF Token endpoint
app.get('/csrf-token', getCsrfToken);

// Routes
app.use('/', usersRoute);
app.use('/', postsRoute);

// Menjalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
    console.log('✅ Aplikasi SECURED dengan proteksi XSS dan CSRF');
    console.log('📁 Struktur: Controllers -> Repositories -> Database (PostgreSQL)');
    console.log('🔒 Security: Helmet, Rate Limiting, CSRF Protection, XSS Sanitization');
});