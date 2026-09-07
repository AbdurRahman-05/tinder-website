import React from 'react';
import { Link } from 'react-router-dom';
import { Profile } from '../types';
import { CheckCircle2, MapPin, Heart, ArrowUpRight, Sparkles } from 'lucide-react';

interface ProfileCardProps {
  profile: Profile;
  onToggleSave?: (profileId: string) => void;
  isSaved?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onToggleSave, isSaved }) => {
  const primaryPhoto = profile.photos?.find((p) => p.isPrimary)?.url || profile.photos?.[0]?.url;
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    profile.name
  )}&background=9333ea&color=ffffff&size=512`;

  const displayGender = profile.gender === 'Other' && profile.customGender ? profile.customGender : profile.gender;

  return (
    <div className="group relative rounded-2xl overflow-hidden glass-card-hover flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900">
        <img
          src={primaryPhoto || fallbackAvatar}
          alt={profile.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackAvatar;
          }}
        />

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

        {/* Badges Top Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex flex-wrap gap-1.5 pointer-events-auto">
            {profile.isVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white backdrop-blur-md shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            )}
            {profile.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm">
                <Sparkles className="w-3 h-3" />
                <span>Featured</span>
              </span>
            )}
          </div>

          {onToggleSave && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSave(profile.id);
              }}
              className={`pointer-events-auto p-2 rounded-full backdrop-blur-md transition-all ${
                isSaved
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-110'
                  : 'bg-slate-900/60 text-slate-200 hover:bg-rose-500 hover:text-white'
              }`}
              aria-label={isSaved ? 'Remove from saved' : 'Save profile'}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Card Overlay Bottom Info */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl font-bold text-white tracking-tight">{profile.name}</h3>
            <span className="text-lg font-medium text-slate-300">{profile.age}</span>
          </div>

          {/* Gender & Pronouns */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-500/30 text-purple-200 border border-purple-500/40 backdrop-blur-sm">
              {displayGender}
            </span>
            {profile.pronouns && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60 backdrop-blur-sm">
                {profile.pronouns}
              </span>
            )}
          </div>

          {profile.location && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-300">
              <MapPin className="w-3 h-3 text-purple-400 shrink-0" />
              <span className="truncate">{profile.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-grow justify-between bg-slate-950/60">
        <div>
          {/* Looking For Pills */}
          {profile.lookingFor && profile.lookingFor.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {profile.lookingFor.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/50"
                >
                  {tag}
                </span>
              ))}
              {profile.lookingFor.length > 3 && (
                <span className="text-[10px] px-1.5 py-0.5 text-slate-400 font-medium">
                  +{profile.lookingFor.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Bio Snippet */}
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {profile.bio}
          </p>
        </div>

        {/* View Profile Action */}
        <Link
          to={`/profile/${profile.id}`}
          className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 border border-slate-800 hover:border-transparent text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all group-hover:border-purple-500/40"
        >
          <span>View Profile</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
