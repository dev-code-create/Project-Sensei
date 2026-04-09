import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { 
  Search, 
  MapPin, 
  Star, 
  Linkedin, 
  MessageCircle, 
  Award,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Mentorship = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const { data } = await api.get('/mentors');
        setMentors(data);
      } catch (error) {
        console.error('Error fetching mentors', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const categories = ['All', 'SaaS', 'Fintech', 'AI/ML', 'Marketing', 'E-commerce'];

  const filteredMentors = mentors.filter(m => 
    (filter === 'All' || m.expertise.includes(filter)) &&
    (m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Expert Mentorship</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
          Connect with verified industry leaders for personalized guidance to scale your startup.
        </p>
      </header>

      {/* Search and Filter */}
      <div className="glass" style={{ padding: '1.5rem', marginBottom: '3rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            className="input-field" 
            style={{ paddingLeft: '48px' }}
            placeholder="Search mentors by name, expertise, or bio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setFilter(cat)}
              style={{ 
                padding: '8px 16px', 
                borderRadius: '10px', 
                border: '1px solid var(--border-glass)', 
                background: filter === cat ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>Loading mentors...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {filteredMentors.length > 0 ? filteredMentors.map((mentor, i) => (
            <motion.div 
              key={mentor._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass glass-hover" 
              style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '700' }}>
                    {mentor.name.charAt(0)}
                  </div>
                  <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: '#10b981', borderRadius: '50%', padding: '4px', border: '3px solid var(--bg-dark)' }}>
                    <CheckCircle2 size={12} color="white" />
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.4rem' }}>{mentor.name}</h3>
                  <p style={{ color: 'var(--accent-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>{mentor.title}</p>
                </div>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', flex: 1 }}>{mentor.bio}</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {mentor.expertise.map((exp, i) => (
                  <span key={i} className="badge" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', fontSize: '0.7rem' }}>{exp}</span>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24' }}>
                  <Star size={16} fill="#fbbf24" />
                  <span style={{ fontWeight: '700', fontSize: '1rem' }}>4.9</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(120 reviews)</span>
                </div>
                <Link to={`/chat/new?mentor=${mentor.user}`} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  <MessageCircle size={16} /> Book Session
                </Link>
              </div>
            </motion.div>
          )) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
              No mentors found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Mentorship;
