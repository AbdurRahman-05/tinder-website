import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { ReportItem } from '../../types';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  ShieldBan,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionOnProfile, setActionOnProfile] = useState<'NONE' | 'BLOCK'>('NONE');
  const [actionStatus, setActionStatus] = useState<'RESOLVED' | 'DISMISSED' | 'REVIEWING'>('RESOLVED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      const res = await api.get(`/admin/reports?${params.toString()}`);
      if (res && res.reports) {
        setReports(res.reports);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleOpenTriage = (report: ReportItem) => {
    setSelectedReport(report);
    setResolutionNotes(report.resolutionNotes || '');
    setActionOnProfile('NONE');
    setActionStatus('RESOLVED');
  };

  const handleSubmitResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setIsSubmitting(true);
    try {
      await api.put(`/admin/reports/${selectedReport.id}`, {
        status: actionStatus,
        resolutionNotes,
        actionOnProfile: actionOnProfile === 'BLOCK' ? 'BLOCK' : undefined,
      });
      setSelectedReport(null);
      fetchReports();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Outfit']">Abuse Reports Triage</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review community safety reports, take disciplinary actions, or dismiss benign flags.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending Only</option>
          <option value="REVIEWING">In Review</option>
          <option value="RESOLVED">Resolved</option>
          <option value="DISMISSED">Dismissed</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Reported Profile</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reported On</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Loading reports...
                  </td>
                </tr>
              ) : reports.length > 0 ? (
                reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* Reported Profile */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                          <img
                            src={r.profile?.photos?.[0]?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.profile?.name || 'User')}`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="font-bold text-white block">{r.profile?.name}</span>
                          <span className="text-[10px] text-slate-500">{r.profile?.gender}</span>
                        </div>
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        {r.reason.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-slate-400 text-xs truncate">
                        {r.description || 'No additional comment provided.'}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          r.status === 'PENDING'
                            ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                            : r.status === 'REVIEWING'
                            ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                            : r.status === 'RESOLVED'
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {r.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {r.status === 'RESOLVED' && <CheckCircle className="w-3 h-3" />}
                        {r.status === 'DISMISSED' && <XCircle className="w-3 h-3" />}
                        <span>{r.status}</span>
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenTriage(r)}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-colors"
                      >
                        Triage Report
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No reports found for this filter. Platform is clean!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Triage Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="max-w-lg w-full rounded-2xl glass-card border border-slate-700 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>Moderate Report #{selectedReport.id.slice(-6)}</span>
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Target Profile:</span>
                <span className="font-bold text-white">{selectedReport.profile?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Reported Category:</span>
                <span className="text-rose-400 font-semibold">{selectedReport.reason}</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 block mb-1">User Comment:</span>
                <p className="text-slate-200 italic">
                  "{selectedReport.description || 'No comment.'}"
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitResolution} className="space-y-4 text-xs">
              {/* Status Decision */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Moderation Decision</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionStatus('RESOLVED')}
                    className={`py-2 rounded-xl border font-semibold ${
                      actionStatus === 'RESOLVED'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Resolve
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionStatus('REVIEWING')}
                    className={`py-2 rounded-xl border font-semibold ${
                      actionStatus === 'REVIEWING'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    In Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionStatus('DISMISSED')}
                    className={`py-2 rounded-xl border font-semibold ${
                      actionStatus === 'DISMISSED'
                        ? 'bg-slate-800 border-slate-600 text-slate-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              {/* Action On Profile */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Action On Target Profile</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionOnProfile('NONE')}
                    className={`py-2 rounded-xl border font-semibold ${
                      actionOnProfile === 'NONE'
                        ? 'bg-slate-800 border-purple-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    No Direct Penalty
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionOnProfile('BLOCK')}
                    className={`py-2 rounded-xl border font-semibold ${
                      actionOnProfile === 'BLOCK'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    🚫 Block Target Profile
                  </button>
                </div>
              </div>

              {/* Resolution Notes */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Resolution Notes (Logged for Audit)</label>
                <textarea
                  rows={2}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Warning issued / Profile investigated and determined safe..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md shadow-purple-600/20"
                >
                  {isSubmitting ? 'Saving...' : 'Apply Moderation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
