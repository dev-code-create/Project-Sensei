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
    { label: 'Startup Score', value: reports[0]?.aiReport?.overallScore || '--', icon: <TrendingUp className="text-sensai-primary" />, trend: '+5%' },
    { label: 'AI Reports', value: reports.length, icon: <FileText className="text-sensai-secondary" />, trend: 'New' },
    { label: 'Mentor Sessions', value: '0', icon: <Users className="text-emerald-400" />, trend: 'Upcoming' },
    { label: 'Forum Posts', value: '0', icon: <MessageSquare className="text-amber-400" />, trend: 'Activity' },
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-white md:text-5xl">Welcome, {user?.name} 👋</h1>
        <p className="mt-2 text-sensai-muted">Here's what's happening with your startup path today.</p>
      </header>

      {/* Stats Grid */}
      <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass flex flex-col gap-4 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-white/5 p-2.5">{stat.icon}</div>
              <span className="badge badge-success text-[0.65rem]">{stat.trend}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-sensai-muted">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Reports */}
        <section className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Recent AI Reports</h2>
            <Link to="/feasibility" className="flex items-center gap-1 text-sm font-semibold text-sensai-primary transition-colors hover:text-sensai-secondary">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="flex flex-col gap-4">
            {loading ? (
              <p className="py-10 text-center text-sensai-muted">Loading reports...</p>
            ) : reports.length > 0 ? (
              reports.map((report) => (
                <Link key={report._id} to={`/feasibility?id=${report._id}`} className="no-underline">
                  <div className="glass glass-hover flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-sensai-primary/10 p-2.5">
                        <BarChart className="text-sensai-primary" size={20} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">{report.startupName}</h4>
                        <p className="text-xs text-sensai-muted">Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-sensai-primary">{report.aiReport?.overallScore}%</div>
                      <p className="text-[0.65rem] font-bold uppercase tracking-widest text-sensai-muted">Viability</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="glass flex flex-col items-center justify-center border-dashed p-12 text-center">
                <p className="mb-6 text-sensai-muted">You haven't generated any AI feasibility reports yet.</p>
                <Link to="/feasibility" className="btn-primary">
                  <Plus size={18} /> Generate Your First Report
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions / Activity */}
        <aside className="flex flex-col gap-8">
          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">Sessions</h2>
            <div className="glass flex flex-col gap-4 p-6">
               <div className="flex items-center gap-3 text-sensai-muted">
                  <Clock size={20} />
                  <span className="text-sm font-medium">No sessions scheduled</span>
               </div>
               <Link to="/mentorship" className="btn-primary mt-2 w-full text-sm">
                  Find a Mentor
               </Link>
            </div>
          </section>
          
          <section>
            <div className="glass p-6">
              <h3 className="mb-4 text-lg font-bold text-white">Community</h3>
              <p className="text-sm leading-relaxed text-sensai-muted">
                New discussion: "How to validate B2B SaaS ideas without a prototype?"
              </p>
              <Link to="/forum" className="mt-4 block text-sm font-bold text-sensai-secondary no-underline transition-opacity hover:opacity-80">
                 Join Discussion
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
