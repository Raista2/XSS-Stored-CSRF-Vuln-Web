// csrf.middleware.js - CSRF Protection Middleware
const crypto = require('crypto');

// Store untuk CSRF tokens (dalam production, gunakan Redis atau database)
const csrfTokens = new Map();

// Generate CSRF token
const generateCsrfToken = (sessionId) => {
    const token = crypto.randomBytes(32).toString('hex');
    csrfTokens.set(sessionId, token);
    return token;
};

// Verify CSRF token
const verifyCsrfToken = (sessionId, token) => {
    const storedToken = csrfTokens.get(sessionId);
    return storedToken && storedToken === token;
};

// Middleware untuk generate token
const csrfTokenMiddleware = (req, res, next) => {
    // Gunakan username dari cookie sebagai session identifier
    const sessionId = req.cookies.user;
    
    if (sessionId && !csrfTokens.has(sessionId)) {
        const token = generateCsrfToken(sessionId);
        res.cookie('XSRF-TOKEN', token, {
            httpOnly: false, // Harus false agar JS bisa baca
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/'
        });
    }
    
    next();
};

// Middleware untuk verify token pada mutating requests
const csrfProtection = (req, res, next) => {
    // Skip untuk GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    
    const sessionId = req.cookies.user;
    
    if (!sessionId) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: No session',
            payload: null
        });
    }
    
    // Ambil token dari header atau body
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    
    if (!token) {
        return res.status(403).json({
            success: false,
            message: 'CSRF token missing',
            payload: null
        });
    }
    
    if (!verifyCsrfToken(sessionId, token)) {
        return res.status(403).json({
            success: false,
            message: 'Invalid CSRF token',
            payload: null
        });
    }
    
    next();
};

// Cleanup token saat logout
const clearCsrfToken = (sessionId) => {
    csrfTokens.delete(sessionId);
};

// Get CSRF token endpoint
const getCsrfToken = (req, res) => {
    const sessionId = req.cookies.user;
    
    if (!sessionId) {
        return res.status(401).json({
            success: false,
            message: 'Not authenticated',
            payload: null
        });
    }
    
    let token = csrfTokens.get(sessionId);
    
    if (!token) {
        token = generateCsrfToken(sessionId);
    }
    
    return res.json({
        success: true,
        message: 'CSRF token generated',
        payload: { csrfToken: token }
    });
};

module.exports = {
    csrfTokenMiddleware,
    csrfProtection,
    clearCsrfToken,
    getCsrfToken
};
