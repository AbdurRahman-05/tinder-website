import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ShieldAlert,
  ClipboardList,
  PlusCircle,
  LogOut,
  ExternalLink,
  Shield,
  Sparkles,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isModerator, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isModerator) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md p-8 rounded-3xl glass-card border border-rose-500/30">
          <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Admin Access Restricted</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            You must be logged in with Moderator or Administrator privileges to access this area.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Link
              to="/admin/login"
              className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold"
            >
              Admin Sign In
            </Link>
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Profiles', path: '/admin/profiles', icon: Users },
    { label: 'Add Profile', path: '/admin/profiles/create', icon: PlusCircle },
    { label: 'Reports Triage', path: '/admin/reports', icon: ShieldAlert },
    { label: 'User Directory', path: '/admin/users', icon: UserCheck },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: ClipboardList },
  ];

  const isActive = (p: string) => {
    if (p === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(p);
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="p-6 space-y-6">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-purple-600 to-pink-500 p-[2px]">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white font-['Outfit'] tracking-tight">PRISM ADMIN</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-400">
                {user?.role.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & exit */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/60 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Logged In As</span>
            <span className="text-xs font-medium text-slate-300 truncate block">{user?.email}</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <Link
              to="/discover"
              className="text-slate-400 hover:text-purple-300 flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
              className="text-slate-400 hover:text-rose-400 flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar for mobile nav & quick exit */}
        <header className="h-16 px-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-sm">PRISM Admin</span>
            </div>
            <span className="hidden sm:inline-block text-xs text-slate-400">
              SaaS Moderation & Security Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/discover"
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Platform</span>
            </Link>
          </div>
        </header>

        {/* Nested Admin Page Content */}
        <div className="p-6 sm:p-8 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
