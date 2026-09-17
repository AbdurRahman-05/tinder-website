import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Profile } from '../types';
import { useAuth } from '../context/AuthContext';
import { ReportModal } from '../components/ReportModal';
import { BlockModal } from '../components/BlockModal';
import {
  CheckCircle2,
  MapPin,
  Heart,
  ShieldAlert,
  ShieldBan,
  MessageCircle,
  Camera,
  Edit3,
  ArrowLeft,
  Share2,
  Lock,
  Sparkles,
  Shield,
  Trash2,
  Copy,
  Check,
  Phone,
} from 'lucide-react';

export const ProfileDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isModerator, isAdmin } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSaved, setIsSaved] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);
  const [copiedInsta, setCopiedInsta] = useState(false);
  const [adminMessage, setAdminMessage] = useState<string | null>(null);

  const handleAdminBlock = async () => {
    if (!profile) return;
    try {
      const res = await api.post(`/admin/profiles/${profile.id}/block`);
      setAdminMessage(res.message || 'Block status updated');
      setProfile((prev) => (prev ? { ...prev, status: prev.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED' } : null));
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleAdminVerify = async () => {
    if (!profile) return;
    try {
      const res = await api.post(`/admin/profiles/${profile.id}/verify`);
      setAdminMessage(res.message || 'Verification updated');
      setProfile((prev) => (prev ? { ...prev, isVerified: !prev.isVerified } : null));
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleAdminFeature = async () => {
    if (!profile) return;
    try {
      const res = await api.post(`/admin/profiles/${profile.id}/feature`);
      setAdminMessage(res.message || 'Feature status updated');
      setProfile((prev) => (prev ? { ...prev, isFeatured: !prev.isFeatured } : null));
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleAdminDelete = async () => {
    if (!profile) return;
    if (!confirm('Are you sure you want to delete this profile as Admin?')) return;
    try {
      await api.delete(`/admin/profiles/${profile.id}`);
      alert('Profile deleted by Admin');
      navigate('/discover');
    } catch (err: any) {
      alert(err.message || 'Failed to delete profile');
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await api.get<Profile>(`/profiles/${id}`);
        setProfile(data);
        setIsSaved(Boolean(data.isSaved));
      } catch (err: any) {
        setError(err.message || 'Profile not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProfile();
  }, [id]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      alert('Please create a free account or log in to save favorite profiles.');
      return;
    }
    if (!profile) return;

    try {
      if (isSaved) {
        await api.delete(`/interactions/${profile.id}/save`);
        setIsSaved(false);
      } else {
        await api.post(`/interactions/${profile.id}/save`);
        setIsSaved(true);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyWa = () => {
    if (!profile?.whatsapp) return;
    navigator.clipboard.writeText(profile.whatsapp);
    setCopiedWa(true);
    setTimeout(() => setCopiedWa(false), 2500);
  };

  const handleCopyInsta = () => {
    const handle = profile?.instagram?.replace('@', '').trim();
    if (!handle) return;
    navigator.clipboard.writeText(`@${handle}`);
    setCopiedInsta(true);
    setTimeout(() => setCopiedInsta(false), 2500);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400">Loading community profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Profile Unavailable</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          {error || 'This profile is no longer public or has been removed.'}
        </p>
        <Link
          to="/discover"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover</span>
        </Link>
      </div>
    );
  }

  const isOwner = Boolean(user && profile.userId && user.id === profile.userId);
  const displayGender = profile.gender === 'Other' && profile.customGender ? profile.customGender : profile.gender;
  const photos = profile.photos?.length > 0 ? profile.photos : [{ id: '1', url: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=9333ea&color=ffffff&size=512`, isPrimary: true }];
  const activePhoto = photos[activePhotoIdx]?.url || photos[0]?.url;

  // WhatsApp link normalized: remove spaces, +, etc.
  const whatsappNumber = profile.whatsapp?.replace(/\D/g, '');
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi ${profile.name}! Saw your profile on PRISM.`)}`
    : null;

  // Instagram handle normalized: remove @
  const instagramHandle = profile.instagram?.replace('@', '').trim();
  const instagramUrl = instagramHandle ? `https://instagram.com/${instagramHandle}` : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>

          {isOwner && (
            <Link
              to={`/edit-profile?id=${profile.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Link>
          )}
        </div>
      </div>

      {/* Admin Moderation Bar */}
      {(isModerator || isAdmin) && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                Admin Moderation Controls
              </span>
              <span className="text-[11px] text-amber-400/80">
                Status: <strong className="uppercase">{profile.status}</strong> • Verified: {profile.isVerified ? 'Yes' : 'No'} • Featured: {profile.isFeatured ? 'Yes' : 'No'}
              </span>
              {adminMessage && (
                <span className="text-[11px] text-emerald-400 block font-medium mt-0.5">
                  ✓ {adminMessage}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAdminVerify}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                profile.isVerified
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {profile.isVerified ? '✓ Verified' : 'Verify'}
            </button>

            <button
              onClick={handleAdminFeature}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                profile.isFeatured
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {profile.isFeatured ? '★ Featured' : 'Feature'}
            </button>

            <button
              onClick={handleAdminBlock}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                profile.status === 'BLOCKED'
                  ? 'bg-rose-500/30 text-rose-200 border-rose-500/50'
                  : 'bg-slate-900 text-rose-300 border-rose-500/30 hover:bg-rose-500/10'
              }`}
            >
              {profile.status === 'BLOCKED' ? 'Unblock Profile' : 'Block Profile'}
            </button>

            {isAdmin && (
              <button
                onClick={handleAdminDelete}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600/20 text-rose-400 border border-rose-500/40 hover:bg-rose-600 hover:text-white transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}

            <Link
              to="/admin/profiles"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            >
              Admin Portal →
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Photo Gallery */}
        <div className="md:col-span-5 space-y-4">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden glass-card border border-slate-800/80 shadow-2xl bg-slate-900">
            <img
              src={activePhoto}
              alt={profile.name}
              className="w-full h-full object-cover object-center"
            />

            {profile.isVerified && (
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white backdrop-blur-md shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified by PRISM</span>
              </div>
            )}

            {!isOwner && (
              <button
                onClick={handleToggleSave}
                className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all shadow-lg ${
                  isSaved
                    ? 'bg-rose-500 text-white scale-110 shadow-rose-500/40'
                    : 'bg-slate-900/70 text-slate-200 hover:bg-rose-500 hover:text-white'
                }`}
                aria-label={isSaved ? 'Remove from saved' : 'Save profile'}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>

          {/* Multiple Photo Thumbnails if available */}
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((ph, idx) => (
                <button
                  key={ph.id || idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activePhotoIdx === idx ? 'border-purple-500 scale-105' : 'border-slate-800 opacity-60'
                  }`}
                >
                  <img src={ph.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Profile Information */}
        <div className="md:col-span-7 space-y-6">
          {/* Header & Badges */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
                {profile.name}
              </h1>
              <span className="text-2xl font-semibold text-slate-300">{profile.age}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-200 border border-purple-500/40">
                {displayGender}
              </span>

              {profile.pronouns && (
                <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-300 border border-slate-700/60">
                  {profile.pronouns}
                </span>
              )}

              {profile.location && (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Looking For */}
          {profile.lookingFor && profile.lookingFor.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Looking For
              </span>
              <div className="flex flex-wrap gap-2">
                {profile.lookingFor.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* About / Bio */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              About
            </span>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          </div>

          {/* Direct Contact & Socials Section */}
          <div className="p-6 rounded-3xl glass-card border border-purple-500/30 shadow-2xl space-y-5 bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Direct Contact & Social Accounts</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Get in touch directly with {profile.name} via WhatsApp or Instagram.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Public Contact
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* WhatsApp Contact Box */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/30 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <span>WhatsApp</span>
                  </div>
                  {profile.whatsapp && (
                    <button
                      onClick={handleCopyWa}
                      className="px-2 py-1 rounded-md text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                      title="Copy WhatsApp Number"
                    >
                      {copiedWa ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-300 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Phone / WA Number</span>
                  <p className="text-sm font-bold text-white tracking-wide mt-0.5 font-mono">
                    {profile.whatsapp || 'Not provided'}
                  </p>
                </div>

                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Open WhatsApp Chat</span>
                  </a>
                ) : (
                  <div className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs text-center font-medium">
                    No WhatsApp number listed
                  </div>
                )}
              </div>

              {/* Instagram Contact Box */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-pink-500/30 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-pink-400 font-semibold text-xs">
                    <div className="w-7 h-7 rounded-lg bg-pink-500/20 flex items-center justify-center">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <span>Instagram</span>
                  </div>
                  {instagramHandle && (
                    <button
                      onClick={handleCopyInsta}
                      className="px-2 py-1 rounded-md text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                      title="Copy Instagram Handle"
                    >
                      {copiedInsta ? (
                        <>
                          <Check className="w-3 h-3 text-pink-400" />
                          <span className="text-pink-300 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Instagram Handle</span>
                  <p className="text-sm font-bold text-white tracking-wide mt-0.5 font-mono">
                    {instagramHandle ? `@${instagramHandle}` : 'Not provided'}
                  </p>
                </div>

                {instagramUrl ? (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-pink-600/25 transition-all hover:scale-[1.02]"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>View Instagram Profile</span>
                  </a>
                ) : (
                  <div className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs text-center font-medium">
                    No Instagram handle listed
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Safety Actions: Report / Block */}
          {!isOwner && (
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => setReportModalOpen(true)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Report Profile</span>
              </button>

              <button
                onClick={() => setBlockModalOpen(true)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <ShieldBan className="w-3.5 h-3.5" />
                <span>Block Profile</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        profileId={profile.id}
        profileName={profile.name}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

      {/* Block Modal */}
      <BlockModal
        profileId={profile.id}
        profileName={profile.name}
        isOpen={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        onBlocked={() => navigate('/discover')}
      />
    </div>
  );
};
