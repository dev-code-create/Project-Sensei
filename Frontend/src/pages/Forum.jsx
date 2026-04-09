import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  ThumbsUp, 
  Plus, 
  Search, 
  User as UserIcon, 
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
    <div className="container mx-auto px-6 py-12">
      <header className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="mb-2 text-5xl font-bold text-white md:text-6xl">Community Forum</h1>
          <p className="text-lg text-sensai-muted">Discuss ideas, share insights, and grow with fellow founders.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={20} /> Create Post
        </button>
      </header>

      {/* Search Bar */}
      <div className="glass mb-10 flex items-center gap-4 p-4">
        <Search size={22} className="text-sensai-muted" />
        <input 
          className="w-full border-none bg-transparent text-lg text-white outline-none placeholder:text-sensai-muted" 
          placeholder="Search discussions..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Posts List */}
        <section className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-sensai-primary" size={32} /></div>
          ) : (
            <div className="flex flex-col gap-6">
              {posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map((post, i) => (
                <motion.div 
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass p-8"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="badge bg-sensai-secondary/10 text-sensai-secondary border border-sensai-secondary/20">{post.category}</span>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sensai-muted">
                      <Clock size={14} />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-white">{post.title}</h3>
                  <p className="mb-6 leading-relaxed text-sensai-muted">{post.content}</p>
                  
                  <div className="flex items-center justify-between border-t border-glass pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-sensai-muted">
                        <UserIcon size={18} />
                      </div>
                      <span className="text-sm font-bold text-white">{post.user?.name || 'Founder'}</span>
                    </div>
                    
                    <div className="flex gap-6">
                      <button 
                        onClick={() => toggleLike(post._id)}
                        className={`flex items-center gap-2 bg-none border-none cursor-pointer transition-colors
                          ${post.likes?.includes(user?._id) ? 'text-sensai-primary' : 'text-sensai-muted hover:text-white'}`}
                      >
                        <ThumbsUp size={18} className={post.likes?.includes(user?._id) ? 'fill-sensai-primary' : ''} />
                        <span className="text-sm font-bold">{post.likes?.length || 0}</span>
                      </button>
                      <button className="flex items-center gap-2 bg-none border-none cursor-pointer text-sensai-muted transition-colors hover:text-white">
                        <MessageSquare size={18} />
                        <span className="text-sm font-bold">{post.comments?.length || 0}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="glass sticky top-40 p-8">
            <h3 className="mb-6 text-xl font-bold text-white uppercase tracking-widest">Trending Topics</h3>
            <div className="flex flex-col gap-4">
              {['#Bootstrapping', '#OpenAI', '#MarketValidation', '#Funding2024', '#SaaSMetrics'].map(tag => (
                <a key={tag} href="#" className="text-[0.95rem] font-medium text-sensai-secondary no-underline transition-opacity hover:opacity-80">{tag}</a>
              ))}
            </div>
            
            <div className="mt-10 rounded-2xl bg-sensai-primary/10 p-6 border border-sensai-primary/20">
              <h4 className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-sensai-primary">Sensai Challenge</h4>
              <p className="text-sm leading-relaxed text-sensai-muted">
                "Post your 30-second elevator pitch and get feedback from 3 verified mentors this week."
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
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass relative w-full max-w-[600px] p-8 md:p-12"
            >
              <button onClick={() => setShowCreate(false)} className="absolute right-6 top-6 border-none bg-transparent text-sensai-muted transition-colors hover:text-white">
                <X size={24} />
              </button>
              
              <h2 className="mb-8 text-3xl font-bold text-white">Create Discussion</h2>
              
              <form onSubmit={handleCreatePost} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-sensai-muted">Topic Title</label>
                  <input 
                    className="input-field" 
                    placeholder="What's on your mind?" 
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-sensai-muted">Category</label>
                  <select 
                    className="input-field cursor-pointer pr-10"
                    value={newPost.category}
                    onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                  >
                    <option>General</option>
                    <option>Idea Validation</option>
                    <option>Tech Stack</option>
                    <option>Funding</option>
                    <option>Market Entry</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-sensai-muted">Content</label>
                  <textarea 
                    className="input-field min-h-[150px] resize-none" 
                    placeholder="Share your thoughts with the community..." 
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary mt-4">
                  Post Discussion <Send size={18} className="ml-2" />
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
