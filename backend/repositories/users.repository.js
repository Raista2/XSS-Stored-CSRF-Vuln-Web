// users.repository.js
const db = require('../database/pg.database');

class UsersRepository {
    async findByUsername(username) {
        try {
            const result = await db.query(
                'SELECT * FROM users WHERE username = $1',
                [username]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error in findByUsername:', error);
            throw error;
        }
    }

    async updateEmail(username, email) {
        try {
            const result = await db.query(
                'UPDATE users SET email = $1 WHERE username = $2 RETURNING *',
                [email, username]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error in updateEmail:', error);
            throw error;
        }
    }

    async getAllUsers() {
        try {
            const result = await db.query('SELECT username, email, full_name FROM users');
            return result.rows;
        } catch (error) {
            console.error('Error in getAllUsers:', error);
            throw error;
        }
    }
}

module.exports = new UsersRepository();
