import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { ArrowLeft, Sparkles, CheckCircle2, AlertTriangle, PlusCircle } from 'lucide-react';

const GENDER_OPTIONS = [
  'Non-binary',
  'Trans woman',
  'Trans man',
  'Genderqueer',
  'Genderfluid',
  'Agender',
  'Woman',
  'Man',
  'Other',
];

const LOOKING_FOR_OPTIONS = [
  'Friendship',
  'Dating',
  'Relationship',
  'Community',
  'Networking',
  'Chatting',
];

export const AdminCreateProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1998-06-15');
  const [gender, setGender] = useState('Non-binary');
  const [customGender, setCustomGender] = useState('');
  const [pronouns, setPronouns] = useState('They/Them');
  const [lookingFor, setLookingFor] = useState<string[]>(['Friendship', 'Community']);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('San Francisco, CA');
  const [whatsapp, setWhatsapp] = useState('');
  const [whatsappVisible, setWhatsappVisible] = useState(false);
  const [instagram, setInstagram] = useState('');
  const [instagramVisible, setInstagramVisible] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80');
  const [isVerified, setIsVerified] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLookingForToggle = (tag: string) => {
    setLookingFor((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await api.post('/admin/profiles', {
        name,
        dateOfBirth,
        gender,
        customGender: gender === 'Other' ? customGender : undefined,
        pronouns,
        lookingFor,
        bio,
        location,
        whatsapp: whatsapp.trim() || undefined,
        whatsappVisible,
        instagram: instagram.trim() || undefined,
        instagramVisible,
        photoUrl,
        isVerified,
        isFeatured,
      });
      navigate('/admin/profiles');
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/profiles')}
          className="p-2 rounded-lg text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white font-['Outfit']">Create Community Profile</h1>
          <p className="text-xs text-slate-400">Direct administrator profile creation (createdByAdmin: true)</p>
        </div>
      </div>

      <div className="p-8 rounded-3xl glass-card border border-slate-800 shadow-2xl">
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Rivera"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Date of Birth</label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Gender Identity</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Pronouns</label>
              <input
                type="text"
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
                placeholder="e.g. They/Them, She/Her"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {gender === 'Other' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Custom Gender</label>
              <input
                type="text"
                value={customGender}
                onChange={(e) => setCustomGender(e.target.value)}
                placeholder="e.g. Two-Spirit, Gender-nonconforming"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Photo Image URL</label>
            <input
              type="url"
              required
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Looking For</label>
            <div className="flex flex-wrap gap-2">
              {LOOKING_FOR_OPTIONS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleLookingForToggle(tag)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    lookingFor.includes(tag)
                      ? 'bg-purple-600 border-purple-500 text-white font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Bio</label>
            <textarea
              required
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Community bio..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State/Country"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Instagram Handle</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@username"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Verification & Featured Checkboxes */}
          <div className="flex flex-wrap gap-6 pt-3 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-purple-600"
              />
              <span>Verify profile immediately</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-purple-600"
              />
              <span>Feature on homepage</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20"
            >
              {isSubmitting ? 'Creating...' : 'Create Admin Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
