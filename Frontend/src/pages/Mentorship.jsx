import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  MapPin, 
  Star, 
  MessageCircle, 
  Award,
  Filter,
  CheckCircle2,
  Loader2,
  Plus,
  Briefcase,
  DollarSign,
  Calendar,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Mentorship = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  
  // Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    expertise: '',
    hourlyRate: '',
    availability: 'Weekdays 6-9 PM'
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/mentors');
      setMentors(data);
    } catch (error) {
      console.error('Error fetching mentors', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const expertiseArray = formData.expertise ? formData.expertise.split(',').map(s => s.trim()).filter(s => s !== '') : [];
      const payload = {
        ...formData,
        expertise: expertiseArray
      };
      await api.post('/mentors/apply', payload);
      
      // Update local user state
      if (user && setUser) {
        setUser({ ...user, role: 'mentor' });
      }
      
      setIsModalOpen(false);
      setShowSuccess(true);
      fetchMentors(); // Refresh list
    } catch (err) {
      console.error('Error applying as mentor', err);
      alert(err.response?.data?.message || 'Failed to apply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContactMentor = async (mentorId) => {
    try {
      const { data } = await api.get(`/messages/start/${mentorId}`);
      if (data.conversation) {
        navigate(`/messages/${data.conversation._id}`);
      } else {
        // Start conversation logic
        const res = await api.post('/messages/send', { 
          receiverId: mentorId, 
          text: `Hi! I found your profile on the Expert Network and would like to book a session to discuss my startup.` 
        });
        navigate(`/messages/${res.data.conversationId}`);
      }
    } catch (err) {
      console.error('Error starting conversation', err);
    }
  };

  const categories = ['All', 'SaaS', 'Fintech', 'AI/ML', 'Marketing', 'E-commerce'];

  const filteredMentors = mentors.filter(m => 
    (filter === 'All' || m.expertise.includes(filter)) &&
    (m.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || m.user?.bio?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-6 py-12">
      <header className="mb-12 text-center">
        <h1 className="mb-4 text-5xl font-bold text-white md:text-6xl">Expert Mentorship</h1>
        <p className="mx-auto max-w-2xl text-lg text-sensai-muted md:text-xl">
          Connect with verified industry leaders for personalized guidance to scale your startup.
        </p>
        
        {(user?.role === 'founder' || (user?.role === 'mentor' && !mentors.some(m => m.user?._id === user?._id))) && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="btn-primary mt-8 inline-flex items-center gap-2 px-8 py-3"
          >
            <Plus size={20} /> Join our Expert Network
          </motion.button>
        )}
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
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-sensai-primary" size={40} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredMentors.length > 0 ? (
              filteredMentors.map((mentor, i) => (
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
                        {mentor.user?.name?.charAt(0) || 'M'}
                      </div>
                      <div className="absolute -bottom-1.5 -right-1.5 rounded-full border-4 border-slate-900 bg-emerald-500 p-1">
                        <CheckCircle2 size={12} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white leading-tight">{mentor.user?.name || 'Expert Advisor'}</h3>
                      <p className="mt-1 text-sm font-bold text-sensai-secondary uppercase tracking-widest">{mentor.title || 'Mentor'}</p>
                    </div>
                  </div>

                  <p className="flex-1 text-sm leading-relaxed text-sensai-muted">{mentor.user?.bio || 'No bio available yet.'}</p>

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
                    <button 
                      onClick={() => handleContactMentor(mentor.user?._id || mentor.user)}
                      className="btn-primary py-2 px-5 text-xs inline-flex items-center gap-2"
                    >
                      <MessageCircle size={16} /> Book Session
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-sensai-muted">
                No mentors found matching your criteria.
              </div>
            )}
          </div>

          {/* Registration Modal */}
          <AnimatePresence>
            {isModalOpen && (
              <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => !submitting && setIsModalOpen(false)}
                  className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="glass relative w-full max-w-xl overflow-hidden p-8"
                >
                  <button 
                    onClick={() => !submitting && setIsModalOpen(false)}
                    className="absolute top-4 right-4 text-sensai-muted hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>

                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Become a Mentor</h2>
                    <p className="text-sensai-muted">Share your expertise and help the next generation of founders.</p>
                  </div>

                  <form onSubmit={handleApply} className="space-y-6">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-white tracking-widest flex items-center gap-2">
                        <Briefcase size={16} className="text-sensai-primary" /> Expertise
                      </label>
                      <input 
                        required
                        className="input-field" 
                        placeholder="e.g. SaaS, Marketing, Fundraising (comma separated)"
                        value={formData.expertise}
                        onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-bold text-white tracking-widest flex items-center gap-2">
                          <DollarSign size={16} className="text-sensai-primary" /> Hourly Rate ($)
                        </label>
                        <input 
                          type="number"
                          required
                          className="input-field" 
                          placeholder="100"
                          value={formData.hourlyRate}
                          onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold text-white tracking-widest flex items-center gap-2">
                          <Calendar size={16} className="text-sensai-primary" /> Availability
                        </label>
                        <input 
                          required
                          className="input-field" 
                          placeholder="e.g. Weekdays 6-9 PM"
                          value={formData.availability}
                          onChange={(e) => setFormData({...formData, availability: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button 
                        type="button"
                        onClick={() => !submitting && setIsModalOpen(false)}
                        className="flex-1 px-6 py-3 rounded-xl border border-glass text-white font-semibold transition-all hover:bg-white/5"
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                        disabled={submitting}
                      >
                        {submitting ? <Loader2 className="animate-spin" size={20} /> : "Submit Application"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Success Dialogue Box */}
          <AnimatePresence>
            {showSuccess && (
              <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 50 }}
                  className="glass relative w-full max-w-md overflow-hidden p-10 text-center"
                >
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-emerald-500/20 to-emerald-500/10 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                    <motion.div
                      initial={{ rotate: -20, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                    >
                      <CheckCircle2 size={50} className="text-emerald-500" />
                    </motion.div>
                  </div>

                  <h2 className="mb-3 text-3xl font-bold text-white">Congratulations!</h2>
                  <p className="mb-8 text-sensai-muted text-lg">
                    You are now a verified mentor on Startup Sensai. Your expertise will help founders reach new heights.
                  </p>

                  <button 
                    onClick={() => setShowSuccess(false)}
                    className="w-full btn-primary py-4 text-lg font-bold shadow-[0_10px_30px_rgba(139,92,246,0.3)]"
                  >
                    Start Mentoring
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default Mentorship;
