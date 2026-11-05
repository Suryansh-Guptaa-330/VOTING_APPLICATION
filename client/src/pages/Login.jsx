import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  KeyRound
} from 'lucide-react';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();

  // Login form state matching backend schema
  const [formData, setFormData] = useState({
    aadharCardNumber: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'aadharCardNumber') {
      const cleaned = value.replace(/\D/g, '').slice(0, 12);
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickFillDemo = () => {
    setFormData({
      aadharCardNumber: '123456789012',
      password: 'password123'
    });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (formData.aadharCardNumber.length !== 12) {
      setErrorMessage('Please enter a valid 12-digit Aadhar Card Number.');
      return;
    }

    if (!formData.password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      // Live API call to backend /user/login
      const response = await api.post('/user/login', {
        aadharCardNumber: formData.aadharCardNumber,
        password: formData.password
      });

      const token = response.data?.token;
      if (!token) {
        throw new Error('Authentication token not received from server.');
      }

      // Store JWT token for subsequent protected requests
      localStorage.setItem('token', token);
      setSuccessMessage('Authentication verified! Loading ballot...');

      // Fetch user profile from /user/profile to update client application state
      try {
        const profileRes = await api.get('/user/profile');
        if (profileRes.data && profileRes.data.user) {
          if (onLogin) onLogin(profileRes.data.user);
        } else {
          if (onLogin) {
            onLogin({
              name: 'Authenticated Voter',
              aadharCardNumber: formData.aadharCardNumber,
              role: 'voter'
            });
          }
        }
      } catch (profileErr) {
        console.warn('Could not fetch profile details, using default auth session:', profileErr);
        if (onLogin) {
          onLogin({
            name: 'Authenticated Voter',
            aadharCardNumber: formData.aadharCardNumber,
            role: 'voter'
          });
        }
      }

      // Redirect to /vote page
      setTimeout(() => {
        navigate('/vote');
      }, 800);
    } catch (err) {
      console.error('Login error:', err);
      const backendError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Invalid credentials or server unavailable. Please check that backend is running on port 3000.';
      setErrorMessage(backendError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        
        {/* Header & Logo */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            Citizen Authentication Portal
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Voter <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">Login</span>
          </h1>
          <p className="text-sm text-slate-400">
            Enter your registered 12-digit Aadhar number and password to access your ballot.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            
            {/* Aadhar Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                Aadhar Card Number (12 digits)
              </label>
              <input
                type="text"
                name="aadharCardNumber"
                value={formData.aadharCardNumber}
                onChange={handleChange}
                placeholder="123456789012"
                maxLength={12}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono tracking-wider disabled:opacity-50"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your secure password"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-11 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Demo Fill Helper */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleQuickFillDemo}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                <KeyRound className="w-3 h-3" />
                <span>Fill Demo Credentials</span>
              </button>
              <span className="text-[11px] text-slate-500">256-bit SSL</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Verifying with Server...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Ballot</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Link: 'New voter? Register here' */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-sm text-slate-400">
            New voter?{' '}
            <Link
              to="/signup"
              className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors ml-1"
            >
              Register here &rarr;
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
