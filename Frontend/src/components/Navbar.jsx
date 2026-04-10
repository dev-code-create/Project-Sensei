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
    <nav className="glass sticky top-4 z-[100] m-4 flex items-center justify-between px-6 py-3">
      <Link to="/" className="flex items-center gap-2 no-underline transition-opacity hover:opacity-80">
        <Zap size={24} className="fill-sensai-primary text-sensai-primary" />
        <span className="font-heading text-xl font-bold tracking-tight text-white">Startup Sensai</span>
      </Link>

      <div className="flex items-center gap-8">
        {user ? (
          <>
            <div className="hidden items-center gap-6 md:flex">
              <Link to="/dashboard" className="text-sm font-medium text-sensai-muted no-underline transition-colors hover:text-white">Dashboard</Link>
              {user?.role === 'founder' && (
                <Link to="/feasibility" className="text-sm font-medium text-sensai-muted no-underline transition-colors hover:text-white">AI Advisory</Link>
              )}
              {['founder', 'mentor'].includes(user?.role) && (
                 <Link to="/mentorship" className="text-sm font-medium text-sensai-muted no-underline transition-colors hover:text-white">Mentors</Link>
              )}
              <Link to="/messages" className="text-sm font-medium text-sensai-muted no-underline transition-colors hover:text-white">Messages</Link>
              <Link to="/forum" className="text-sm font-medium text-sensai-muted no-underline transition-colors hover:text-white">Forum</Link>
            </div>
            <div className="flex items-center gap-4 border-l border-glass pl-6 ml-2">
               <span className="hidden text-sm font-medium text-white lg:block">{user.name}</span>
               <button 
                 onClick={handleLogout} 
                 className="flex items-center text-red-400 transition-colors hover:text-red-300"
               >
                 <LogOut size={18} />
               </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-sensai-muted no-underline transition-colors hover:text-white">Login</Link>
            <Link to="/register" className="btn-primary py-2 text-sm">Join Now</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
