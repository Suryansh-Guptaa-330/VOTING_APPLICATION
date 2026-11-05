import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  Vote, 
  BarChart3, 
  User, 
  LogIn, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

/**
 * Modern Dark-Themed Dynamic Navbar for VoteChain
 * 
 * @param {Object} props
 * @param {boolean} props.isLoggedIn - Dynamic authentication state (based on token)
 * @param {Object|null} props.user - Verified logged in user data
 * @param {Function} props.onLogout - Callback to clear token and state
 */
const Navbar = ({ isLoggedIn = false, user = null, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (isLoggedIn) {
      if (onLogout) {
        onLogout();
      }
      setMobileMenuOpen(false);
      navigate('/login');
    } else {
      setMobileMenuOpen(false);
      navigate('/login');
    }
  };

  const navLinks = [
    { name: 'Vote', path: '/vote', icon: Vote },
    { name: 'Live Results', path: '/results', icon: BarChart3 },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const getLinkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;

  const getMobileLinkClasses = ({ isActive }) =>
    `flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all ${
      isActive
        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link 
            to="/vote" 
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg py-1"
          >
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                  Vote<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">Chain</span>
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Sparkles className="w-2.5 h-2.5" /> Web3 Vibe
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide hidden sm:block">
                Decentralized &amp; Tamper-Proof Voting
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink 
                  key={link.path} 
                  to={link.path} 
                  className={getLinkClasses}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Desktop Right Action (Login / Logout & User Status) */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn && user && (
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-left">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xs shadow-inner uppercase">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="flex flex-col text-xs leading-tight">
                  <span className="text-slate-200 font-semibold truncate max-w-[120px]">
                    {user.name || 'Citizen Voter'}
                  </span>
                  <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    Verified
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleAuthClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 shadow-md ${
                isLoggedIn
                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-400/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'
              }`}
            >
              {isLoggedIn ? (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Login / Register</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3 transition-all animate-in fade-in slide-in-from-top-3 duration-200">
          {/* User status card for mobile */}
          {isLoggedIn && user && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm uppercase">
                {user.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-slate-100 font-medium text-sm">{user.name}</span>
                <span className="text-slate-400 text-xs font-mono">
                  Aadhar: XXXX-XXXX-{String(user.aadharCardNumber || '1234').slice(-4)}
                </span>
              </div>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                Verified
              </span>
            </div>
          )}

          {/* Mobile Nav Links */}
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={getMobileLinkClasses}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </NavLink>
              );
            })}
          </nav>

          {/* Mobile Auth Button */}
          <div className="pt-2">
            <button
              onClick={handleAuthClick}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-base font-semibold transition-all ${
                isLoggedIn
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
              }`}
            >
              {isLoggedIn ? (
                <>
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Login / Register</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
