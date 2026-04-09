import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  BarChart, 
  Users, 
  MessageSquare, 
  FileText, 
  TrendingUp, 
  Clock,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/feasibility/my');
        setReports(data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Startup Score', value: reports[0]?.aiReport?.overallScore || '--', icon: <TrendingUp color="#8b5cf6" />, trend: '+5%' },
    { label: 'AI Reports', value: reports.length, icon: <FileText color="#06b6d4" />, trend: 'New' },
    { label: 'Mentor Sessions', value: '0', icon: <Users color="#10b981" />, trend: 'Upcoming' },
    { label: 'Forum Posts', value: '0', icon: <MessageSquare color="#f59e0b" />, trend: 'Activity' },
  ];

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome, {user?.name} 👋</h1>
        <p style={{ color: 'var(--text-muted)' }}>Here's what's happening with your startup path today.</p>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass" 
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }}>{stat.icon}</div>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>{stat.trend}</span>
            </div>
            <div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{stat.label}</p>
              <h3 style={{ fontSize: '1.75rem' }}>{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Recent Reports */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>Recent AI Reports</h2>
            <Link to="/feasibility" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
              View All <ChevronRight size={16} />
            </Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <p>Loading reports...</p>
            ) : reports.length > 0 ? (
              reports.map((report) => (
                <Link key={report._id} to={`/feasibility?id=${report._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="glass glass-hover" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '10px', borderRadius: '10px' }}>
                        <BarChart color="#8b5cf6" size={20} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.1rem' }}>{report.startupName}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--accent-primary)' }}>{report.aiReport?.overallScore}%</div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Confidence Score</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderStyle: 'dashed' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You haven't generated any AI feasibility reports yet.</p>
                <Link to="/feasibility" className="btn-primary">
                  <Plus size={18} /> Generate Your First Report
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions / Mentors */}
        <section>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Upcoming Sessions</h2>
          <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                <Clock size={20} />
                <span style={{ fontSize: '0.9rem' }}>No sessions scheduled</span>
             </div>
             <Link to="/mentorship" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Find a Mentor
             </Link>
          </div>
          
          <div className="glass" style={{ marginTop: '2rem', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Community Activity</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              New discussion: "How to validate B2B SaaS ideas without a prototype?"
            </p>
            <Link to="/forum" style={{ display: 'block', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--accent-secondary)', textDecoration: 'none', fontWeight: '600' }}>
               Join Discussion
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
