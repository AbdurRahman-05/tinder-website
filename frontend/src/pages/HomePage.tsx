import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Profile } from '../types';
import { ProfileCard } from '../components/ProfileCard';
import {
  Compass,
  Sparkles,
  ShieldCheck,
  Heart,
  Users,
  Search,
  ArrowRight,
  CheckCircle2,
  Lock,
  MessageCircle,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [featuredProfiles, setFeaturedProfiles] = useState<Profile[]>([]);
  const [searchName, setSearchName] = useState('');
  const [selectedGender, setSelectedGender] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await api.get('/profiles/featured');
        if (Array.isArray(data)) {
          setFeaturedProfiles(data);
        }
      } catch (err) {
        console.error('Failed to load featured profiles', err);
      }
    };
    fetchFeatured();
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchName.trim()) params.set('q', searchName.trim());
    if (selectedGender && selectedGender !== 'All') params.set('gender', selectedGender);
    navigate(`/discover?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-pink-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Inclusive Community Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/70 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-6 shadow-lg shadow-purple-950/50 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Modern LGBTQ+ Friendly Discovery Platform</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span className="text-slate-400">Strictly 18+</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-['Outfit'] max-w-4xl mx-auto leading-[1.1]">
            Find Your People. <br />
            <span className="gradient-text">Discover. Connect. Be Yourself.</span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A safe, inclusive space to discover authentic public profiles, connect through your favorite socials, and build genuine community — with zero forced swipe games.
          </p>

          {/* CTA Group */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <Link
              to="/discover"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-semibold text-sm shadow-xl shadow-purple-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Profiles</span>
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white font-semibold text-sm transition-all hover:border-purple-500/50 flex items-center justify-center gap-2"
            >
              <span>Create Your Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Guest Notice */}
          <div className="mt-4">
            <Link
              to="/discover"
              className="text-xs text-slate-400 hover:text-purple-300 underline underline-offset-4 transition-colors"
            >
              Want to browse first? Continue as Guest without an account →
            </Link>
          </div>

          {/* 2. SEARCH PREVIEW CARD */}
          <div className="mt-14 max-w-3xl mx-auto">
            <form
              onSubmit={handleQuickSearch}
              className="p-2.5 sm:p-3 rounded-2xl glass-card border border-purple-500/20 shadow-2xl flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="relative w-full flex-grow">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Search profiles by name or keywords..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full sm:w-48 px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="All">All Identities</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Trans woman">Trans woman</option>
                <option value="Trans man">Trans man</option>
                <option value="Genderfluid">Genderfluid</option>
                <option value="Genderqueer">Genderqueer</option>
                <option value="Agender">Agender</option>
                <option value="Woman">Woman</option>
                <option value="Man">Man</option>
              </select>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROFILES SHOWCASE */}
      {featuredProfiles.length > 0 && (
        <section className="py-16 bg-slate-950/60 border-y border-slate-900 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
              <div>
                <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold">Community Spotlight</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Featured Profiles</h2>
              </div>
              <Link
                to="/discover"
                className="mt-3 sm:mt-0 text-sm font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 group"
              >
                <span>View all verified members</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProfiles.slice(0, 4).map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. HOW IT WORKS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-pink-400 font-semibold">Effortless Discovery</span>
          <h2 className="text-3xl font-bold text-white mt-2">How PRISM Works</h2>
          <p className="text-sm text-slate-400 mt-3">
            No endless swiping, no algorithmic mystery. Just authentic public discovery on your terms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl glass-card border border-slate-800 flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg mb-4">
              01
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-2">Browse or Register</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Explore profiles instantly as a guest or create an 18+ verified account to express yourself.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-slate-800 flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-lg mb-4">
              02
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-2">Filter By Identity</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Search by expansive LGBTQ+ gender identities, pronouns, age range, location, and intentions.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-slate-800 flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg mb-4">
              03
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-2">Read Authentic Bios</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Get to know the real person through creative bios, looking-for badges, and verification status.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-slate-800 flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-lg mb-4">
              04
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-2">Connect Your Way</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reach out via WhatsApp or Instagram when the user has chosen to make their contact info visible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INCLUSIVE COMMUNITY & PRIDE */}
      <section className="py-20 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold">LGBTQ+ First</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                Designed For Diversity. Built With Dignity.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Dating and connection platforms often reduce gender to a binary checkbox. PRISM embraces the full spectrum of identity with full support for Non-binary, Trans, Genderfluid, Agender, and custom expressions, alongside optional pronouns.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-200">
                    <strong>10+ Inclusive Gender Selections:</strong> Select your authentic identity or add custom descriptions.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-200">
                    <strong>Pronouns Respected:</strong> Optional, clear pronoun badges displayed proudly across the platform.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-200">
                    <strong>Multi-intent Badges:</strong> Looking for Friendship, Dating, Community, or Networking? Choose all that apply.
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Feature Card */}
            <div className="p-8 rounded-3xl glass-card border border-purple-500/30 relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-lg">
                    P
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Community Values</h4>
                    <p className="text-xs text-slate-400">Zero tolerance for bigotry & harassment</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <div className="flex items-center justify-between text-purple-300 font-medium">
                    <span>Safety Standard</span>
                    <span>100% Human Reviewed</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Every report is reviewed by platform moderators. We protect queer spaces through proactive monitoring and user-controlled blocking.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {['Non-binary', 'Trans Pride', 'They/Them', 'Friendship', 'Safe Dating', '18+ Verified'].map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SAFETY & PRIVACY HIGHLIGHTS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">Your Safety First</span>
          <h2 className="text-3xl font-bold text-white mt-2">Privacy You Control</h2>
          <p className="text-sm text-slate-400 mt-3">
            You decide what you share, who sees it, and when to pause.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Strictly 18+</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Date of birth is verified upon registration to ensure an adult-only platform. Full birth dates are strictly private and never displayed publicly.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Contact Visibility Toggles</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              WhatsApp numbers and Instagram accounts are strictly optional. You can hide or show your links with a single click at any time.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">One-Click Block & Report</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Block any profile to immediately remove them from your discovery results symmetrically. Report inappropriate conduct directly to our moderation team.
            </p>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-t from-slate-950 via-purple-950/30 to-slate-950 border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to find your people?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Join a welcoming community of real people discovering meaningful connections every day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm shadow-xl shadow-purple-600/30 transition-all hover:scale-105"
            >
              Join PRISM Today
            </Link>
            <Link
              to="/discover"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm transition-all"
            >
              Browse as Guest
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
