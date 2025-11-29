// posts.repository.js
const db = require('../database/pg.database');

class PostsRepository {
    async findAll() {
        try {
            const result = await db.query(
                'SELECT p.id, p.content, p.created_at, u.username FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC'
            );
            return result.rows;
        } catch (error) {
            console.error('Error in findAll:', error);
            throw error;
        }
    }

    async create(userId, content) {
        try {
            const result = await db.query(
                'INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *',
                [userId, content]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error in create:', error);
            throw error;
        }
    }

    async deleteById(id) {
        try {
            const result = await db.query(
                'DELETE FROM posts WHERE id = $1 RETURNING *',
                [id]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error in deleteById:', error);
            throw error;
        }
    }
}

module.exports = new PostsRepository();
