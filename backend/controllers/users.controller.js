// users.controller.js
const usersRepository = require('../repositories/users.repository');
const baseResponse = require('../utils/baseResponse.util');
const { clearCsrfToken } = require('../middleware/csrf.middleware');

class UsersController {
    async login(req, res) {
        try {
            const { username, password } = req.body;

            const user = await usersRepository.findByUsername(username);

            if (!user) {
                return baseResponse(res, false, 401, 'Username tidak ditemukan', null);
            }

            // Plain text password comparison (untuk demo purposes)
            if (user.password !== password) {
                return baseResponse(res, false, 401, 'Password salah', null);
            }

            // SECURED: Cookie dengan HttpOnly dan SameSite=Strict
            res.cookie('user', username, {
                httpOnly: true, // Mencegah akses JavaScript ke cookie
                sameSite: 'strict', // Mencegah CSRF
                secure: process.env.NODE_ENV === 'production', // HTTPS only di production
                maxAge: 24 * 60 * 60 * 1000,
                path: '/'
            });

            return baseResponse(res, true, 200, 'Login berhasil', {
                username: user.username,
                email: user.email,
                fullName: user.full_name
            });
        } catch (error) {
            console.error('Error in login:', error);
            return baseResponse(res, false, 500, 'Internal server error', null);
        }
    }

    async logout(req, res) {
        try {
            const username = req.cookies.user;
            
            // Clear CSRF token dari memory
            if (username) {
                clearCsrfToken(username);
            }
            
            res.clearCookie('user');
            res.clearCookie('XSRF-TOKEN');
            
            return baseResponse(res, true, 200, 'Logout berhasil', null);
        } catch (error) {
            console.error('Error in logout:', error);
            return baseResponse(res, false, 500, 'Internal server error', null);
        }
    }

    async getMe(req, res) {
        try {
            const username = req.cookies.user;

            if (!username) {
                return baseResponse(res, false, 401, 'Not authenticated', null);
            }

            const user = await usersRepository.findByUsername(username);

            if (!user) {
                return baseResponse(res, false, 401, 'User not found', null);
            }

            return baseResponse(res, true, 200, 'Success', {
                username: user.username,
                email: user.email,
                fullName: user.full_name
            });
        } catch (error) {
            console.error('Error in getMe:', error);
            return baseResponse(res, false, 500, 'Internal server error', null);
        }
    }

    async changeEmail(req, res) {
        try {
            const username = req.cookies.user;

            if (!username) {
                return baseResponse(res, false, 401, 'Silakan login terlebih dahulu', null);
            }

            const { email } = req.body;

            if (!email) {
                return baseResponse(res, false, 400, 'Email harus diisi', null);
            }

            // SECURED: CSRF token sudah divalidasi oleh middleware
            // Input email sudah disanitasi oleh XSS middleware
            const updatedUser = await usersRepository.updateEmail(username, email);

            return baseResponse(res, true, 200, 'Email berhasil diubah', {
                username: updatedUser.username,
                email: updatedUser.email
            });
        } catch (error) {
            console.error('Error in changeEmail:', error);
            return baseResponse(res, false, 500, 'Internal server error', null);
        }
    }
}

module.exports = new UsersController();
