import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  ThumbsUp, 
  Plus, 
  Search, 
  User, 
  Clock,
  MoreVertical,
  Send,
  Loader2,
  X
} from 'lucide-react';

const Forum = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/forum');
      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/forum', newPost);
      setPosts([data, ...posts]);
      setShowCreate(false);
      setNewPost({ title: '', content: '', category: 'General' });
    } catch (err) {
      console.error('Error creating post', err);
    }
  };

  const toggleLike = async (postId) => {
    try {
      const { data } = await api.put(`/forum/${postId}/like`);
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: data.likes } : p));
    } catch (err) {
      console.error('Error liking post', err);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Community Forum</h1>
          <p style={{ color: 'var(--text-muted)' }}>Discuss ideas, share insights, and grow with fellow founders.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={20} /> Create Post
        </button>
      </header>

      {/* Search Bar */}
      <div className="glass" style={{ padding: '1rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Search size={20} color="var(--text-muted)" />
        <input 
          className="input-field" 
          placeholder="Search discussions..." 
          style={{ border: 'none', background: 'transparent', padding: '0' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
        {/* Posts List */}
        <section>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={32} /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map((post, i) => (
                <motion.div 
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass" 
                  style={{ padding: '2rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>{post.category}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      <Clock size={14} />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{post.title}</h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>{post.content}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={16} />
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{post.user?.name || 'User'}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                      <button 
                        onClick={() => toggleLike(post._id)}
                        style={{ background: 'none', border: 'none', color: post.likes?.includes(user?._id) ? 'var(--accent-primary)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <ThumbsUp size={18} fill={post.likes?.includes(user?._id) ? 'var(--accent-primary)' : 'none'} />
                        <span>{post.likes?.length || 0}</span>
                      </button>
                      <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MessageSquare size={18} />
                        <span>{post.comments?.length || 0}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside>
          <div className="glass" style={{ padding: '2rem', position: 'sticky', top: '7rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Trending Topics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {['#Bootstrapping', '#OpenAI', '#MarketValidation', '#Funding2024', '#SaaSMetrics'].map(tag => (
                <a key={tag} href="#" style={{ textDecoration: 'none', color: 'var(--accent-secondary)', fontSize: '0.95rem' }}>{tag}</a>
              ))}
            </div>
            
            <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#a78bfa' }}>Weekly Challenge</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                "Post your 30-second elevator pitch and get feedback from 3 mentors."
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass" 
              style={{ width: '100%', maxWidth: '600px', padding: '3rem', position: 'relative' }}
            >
              <button onClick={() => setShowCreate(false)} style={{ position: 'absolute', right: '2rem', top: '2rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
              
              <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Create Discussion</h2>
              
              <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Title</label>
                  <input 
                    className="input-field" 
                    placeholder="What's on your mind?" 
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    required
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Category</label>
                  <select 
                    className="input-field"
                    value={newPost.category}
                    onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                    style={{ appearance: 'none' }}
                  >
                    <option>General</option>
                    <option>Idea Validation</option>
                    <option>Tech Stack</option>
                    <option>Funding</option>
                    <option>Market Entry</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Content</label>
                  <textarea 
                    className="input-field" 
                    placeholder="Share your thoughts..." 
                    style={{ minHeight: '150px' }}
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                  Post Discussion <Send size={18} />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Forum;
