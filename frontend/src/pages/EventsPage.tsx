import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { CreateEventModal } from '../components/CreateEventModal';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  MessageCircle,
  FileText,
  PlusCircle,
  Search,
  Users,
  ExternalLink,
  Share2,
  CheckCircle2,
} from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time?: string;
  location: string;
  isVirtual: boolean;
  virtualLink?: string;
  imageUrl?: string;
  whatsapp?: string;
  instagram?: string;
  googleFormUrl?: string;
  websiteUrl?: string;
  creatorName?: string;
  isFeatured: boolean;
}

const CATEGORY_TABS = [
  { label: 'All Events', value: 'ALL' },
  { label: 'Parties 🎉', value: 'Party' },
  { label: 'Meetups ☕', value: 'Meetup' },
  { label: 'Outings 🌄', value: 'Outing' },
  { label: 'Club Nights 🪩', value: 'Club Night' },
  { label: 'Workshops 💡', value: 'Workshop' },
];

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'ALL') params.set('category', activeCategory);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());

      const res = await api.get(`/events?${params.toString()}`);
      if (res && res.events) {
        setEvents(res.events);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleShare = (event: EventItem) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `${event.title} - ${new Date(event.date).toLocaleDateString()} @ ${event.location}\nRSVP link: ${event.googleFormUrl || window.location.href}`
      );
      setCopiedId(event.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 border border-purple-500/20 bg-gradient-to-br from-purple-950/40 via-slate-900/60 to-pink-950/30 backdrop-blur-xl shadow-2xl">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>PRISM Community Gatherings & Events</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-['Outfit']">
              LGBTQ+ Parties, Meetups & Outings
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Find safe, vibrant, and inclusive community events. RSVP directly via Google Forms,
              chat with hosts on WhatsApp, or connect on Instagram!
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-500 hover:to-rose-400 text-white text-sm font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Launch an Event</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-slate-800">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveCategory(tab.value)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                  activeCategory === tab.value
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-transparent text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-purple-500/40 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event, venue, host..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Event Cards Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 mx-auto border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-slate-400">Loading community events...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="group rounded-3xl glass-card border border-slate-800 hover:border-purple-500/40 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-purple-950/50 hover:-translate-y-1"
              >
                {/* Event Image Banner */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
                  <img
                    src={
                      ev.imageUrl ||
                      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80'
                    }
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-purple-500/30 text-purple-300 text-[11px] font-bold uppercase tracking-wider">
                      {ev.category}
                    </span>
                    {ev.isFeatured && (
                      <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                        Featured ✨
                      </span>
                    )}
                  </div>

                  {/* Date badge on bottom right of image */}
                  <div className="absolute bottom-3 left-3.5 flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-700/80 text-white text-xs font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      <span>{formatDate(ev.date)}</span>
                    </div>
                    {ev.time && (
                      <div className="px-2.5 py-1 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-700/80 text-slate-300 text-xs font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-pink-400" />
                        <span>{ev.time}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1 font-['Outfit']">
                      {ev.title}
                    </h3>

                    {/* Venue Location */}
                    <div className="flex items-start gap-1.5 text-xs text-slate-400">
                      <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{ev.location}</span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300/90 line-clamp-3 leading-relaxed">
                      {ev.description}
                    </p>

                    {/* Organizer name */}
                    {ev.creatorName && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>Host: <strong className="text-slate-200">{ev.creatorName}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Direct Contact & RSVP Action Buttons */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    {/* Google Form RSVP Button (Primary CTA if available) */}
                    {ev.googleFormUrl ? (
                      <a
                        href={ev.googleFormUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all hover:scale-[1.01]"
                      >
                        <FileText className="w-4 h-4" />
                        <span>RSVP via Google Form</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : null}

                    {/* WhatsApp & Instagram Direct Channels */}
                    <div className="grid grid-cols-2 gap-2">
                      {ev.whatsapp ? (
                        <a
                          href={`https://wa.me/${ev.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Hi! I saw your event "${ev.title}" on PRISM and would love more details / to RSVP!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                          title="Chat with host on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">WhatsApp</span>
                        </a>
                      ) : (
                        <div className="py-2 px-3 rounded-xl bg-slate-900/50 border border-slate-800/60 text-slate-600 text-xs flex items-center justify-center">
                          <span>No WhatsApp</span>
                        </div>
                      )}

                      {ev.instagram ? (
                        <a
                          href={`https://instagram.com/${ev.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 hover:border-pink-500/50 text-pink-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                          title="View Instagram profile"
                        >
                          <svg className="w-3.5 h-3.5 fill-pink-400 shrink-0" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          <span className="truncate">Instagram</span>
                        </a>
                      ) : (
                        <div className="py-2 px-3 rounded-xl bg-slate-900/50 border border-slate-800/60 text-slate-600 text-xs flex items-center justify-center">
                          <span>No Instagram</span>
                        </div>
                      )}
                    </div>

                    {/* Share Button */}
                    <button
                      onClick={() => handleShare(ev)}
                      className="w-full py-1.5 text-center text-[11px] text-slate-400 hover:text-purple-300 flex items-center justify-center gap-1 transition-colors"
                    >
                      {copiedId === ev.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Event info copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share event link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center rounded-3xl glass-card border border-slate-800 p-8 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">No Events Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No upcoming events in this category yet. Be the first to host a party, meetup, or outing!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold shadow-lg shadow-purple-600/30"
            >
              + Host the First Event
            </button>
          </div>
        )}
      </div>

      {/* Launch Event Modal */}
      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEventCreated={fetchEvents}
      />
    </div>
  );
};
