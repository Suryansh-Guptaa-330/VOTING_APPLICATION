import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import {
  BarChart3,
  TrendingUp,
  Trophy,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  RefreshCw,
  Radio,
  ChevronRight,
  Award,
  Vote,
  AlertCircle
} from 'lucide-react';

// Color and symbol styling by party name
const getPartyTheme = (party = '') => {
  const p = party.toLowerCase();
  if (p.includes('bjp') || p.includes('bharatiya')) {
    return {
      symbol: '🪷',
      symbolName: 'Lotus',
      barColor: 'from-orange-500 to-amber-400',
      badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    };
  }
  if (p.includes('inc') || p.includes('congress')) {
    return {
      symbol: '✋',
      symbolName: 'Hand',
      barColor: 'from-blue-500 to-cyan-400',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    };
  }
  if (p.includes('aap') || p.includes('aam aadmi')) {
    return {
      symbol: '🧹',
      symbolName: 'Broom',
      barColor: 'from-yellow-500 to-amber-300',
      badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    };
  }
  if (p.includes('samajwadi') || p.includes('sp')) {
    return {
      symbol: '🚲',
      symbolName: 'Bicycle',
      barColor: 'from-rose-500 to-red-400',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    };
  }
  if (p.includes('trinamool') || p.includes('aitc')) {
    return {
      symbol: '🌸',
      symbolName: 'Twin Flowers',
      barColor: 'from-emerald-500 to-teal-400',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    };
  }
  return {
    symbol: '🗳️',
    symbolName: 'Ballot',
    barColor: 'from-indigo-500 to-purple-400',
    badgeColor: 'bg-slate-700/30 text-slate-400 border-slate-700/40'
  };
};

