import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { Profile, ProfilesResponse } from '../types';
import { ProfileCard } from '../components/ProfileCard';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Sparkles,
} from 'lucide-react';

const GENDER_OPTIONS = [
  'All',
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

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  // Search State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedGender, setSelectedGender] = useState(searchParams.get('gender') || 'All');
  const [selectedLookingFor, setSelectedLookingFor] = useState<string[]>(
    searchParams.get('lookingFor') ? searchParams.get('lookingFor')!.split(',') : []
  );
  const [minAge, setMinAge] = useState<number>(Number(searchParams.get('minAge')) || 18);
  const [maxAge, setMaxAge] = useState<number>(Number(searchParams.get('maxAge')) || 65);
  const [locationQuery, setLocationQuery] = useState(searchParams.get('location') || '');
  const [isVerifiedOnly, setIsVerifiedOnly] = useState<boolean>(searchParams.get('isVerified') === 'true');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState<number>(Number(searchParams.get('page')) || 1);

  // Data & Loading State
  const [data, setData] = useState<ProfilesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [savedProfileIds, setSavedProfileIds] = useState<Set<string>>(new Set());

  // Debounced fetch handler
  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (selectedGender && selectedGender !== 'All') params.set('gender', selectedGender);
      if (selectedLookingFor.length > 0) params.set('lookingFor', selectedLookingFor.join(','));
      if (minAge > 18) params.set('minAge', minAge.toString());
      if (maxAge < 65) params.set('maxAge', maxAge.toString());
      if (locationQuery.trim()) params.set('location', locationQuery.trim());
      if (isVerifiedOnly) params.set('isVerified', 'true');
      params.set('sort', sortBy);
      params.set('page', currentPage.toString());
      params.set('limit', '16');

      setSearchParams(params, { replace: true });

      const res = await api.get<ProfilesResponse>(`/profiles?${params.toString()}`);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedGender, selectedLookingFor, minAge, maxAge, locationQuery, isVerifiedOnly, sortBy, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProfiles();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchProfiles]);

  // Load user saved profiles if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      api
        .get<Profile[]>('/interactions/saved')
        .then((saved) => {
          if (Array.isArray(saved)) {
            setSavedProfileIds(new Set(saved.map((p) => p.id)));
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const toggleSaveProfile = async (profileId: string) => {
    if (!isAuthenticated) {
      alert('Please create a free account or log in to save favorite profiles.');
      return;
    }

    const isCurrentlySaved = savedProfileIds.has(profileId);
    try {
      if (isCurrentlySaved) {
        await api.delete(`/interactions/${profileId}/save`);
        setSavedProfileIds((prev) => {
          const next = new Set(prev);
          next.delete(profileId);
          return next;
        });
      } else {
        await api.post(`/interactions/${profileId}/save`);
        setSavedProfileIds((prev) => new Set(prev).add(profileId));
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleLookingForToggle = (tag: string) => {
    setSelectedLookingFor((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedGender('All');
    setSelectedLookingFor([]);
    setMinAge(18);
    setMaxAge(65);
    setLocationQuery('');
    setIsVerifiedOnly(false);
    setSortBy('newest');
    setCurrentPage(1);
  };

  const filterSidebar = (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <SlidersHorizontal className="w-4 h-4 text-purple-400" />
          <span>Filters</span>
        </div>
        <button
          onClick={handleClearFilters}
          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Gender Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Gender Identity
        </label>
        <div className="flex flex-wrap gap-1.5">
          {GENDER_OPTIONS.map((g) => (
            <button
              key={g}
              onClick={() => {
                setSelectedGender(g);
                setCurrentPage(1);
              }}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                selectedGender === g
                  ? 'bg-purple-600 border-purple-500 text-white font-medium shadow-sm'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Looking For Multi-Select */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Looking For
        </label>
        <div className="flex flex-wrap gap-1.5">
          {LOOKING_FOR_OPTIONS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleLookingForToggle(tag)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                selectedLookingFor.includes(tag)
                  ? 'bg-pink-600 border-pink-500 text-white font-medium shadow-sm'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Age Range Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <span>Age Range</span>
          <span className="text-purple-400 normal-case font-bold">{minAge} — {maxAge}+</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={18}
            max={65}
            value={minAge}
            onChange={(e) => {
              const val = Math.min(Number(e.target.value), maxAge);
              setMinAge(val);
              setCurrentPage(1);
            }}
            className="w-full accent-purple-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
          />
          <input
            type="range"
            min={18}
            max={65}
            value={maxAge}
            onChange={(e) => {
              const val = Math.max(Number(e.target.value), minAge);
              setMaxAge(val);
              setCurrentPage(1);
            }}
            className="w-full accent-purple-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
          />
        </div>
      </div>

      {/* Location Filter */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Location
        </label>
        <input
          type="text"
          value={locationQuery}
          onChange={(e) => {
            setLocationQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="e.g. Brooklyn, Austin, Berlin..."
          className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Verified Only Toggle */}
      <div className="pt-2 border-t border-slate-800">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-slate-200">Verified Profiles Only</span>
          </div>
          <input
            type="checkbox"
            checked={isVerifiedOnly}
            onChange={(e) => {
              setIsVerifiedOnly(e.target.checked);
              setCurrentPage(1);
            }}
            className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-purple-500"
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-['Outfit']">
            Discover Community
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse authentic profiles, filter by identity and intentions, and connect safely.
          </p>
        </div>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm font-medium"
        >
          <Filter className="w-4 h-4 text-purple-400" />
          <span>Filters</span>
          {(selectedGender !== 'All' || selectedLookingFor.length > 0 || isVerifiedOnly) && (
            <span className="w-2 h-2 rounded-full bg-purple-500" />
          )}
        </button>
      </div>

      {/* Main Grid: Sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 p-5 rounded-2xl glass-card border border-slate-800/80 h-fit sticky top-24">
          {filterSidebar}
        </aside>

        {/* Profiles Results Column */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Search & Sort Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full flex-grow">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name or bio keywords..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="w-full sm:w-auto flex items-center gap-2">
              <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-44 px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="updated">Recently Active</option>
                <option value="alphabetical">Name (A–Z)</option>
              </select>
            </div>
          </div>

          {/* Active Filter Tags */}
          {(selectedGender !== 'All' || selectedLookingFor.length > 0 || isVerifiedOnly || locationQuery) && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Active:</span>
              {selectedGender !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {selectedGender}
                  <button onClick={() => setSelectedGender('All')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedLookingFor.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30"
                >
                  {tag}
                  <button onClick={() => handleLookingForToggle(tag)}><X className="w-3 h-3" /></button>
                </span>
              ))}
              {isVerifiedOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Verified
                  <button onClick={() => setIsVerifiedOnly(false)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {locationQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {locationQuery}
                  <button onClick={() => setLocationQuery('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={handleClearFilters}
                className="text-xs text-slate-400 hover:text-white underline ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Loading Skeletons */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl glass-card overflow-hidden animate-pulse">
                  <div className="aspect-[4/5] bg-slate-900" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-slate-800 rounded w-1/2" />
                    <div className="h-3 bg-slate-800 rounded w-3/4" />
                    <div className="h-8 bg-slate-800 rounded mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : data && data.profiles.length > 0 ? (
            <>
              {/* Results Count */}
              <div className="text-xs text-slate-400 font-medium">
                Showing {data.profiles.length} of {data.total} profiles
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.profiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    onToggleSave={toggleSaveProfile}
                    isSaved={savedProfileIds.has(profile.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-8 pb-4">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <span className="text-xs text-slate-400 font-medium">
                    Page <strong className="text-white">{currentPage}</strong> of{' '}
                    <strong className="text-white">{data.totalPages}</strong>
                  </span>

                  <button
                    disabled={currentPage >= data.totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(data.totalPages, p + 1))}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-16 px-4 rounded-3xl glass-card border border-slate-800 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">No Profiles Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                We couldn't find any profiles matching your current search criteria. Try relaxing your filters or exploring different identities.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xs h-full bg-slate-950 border-l border-slate-800 p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-base font-bold text-white">Filter Profiles</span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterSidebar}
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-lg shadow-purple-600/20"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
