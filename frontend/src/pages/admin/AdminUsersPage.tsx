import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Shield, AlertTriangle, Search, CheckCircle, Ban } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res && res.users) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleToggleSuspend = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    if (!confirm(`Are you sure you want to set user status to ${nextStatus}?`)) return;

    try {
      await api.put(`/admin/users/${userId}/status`, { status: nextStatus });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    if (currentAdmin?.role !== 'SUPER_ADMIN') {
      alert('Only Super Administrators can change user roles.');
      return;
    }

    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-['Outfit']">User Directory</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage registered members, administrators, moderators, and account statuses.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchUsers();
          }}
          className="relative flex-grow"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
          />
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="ALL">All Roles</option>
          <option value="USER">User</option>
          <option value="MODERATOR">Moderator</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="DELETED">Deleted</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">User Email</th>
                <th className="py-3 px-4">Profile</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      {u.email}
                      {u.id === currentAdmin?.id && (
                        <span className="ml-2 text-[10px] text-purple-400 font-normal">(You)</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {u.profile ? (
                        <span className="text-slate-300 font-medium">{u.profile.name}</span>
                      ) : (
                        <span className="text-slate-500 italic">No Profile</span>
                      )}
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      {currentAdmin?.role === 'SUPER_ADMIN' && u.id !== currentAdmin?.id ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.id, e.target.value)}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-semibold text-purple-300 cursor-pointer"
                        >
                          <option value="USER">USER</option>
                          <option value="MODERATOR">MODERATOR</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {u.role}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : u.status === 'SUSPENDED'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {u.id !== currentAdmin?.id && (
                        <button
                          onClick={() => handleToggleSuspend(u.id, u.status)}
                          className={`px-3 py-1 rounded-lg border text-xs font-medium transition-colors ${
                            u.status === 'SUSPENDED'
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                              : 'bg-rose-500/15 border-rose-500/30 text-rose-300 hover:bg-rose-500/25'
                          }`}
                        >
                          {u.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    No users found matching query.
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
