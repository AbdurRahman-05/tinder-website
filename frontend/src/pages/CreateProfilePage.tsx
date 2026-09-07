import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Camera,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  Upload,
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

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
];

export const CreateProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Non-binary');
  const [customGender, setCustomGender] = useState('');
  const [pronouns, setPronouns] = useState('They/Them');
  const [customPronouns, setCustomPronouns] = useState('');
  const [lookingFor, setLookingFor] = useState<string[]>(['Friendship', 'Community']);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [whatsappVisible, setWhatsappVisible] = useState(false);
  const [instagram, setInstagram] = useState('');
  const [instagramVisible, setInstagramVisible] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_AVATARS[0]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoUrl(URL.createObjectURL(file));
    }
  };

  const handleLookingForToggle = (tag: string) => {
    setLookingFor((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (lookingFor.length === 0) {
      setError('Please select at least one "Looking For" category');
      return;
    }

    if (bio.trim().length < 10) {
      setError('Bio must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create base profile
      const res = await api.post('/profiles', {
        name,
        dateOfBirth: dateOfBirth || '2000-01-01',
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
        visibility: 'PUBLIC',
        photoUrl: !photoFile ? photoUrl : undefined,
      });

      // 2. If a local file was chosen, upload it
      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);
        await api.upload('/profiles/upload-photo', formData);
      }

      await refreshProfile();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Profile Setup</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white font-['Outfit']">Create Your Profile</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Express your authentic self. Control your contact visibility and connect safely with community members.
        </p>
      </div>

      <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-10 shadow-2xl">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Profile Photo */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
              1. Profile Photo
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-32 h-32 rounded-3xl overflow-hidden glass-card border-2 border-purple-500/40 shadow-xl shrink-0 bg-slate-900">
                <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                <label className="absolute inset-0 bg-slate-950/40 hover:bg-slate-950/60 flex flex-col items-center justify-center cursor-pointer text-white transition-colors">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-semibold">Change</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <span className="text-xs text-slate-300 font-semibold block">
                  Select a Sample Photo or Upload Your Own:
                </span>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {SAMPLE_AVATARS.map((url, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => {
                        setPhotoUrl(url);
                        setPhotoFile(null);
                      }}
                      className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${
                        photoUrl === url && !photoFile ? 'border-purple-500 scale-110' : 'border-slate-800 opacity-70'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  Allowed formats: JPEG, PNG, WebP. Max size: 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Basic Info */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
              2. Basic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Date of Birth (18+)</label>
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max="2008-01-01"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Gender Identity */}
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
                        ? 'bg-purple-600 border-purple-500 text-white font-semibold shadow-sm'
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
                    required
                    value={customGender}
                    onChange={(e) => setCustomGender(e.target.value)}
                    placeholder="Specify your gender identity (e.g. Two-Spirit, Pangender)..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-purple-500/40 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}
            </div>

            {/* Pronouns */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Pronouns (Optional)</label>
              <div className="flex flex-wrap gap-2">
                {PRONOUN_PRESETS.map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPronouns(p)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                      pronouns === p
                        ? 'bg-pink-600 border-pink-500 text-white font-semibold shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {pronouns === 'Other' && (
                <div className="pt-2">
                  <input
                    type="text"
                    value={customPronouns}
                    onChange={(e) => setCustomPronouns(e.target.value)}
                    placeholder="Enter custom pronouns (e.g. Ze/Zir)..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">General Location (Optional)</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Brooklyn, NY or Toronto, Canada (General only)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Section 3: Looking For */}
          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
              3. Looking For (Multi-Select)
            </h3>
            <p className="text-xs text-slate-400">What brings you to PRISM? Choose all that apply.</p>
            <div className="flex flex-wrap gap-2">
              {LOOKING_FOR_OPTIONS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleLookingForToggle(tag)}
                  className={`text-xs px-3.5 py-2 rounded-xl border transition-all ${
                    lookingFor.includes(tag)
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-transparent text-white font-semibold shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Bio */}
          <div className="space-y-2 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
                4. About You
              </h3>
              <span className={`text-[11px] font-semibold ${bio.length > 500 ? 'text-rose-400' : 'text-slate-500'}`}>
                {bio.length} / 500
              </span>
            </div>
            <textarea
              required
              rows={4}
              maxLength={500}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about yourself, passions, hobbies, music, or what makes you smile..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
            />
          </div>

          {/* Section 5: Contact & Privacy Controls */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
                5. Contact & Privacy Settings
              </h3>
              <p className="text-xs text-slate-400">
                Both WhatsApp and Instagram are completely optional. Control whether each link is visible to public visitors.
              </p>
            </div>

            {/* WhatsApp */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-grow space-y-1">
                  <label className="text-xs font-semibold text-slate-300">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+14155552671 (with country code)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => setWhatsappVisible(!whatsappVisible)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      whatsappVisible
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {whatsappVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{whatsappVisible ? 'Public Button' : 'Hidden'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Instagram */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-grow space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Instagram Handle</label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@username"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => setInstagramVisible(!instagramVisible)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      instagramVisible
                        ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {instagramVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{instagramVisible ? 'Public Button' : 'Hidden'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 border-t border-slate-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Publishing Profile...' : 'Publish Public Profile'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
