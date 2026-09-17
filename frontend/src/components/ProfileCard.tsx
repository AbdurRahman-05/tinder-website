import React from 'react';
import { Link } from 'react-router-dom';
import { Profile } from '../types';
import { CheckCircle2, MapPin, Heart, ArrowUpRight, Sparkles, MessageCircle } from 'lucide-react';

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

  const whatsappNumber = profile.whatsapp?.replace(/\D/g, '');
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi ${profile.name}! Saw your profile on PRISM.`)}`
    : null;

  const instagramHandle = profile.instagram?.replace('@', '').trim();
  const instagramUrl = instagramHandle ? `https://instagram.com/${instagramHandle}` : null;

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
      <div className="p-4 flex flex-col flex-grow justify-between bg-slate-950/60 space-y-3">
        <div>
          {/* Looking For Pills */}
          {profile.lookingFor && profile.lookingFor.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
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

        {/* Quick Contact & Action Buttons */}
        <div className="space-y-2 pt-1 border-t border-slate-800/80">
          {(whatsappUrl || instagramUrl) && (
            <div className="flex items-center gap-2">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-600 border border-emerald-500/30 hover:border-emerald-500 text-emerald-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  title={`Chat with ${profile.name} on WhatsApp`}
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                  <span>WhatsApp</span>
                </a>
              )}

              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-pink-500/15 hover:bg-gradient-to-r hover:from-pink-600 hover:to-rose-600 border border-pink-500/30 hover:border-transparent text-pink-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  title={`View @${instagramHandle} on Instagram`}
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Insta</span>
                </a>
              )}
            </div>
          )}

          {/* View Profile Action */}
          <Link
            to={`/profile/${profile.id}`}
            className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <span>View Full Details</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
