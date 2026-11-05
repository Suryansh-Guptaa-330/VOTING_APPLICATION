import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import {
  Vote as VoteIcon,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Lock,
  Sparkles,
  BarChart3,
  Building2,
  Check,
  Search,
  RefreshCw,
  LogIn
} from 'lucide-react';

// Dynamic symbol and style helper based on party name
const getPartyStyle = (party = '') => {
  const p = party.toLowerCase();
  if (p.includes('bjp') || p.includes('bharatiya')) {
    return {
      symbol: '🪷',
      symbolName: 'Lotus (Kamal)',
      badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      alliance: 'NDA'
    };
  }
  if (p.includes('inc') || p.includes('congress')) {
    return {
      symbol: '✋',
      symbolName: 'Hand (Haath)',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      alliance: 'INDIA Bloc'
    };
  }
  if (p.includes('aap') || p.includes('aam aadmi')) {
    return {
      symbol: '🧹',
      symbolName: 'Broom (Jhadu)',
      badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      alliance: 'INDIA Bloc'
    };
  }
  if (p.includes('samajwadi') || p.includes('sp')) {
    return {
      symbol: '🚲',
      symbolName: 'Bicycle (Cycle)',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      alliance: 'INDIA Bloc'
    };
  }
  if (p.includes('trinamool') || p.includes('aitc')) {
    return {
      symbol: '🌸',
      symbolName: 'Twin Flowers',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      alliance: 'Regional'
    };
  }
  return {
    symbol: '🗳️',
    symbolName: 'Official Seal',
    badgeColor: 'bg-slate-700/30 text-slate-400 border-slate-700/40',
    alliance: 'Independent'
  };
};

