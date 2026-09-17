import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { CreateEventModal } from '../../components/CreateEventModal';
import {
  Calendar,
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
  MapPin,
  Tag,
  Clock,
  FileText,
  Users,
} from 'lucide-react';

interface EventStats {
  totalEvents: number;
  activeEvents: number;
  blockedEvents: number;
  categoryCounts: Record<string, number>;
}

const CATEGORY_LIST = [
  'All',
  'Party',
  'Meetup',
  'Outing',
  'Club Night',
  'Workshop',
  'Other',
];

export const AdminEventsPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [events, setEvents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<EventStats | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'All');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (categoryFilter !== 'All') params.set('category', categoryFilter);
      params.set('page', page.toString());
      params.set('limit', '15');

      const data = await api.get(`/admin/events?${params.toString()}`);
      if (data) {
        setEvents(data.events || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err: any) {
      console.error('Failed to load admin events:', err);
      setActionMessage(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
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
      setSelectedIds(new Set(events.map((ev) => ev.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleBlock = async (id: string, currentStatus: string) => {
    const actionName = currentStatus === 'CANCELLED' ? 'Reactivate' : 'Block';
    if (!confirm(`Are you sure you want to ${actionName.toLowerCase()} this event?`)) return;
    try {
      const res = await api.post(`/admin/events/${id}/block`);
      setActionMessage(res.message || `Event ${actionName.toLowerCase()}ed successfully`);
      fetchEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to update event status');
    }
  };

  const handleToggleFeature = async (id: string) => {
    try {
      const res = await api.post(`/admin/events/${id}/feature`);
      setActionMessage(res.message || 'Feature status updated');
      fetchEvents();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    const confirmDelete = confirm(
      `PERMANENTLY DELETE event "${title}"?\n\nThis will remove the event from the site and database. This cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/admin/events/${id}`);
      setActionMessage(`Event "${title}" permanently deleted from database`);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      fetchEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to delete event');
    }
  };

  const handleBatchBlock = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Block/Cancel all ${selectedIds.size} selected event(s)?`)) return;
    try {
      const res = await api.post('/admin/events/batch-block', { ids: Array.from(selectedIds) });
      setActionMessage(res.message || `Successfully blocked ${selectedIds.size} event(s)`);
      setSelectedIds(new Set());
      fetchEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to batch block events');
    }
  };

  const handleBatchUnblock = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Reactivate all ${selectedIds.size} selected event(s)?`)) return;
    try {
      const res = await api.post('/admin/events/batch-unblock', { ids: Array.from(selectedIds) });
      setActionMessage(res.message || `Successfully reactivated ${selectedIds.size} event(s)`);
      setSelectedIds(new Set());
      fetchEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to batch reactivate events');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    const confirmDelete = confirm(
      `PERMANENTLY DELETE ${selectedIds.size} selected event(s)?\n\nWARNING: This will completely wipe these events from the database. This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      const res = await api.post('/admin/events/batch-delete', { ids: Array.from(selectedIds) });
      setActionMessage(res.message || `Permanently deleted ${selectedIds.size} event(s)`);
      setSelectedIds(new Set());
      fetchEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to batch delete events');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setCategoryFilter('All');
    setPage(1);
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
            Admin Event Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor community gatherings, view category counts, block or reactivate listings, and manage RSVPs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchEvents()}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-purple-500/40 transition-colors"
            title="Refresh events list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-500 hover:to-rose-400 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Create Admin Event</span>
          </button>
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

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Total Events */}
        <div className="p-4 rounded-2xl glass-card border border-purple-500/30 bg-purple-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-300">Total Events</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {stats?.totalEvents ?? total}
          </div>
          <span className="text-[10px] text-purple-400/80 mt-0.5 block font-medium">
            All database listings
          </span>
        </div>

        {/* Active Events */}
        <div className="p-4 rounded-2xl glass-card border border-emerald-500/30 bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-300">Active / Published</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {stats?.activeEvents ?? 0}
          </div>
          <span className="text-[10px] text-emerald-400/80 mt-0.5 block font-medium">
            Visible in public events
          </span>
        </div>

        {/* Blocked Events */}
        <div className="p-4 rounded-2xl glass-card border border-rose-500/30 bg-rose-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-300">Blocked / Cancelled</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center">
              <ShieldBan className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {stats?.blockedEvents ?? 0}
          </div>
          <span className="text-[10px] text-rose-400/80 mt-0.5 block font-medium">
            Hidden from directory
          </span>
        </div>

        {/* Featured Events */}
        <div className="p-4 rounded-2xl glass-card border border-amber-500/30 bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-300">Featured Events</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {events.filter((e) => e.isFeatured).length}
          </div>
          <span className="text-[10px] text-amber-400/80 mt-0.5 block font-medium">
            Highlighted showcase
          </span>
        </div>
      </div>

      {/* 3. Category Count Filters Section */}
      <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
            <Tag className="w-4 h-4" />
            <span>Filter by Event Category & Live Counts</span>
          </div>
          {(statusFilter !== 'ALL' || categoryFilter !== 'All' || searchQuery) && (
            <button
              onClick={resetFilters}
              className="text-xs text-purple-400 hover:text-pink-300 underline underline-offset-2"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Category Pills with Live Counts */}
        <div className="flex flex-wrap gap-2">
          {CATEGORY_LIST.map((cat) => {
            const count =
              cat === 'All'
                ? stats?.totalEvents ?? total
                : stats?.categoryCounts?.[cat] || 0;
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

        {/* Search Bar & Dropdown Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-800/80">
          {/* Search Query */}
          <form onSubmit={handleSearchSubmit} className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event title, location, host, or description..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
            />
          </form>

          {/* Status Filter */}
          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">All Statuses ({stats?.totalEvents ?? total})</option>
              <option value="ACTIVE">Active / Published ({stats?.activeEvents ?? 0})</option>
              <option value="CANCELLED">Blocked / Cancelled ({stats?.blockedEvents ?? 0})</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Events Database Table */}
      <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <span className="text-xs font-semibold text-slate-300">
            Showing {events.length} of {total} events
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
                    checked={events.length > 0 && events.every((ev) => selectedIds.has(ev.id))}
                    onChange={handleSelectAll}
                    title="Select/Deselect all on this page"
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-900 cursor-pointer accent-purple-600"
                  />
                </th>
                <th className="py-3.5 px-4">Event Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Direct RSVP / Contact</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Badges</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    <div className="w-8 h-8 mx-auto border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <span>Loading events database...</span>
                  </td>
                </tr>
              ) : events.length > 0 ? (
                events.map((ev) => {
                  const isCancelled = ev.status === 'CANCELLED';
                  const isSelected = selectedIds.has(ev.id);

                  return (
                    <tr
                      key={ev.id}
                      className={`hover:bg-slate-900/50 transition-colors ${
                        isSelected
                          ? 'bg-purple-950/25 border-l-2 border-l-purple-500'
                          : isCancelled
                          ? 'bg-rose-950/15 opacity-75'
                          : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(ev.id)}
                          className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-900 cursor-pointer accent-purple-600"
                        />
                      </td>

                      {/* Event Cover & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800 shadow-md">
                            <img
                              src={
                                ev.imageUrl ||
                                'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80'
                              }
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm line-clamp-1 max-w-xs">
                              {ev.title}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-purple-400 mt-0.5">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[180px]">{ev.location}</span>
                            </div>
                            {ev.creatorName && (
                              <span className="text-[10px] text-slate-500 block">
                                Host: {ev.creatorName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                          {ev.category}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-200 block">
                            {formatDate(ev.date)}
                          </span>
                          {ev.time ? (
                            <span className="text-[11px] text-slate-400 block font-mono">
                              {ev.time}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-600 block">All Day</span>
                          )}
                        </div>
                      </td>

                      {/* Contact & RSVP Channels */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          {ev.googleFormUrl && (
                            <a
                              href={ev.googleFormUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                              title="Google Form RSVP link"
                            >
                              <FileText className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate max-w-[130px]">Google Form RSVP</span>
                            </a>
                          )}

                          {ev.whatsapp && (
                            <a
                              href={`https://wa.me/${ev.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono"
                              title="WhatsApp Coordinator"
                            >
                              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{ev.whatsapp}</span>
                            </a>
                          )}

                          {ev.instagram && (
                            <a
                              href={`https://instagram.com/${ev.instagram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-pink-400 hover:text-pink-300 font-mono"
                              title="Instagram Profile"
                            >
                              <span className="text-pink-400 font-bold">@</span>
                              <span>{ev.instagram.replace('@', '')}</span>
                            </a>
                          )}

                          {!ev.googleFormUrl && !ev.whatsapp && !ev.instagram && (
                            <span className="text-[10px] text-slate-600">No contact channels</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            ev.status === 'ACTIVE'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {ev.status === 'CANCELLED' ? 'BLOCKED' : ev.status}
                        </span>
                      </td>

                      {/* Badges */}
                      <td className="py-3.5 px-4">
                        {ev.isFeatured ? (
                          <span
                            className="p-1 rounded-md bg-purple-500/20 text-purple-400 inline-flex items-center gap-1 text-[10px] font-bold"
                            title="Featured Event"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Featured</span>
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Block / Reactivate Toggle */}
                          <button
                            onClick={() => handleToggleBlock(ev.id, ev.status)}
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              isCancelled
                                ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                : 'bg-rose-500/10 hover:bg-rose-600 border-rose-500/30 hover:border-rose-500 text-rose-300 hover:text-white'
                            }`}
                            title={isCancelled ? 'Reactivate event' : 'Block / Cancel event'}
                          >
                            <ShieldBan className="w-3.5 h-3.5" />
                            <span>{isCancelled ? 'Reactivate' : 'Block'}</span>
                          </button>

                          {/* Feature Toggle */}
                          <button
                            onClick={() => handleToggleFeature(ev.id)}
                            title={ev.isFeatured ? 'Remove featured' : 'Mark as featured'}
                            className={`p-1.5 rounded-lg border text-xs transition-colors ${
                              ev.isFeatured
                                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-purple-300'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>

                          {/* Public View Link */}
                          <Link
                            to="/events"
                            target="_blank"
                            title="View public events page"
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteEvent(ev.id, ev.title)}
                            title="Permanently delete event"
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
                      No events found matching selected filters.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="text-xs text-purple-400 hover:text-pink-300 underline"
                    >
                      Clear filters to view all events
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
              title="Block all selected events"
            >
              <ShieldBan className="w-3.5 h-3.5" />
              <span>Batch Block</span>
            </button>

            {/* Batch Reactivate */}
            <button
              onClick={handleBatchUnblock}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-600 border border-emerald-500/40 hover:border-emerald-500 text-emerald-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Reactivate all selected events"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Batch Reactivate</span>
            </button>

            {/* Batch Delete (Permanent) */}
            <button
              onClick={handleBatchDelete}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/30"
              title="Permanently delete selected events"
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

      {/* 7. Create Admin Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={fetchEvents}
      />
    </div>
  );
};
