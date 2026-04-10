import React, { useState, useEffect, useRef } from 'react';
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
import { jsPDF } from 'jspdf';

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
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  
  const reportRef = useRef();

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
    setError(null);
    try {
      const { data } = await api.post('/feasibility/generate', formData);
      setReport(data);
    } catch (err) {
      console.error('Error generating report', err);
      setError(err.response?.data?.message || 'Failed to generate report. Please check your AI connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!report) return;
    setExporting(true);

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pw = doc.internal.pageSize.getWidth();   // 210mm
      const ph = doc.internal.pageSize.getHeight();  // 297mm
      const pad = 15;
      const contentW = pw - pad * 2;

      // ─── Colour Palette ───────────────────────────────────────────────
      const BG        = [2,   6,  23];   // #020617
      const CARD      = [15,  23,  42];  // #0f172a
      const BORDER    = [51,  65,  85];  // #334155
      const PRIMARY   = [167, 139, 250]; // #a78bfa violet-400
      const SECONDARY = [34,  211, 238]; // #22d3ee cyan-400
      const EMERALD   = [74,  222, 128]; // #4ade80
      const RED       = [248, 113, 113]; // #f87171
      const WHITE     = [255, 255, 255];
      const MUTED     = [241, 245, 249]; // #f1f5f9

      // ─── Helpers ──────────────────────────────────────────────────────
      const setFill   = (c) => doc.setFillColor(...c);
      const setStroke = (c) => doc.setDrawColor(...c);
      const setTxt    = (c) => doc.setTextColor(...c);

      // Rounded rect helper
      const roundRect = (x, y, w, h, r = 4) => {
        doc.roundedRect(x, y, w, h, r, r, 'FD');
      };

      // Text wrap helper — returns new y position after drawing
      const drawWrapped = (text, x, y, maxW, lineH = 5) => {
        const lines = doc.splitTextToSize(text || '', maxW);
        doc.text(lines, x, y);
        return y + lines.length * lineH;
      };

      let y = 0; // current cursor

      // ─── FULL PAGE BACKGROUND ─────────────────────────────────────────
      setFill(BG);
      setStroke(BG);
      doc.rect(0, 0, pw, ph, 'F');

      // ─── HEADER CARD ──────────────────────────────────────────────────
      const headerH = 46;
      setFill(CARD); setStroke(BORDER);
      doc.setLineWidth(0.3);
      roundRect(pad, pad, contentW, headerH, 5);

      // Startup name
      setTxt(WHITE);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text(report.startupName || 'Report', pad + 8, pad + 14);

      // Generated date
      setTxt(MUTED);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const dateStr = `Generated on ${new Date(report.createdAt || Date.now()).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}`;
      doc.text(dateStr, pad + 8, pad + 21);

      // Score badge (right side)
      const score = report.aiReport?.overallScore ?? 0;
      const scorePct = Math.min(100, Math.max(0, score));
      const badgeColor = scorePct >= 70 ? EMERALD : scorePct >= 40 ? PRIMARY : RED;
      setTxt(WHITE);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('VIABILITY SCORE', pw - pad - 30, pad + 12, { align: 'center' });
      setTxt(badgeColor);
      doc.setFontSize(32);
      doc.text(`${score}`, pw - pad - 30, pad + 35, { align: 'center' });

      y = pad + headerH + 6;

      // ─── SECTION HELPER ───────────────────────────────────────────────
      const sections = [
        { label: 'Market Analysis',     icon: '◈', color: PRIMARY,   key: 'marketAnalysis' },
        { label: 'Competitor Overview', icon: '◎', color: SECONDARY, key: 'competitorOverview' },
        { label: 'Revenue Projection',  icon: '◆', color: EMERALD,   key: 'revenueProjection' },
        { label: 'Risk Assessment',     icon: '⚠', color: RED,       key: 'riskAssessment' },
      ];

      for (const sec of sections) {
        if (y > ph - 30) {
          // New page with same background
          doc.addPage();
          setFill(BG); setStroke(BG);
          doc.rect(0, 0, pw, ph, 'F');
          y = pad;
        }

        const text   = report.aiReport?.[sec.key] || 'N/A';
        const lines  = doc.setFont('helvetica', 'normal').setFontSize(9)
                          .splitTextToSize(text, contentW - 16);
        const cardH  = 6 + 6 + lines.length * 4.8 + 6;

        // Page-break inside card
        if (y + cardH > ph - pad) {
          doc.addPage();
          setFill(BG); setStroke(BG);
          doc.rect(0, 0, pw, ph, 'F');
          y = pad;
        }

        // Card background
        setFill(CARD); setStroke(BORDER);
        doc.setLineWidth(0.3);
        roundRect(pad, y, contentW, cardH, 4);

        // Coloured left accent bar
        setFill(sec.color); setStroke(sec.color);
        doc.roundedRect(pad, y, 3, cardH, 1.5, 1.5, 'F');

        // Section title
        setTxt(sec.color);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(sec.label, pad + 8, y + 8);

        // Body text
        setTxt(MUTED);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(lines, pad + 8, y + 15);

        y += cardH + 5;
      }

      // ─── FOOTER ───────────────────────────────────────────────────────
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        setTxt([71, 85, 105]); // slate-500
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(
          `Project Sensei  •  AI Feasibility Report  •  Page ${i} of ${totalPages}`,
          pw / 2, ph - 6,
          { align: 'center' }
        );
      }

      doc.save(`${report.startupName}_Feasibility_Report.pdf`);
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setExporting(false);
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

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-8 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-500 flex items-center gap-3"
              >
                <ShieldAlert size={20} className="shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

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
            className={`page-transition ${exporting ? 'p-12' : ''}`}
            ref={reportRef}
          >
            <div className={`mb-8 flex items-center justify-between ${exporting ? 'hidden' : ''}`}>
              <button 
                onClick={() => setReport(null)} 
                className="flex items-center gap-2 border-none bg-transparent text-sensai-muted transition-colors hover:text-white"
              >
                <ChevronLeft size={20} /> Back to Generator
              </button>
              <button 
                onClick={handleExportPDF}
                disabled={exporting}
                className="glass flex items-center gap-2 border-none p-2 px-4 font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                 {exporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                 {exporting ? 'Exporting...' : 'Export PDF'}
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