const Vote = () => {
  const navigate = useNavigate();

  // State from live backend
  const [candidates, setCandidates] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedCandidateId, setVotedCandidateId] = useState(null);

  // UI & loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSealing, setIsSealing] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal selection
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch Candidates from Live Backend: GET /candidate
  const fetchCandidates = async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const response = await api.get('/candidate');
      console.log('Fetched Candidates:', response.data);
      const candidateList = Array.isArray(response.data)
        ? response.data
        : (response.data.candidates || response.data.response || []);
      setCandidates(candidateList);
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Unable to load candidates from backend server. Please verify backend is running on port 3000.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fetch Current Voter Profile & Voting Status: GET /user/profile
  const fetchVoterStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await api.get('/user/profile');
      if (response.data && response.data.user) {
        const u = response.data.user;
        setCurrentUser(u);
        if (u.isVoted) {
          setHasVoted(true);
        }
      }
    } catch (err) {
      console.warn('Could not fetch user profile status:', err);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchVoterStatus();
  }, []);

  // Filter candidates by search term
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const query = searchQuery.toLowerCase();
      return (
        (c.name && c.name.toLowerCase().includes(query)) ||
        (c.party && c.party.toLowerCase().includes(query))
      );
    });
  }, [candidates, searchQuery]);

  // Handle vote button click
  const handleInitiateVote = (candidate) => {
    if (hasVoted) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setApiError('Please log in with your Voter credentials to cast a ballot.');
      navigate('/login');
      return;
    }

    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  // 3. Confirm & Cast Vote via Live API: POST /candidate/vote/:candidateID
  const handleConfirmVote = async () => {
    if (!selectedCandidate) return;

    const candidateId = selectedCandidate._id || selectedCandidate.id;
    if (!candidateId) {
      setApiError('Invalid candidate reference. Please refresh the ballot.');
      return;
    }

    setIsSealing(true);
    setApiError('');

    try {
      const response = await api.post(`/candidate/vote/${candidateId}`);

      // Successful vote
      setHasVoted(true);
      setVotedCandidateId(candidateId);
      setIsModalOpen(false);
      setSuccessToast(response.data?.message || 'Vote recorded successfully in blockchain ledger!');

      // Update current user status in state
      if (currentUser) {
        setCurrentUser({ ...currentUser, isVoted: true });
      }

      // Re-fetch to sync vote counts
      fetchCandidates();

      setTimeout(() => {
        setSuccessToast('');
      }, 5000);
    } catch (err) {
      console.error('Cast vote failed:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to record vote. You may have already voted or your session has expired.';
      setApiError(msg);
      setIsModalOpen(false);
    } finally {
      setIsSealing(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ================= Header & Election Status ================= */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                Live EVM Node &bull; Backend Connected
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
                Official Electronic Ballot
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                Review candidates registered in the backend database. Every authenticated citizen has exactly one verified ballot.
              </p>
            </div>

            {/* Voter Status & Refresh Block */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 lg:self-center">
              
              {/* Voter Status Badge */}
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Voter Status
                </span>
                {hasVoted ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/40 text-blue-300 font-semibold text-sm shadow-[0_0_20px_rgba(59,130,246,0.25)]">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    <span>Already Voted</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold text-sm shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span>Eligible to Vote</span>
                  </div>
                )}
              </div>

              {/* Refresh Candidates */}
              <button
                onClick={fetchCandidates}
                disabled={isLoading}
                title="Reload candidates from backend"
                className="self-end sm:self-auto p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

          </div>

          {/* Success Toast Banner */}
          {successToast && (
            <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-semibold">{successToast}</span>
              </div>
              <Link
                to="/results"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold whitespace-nowrap shadow transition-all"
              >
                View Live Standings &rarr;
              </Link>
            </div>
          )}

          {/* Error Banner */}
          {apiError && (
            <div className="mt-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}
        </div>

        {/* ================= Search Bar ================= */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate or party..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Total on Ballot: {filteredCandidates.length}
          </span>
        </div>

        {/* ================= Candidates Grid ================= */}
        {isLoading ? (
          <div className="p-16 rounded-3xl bg-slate-900/60 border border-slate-800/80 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 text-sm">Fetching verified candidates from backend API...</p>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Candidates Found</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              No candidates are currently registered in the database. Ensure candidates are seeded in MongoDB.
            </p>
            <button
              onClick={fetchCandidates}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((candidate) => {
              const candId = candidate._id || candidate.id;
              const isSelected = votedCandidateId === candId;
              const style = getPartyStyle(candidate.party);

              return (
                <div
                  key={candId}
                  className={`group relative rounded-3xl bg-slate-900 border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                    isSelected
                      ? 'border-blue-500 shadow-[0_0_35px_rgba(59,130,246,0.35)] bg-gradient-to-b from-slate-900 to-blue-950/30'
                      : 'border-slate-800/90 hover:border-slate-700 hover:shadow-xl'
                  }`}
                >
                  {/* Top Alliance Pill */}
                  <div className="flex items-center justify-between px-6 pt-5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                      {style.alliance}
                    </span>
                    {candidate.voteCount !== undefined && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        Count: <strong className="text-slate-200">{candidate.voteCount}</strong>
                      </span>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      
                      {/* Avatar with Symbol Overlay */}
                      <div className="relative shrink-0">
                        <img
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                            candidate.name
                          )}&backgroundColor=1e293b,0f172a&textColor=ffffff`}
                          alt={candidate.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 bg-slate-800 shadow"
                        />
                        <div
                          title={style.symbolName}
                          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center text-sm shadow-md"
                        >
                          {style.symbol}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors leading-tight">
                          {candidate.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {candidate.age && <span>Age: <strong className="text-slate-200">{candidate.age} yrs</strong> &bull; </span>}
                          <span>Nominated Candidate</span>
                        </p>
                      </div>

                    </div>

                    {/* Party Tag & Symbol */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.badgeColor}`}>
                        {candidate.party}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
                        {style.symbolName}
                      </span>
                    </div>

                  </div>

                  {/* Card Footer: Vote Action */}
                  <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500 font-mono truncate max-w-[120px]">
                      ID: #{String(candId).slice(-6).toUpperCase()}
                    </span>

                    <button
                      disabled={hasVoted}
                      onClick={() => handleInitiateVote(candidate)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all duration-200 ${
                        hasVoted
                          ? isSelected
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 cursor-not-allowed opacity-90'
                            : 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
                          : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-[1.03] active:scale-[0.98]'
                      }`}
                    >
                      {hasVoted ? (
                        isSelected ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-blue-400" />
                            <span>Your Sealed Vote</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Already Voted</span>
                          </>
                        )
                      ) : (
                        <>
                          <VoteIcon className="w-4 h-4" />
                          <span>Cast Vote</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ================= Confirmation Modal ================= */}
      {isModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => !isSealing && setIsModalOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in"
          />

          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl z-10 space-y-6 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <VoteIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Confirm Official Vote</h3>
                  <p className="text-xs text-slate-400">Live Backend Verification</p>
                </div>
              </div>

              {!isSealing && (
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Candidate Summary */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                Selected Nominee:
              </span>
              <h4 className="text-lg font-bold text-white">{selectedCandidate.name}</h4>
              <p className="text-xs text-slate-400 font-medium">
                Party: <span className="text-slate-200">{selectedCandidate.party}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              <strong>Notice:</strong> Your vote will be permanently committed to the backend database. Each citizen may only vote once.
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isSealing}
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSealing}
                onClick={handleConfirmVote}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 disabled:opacity-75"
              >
                {isSealing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Transmitting Vote...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Confirm &amp; Cast Vote</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Vote;
