import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, Menu, LogOut, User, Zap } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass" style={{ margin: '1rem', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '1rem', zIndex: 100 }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
        <Zap size={24} color="#8b5cf6" fill="#8b5cf6" />
        <span style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>Startup Sensai</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {user ? (
          <>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500' }}>Dashboard</Link>
            <Link to="/feasibility" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500' }}>AI Advisory</Link>
            <Link to="/mentorship" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500' }}>Mentors</Link>
            <Link to="/forum" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500' }}>Forum</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', borderLeft: '1px solid var(--border-glass)', paddingLeft: '1.5rem' }}>
               <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{user.name}</span>
               <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                 <LogOut size={18} />
               </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500' }}>Login</Link>
            <Link to="/register" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>Join Now</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