const Results = () => {
  const [resultsData, setResultsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('Just now');

  // Fetch sorted live vote counts from backend: GET /candidate/vote/count
  const fetchVoteCounts = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError('');

    try {
      const response = await api.get('/candidate/vote/count');
      console.log('Fetched Vote Counts:', response.data);
      const voteList = Array.isArray(response.data)
        ? response.data
        : (response.data.candidates || response.data.response || response.data.voteRecord || []);
      setResultsData(voteList);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed to fetch vote counts:', err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Unable to load live results from backend server. Please verify backend is running on port 3000.';
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVoteCounts();
  }, []);

  // Compute total votes cast across all candidates
  const totalVotesCast = useMemo(() => {
    return resultsData.reduce((acc, curr) => acc + (curr.count || 0), 0);
  }, [resultsData]);

  // Leading candidate
  const leadingCandidate = resultsData[0];
  const runnerUp = resultsData[1];
  const leadMargin =
    leadingCandidate && runnerUp ? (leadingCandidate.count || 0) - (runnerUp.count || 0) : 0;

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ================= Header with Live Indicator & Refresh Button ================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                Live Counting Centre &bull; Backend Connected
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-cyan-400" />
              Live Election Results &amp; Analytics
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Real-time vote count fetched directly from database API.
            </p>
          </div>

          {/* Right Live Stream Badge & Refresh CTA */}
          <div className="flex items-center gap-3 self-start md:self-center">
            {/* Live Indicator */}
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-rose-400" />
                LIVE
              </span>
              <span className="text-slate-500 text-xs hidden sm:inline">&bull; {lastUpdated}</span>
            </div>

            {/* Manual 'Refresh Tally' Button */}
            <button
              onClick={() => fetchVoteCounts(true)}
              disabled={isRefreshing || isLoading}
              title="Click to trigger manual refresh from backend API"
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Tally</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ================= Top 3 Quick Analytics Stat Cards ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Total Votes Cast */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition-all shadow-xl">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Ballots Recorded
              </span>
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Vote className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                {totalVotesCast.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 pt-1">
                <span className="text-emerald-400 font-semibold flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Database Synced
                </span>
                <span>across EVM nodes</span>
              </p>
            </div>
          </div>

          {/* Card 2: Leading Party / Candidate */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition-all shadow-xl">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Current Leading Contender
              </span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2 truncate">
                <span>{getPartyTheme(leadingCandidate?.party).symbol}</span>
                <span className="truncate">{leadingCandidate?.name || leadingCandidate?.party || 'No Votes Yet'}</span>
              </div>
              <p className="text-xs text-amber-300/90 font-medium pt-1 truncate">
                {leadingCandidate ? (
                  <>Party: <strong className="text-white">{leadingCandidate.party}</strong> &bull; Lead: +{leadMargin.toLocaleString()} votes</>
                ) : (
                  'Waiting for first ballot'
                )}
              </p>
            </div>
          </div>

          {/* Card 3: Contesting Candidates */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition-all shadow-xl">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Contesting Nominees
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                {resultsData.length}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 pt-1">
                <span>Active candidates receiving ballots</span>
              </p>
            </div>
          </div>

        </div>

        {/* ================= Leaderboard & Real Percentage Bars ================= */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                <Award className="w-6 h-6 text-blue-400" />
                Live Candidate Standings ({resultsData.length})
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Sorted by backend API in descending order of votes.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Immutable Ledger Verified</span>
            </div>
          </div>

          {isLoading ? (
            <div className="p-16 rounded-3xl bg-slate-900/60 border border-slate-800/80 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400 text-sm">Fetching live vote counts from database...</p>
            </div>
          ) : resultsData.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <BarChart3 className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Vote Data Available</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                No candidate vote counts returned from the server. Once candidates are added and ballots are cast, real-time percentages will display here.
              </p>
              <button
                onClick={() => fetchVoteCounts(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
              >
                Refresh Tally
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {resultsData.map((item, index) => {
                const votesCount = item.count || 0;
                const voteShare = totalVotesCast > 0 ? ((votesCount / totalVotesCast) * 100).toFixed(1) : '0.0';
                const isLeader = index === 0 && votesCount > 0;
                const theme = getPartyTheme(item.party);
                const displayName = item.name || item.party;

                return (
                  <div
                    key={item.id || item.party + index}
                    className={`p-6 sm:p-7 rounded-3xl bg-slate-900 border transition-all duration-300 relative overflow-hidden ${
                      isLeader
                        ? 'border-amber-500/50 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 shadow-[0_0_35px_rgba(245,158,11,0.15)]'
                        : 'border-slate-800/90 hover:border-slate-700 hover:shadow-xl'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-5">
                      
                      {/* Rank Badge + Candidate Avatar + Details */}
                      <div className="flex items-center gap-4 sm:gap-5">
                        
                        {/* Rank Badge */}
                        <div
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-black text-sm sm:text-base shrink-0 shadow-md ${
                            isLeader
                              ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-amber-500/20'
                              : index === 1
                              ? 'bg-slate-700 text-white'
                              : index === 2
                              ? 'bg-amber-800/80 text-amber-200'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          #{index + 1}
                        </div>

                        {/* Avatar / Symbol */}
                        <div className="relative shrink-0">
                          <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                              displayName
                            )}&backgroundColor=1e293b,0f172a&textColor=ffffff`}
                            alt={displayName}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-slate-700 bg-slate-800 shadow"
                          />
                          <div
                            title={`Symbol: ${theme.symbolName}`}
                            className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-sm shadow-md"
                          >
                            {theme.symbol}
                          </div>
                        </div>

                        {/* Name & Party */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                              {displayName}
                            </h3>
                            {isLeader && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/40 text-xs font-extrabold shadow-sm">
                                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                                Current Leader
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                            <span className={`px-2 py-0.5 rounded-full font-medium border ${theme.badgeColor}`}>
                              {item.party}
                            </span>
                            {item.age && (
                              <>
                                <span className="text-slate-500">&bull;</span>
                                <span className="text-slate-300">Age: {item.age} yrs</span>
                              </>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Actual Votes Count & Real Percentage */}
                      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                            {votesCount.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400 font-medium uppercase">votes</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm sm:text-base font-bold text-blue-400 font-mono">
                          <span>{voteShare}%</span>
                          <span className="text-xs text-slate-500 font-normal">of counted</span>
                        </div>
                      </div>

                    </div>

                    {/* Dynamic Real Percentage Visual Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="w-full h-3 sm:h-3.5 rounded-full bg-slate-950 border border-slate-800/80 p-[1.5px] overflow-hidden">
                        <div
                          style={{ width: `${voteShare}%` }}
                          className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${
                            isLeader
                              ? 'from-amber-500 via-orange-500 to-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                              : theme.barColor
                          }`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>0%</span>
                        {isLeader && leadMargin > 0 && (
                          <span className="text-amber-400/90 font-sans font-medium">
                            Leading by +{leadMargin.toLocaleString()} votes over 2nd place
                          </span>
                        )}
                        <span>100%</span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= Bottom Ballot CTA Banner ================= */}
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Vote className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Have you cast your official ballot yet?</h4>
              <p className="text-xs text-slate-400">Connect with your credentials to participate in this election.</p>
            </div>
          </div>
          <Link
            to="/vote"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/30 whitespace-nowrap"
          >
            <span>Go to Ballot Screen</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Results;
