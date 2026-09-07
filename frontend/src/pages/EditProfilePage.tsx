import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Camera,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  Save,
} from 'lucide-react';

const GENDER_LIST = [
  'Non-binary',
  'Trans woman',
  'Trans man',
  'Genderqueer',
  'Genderfluid',
  'Agender',
  'Woman',
  'Man',
  'Other',
  'Prefer not to say',
];

const PRONOUN_PRESETS = ['They/Them', 'She/Her', 'He/Him', 'She/They', 'He/They', 'Any Pronouns', 'Other'];

const LOOKING_FOR_OPTIONS = [
  'Friendship',
  'Dating',
  'Relationship',
  'Community',
  'Networking',
  'Chatting',
];

export const EditProfilePage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [gender, setGender] = useState('Non-binary');
  const [customGender, setCustomGender] = useState('');
  const [pronouns, setPronouns] = useState('They/Them');
  const [customPronouns, setCustomPronouns] = useState('');
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [whatsappVisible, setWhatsappVisible] = useState(false);
  const [instagram, setInstagram] = useState('');
  const [instagramVisible, setInstagramVisible] = useState(false);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'HIDDEN'>('PUBLIC');

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setGender(profile.gender || 'Non-binary');
      setCustomGender(profile.customGender || '');
      setPronouns(profile.pronouns || 'They/Them');
      setLookingFor(profile.lookingFor || []);
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setWhatsapp(profile.whatsapp || '');
      setWhatsappVisible(Boolean(profile.whatsappVisible));
      setInstagram(profile.instagram || '');
      setInstagramVisible(Boolean(profile.instagramVisible));
      setVisibility(profile.visibility || 'PUBLIC');
      if (profile.photos?.[0]?.url) {
        setPhotoPreview(profile.photos[0].url);
      }
    }
  }, [profile]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleLookingForToggle = (tag: string) => {
    setLookingFor((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      // 1. Update text fields
      await api.put(`/profiles/${profile.id}`, {
        name,
        gender,
        customGender: gender === 'Other' ? customGender : undefined,
        pronouns: pronouns === 'Other' ? customPronouns : pronouns,
        lookingFor,
        bio,
        location,
        whatsapp: whatsapp.trim() || undefined,
        whatsappVisible,
        instagram: instagram.trim() || undefined,
        instagramVisible,
        visibility,
      });

      // 2. Upload new photo if selected
      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);
        await api.upload('/profiles/upload-photo', formData);
      }

      await refreshProfile();
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <p className="text-slate-400 text-sm">No profile created yet.</p>
        <button
          onClick={() => navigate('/create-profile')}
          className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold"
        >
          Create Profile
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h1 className="text-xl font-bold text-white font-['Outfit']">Edit Profile</h1>
        <div className="w-12" />
      </div>

      <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-10 shadow-2xl">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Photo */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
              Profile Photo
            </h3>
            <div className="flex items-center gap-6">
              <div className="relative w-28 h-28 rounded-2xl overflow-hidden glass-card border-2 border-purple-500/40 shadow-xl bg-slate-900 shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    No photo
                  </div>
                )}
                <label className="absolute inset-0 bg-slate-950/40 hover:bg-slate-950/60 flex flex-col items-center justify-center cursor-pointer text-white transition-colors">
                  <Camera className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-semibold">Change</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-300 font-semibold block">Update Photo</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Upload a fresh high-resolution photo. JPEG, PNG, WebP up to 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
              Basic Details
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Gender Identity</label>
              <div className="flex flex-wrap gap-2">
                {GENDER_LIST.map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setGender(g)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                      gender === g
                        ? 'bg-purple-600 border-purple-500 text-white font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {gender === 'Other' && (
                <div className="pt-2">
                  <input
                    type="text"
                    value={customGender}
                    onChange={(e) => setCustomGender(e.target.value)}
                    placeholder="Specify gender..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/40 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}
            </div>

            {/* Pronouns */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Pronouns</label>
              <div className="flex flex-wrap gap-2">
                {PRONOUN_PRESETS.map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPronouns(p)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                      pronouns === p
                        ? 'bg-pink-600 border-pink-500 text-white font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">General Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Looking For */}
          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
              Looking For
            </h3>
            <div className="flex flex-wrap gap-2">
              {LOOKING_FOR_OPTIONS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleLookingForToggle(tag)}
                  className={`text-xs px-3.5 py-2 rounded-xl border transition-all ${
                    lookingFor.includes(tag)
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-transparent text-white font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
                About You
              </h3>
              <span className="text-[11px] text-slate-500">{bio.length} / 500</span>
            </div>
            <textarea
              rows={4}
              maxLength={500}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
            />
          </div>

          {/* Contact & Visibility */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
              Contact & Visibility
            </h3>

            {/* Profile Visibility Toggle */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">Profile Search Visibility</span>
                <p className="text-[11px] text-slate-400">
                  {visibility === 'PUBLIC'
                    ? 'Your profile is visible in public discovery.'
                    : 'Your profile is completely hidden from discovery.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVisibility(visibility === 'PUBLIC' ? 'HIDDEN' : 'PUBLIC')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  visibility === 'PUBLIC'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                }`}
              >
                {visibility === 'PUBLIC' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{visibility}</span>
              </button>
            </div>

            {/* WhatsApp */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-grow">
                <label className="text-xs font-semibold text-slate-300">WhatsApp Number</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+14155552671"
                  className="w-full px-3 py-1.5 mt-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setWhatsappVisible(!whatsappVisible)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border sm:mt-5 ${
                  whatsappVisible
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {whatsappVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{whatsappVisible ? 'Public' : 'Hidden'}</span>
              </button>
            </div>

            {/* Instagram */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-grow">
                <label className="text-xs font-semibold text-slate-300">Instagram Handle</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@handle"
                  className="w-full px-3 py-1.5 mt-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setInstagramVisible(!instagramVisible)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border sm:mt-5 ${
                  instagramVisible
                    ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {instagramVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{instagramVisible ? 'Public' : 'Hidden'}</span>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
