import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import {
  Users,
  Search,
  CheckCircle2,
  Sparkles,
  ShieldBan,
  Trash2,
  ExternalLink,
  PlusCircle,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  UserCheck,
  EyeOff,
  Filter,
  Tag,
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalProfiles: number;
  activeProfiles: number;
  blockedProfiles: number;
  deletedProfiles: number;
  lookingForCounts: Record<string, number>;
  genderCounts: Record<string, number>;
}

const CATEGORY_LIST = [
  'All',
  'Friendship',
  'Dating',
  'Relationship',
  'Community',
  'Networking',
  'Chatting',
];

const GENDER_LIST = [
  'All',
  'Woman',
  'Man',
  'Non-binary',
  'Trans woman',
  'Trans man',
  'Genderqueer',
  'Genderfluid',
  'Agender',
  'Other',
];

export const AdminProfilesPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filters initialized from URL parameters if present
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('lookingFor') || 'All');
  const [genderFilter, setGenderFilter] = useState(searchParams.get('gender') || 'All');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (categoryFilter !== 'All') params.set('lookingFor', categoryFilter);
      if (genderFilter !== 'All') params.set('gender', genderFilter);
      params.set('page', page.toString());
      params.set('limit', '15');

      const data = await api.get(`/admin/profiles?${params.toString()}`);
      if (data) {
        setProfiles(data.profiles || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err: any) {
      console.error('Failed to load admin profiles:', err);
      setActionMessage(err.message || 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, categoryFilter, genderFilter, searchQuery]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProfiles();
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(profiles.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleBatchBlock = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to BLOCK all ${selectedIds.size} selected profile(s)?`)) return;
    try {
      const res = await api.post('/admin/profiles/batch-block', { ids: Array.from(selectedIds) });
      setActionMessage(res.message || `Successfully blocked ${selectedIds.size} profile(s)`);
      setSelectedIds(new Set());
      fetchProfiles();
    } catch (err: any) {
      alert(err.message || 'Failed to batch block profiles');
    }
  };

  const handleBatchUnblock = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to UNBLOCK all ${selectedIds.size} selected profile(s)?`)) return;
    try {
      const res = await api.post('/admin/profiles/batch-unblock', { ids: Array.from(selectedIds) });
      setActionMessage(res.message || `Successfully unblocked ${selectedIds.size} profile(s)`);
      setSelectedIds(new Set());
      fetchProfiles();
    } catch (err: any) {
      alert(err.message || 'Failed to batch unblock profiles');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    const confirmDelete = confirm(
      `PERMANENTLY DELETE ${selectedIds.size} selected profile(s)?\n\nWARNING: This will completely wipe these profiles and their data from the site and database. This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      const res = await api.post('/admin/profiles/batch-delete', { ids: Array.from(selectedIds) });
      setActionMessage(res.message || `Permanently deleted ${selectedIds.size} profile(s) from database`);
      setSelectedIds(new Set());
      fetchProfiles();
    } catch (err: any) {
      alert(err.message || 'Failed to batch delete profiles');
    }
  };

  const handleToggleBlock = async (id: string, currentStatus: string) => {
    const actionName = currentStatus === 'BLOCKED' ? 'Unblock' : 'Block';
    if (!confirm(`Are you sure you want to ${actionName.toLowerCase()} this profile?`)) return;
    try {
      const res = await api.post(`/admin/profiles/${id}/block`);
      setActionMessage(res.message || `Profile ${actionName.toLowerCase()}ed successfully`);
      fetchProfiles();
    } catch (err: any) {
      alert(err.message || 'Failed to update block status');
    }
  };

  const handleDeleteProfile = async (id: string, profileName: string) => {
    const confirmDelete = confirm(
      `PERMANENTLY DELETE profile "${profileName}"?\n\nThis will completely remove this profile from the site and database. This cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/admin/profiles/${id}`);
      setActionMessage(`Profile "${profileName}" permanently deleted from database`);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      fetchProfiles();
    } catch (err: any) {
      alert(err.message || 'Failed to delete profile');
    }
  };

  const handleToggleVerify = async (id: string) => {
    try {
      const res = await api.post(`/admin/profiles/${id}/verify`);
      setActionMessage(res.message || 'Verification status updated');
      fetchProfiles();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleToggleFeature = async (id: string) => {
    try {
      const res = await api.post(`/admin/profiles/${id}/feature`);
      setActionMessage(res.message || 'Feature status updated');
      fetchProfiles();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setCategoryFilter('All');
    setGenderFilter('All');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
            Admin Profile Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            View all profiles, filter by category counts, manage block status, and delete profiles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchProfiles()}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-purple-500/40 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
          <Link
            to="/admin/profiles/create"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-purple-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Admin Profile</span>
          </Link>
        </div>
      </div>

      {/* Action Notification Message */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-center justify-between shadow-lg">
          <span className="font-medium">{actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-white px-2 py-0.5 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Total User Count & Profiles KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Total Users */}
        <div className="p-4 rounded-2xl glass-card border border-purple-500/30 bg-purple-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-300">Total Users</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {stats?.totalUsers ?? '...'}
          </div>
          <span className="text-[10px] text-purple-400/80 mt-0.5 block font-medium">
            Registered accounts
          </span>
        </div>

        {/* Total Profiles */}
        <div className="p-4 rounded-2xl glass-card border border-blue-500/30 bg-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-300">Total Profiles</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {stats?.totalProfiles ?? total}
          </div>
          <span className="text-[10px] text-blue-400/80 mt-0.5 block font-medium">
            Active in database
          </span>
        </div>

        {/* Active Profiles */}
        <div className="p-4 rounded-2xl glass-card border border-emerald-500/30 bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-300">Active Profiles</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {stats?.activeProfiles ?? 0}
          </div>
          <span className="text-[10px] text-emerald-400/80 mt-0.5 block font-medium">
            Public discovery
          </span>
        </div>

        {/* Blocked Profiles */}
        <div className="p-4 rounded-2xl glass-card border border-rose-500/30 bg-rose-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-300">Blocked Profiles</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center">
              <ShieldBan className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {stats?.blockedProfiles ?? 0}
          </div>
          <span className="text-[10px] text-rose-400/80 mt-0.5 block font-medium">
            Restricted / blocked
          </span>
        </div>
      </div>

      {/* 3. Category Count Filters Section */}
      <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
            <Tag className="w-4 h-4" />
            <span>Filter by Category & Counts</span>
          </div>
          {(statusFilter !== 'ALL' || categoryFilter !== 'All' || genderFilter !== 'All' || searchQuery) && (
            <button
              onClick={resetFilters}
              className="text-xs text-purple-400 hover:text-pink-300 underline underline-offset-2"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Category Pills (Looking For) with Live Counts */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 block">
            Looking For / Intent Category:
          </span>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_LIST.map((cat) => {
              const count =
                cat === 'All'
                  ? stats?.totalProfiles ?? total
                  : stats?.lookingForCounts?.[cat] || 0;
              const isSelected = categoryFilter === cat;

              return (
                <button
                  key={cat}
                  onClick={() => {
                    setCategoryFilter(cat);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-transparent text-white shadow-md shadow-purple-600/25'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-purple-500/40 hover:text-white'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-purple-300 border border-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar & Dropdown Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-800/80">
          {/* Search Query */}
          <form onSubmit={handleSearchSubmit} className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by profile name, email, WhatsApp, or Instagram..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
            />
          </form>

          {/* Gender Filter with Counts */}
          <div className="sm:col-span-3">
            <select
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="All">All Genders</option>
              {GENDER_LIST.filter((g) => g !== 'All').map((g) => (
                <option key={g} value={g}>
                  {g} ({stats?.genderCounts?.[g] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter with Counts */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">All Statuses ({stats?.totalProfiles ?? total})</option>
              <option value="ACTIVE">Active ({stats?.activeProfiles ?? 0})</option>
              <option value="BLOCKED">Blocked ({stats?.blockedProfiles ?? 0})</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Profiles Database Table */}
      <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <span className="text-xs font-semibold text-slate-300">
            Showing {profiles.length} of {total} profiles
          </span>
          <span className="text-xs text-slate-400">
            Page {page} of {totalPages}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={profiles.length > 0 && profiles.every((p) => selectedIds.has(p.id))}
                    onChange={handleSelectAll}
                    title="Select/Deselect all on this page"
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-900 cursor-pointer accent-purple-600"
                  />
                </th>
                <th className="py-3.5 px-4">Profile</th>
                <th className="py-3.5 px-4">Direct Contact</th>
                <th className="py-3.5 px-4">Gender & Identity</th>
                <th className="py-3.5 px-4">Categories</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Badges</th>
                <th className="py-3.5 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    <div className="w-8 h-8 mx-auto border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <span>Loading profiles database...</span>
                  </td>
                </tr>
              ) : profiles.length > 0 ? (
                profiles.map((p) => {
                  const isBlocked = p.status === 'BLOCKED';
                  const isSelected = selectedIds.has(p.id);
                  const primaryPhoto =
                    p.photos?.find((ph: any) => ph.isPrimary)?.url || p.photos?.[0]?.url;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-900/50 transition-colors ${
                        isSelected
                          ? 'bg-purple-950/25 border-l-2 border-l-purple-500'
                          : isBlocked
                          ? 'bg-rose-950/10'
                          : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(p.id)}
                          className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-900 cursor-pointer accent-purple-600"
                        />
                      </td>

                      {/* Profile & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800 shadow-md">
                            <img
                              src={
                                primaryPhoto ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  p.name
                                )}&background=9333ea&color=ffffff`
                              }
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                              <span>{p.name}</span>
                              <span className="text-slate-400 text-xs font-normal">({p.age})</span>
                            </div>
                            <span className="text-[11px] text-slate-400 truncate max-w-[170px] block">
                              {p.user?.email || (p.createdByAdmin ? 'Admin Created' : 'Guest Account')}
                            </span>
                            {p.location && (
                              <span className="text-[10px] text-purple-400 block truncate max-w-[150px]">
                                📍 {p.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Direct Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {p.whatsapp ? (
                            <a
                              href={`https://wa.me/${p.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{p.whatsapp}</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-600 block">No WhatsApp</span>
                          )}

                          {p.instagram ? (
                            <a
                              href={`https://instagram.com/${p.instagram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-pink-400 hover:text-pink-300 font-mono"
                              title="View Instagram"
                            >
                              <svg className="w-3 h-3 fill-current shrink-0" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                              <span>@{p.instagram.replace('@', '')}</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-600 block">No Instagram</span>
                          )}
                        </div>
                      </td>

                      {/* Gender */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-200">{p.gender}</span>
                        {p.pronouns && (
                          <span className="text-[11px] text-slate-400 block">{p.pronouns}</span>
                        )}
                      </td>

                      {/* Looking for Categories */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {p.lookingFor?.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md bg-slate-900 text-[10px] font-medium text-slate-300 border border-slate-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {p.lookingFor?.length > 3 && (
                            <span className="text-[10px] text-purple-400 font-semibold">
                              +{p.lookingFor.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            p.status === 'ACTIVE'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : p.status === 'BLOCKED'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      {/* Badges */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {p.isVerified && (
                            <span
                              className="p-1 rounded-md bg-emerald-500/20 text-emerald-400"
                              title="Verified by Moderation"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {p.isFeatured && (
                            <span
                              className="p-1 rounded-md bg-purple-500/20 text-purple-400"
                              title="Featured Profile"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {!p.isVerified && !p.isFeatured && (
                            <span className="text-slate-600">—</span>
                          )}
                        </div>
                      </td>

                      {/* Moderation Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Block / Unblock Action Button */}
                          <button
                            onClick={() => handleToggleBlock(p.id, p.status)}
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              isBlocked
                                ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                : 'bg-rose-500/10 hover:bg-rose-600 border-rose-500/30 hover:border-rose-500 text-rose-300 hover:text-white'
                            }`}
                            title={isBlocked ? 'Unblock profile' : 'Block profile'}
                          >
                            <ShieldBan className="w-3.5 h-3.5" />
                            <span>{isBlocked ? 'Unblock' : 'Block'}</span>
                          </button>

                          {/* Verify Toggle */}
                          <button
                            onClick={() => handleToggleVerify(p.id)}
                            title={p.isVerified ? 'Remove verification' : 'Verify profile'}
                            className={`p-1.5 rounded-lg border text-xs transition-colors ${
                              p.isVerified
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-emerald-300'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Feature Toggle */}
                          <button
                            onClick={() => handleToggleFeature(p.id)}
                            title={p.isFeatured ? 'Remove featured' : 'Make featured'}
                            className={`p-1.5 rounded-lg border text-xs transition-colors ${
                              p.isFeatured
                                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-purple-300'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>

                          {/* View Profile */}
                          <Link
                            to={`/profile/${p.id}`}
                            target="_blank"
                            title="View public profile"
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete Action Button */}
                          <button
                            onClick={() => handleDeleteProfile(p.id, p.name)}
                            title="Delete profile"
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 space-y-2">
                    <p className="text-sm font-semibold text-slate-400">
                      No profiles found matching selected filters.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="text-xs text-purple-400 hover:text-pink-300 underline"
                    >
                      Clear filters to view all profiles
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/60 text-xs">
            <span className="text-slate-400">
              Page <strong className="text-white">{page}</strong> of{' '}
              <strong className="text-white">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Floating Sticky Multi-Select Batch Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-purple-500/50 shadow-2xl shadow-purple-950/80 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
            <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
              {selectedIds.size}
            </span>
            <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
              Selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Batch Block */}
            <button
              onClick={handleBatchBlock}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-600 border border-amber-500/40 hover:border-amber-500 text-amber-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Block all selected profiles"
            >
              <ShieldBan className="w-3.5 h-3.5" />
              <span>Batch Block</span>
            </button>

            {/* Batch Unblock */}
            <button
              onClick={handleBatchUnblock}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-600 border border-emerald-500/40 hover:border-emerald-500 text-emerald-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Unblock all selected profiles"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Batch Unblock</span>
            </button>

            {/* Batch Delete (Permanent) */}
            <button
              onClick={handleBatchDelete}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/30"
              title="Permanently wipe selected profiles from database"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Batch Delete (Permanent)</span>
            </button>

            {/* Clear Selection */}
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
