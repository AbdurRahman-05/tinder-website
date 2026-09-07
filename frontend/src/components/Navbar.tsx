import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Bookmark,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Shield,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, isAuthenticated, isModerator, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-400 p-[2px] shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400 group-hover:text-pink-400 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-bold tracking-tight text-white font-['Outfit']">PRISM</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold tracking-wider uppercase">18+</span>
              </div>
              <span className="text-[10px] text-slate-400 tracking-wider font-medium hidden sm:inline-block">Discover. Connect. Be Yourself.</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/discover"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                isActive('/discover')
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Discover</span>
            </Link>

            <Link
              to="/safety"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                isActive('/safety')
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Safety & Inclusivity</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/saved"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  isActive('/saved')
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>Favorites</span>
              </Link>
            )}

            {isModerator && (
              <Link
                to="/admin"
                className="px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2 text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Portal</span>
              </Link>
            )}
          </nav>

          {/* User Status / Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {!profile && (
                  <Link
                    to="/create-profile"
                    className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02]"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Profile</span>
                  </Link>
                )}

                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-slate-200 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-xs font-semibold text-purple-300">
                    {profile?.name ? profile.name[0].toUpperCase() : user?.email[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium max-w-[100px] truncate">{profile?.name || user?.email.split('@')[0]}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  to="/discover"
                  className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  Continue as Guest
                </Link>
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02]"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            <Link
              to="/discover"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800 flex items-center space-x-3"
            >
              <Compass className="w-5 h-5 text-purple-400" />
              <span>Discover People</span>
            </Link>

            <Link
              to="/safety"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800 flex items-center space-x-3"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Safety & Inclusivity</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800 flex items-center space-x-3"
                >
                  <Bookmark className="w-5 h-5 text-pink-400" />
                  <span>Favorite Profiles</span>
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800 flex items-center space-x-3"
                >
                  <UserIcon className="w-5 h-5 text-purple-400" />
                  <span>Dashboard</span>
                </Link>
              </>
            )}

            {isModerator && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-base font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 flex items-center space-x-3"
              >
                <Shield className="w-5 h-5 text-amber-400" />
                <span>Admin SaaS Portal</span>
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex flex-col space-y-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-slate-900 border border-slate-800"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold"
                >
                  Create Account (18+)
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
