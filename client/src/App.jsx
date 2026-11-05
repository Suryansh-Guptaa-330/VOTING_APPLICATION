import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Vote from './pages/Vote';
import Results from './pages/Results';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profile from './pages/Profile';
import api from './api/api';
import { ShieldCheck } from 'lucide-react';

/**
 * Protected Route Component:
 * Automatically redirects unauthenticated users (missing JWT token) to /login
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  // Live dynamic authentication state
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Sync user profile from backend whenever token exists or changes
  useEffect(() => {
    const syncUserProfile = async () => {
      const activeToken = localStorage.getItem('token');
      if (!activeToken) {
        setCurrentUser(null);
        setIsAuthLoading(false);
        return;
      }

      try {
        const response = await api.get('/user/profile');
        if (response.data && response.data.user) {
          setCurrentUser(response.data.user);
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err);
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    syncUserProfile();
  }, [token]);

  const handleLoginSuccess = (userData) => {
    setToken(localStorage.getItem('token'));
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  };

  const isLoggedIn = Boolean(token);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-300">
      {/* Dynamic Navbar based on real Token presence */}
      <Navbar 
        isLoggedIn={isLoggedIn} 
        user={currentUser} 
        onLogout={handleLogout} 
      />

      {/* Main Content Area with Protected & Public Routes */}
      <main className="flex-1 flex flex-col">
        {isAuthLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="w-9 h-9 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <Routes>
            {/* Public Standings */}
            <Route path="/results" element={<Results />} />

            {/* Public Auth */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login onLogin={handleLoginSuccess} />} />

            {/* Protected Routes (Require Token) */}
            <Route 
              path="/vote" 
              element={
                <ProtectedRoute>
                  <Vote />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile user={currentUser} onLogout={handleLogout} />
                </ProtectedRoute>
              } 
            />

            {/* Default Route: Redirect to /vote if logged in, otherwise /results */}
            <Route path="/" element={<Navigate to={isLoggedIn ? "/vote" : "/results"} replace />} />
            <Route path="*" element={<Navigate to={isLoggedIn ? "/vote" : "/results"} replace />} />
          </Routes>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-4 text-center text-sm text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-slate-400">VoteChain Platform</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-500">
            Decentralized, Transparent &amp; Immutable Voting System
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
