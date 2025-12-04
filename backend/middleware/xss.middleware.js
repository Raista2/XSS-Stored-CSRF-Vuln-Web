// xss.middleware.js - XSS Sanitization Middleware
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Konfigurasi DOMPurify
const sanitizeConfig = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
    // Hapus script tags dan event handlers
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 
                  'onkeydown', 'onkeyup', 'onkeypress', 'onfocus', 'onblur']
};

// Middleware untuk sanitasi input
const sanitizeInput = (req, res, next) => {
    // Sanitasi body
    if (req.body) {
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = DOMPurify.sanitize(req.body[key], sanitizeConfig);
            }
        }
    }
    
    // Sanitasi query parameters
    if (req.query) {
        for (const key in req.query) {
            if (typeof req.query[key] === 'string') {
                req.query[key] = DOMPurify.sanitize(req.query[key], sanitizeConfig);
            }
        }
    }
    
    // Sanitasi params
    if (req.params) {
        for (const key in req.params) {
            if (typeof req.params[key] === 'string') {
                req.params[key] = DOMPurify.sanitize(req.params[key], sanitizeConfig);
            }
        }
    }
    
    next();
};

// Fungsi untuk sanitasi manual jika diperlukan
const sanitize = (dirty, config = sanitizeConfig) => {
    return DOMPurify.sanitize(dirty, config);
};

module.exports = {
    sanitizeInput,
    sanitize
};
