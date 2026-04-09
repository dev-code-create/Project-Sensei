import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Sparkles, 
  ChevronLeft,
  Loader2,
  FileBadge,
  MessageSquare
} from 'lucide-react';

const Chat = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    if (sessionId && sessionId !== 'new') {
      fetchSession();
    }
  }, [sessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchSession = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/chat/${sessionId}`);
      setSession(data);
      setMessages(data.messages);
    } catch (err) {
      console.error('Error fetching chat session', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const { data } = await api.post(`/chat/${sessionId}/message`, { message: input });
      const assistantMessage = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error sending message', err);
    } finally {
      setSending(false);
    }
  };

  const generatePlan = async () => {
    try {
      const { data } = await api.post(`/chat/${sessionId}/generate-plan`);
      alert('Structured Plan Generated! Check your dashboard.');
    } catch (err) {
      console.error('Error generating plan', err);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}><Loader2 className="animate-spin" size={48} color="#8b5cf6" /></div>;

  return (
    <div className="container" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
      {/* Chat Header */}
      <header className="glass" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <ChevronLeft size={24} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '8px', borderRadius: '10px' }}>
              <Bot color="#8b5cf6" size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>{session?.startupName || 'Sensai AI Advisor'}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '600' }}>ONLINE</p>
            </div>
          </div>
        </div>
        <button onClick={generatePlan} className="glass" style={{ padding: '8px 16px', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', border: 'none' }}>
           <FileBadge size={18} color="#06b6d4" /> Generate Plan
        </button>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        className="glass"
      >
        {messages.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ 
              maxWidth: '80%', 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              gap: '1rem'
            }}
          >
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '12px', 
              background: msg.role === 'user' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(139, 92, 246, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {msg.role === 'user' ? <UserIcon size={20} color="#06b6d4" /> : <Bot size={20} color="#8b5cf6" />}
            </div>
            <div style={{ 
              padding: '1.25rem', 
              borderRadius: '20px', 
              background: msg.role === 'user' ? 'var(--accent-secondary)' : 'rgba(255,255,255,0.05)',
              color: 'white',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              boxShadow: msg.role === 'user' ? '0 4px 15px rgba(6, 182, 212, 0.2)' : 'none'
            }}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {sending && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '1rem' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Bot size={20} color="#8b5cf6" />
             </div>
             <div className="glass" style={{ padding: '1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Loader2 className="animate-spin" size={16} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Sensai is typing...</span>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem' }}>
        <input 
          className="glass" 
          style={{ flex: 1, padding: '1rem 1.5rem', border: '1px solid var(--border-glass)', borderRadius: '15px', color: 'white', outline: 'none' }}
          placeholder="Type your message to Sensai..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0 2rem' }} disabled={sending}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chat;
