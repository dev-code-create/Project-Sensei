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

  if (fetching) return <div className="flex justify-center py-40"><Loader2 className="animate-spin text-sensai-primary" size={48} /></div>;

  return (
    <div className="container mx-auto px-6 py-12">
      <AnimatePresence mode="wait">
        {!report ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="glass mx-auto max-w-[800px] p-8 md:p-12"
          >
            <header className="mb-10 text-center">
              <Sparkles className="mx-auto mb-4 text-sensai-primary" size={40} />
              <h1 className="mb-2 text-4xl font-bold text-white md:text-5xl">AI Feasibility Advisory</h1>
              <p className="text-sensai-muted">Get a deep-dive analysis of your startup idea powered by GPT-4.</p>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <label className="text-lg font-semibold text-white">Startup / Project Name</label>
                <input 
                  className="input-field" 
                  placeholder="e.g. EcoSphere, FinFlow" 
                  value={formData.startupName}
                  onChange={(e) => setFormData({...formData, startupName: e.target.value})}
                  required 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-lg font-semibold text-white">Idea Description</label>
                <textarea 
                  className="input-field min-h-[150px] resize-none" 
                  placeholder="Explain your concept, core value proposition, and how it works..." 
                  value={formData.ideaDescription}
                  onChange={(e) => setFormData({...formData, ideaDescription: e.target.value})}
                  required 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-lg font-semibold text-white">Target Market</label>
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
                className="btn-primary py-4 text-xl"
                disabled={loading}
              >
                {loading ? <><Loader2 className="mr-2 animate-spin" size={20} /> Analyzing...</> : <><Send className="mr-2" size={20} /> Generate Report</>}
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
            <div className="mb-8 flex items-center justify-between">
              <button onClick={() => setReport(null)} className="flex items-center gap-2 border-none bg-transparent text-sensai-muted transition-colors hover:text-white">
                <ChevronLeft size={20} /> Back to Generator
              </button>
              <button className="glass flex items-center gap-2 border-none p-2 px-4 font-semibold text-white transition-opacity hover:opacity-80">
                 <Download size={18} /> Export PDF
              </button>
            </div>

            <header className="glass mb-8 flex flex-col items-center justify-between gap-6 p-8 md:flex-row md:p-12">
              <div className="text-center md:text-left">
                <h1 className="mb-2 text-4xl font-bold text-white md:text-6xl">{report.startupName}</h1>
                <p className="text-lg text-sensai-muted">Analysis generated on {new Date(report.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-sensai-primary to-sensai-secondary bg-clip-text text-7xl font-extrabold text-transparent md:text-8xl">
                  {report.aiReport?.overallScore}
                </div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-sensai-muted">Viability Score</p>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <AnalysisSection 
                icon={<Target className="text-sensai-primary" size={24} />}
                title="Market Analysis"
                content={report.aiReport?.marketAnalysis}
              />
              <AnalysisSection 
                icon={<PieChart className="text-sensai-secondary" size={24} />}
                title="Competitor Overview"
                content={report.aiReport?.competitorOverview}
              />
              <AnalysisSection 
                icon={<TrendingUp className="text-emerald-400" size={24} />}
                title="Revenue Projection"
                content={report.aiReport?.revenueProjection}
              />
              <AnalysisSection 
                icon={<ShieldAlert className="text-red-400" size={24} />}
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
  <div className="glass flex flex-col gap-4 p-8">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-white/5 p-2.5">{icon}</div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
    </div>
    <div className="whitespace-pre-wrap leading-relaxed text-sensai-muted">
      {content}
    </div>
  </div>
);

export default AIAdvisory;
