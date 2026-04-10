import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rocket, ShieldCheck, Users, BarChart3, ChevronRight } from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();
  return (
    <div className="page-transition">
      {/* Hero Section */}
      <section className="flex min-h-[80vh] flex-col justify-center px-6 py-24 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-white to-slate-400 bg-clip-text font-heading text-5xl font-bold tracking-tight text-transparent md:text-7xl lg:text-8xl"
        >
          Scale Your Startup <br /> with AI-Powered Precision
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-sensai-muted md:text-xl lg:text-2xl"
        >
          Bridge the gap between vision and market entry. Startup Sensai combines AI insights with expert mentorship to turn your concept into a scalable venture.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          {user ? (
            <Link to="/dashboard" className="btn-primary px-8 py-4 text-lg">
              Go to Dashboard <ChevronRight size={20} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary px-8 py-4 text-lg">
                Get Started Free <ChevronRight size={20} />
              </Link>
              <Link to="/feasibility" className="glass flex items-center gap-2 px-8 py-4 text-lg text-white no-underline transition-opacity hover:opacity-90">
                Try AI Advisory
              </Link>
            </>
          )}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <FeatureCard 
            icon={<BarChart3 className="text-sensai-primary" size={32} />}
            title="Instant Feasibility"
            description="Our GPT-4 model analyzes your startup idea against market trends and competition in seconds."
          />
          <FeatureCard 
            icon={<Users className="text-sensai-secondary" size={32} />}
            title="Verified Mentors"
            description="Connect with industry experts for 1:1 sessions to navigate scaling challenges."
          />
          <FeatureCard 
            icon={<Rocket className="text-emerald-400" size={32} />}
            title="Growth Roadmap"
            description="Get personalized action plans for funding, marketing, and product development."
          />
          <FeatureCard 
            icon={<ShieldCheck className="text-amber-400" size={32} />}
            title="Investor Ready"
            description="Optimize your pitch decks and financial projections with AI-curated insights."
          />
        </div>
      </section>

      {/* Partners Section */}
      <section className="container mx-auto mt-20 px-6 pb-24 text-center">
        <h2 className="mb-4 text-4xl font-bold text-white uppercase tracking-widest text-[0.85rem] text-sensai-secondary">
          Partners
        </h2>
        <h3 className="mb-6 text-4xl font-bold text-white">Share Your Expertise</h3>
        <p className="mx-auto mb-12 max-w-2xl text-lg text-sensai-muted">
          Join our network of industry leaders and capital providers helping the next generation of founders.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <Link to="/register" className="glass group relative overflow-hidden p-8 text-left transition-all hover:border-sensai-primary md:w-[350px]">
            <Users className="mb-4 text-sensai-primary transition-transform group-hover:scale-110" size={32} />
            <h4 className="mb-2 text-xl font-bold text-white">Join as Mentor</h4>
            <p className="text-sm text-sensai-muted">Guide early-stage founders and share your industry insights.</p>
          </Link>
          <Link to="/register" className="glass group relative overflow-hidden p-8 text-left transition-all hover:border-sensai-secondary md:w-[350px]">
            <Rocket className="mb-4 text-sensai-secondary transition-transform group-hover:scale-110" size={32} />
            <h4 className="mb-2 text-xl font-bold text-white">Join as Investor</h4>
            <p className="text-sm text-sensai-muted">Discover high-potential startups and scale your portfolio.</p>
          </Link>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass glass-hover flex flex-col gap-4 p-8"
  >
    <div className="w-fit rounded-xl bg-white/5 p-3">{icon}</div>
    <h3 className="text-2xl font-bold text-white">{title}</h3>
    <p className="leading-relaxed text-sensai-muted">{description}</p>
  </motion.div>
);

export default Landing;
