import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AIAdvisory from './pages/AIAdvisory';
import Mentorship from './pages/Mentorship';
import Chat from './pages/Chat';
import Forum from './pages/Forum';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/feasibility" element={<ProtectedRoute><AIAdvisory /></ProtectedRoute>} />
              <Route path="/mentorship" element={<ProtectedRoute><Mentorship /></ProtectedRoute>} />
              <Route path="/chat/:sessionId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
