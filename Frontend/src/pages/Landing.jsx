import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Rocket, ShieldCheck, Users, BarChart3, ChevronRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="page-transition">
      {/* Hero Section */}
      <section style={{ padding: '8rem 2rem 4rem', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ fontSize: '4.5rem', marginBottom: '1.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          Scale Your Startup <br /> with AI-Powered Precision
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}
        >
          Bridge the gap between vision and market entry. Startup Sensai combines AI insights with expert mentorship to turn your concept into a scalable venture.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}
        >
          <Link to="/register" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
            Get Started Free <ChevronRight size={20} />
          </Link>
          <Link to="/feasibility" className="glass" style={{ padding: '14px 32px', fontSize: '1.1rem', textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Try AI Advisory
          </Link>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container" style={{ padding: '4rem 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <FeatureCard 
            icon={<BarChart3 color="#8b5cf6" size={32} />}
            title="Instant Feasibility"
            description="Our GPT-4 model analyzes your startup idea against market trends and competition in seconds."
          />
          <FeatureCard 
            icon={<Users color="#06b6d4" size={32} />}
            title="Verified Mentors"
            description="Connect with industry experts for 1:1 sessions to navigate scaling challenges."
          />
          <FeatureCard 
            icon={<Rocket color="#10b981" size={32} />}
            title="Growth Roadmap"
            description="Get personalized action plans for funding, marketing, and product development."
          />
          <FeatureCard 
            icon={<ShieldCheck color="#f59e0b" size={32} />}
            title="Investor Ready"
            description="Optimize your pitch decks and financial projections with AI-curated insights."
          />
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass glass-hover" 
    style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
  >
    <div style={{ background: 'rgba(255,255,255,0.05)', width: 'fit-content', padding: '12px', borderRadius: '12px' }}>{icon}</div>
    <h3 style={{ fontSize: '1.5rem' }}>{title}</h3>
    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{description}</p>
  </motion.div>
);

export default Landing;
