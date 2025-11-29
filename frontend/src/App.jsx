import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:3000';

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [message, setMessage] = useState('');

  // Check if user is logged in
  useEffect(() => {
    checkAuth();
    loadPosts();
  }, []);

  

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_URL}/me`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.payload);
        setNewEmail(data.payload.email);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const loadPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/posts`);
      const data = await res.json();
      if (data.success) {
        setPosts(data.payload.posts);
      }
    } catch (error) {
      console.error('Load posts failed:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      setMessage(data.message);
      if (data.success) {
        setUser(data.payload);
        setNewEmail(data.payload.email);
        setUsername('');
        setPassword('');
      }
    } catch (error) {
      setMessage('Login gagal');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setMessage('Logout berhasil');
    } catch (error) {
      setMessage('Logout gagal');
    }
  };

  // VULNERABLE: Menggunakan dangerouslySetInnerHTML (XSS)
  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newPost })
      });
      const data = await res.json();
      setMessage(data.message);
      if (data.success) {
        setNewPost('');
        loadPosts();
      }
    } catch (error) {
      setMessage('Gagal membuat post');
    }
  };

  // VULNERABLE: Tidak ada CSRF protection
  const handleChangeEmail = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/change-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: newEmail })
      });
      const data = await res.json();
      setMessage(data.message);
      if (data.success) {
        setUser({ ...user, email: data.payload.email });
      }
    } catch (error) {
      setMessage('Gagal mengubah email');
    }
  };

  return (
    <>
      <header className="app-header">
        <h1>🔓 Vulnerable 4chan</h1>
      </header>

      <div className="app">
        {!user ? (
          <div className="login-section card">
            {message && <div className="message">{message}</div>}
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Username (admin atau korban)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Login</button>
            </form>
            <div className="hint">
              <p><strong>Hint:</strong></p>
              <p>Admin: username=admin, password=admin123</p>
              <p>Korban: username=korban, password=123456</p>
            </div>
          </div>
        ) : (
          <div className="main-content">
            {/* Sidebar Kiri - 30% */}
            <div className="sidebar">
              {/* User Profile Card */}
              <div className="user-profile-card">
                <h3>👤 {user.username}</h3>
                <p><strong>Email:</strong><br/>{user.email}</p>
                <p><strong>Full Name:</strong><br/>{user.fullName || 'Not Set'}</p>
                <div className="user-actions">
                  <button onClick={handleLogout}>Logout</button>
                </div>
              </div>

              {message && <div className="message">{message}</div>}

              {/* Change Email Section */}
              <div className="profile-section card">
                <h2>⚠️ Ubah Email</h2>
                <form onSubmit={handleChangeEmail}>
                  <input
                    type="email"
                    placeholder="Email baru"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                  <button type="submit">Ubah Email</button>
                </form>
              </div>

              {/* Create Post Section */}
              <div className="post-section card">
                <h2>✍️ Buat Post</h2>
                <form onSubmit={handleCreatePost}>
                  <textarea
                    placeholder="Tulis sesuatu..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    required
                  />
                  <button type="submit">Post</button>
                </form>
              </div>
            </div>

            {/* Content Kanan - 70% */}
            <div className="content">
              <div className="posts-section">
                <h2>📝 All Posts</h2>
                {posts.length === 0 ? (
                  <div className="card">
                    <p style={{textAlign: 'center', color: '#999'}}>Belum ada post. Buat post pertama Anda!</p>
                  </div>
                ) : (
                  posts.map((post) => {
                    return (
                      <div key={post.id} className="post card">
                        <div className="post-header">
                          <strong>{post.username}</strong>
                        </div>
                        {/* VULNERABLE: Render HTML mentah */}
                        <div 
                          className="post-content"
                          dangerouslySetInnerHTML={{ __html: post.content }} 
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default App
