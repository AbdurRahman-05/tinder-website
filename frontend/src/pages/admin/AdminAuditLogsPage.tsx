import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { AuditLogItem } from '../../types';
import { ClipboardList, Clock, Shield } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/admin/audit-logs');
        if (res && res.logs) {
          setLogs(res.logs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-['Outfit']">Audit Logs</h1>
        <p className="text-xs text-slate-400 mt-1">
          Chronological record of all administrative and moderation events across the platform.
        </p>
      </div>

      <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Admin</th>
                <th className="py-3 px-4">Target Type</th>
                <th className="py-3 px-4">Target ID</th>
                <th className="py-3 px-4">Metadata</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Loading audit events...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-purple-300">
                      {log.action}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-white">{log.admin?.email}</span>
                      <span className="text-[10px] text-slate-500 block">({log.admin?.role})</span>
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      {log.targetType}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {log.targetId.slice(0, 10)}...
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
                    </td>

                    <td className="py-3 px-4 text-right text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    No audit logs recorded yet.
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
