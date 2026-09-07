import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid admin credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-pink-500 p-[2px]">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white font-['Outfit']">
            Admin Portal Authentication
          </h1>
          <p className="text-xs text-slate-400">
            Authorized administrative & moderation personnel only.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@prism.app"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>{isSubmitting ? 'Verifying Credentials...' : 'Access SaaS Admin Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block text-center">
              Quick One-Click Test Login
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@prism.app', 'AdminPass123!')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-amber-300 font-semibold text-center"
              >
                ⚡ Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('moderator@prism.app', 'ModPass123!')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-purple-300 font-semibold text-center"
              >
                🛡️ Moderator
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-300">
            ← Return to public website
          </Link>
        </div>
      </div>
    </div>
  );
};
