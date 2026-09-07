import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  AlertCircle,
} from 'lucide-react';

export const AdminProfilesPage: React.FC = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      params.set('page', page.toString());
      params.set('limit', '20');

      const data = await api.get(`/admin/profiles?${params.toString()}`);
      if (data) {
        setProfiles(data.profiles || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProfiles();
  };

  const handleToggleVerify = async (id: string) => {
    try {
      const res = await api.post(`/admin/profiles/${id}/verify`);
      setActionMessage(res.message || 'Verification updated');
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

  const handleToggleBlock = async (id: string) => {
    if (!confirm('Are you sure you want to change the block status of this profile?')) return;
    try {
      const res = await api.post(`/admin/profiles/${id}/block`);
      setActionMessage(res.message || 'Block status changed');
      fetchProfiles();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Permanently soft-delete this profile? This hides the profile from discovery.')) return;
    try {
      await api.delete(`/admin/profiles/${id}`);
      setActionMessage('Profile soft deleted');
      fetchProfiles();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Outfit']">Profile Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, moderate, verify, feature, or block community profiles.
          </p>
        </div>

        <Link
          to="/admin/profiles/create"
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-purple-600/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Admin Profile</span>
        </Link>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-grow">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by profile name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="BLOCKED">Blocked</option>
          <option value="DELETED">Deleted</option>
        </select>
      </div>

      {/* Profiles Data Table */}
      <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Profile</th>
                <th className="py-3 px-4">Gender & Identity</th>
                <th className="py-3 px-4">Looking For</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Badges</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading profiles database...
                  </td>
                </tr>
              ) : profiles.length > 0 ? (
                profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* Profile & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                          <img
                            src={p.photos?.[0]?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            <span>{p.name}</span>
                            <span className="text-slate-400 font-normal">({p.age})</span>
                          </div>
                          <span className="text-[11px] text-slate-500 truncate max-w-[150px] block">
                            {p.user?.email || (p.createdByAdmin ? 'Admin Created' : 'No Email')}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Gender */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-200">{p.gender}</span>
                      {p.pronouns && (
                        <span className="text-[11px] text-slate-500 block">{p.pronouns}</span>
                      )}
                    </td>

                    {/* Looking for */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {p.lookingFor?.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-900 text-[10px] text-slate-300 border border-slate-800">
                            {tag}
                          </span>
                        ))}
                        {p.lookingFor?.length > 2 && (
                          <span className="text-[10px] text-slate-500">+{p.lookingFor.length - 2}</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          p.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : p.status === 'BLOCKED'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    {/* Badges */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {p.isVerified && (
                          <span className="p-1 rounded bg-emerald-500/20 text-emerald-400" title="Verified">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {p.isFeatured && (
                          <span className="p-1 rounded bg-purple-500/20 text-purple-400" title="Featured">
                            <Sparkles className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {!p.isVerified && !p.isFeatured && (
                          <span className="text-slate-600">—</span>
                        )}
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
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

                        <button
                          onClick={() => handleToggleFeature(p.id)}
                          title={p.isFeatured ? 'Remove from featured' : 'Feature profile'}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            p.isFeatured
                              ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-purple-300'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleBlock(p.id)}
                          title={p.status === 'BLOCKED' ? 'Unblock profile' : 'Block profile'}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            p.status === 'BLOCKED'
                              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-300'
                          }`}
                        >
                          <ShieldBan className="w-3.5 h-3.5" />
                        </button>

                        <Link
                          to={`/profile/${p.id}`}
                          target="_blank"
                          title="View public profile"
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleDeleteProfile(p.id)}
                          title="Soft delete profile"
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No profiles found matching search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
