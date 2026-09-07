import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Profile } from '../types';
import { ProfileCard } from '../components/ProfileCard';
import { Bookmark, Compass, Heart } from 'lucide-react';

export const SavedProfilesPage: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      const data = await api.get<Profile[]>('/interactions/saved');
      if (Array.isArray(data)) {
        setProfiles(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleToggleSave = async (profileId: string) => {
    try {
      await api.delete(`/interactions/${profileId}/save`);
      setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh]">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
          <Bookmark className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
            Favorite Profiles
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Profiles you've saved for future connection. Only visible to you.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[4/5] rounded-2xl glass-card animate-pulse" />
          ))}
        </div>
      ) : profiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isSaved={true}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 rounded-3xl glass-card border border-slate-800 space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Favorite Profiles Yet</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            While exploring community members, tap the heart icon on any profile card to save them here.
          </p>
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Community</span>
          </Link>
        </div>
      )}
    </div>
  );
};
