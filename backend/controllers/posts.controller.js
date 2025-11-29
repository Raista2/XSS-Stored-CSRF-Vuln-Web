// posts.controller.js
const postsRepository = require('../repositories/posts.repository');
const usersRepository = require('../repositories/users.repository');
const baseResponse = require('../utils/baseResponse.util');

class PostsController {
    async getAllPosts(req, res) {
        try {
            const posts = await postsRepository.findAll();
            
            return baseResponse(res, true, 200, 'Success', {
                posts: posts
            });
        } catch (error) {
            console.error('Error in getAllPosts:', error);
            return baseResponse(res, false, 500, 'Internal server error', null);
        }
    }

    async createPost(req, res) {
        try {
            const username = req.cookies.user;
            
            if (!username) {
                return baseResponse(res, false, 401, 'Silakan login terlebih dahulu', null);
            }
            
            const { content } = req.body;
            
            if (!content) {
                return baseResponse(res, false, 400, 'Content harus diisi', null);
            }
            
            // Get user ID
            const user = await usersRepository.findByUsername(username);
            
            if (!user) {
                return baseResponse(res, false, 401, 'User not found', null);
            }
            
            // VULNERABLE: Tidak ada sanitasi input! (Stored XSS)
            const newPost = await postsRepository.create(user.id, content);
            
            return baseResponse(res, true, 201, 'Post berhasil dibuat', {
                post: newPost
            });
        } catch (error) {
            console.error('Error in createPost:', error);
            return baseResponse(res, false, 500, 'Internal server error', null);
        }
    }

    async deletePost(req, res) {
        try {
            const username = req.cookies.user;
            
            if (!username) {
                return baseResponse(res, false, 401, 'Silakan login terlebih dahulu', null);
            }
            
            const { id } = req.params;
            
            const deletedPost = await postsRepository.deleteById(id);
            
            if (!deletedPost) {
                return baseResponse(res, false, 404, 'Post tidak ditemukan', null);
            }
            
            return baseResponse(res, true, 200, 'Post berhasil dihapus', null);
        } catch (error) {
            console.error('Error in deletePost:', error);
            return baseResponse(res, false, 500, 'Internal server error', null);
        }
    }
}

module.exports = new PostsController();
