-- 1. Tabel Users
-- Digunakan untuk target CSRF (misal: attacker ingin mengubah email korban)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- Dalam simulasi pentest pemula, kadang disimpan plaintext agar mudah didebug
    email VARCHAR(100) NOT NULL,     -- Target utama serangan CSRF (ganti email)
    full_name VARCHAR(100),          -- Bisa jadi target Stored XSS juga (Profile XSS)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Posts (atau Comments)
-- Digunakan untuk menyimpan payload Stored XSS
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,           -- Menggunakan TEXT agar muat menampung script payload yang panjang
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Masukkan user 'admin' dan 'korban'
INSERT INTO users (username, password, email, full_name) VALUES 
('admin', 'admin123', 'admin@vulnerable.com', 'Administrator'),
('korban', '123456', 'korban@target.com', 'User Polos');

-- Masukkan satu post normal
INSERT INTO posts (user_id, content) VALUES 
(1, 'Selamat datang di website kami yang aman (padahal tidak).');