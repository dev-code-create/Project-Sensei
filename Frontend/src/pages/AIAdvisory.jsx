import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { 
  Send, 
  Sparkles, 
  ShieldAlert, 
  TrendingUp, 
  Target, 
  PieChart,
  Loader2,
  ChevronLeft,
  Download
} from 'lucide-react';

const AIAdvisory = () => {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('id');

  const [formData, setFormData] = useState({
    startupName: '',
    ideaDescription: '',
    targetMarket: '',
  });
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (reportId) {
      fetchReport(reportId);
    }
  }, [reportId]);

  const fetchReport = async (id) => {
    setFetching(true);
    try {
      const { data } = await api.get(`/feasibility/${id}`);
      setReport(data);
    } catch (err) {
      console.error('Error fetching report', err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/feasibility/generate', formData);
      setReport(data);
    } catch (err) {
      console.error('Error generating report', err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}><Loader2 className="animate-spin" size={48} color="#8b5cf6" /></div>;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <AnimatePresence mode="wait">
        {!report ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="glass" 
            style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}
          >
            <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
              <Sparkles color="#8b5cf6" size={40} style={{ marginBottom: '1rem' }} />
              <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>AI Feasibility Advisory</h1>
              <p style={{ color: 'var(--text-muted)' }}>Get a deep-dive analysis of your startup idea powered by GPT-4.</p>
            </header>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', fontSize: '1rem' }}>Startup / Project Name</label>
                <input 
                  className="input-field" 
                  placeholder="e.g. EcoSphere, FinFlow" 
                  value={formData.startupName}
                  onChange={(e) => setFormData({...formData, startupName: e.target.value})}
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', fontSize: '1rem' }}>Idea Description</label>
                <textarea 
                  className="input-field" 
                  placeholder="Explain your concept, core value proposition, and how it works..." 
                  style={{ minHeight: '150px', resize: 'vertical' }}
                  value={formData.ideaDescription}
                  onChange={(e) => setFormData({...formData, ideaDescription: e.target.value})}
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', fontSize: '1rem' }}>Target Market</label>
                <input 
                  className="input-field" 
                  placeholder="e.g. Small business owners in Southeast Asia, Tech-savvy Gen Z" 
                  value={formData.targetMarket}
                  onChange={(e) => setFormData({...formData, targetMarket: e.target.value})}
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ padding: '16px', fontSize: '1.1rem' }}
                disabled={loading}
              >
                {loading ? <><Loader2 className="animate-spin" size={20} /> Analyzing Concept...</> : <><Send size={20} /> Generate Feasibility Report</>}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="report"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="page-transition"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <button onClick={() => setReport(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ChevronLeft size={20} /> Back to Generator
              </button>
              <button className="glass" style={{ padding: '8px 16px', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Download size={18} /> Export PDF
              </button>
            </div>

            <header className="glass" style={{ padding: '3rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{report.startupName}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Analysis generated on {new Date(report.createdAt).toLocaleDateString()}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', fontWeight: '800', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {report.aiReport?.overallScore}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.1em', fontWeight: '700' }}>OVERALL VIABILITY</p>
              </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
              <AnalysisSection 
                icon={<Target color="#8b5cf6" size={24} />}
                title="Market Analysis"
                content={report.aiReport?.marketAnalysis}
              />
              <AnalysisSection 
                icon={<PieChart color="#06b6d4" size={24} />}
                title="Competitor Overview"
                content={report.aiReport?.competitorOverview}
              />
              <AnalysisSection 
                icon={<TrendingUp color="#10b981" size={24} />}
                title="Revenue Projection"
                content={report.aiReport?.revenueProjection}
              />
              <AnalysisSection 
                icon={<ShieldAlert color="#ef4444" size={24} />}
                title="Risk Assessment"
                content={report.aiReport?.riskAssessment}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AnalysisSection = ({ icon, title, content }) => (
  <div className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px' }}>{icon}</div>
      <h3 style={{ fontSize: '1.25rem' }}>{title}</h3>
    </div>
    <div style={{ color: 'var(--text-muted)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
      {content}
    </div>
  </div>
);

export default AIAdvisory;
