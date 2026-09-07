import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  Sparkles,
  Compass,
  Bookmark,
  Edit3,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, profile, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusToggling, setStatusToggling] = useState(false);

  // Calculate completeness percentage
  let completeness = 30; // base account
  if (profile) {
    completeness += 15; // has profile
    if (profile.photos?.length) completeness += 20;
    if (profile.bio?.length > 20) completeness += 15;
    if (profile.lookingFor?.length) completeness += 10;
    if (profile.whatsapp || profile.instagram) completeness += 10;
  }

  const handleToggleVisibility = async () => {
    if (!profile) return;
    setStatusToggling(true);
    try {
      const newVisibility = profile.visibility === 'PUBLIC' ? 'HIDDEN' : 'PUBLIC';
      await api.put(`/profiles/${profile.id}`, { visibility: newVisibility });
      await refreshProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setStatusToggling(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.post('/auth/delete-account');
      logout();
      navigate('/');
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl glass-card border border-purple-500/20 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-900 border-2 border-purple-500/40 shrink-0">
              {profile?.photos?.[0]?.url ? (
                <img src={profile.photos[0].url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xl text-purple-400">
                  {user?.email[0].toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight font-['Outfit']">
                  Hi, {profile?.name || user?.email.split('@')[0]}
                </h1>
                {profile?.isVerified && (
                  <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400" title="Verified">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {profile ? `${profile.gender} • ${profile.age} years old` : 'Account active — complete your profile to be discovered'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {profile ? (
              <>
                <Link
                  to={`/profile/${profile.id}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Public View</span>
                </Link>
                <Link
                  to="/edit-profile"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </Link>
              </>
            ) : (
              <Link
                to="/create-profile"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all"
              >
                Create Public Profile
              </Link>
            )}
          </div>
        </div>

        {/* Profile Completeness Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300">Profile Completeness</span>
            <span className="text-purple-400">{completeness}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          to="/discover"
          className="p-6 rounded-2xl glass-card-hover border border-slate-800 flex flex-col justify-between space-y-4"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Explore People</h3>
            <p className="text-xs text-slate-400 mt-1">
              Search and connect with people across the LGBTQ+ spectrum.
            </p>
          </div>
        </Link>

        <Link
          to="/saved"
          className="p-6 rounded-2xl glass-card-hover border border-slate-800 flex flex-col justify-between space-y-4"
        >
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Favorite Profiles</h3>
            <p className="text-xs text-slate-400 mt-1">
              Quickly re-visit profiles you've bookmarked for later.
            </p>
          </div>
        </Link>

        {/* Visibility Toggle Card */}
        {profile ? (
          <div className="p-6 rounded-2xl glass-card border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  profile.visibility === 'PUBLIC'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {profile.visibility === 'PUBLIC' ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  profile.visibility === 'PUBLIC'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                {profile.visibility}
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Discovery Visibility</h3>
              <p className="text-xs text-slate-400 mt-1">
                {profile.visibility === 'PUBLIC'
                  ? 'Your profile appears in public search.'
                  : 'Your profile is hidden from discovery results.'}
              </p>
              <button
                onClick={handleToggleVisibility}
                disabled={statusToggling}
                className="mt-3 text-xs text-purple-400 hover:text-purple-300 font-semibold underline"
              >
                {profile.visibility === 'PUBLIC' ? 'Hide my profile' : 'Make profile public'}
              </button>
            </div>
          </div>
        ) : (
          <Link
            to="/create-profile"
            className="p-6 rounded-2xl glass-card-hover border border-slate-800 flex flex-col justify-between space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Get Discovered</h3>
              <p className="text-xs text-slate-400 mt-1">
                Publish your profile so other community members can find you.
              </p>
            </div>
          </Link>
        )}
      </div>

      {/* Account Settings & Danger Zone */}
      <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Account & Privacy Controls
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Permanently Delete Account</span>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanently removes your public profile and removes you from all discovery results.
            </p>
          </div>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="max-w-md w-full rounded-2xl glass-card border border-rose-500/40 p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Delete your account permanently?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                This action cannot be undone. Your profile will immediately disappear from discovery and your session will terminate.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/30"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
