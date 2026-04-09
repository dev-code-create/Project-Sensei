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
  CheckCircle2,
  Loader2
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
    <div className="container mx-auto px-6 py-12">
      <header className="mb-12 text-center">
        <h1 className="mb-4 text-5xl font-bold text-white md:text-6xl">Expert Mentorship</h1>
        <p className="mx-auto max-w-2xl text-lg text-sensai-muted md:text-xl">
          Connect with verified industry leaders for personalized guidance to scale your startup.
        </p>
      </header>

      {/* Search and Filter */}
      <div className="glass mb-12 flex flex-wrap items-center gap-6 p-6">
        <div className="relative flex-1 min-w-[300px]">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-sensai-muted" />
          <input 
            className="input-field pl-12" 
            placeholder="Search mentors by name, expertise, or bio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setFilter(cat)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 border border-glass
                ${filter === cat ? 'bg-sensai-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-white/5 text-sensai-muted hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-sensai-primary" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredMentors.length > 0 ? filteredMentors.map((mentor, i) => (
            <motion.div 
              key={mentor._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass glass-hover flex flex-col gap-6 p-8"
            >
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sensai-primary to-sensai-secondary text-2xl font-bold text-white">
                    {mentor.name.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 rounded-full border-4 border-slate-900 bg-emerald-500 p-1">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white leading-tight">{mentor.name}</h3>
                  <p className="mt-1 text-sm font-bold text-sensai-secondary uppercase tracking-widest">{mentor.title || 'Expert Advisor'}</p>
                </div>
              </div>

              <p className="flex-1 text-sm leading-relaxed text-sensai-muted">{mentor.bio}</p>

              <div className="flex flex-wrap gap-2">
                {mentor.expertise.map((exp, i) => (
                  <span key={i} className="rounded-lg bg-sensai-primary/10 px-3 py-1 text-[0.65rem] font-bold text-sensai-primary uppercase tracking-widest border border-sensai-primary/20">{exp}</span>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-glass pt-6">
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  <span className="text-lg font-bold text-white">4.9</span>
                  <span className="text-xs text-sensai-muted ml-1">(120 reviews)</span>
                </div>
                <Link to={`/chat/new?mentor=${mentor.user}`} className="btn-primary py-2 px-5 text-xs">
                  <MessageCircle size={16} className="mr-2" /> Book Session
                </Link>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-20 text-center text-sensai-muted">
              No mentors found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Mentorship;
