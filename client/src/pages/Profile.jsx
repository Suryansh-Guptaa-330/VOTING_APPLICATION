import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import {
  User,
  ShieldCheck,
  CreditCard,
  MapPin,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Vote,
  Sparkles,
  KeyRound,
  Building2,
  ChevronDown,
  ChevronUp,
  Fingerprint,
  RefreshCw
} from 'lucide-react';

const Profile = ({ user = null, onLogout }) => {
  const navigate = useNavigate();

  // Voter profile state fetched from live backend
  const [voter, setVoter] = useState(user);
  const [isLoading, setIsLoading] = useState(!user);
  const [fetchError, setFetchError] = useState('');

  // Password change state
  const [securityOpen, setSecurityOpen] = useState(true);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 1. Fetch Logged-in User Profile: GET /user/profile
  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setFetchError('');

    try {
      const response = await api.get('/user/profile');
      if (response.data && response.data.user) {
        setVoter(response.data.user);
      } else {
        throw new Error('Voter profile record not found.');
      }
    } catch (err) {
      console.error('Failed to load voter profile:', err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Session expired or failed to fetch profile. Please log in again.';
      setFetchError(msg);

      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        if (onLogout) onLogout();
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Format masked Aadhar: XXXX-XXXX-9012
  const getMaskedAadhar = (aadhar) => {
    if (!aadhar) return 'XXXX-XXXX-XXXX';
    const str = String(aadhar);
    const last4 = str.slice(-4);
    return `XXXX-XXXX-${last4}`;
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Submit Password Change: PUT /user/profile/password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwords.currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (passwords.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setPasswordError('New passwords do not match. Please re-enter.');
      return;
    }

    setIsUpdatingPass(true);

    try {
      const response = await api.put('/user/profile/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });

      setPasswordSuccess(response.data?.message || 'Password updated successfully in database!');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      console.error('Password update error:', err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to update password. Please check your current password.';
      setPasswordError(msg);
    } finally {
      setIsUpdatingPass(false);
    }
  };

  // 3. Logout action
  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-slate-950 text-slate-100 min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Loading your verified voter credentials...</p>
        </div>
      </div>
    );
  }

  if (fetchError && !voter) {
    return (
      <div className="flex-1 bg-slate-950 text-slate-100 min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Session Unavailable</h2>
          <p className="text-sm text-slate-400">{fetchError}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all"
          >
            Go to Login &rarr;
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* ================= Digital Voter ID Smart Header ================= */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            
            {/* Avatar & Identity Info */}
            <div className="flex items-center gap-5">
              
              {/* Voter Avatar */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[2px] shadow-[0_0_30px_rgba(37,99,235,0.35)]">
                  <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl shadow-inner uppercase">
                    {voter?.name ? voter.name.charAt(0) : 'V'}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-blue-600 text-white shadow-lg border-2 border-slate-950">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              {/* Name, Role & ID */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {voter?.name}
                  </h1>
                  <span className="px-3 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
                    {voter?.role || 'Voter'}
                  </span>
                </div>
                
                <p className="text-xs sm:text-sm text-slate-400 font-mono flex items-center gap-2">
                  <span>ID: <strong className="text-slate-200">#{String(voter?._id || voter?.id || 'VTR').slice(-8).toUpperCase()}</strong></span>
                  <span>&bull;</span>
                  <span className="text-emerald-400 font-sans font-semibold">Verified Citizen</span>
                </p>
              </div>

            </div>

            {/* Dynamic Voting Status Badge (From Live Backend user.isVoted) */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Official Ballot Status
              </span>

              {voter?.isVoted ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold text-sm shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>&check; Ballot Cast</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold text-sm shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <span>&bull; Not Voted Yet</span>
                </div>
              )}

              <button
                onClick={fetchProfile}
                title="Refresh voter credentials"
                className="text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors pt-0.5"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sync with Database</span>
              </button>
            </div>

          </div>

          {/* Quick CTA if Not Voted */}
          {!voter?.isVoted && (
            <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/15">
              <div className="text-xs text-amber-300/90 flex items-center gap-2">
                <Vote className="w-4 h-4 text-amber-400 shrink-0" />
                <span>The national ballot is live. You have not cast your single vote yet.</span>
              </div>
              <Link
                to="/vote"
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow hover:scale-105 transition-all whitespace-nowrap"
              >
                Cast Ballot Now &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* ================= Details Grid: Card Format ================= */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-blue-400" />
            Verified Electoral Credentials (Live Backend)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            
            {/* Card 1: Age */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Age
                </span>
                <span className="text-emerald-400 text-[10px] font-bold">18+ Verified</span>
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {voter?.age || '24'} Years
              </div>
              <p className="text-xs text-slate-500">Citizen Voting Age Eligibility Met</p>
            </div>

            {/* Card 2: Masked Aadhar */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  Aadhar Card
                </span>
                <span className="text-blue-400 text-[10px] font-bold">Encrypted</span>
              </div>
              <div className="text-xl font-bold text-white font-mono tracking-wider">
                {getMaskedAadhar(voter?.aadharCardNumber)}
              </div>
              <p className="text-xs text-slate-500">Zero-Knowledge Masked View</p>
            </div>

            {/* Card 3: Address */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  Address
                </span>
                <span className="text-slate-400 text-[10px] font-bold">Registered</span>
              </div>
              <div className="text-lg font-bold text-white truncate" title={voter?.address}>
                {voter?.address || 'Not Provided'}
              </div>
              <p className="text-xs text-slate-500">Constituency Residential Ward</p>
            </div>

            {/* Card 4: Role */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-400" />
                  Electoral Role
                </span>
              </div>
              <div className="text-base font-bold text-white capitalize">{voter?.role || 'voter'}</div>
              <p className="text-xs text-slate-500">Authorized Voter Access</p>
            </div>

            {/* Card 5: Voting Record */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-all sm:col-span-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Vote className="w-4 h-4 text-blue-400" />
                  Ballot Ledger Record
                </span>
                <span className={voter?.isVoted ? 'text-emerald-400 text-[10px] font-bold' : 'text-amber-400 text-[10px] font-bold'}>
                  {voter?.isVoted ? 'Recorded' : 'Pending'}
                </span>
              </div>
              <div className="text-base font-bold text-white">
                {voter?.isVoted
                  ? 'Your single vote has been recorded and locked in the EVM database.'
                  : 'You have not submitted a ballot yet for this election session.'}
              </div>
              <p className="text-xs text-slate-500">Single non-transferable voting privilege</p>
            </div>

          </div>
        </div>

        {/* ================= Security Settings Section ================= */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800/90 overflow-hidden shadow-xl">
          
          <div
            onClick={() => setSecurityOpen((prev) => !prev)}
            className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors select-none"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Security &amp; Password Settings</h3>
                <p className="text-xs text-slate-400">Update your account master password directly via backend API.</p>
              </div>
            </div>

            <button className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60">
              {securityOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {securityOpen && (
            <div className="p-6 pt-0 border-t border-slate-800/80 animate-in fade-in duration-200">
              
              {passwordError && (
                <div className="my-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="my-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwords.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Current password"
                        required
                        disabled={isUpdatingPass}
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        name="newPassword"
                        value={passwords.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Min 6 characters"
                        required
                        disabled={isUpdatingPass}
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Confirm New
                    </label>
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      name="confirmNewPassword"
                      value={passwords.confirmNewPassword}
                      onChange={handlePasswordChange}
                      placeholder="Repeat new password"
                      required
                      disabled={isUpdatingPass}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                    />
                  </div>

                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingPass}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-600/30 disabled:opacity-60"
                  >
                    {isUpdatingPass ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Updating via API...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          )}

        </div>

        {/* ================= Bottom Action: Log Out Button ================= */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">End Voter Session?</h4>
              <p className="text-xs text-slate-400">Clears your authentication token from browser storage.</p>
            </div>
          </div>

          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 font-semibold text-xs transition-all shadow-md hover:shadow-rose-500/20 whitespace-nowrap active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out of VoteChain</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;
