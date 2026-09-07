import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { AdminDashboardData } from '../../types';
import {
  Users,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  EyeOff,
  ShieldBan,
  TrendingUp,
  UserPlus,
  ArrowUpRight,
  PieChart,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get<AdminDashboardData>('/admin/dashboard');
        setData(res);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-900 rounded-lg w-48 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl glass-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { kpi, charts } = data;

  const kpiCards = [
    { title: 'Total Registered Users', value: kpi.totalUsers, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/15' },
    { title: 'Total Profiles', value: kpi.totalProfiles, icon: UserCheck, color: 'text-blue-400', bg: 'bg-blue-500/15' },
    { title: 'Active Public Profiles', value: kpi.activeProfiles, icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    { title: 'Hidden Profiles', value: kpi.hiddenProfiles, icon: EyeOff, color: 'text-amber-400', bg: 'bg-amber-500/15' },
    { title: 'Blocked Profiles', value: kpi.blockedProfiles, icon: ShieldBan, color: 'text-rose-400', bg: 'bg-rose-500/15' },
    { title: 'Pending Abuse Reports', value: kpi.pendingReports, icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/15', link: '/admin/reports' },
    { title: 'New Users Today', value: kpi.newUsersToday, icon: UserPlus, color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
    { title: 'New Profiles Today', value: kpi.newProfilesToday, icon: TrendingUp, color: 'text-pink-400', bg: 'bg-pink-500/15' },
  ];

  const maxGenderCount = Math.max(...charts.genderDistribution.map((g) => g.count), 1);
  const maxLookingForCount = Math.max(...charts.lookingForDistribution.map((l) => l.count), 1);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-['Outfit']">
            Admin Overview & Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time PostgreSQL metrics and moderation overview across PRISM.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/reports"
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Review Pending Reports ({kpi.pendingReports})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl glass-card border border-slate-800 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{card.title}</span>
                <div className={`w-8 h-8 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white tracking-tight">{card.value}</span>
                {card.link && (
                  <Link to={card.link} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-0.5">
                    <span>Manage</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gender Identity Distribution */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
              Gender Spectrum Distribution
            </h3>
            <span className="text-xs text-slate-500 font-medium">Real DB counts</span>
          </div>

          <div className="space-y-3 pt-2">
            {charts.genderDistribution.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.name}</span>
                  <span className="text-purple-400 font-bold">{item.count}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${(item.count / maxGenderCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Looking For Intentions */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-pink-400">
              Looking-For Categories
            </h3>
            <span className="text-xs text-slate-500 font-medium">Multi-intent tags</span>
          </div>

          <div className="space-y-3 pt-2">
            {charts.lookingForDistribution.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.name}</span>
                  <span className="text-pink-400 font-bold">{item.count}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${(item.count / maxLookingForCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Age Groups */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">
            Age Bracket Breakdown (18+)
          </h3>
          <div className="grid grid-cols-5 gap-3 pt-2">
            {charts.ageDistribution.map((item) => (
              <div key={item.range} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
                <span className="text-xs text-slate-400 font-semibold block">{item.range}</span>
                <span className="text-lg font-bold text-white block">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reports Status */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
            Moderation Reports Pipeline
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {charts.reportStats.map((item) => (
              <div key={item.status} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">{item.status}</span>
                <span className="text-lg font-bold text-white block">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
