import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { SupabaseService, SUPER_ADMIN_EMAIL, SECONDARY_ADMIN_EMAIL } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { AccountStatus, UserProfile } from '../../types';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Ban,
  CheckCircle2,
  AlertTriangle,
  UserX,
  RefreshCw,
  Mail,
  GraduationCap,
  Copy,
  Calendar,
  Check,
} from 'lucide-react';

interface UserModerationTabProps {
  onRefresh: () => void;
}

export const UserModerationTab: React.FC<UserModerationTabProps> = ({ onRefresh }) => {
  const { currentUser, isSuperAdmin } = useAuth();
  const { success, error: showError } = useToast();

  const [users, setUsers] = useState<UserProfile[]>(() => StorageService.getUsers());
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [campusFilter, setCampusFilter] = useState<string>('all');

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [modalAction, setModalAction] = useState<'ban' | 'suspend'>('ban');
  const [violationCategory, setViolationCategory] = useState('Fraud / Scam');
  const [suspensionReason, setSuspensionReason] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLiveUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const dbUsers = await SupabaseService.fetchAllProfiles();
        if (dbUsers && dbUsers.length > 0) {
          // Merge with Super Admins if needed
          const merged = [...dbUsers];
          
          // Ensure Super Admin status for designated emails
          const finalUsers = merged.map((u) => {
            const isSuper = SupabaseService.isSuperAdminEmail(u.email);
            if (isSuper) {
              return { ...u, role: 'SUPER_ADMIN' as const, sellerStatus: 'VERIFIED_SELLER' as const };
            }
            return u;
          });

          setUsers(finalUsers);
          StorageService.syncProfilesFromSupabase(finalUsers);
          setIsLoading(false);
          return;
        }
      }
      setUsers(StorageService.getUsers());
    } catch {
      setUsers(StorageService.getUsers());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveUsers();

    // Realtime Supabase subscription
    const unsubscribe = SupabaseService.subscribeToProfiles(() => {
      fetchLiveUsers();
    });

    return () => {
      unsubscribe();
    };
  }, [fetchLiveUsers]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    success('User ID copied to clipboard');
  };

  const handleOpenActionModal = (user: UserProfile, action: 'ban' | 'suspend') => {
    if (SupabaseService.isSuperAdminEmail(user.email)) {
      showError('Security Guard: Super Admin account cannot be banned or suspended.');
      return;
    }

    setSelectedUser(user);
    setModalAction(action);
    setViolationCategory('Fraud / Scam');
    setSuspensionReason('');
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    if (!currentUser || !selectedUser) return;

    setIsLoading(true);
    const fullReason = `${violationCategory}${suspensionReason ? ` - ${suspensionReason.trim()}` : ''}`;

    try {
      if (modalAction === 'ban') {
        const res = await SupabaseService.banUser(
          currentUser.id,
          selectedUser.id,
          fullReason,
          currentUser.fullName,
          currentUser.email
        );
        if (res.success) {
          success(res.message || `User ${selectedUser.fullName} has been banned.`);
          StorageService.updateUserAccountStatus(currentUser.id, selectedUser.id, 'banned', fullReason);
        } else {
          showError(res.message || 'Failed to ban user');
        }
      } else {
        const res = await SupabaseService.suspendUser(
          currentUser.id,
          selectedUser.id,
          fullReason,
          currentUser.fullName,
          currentUser.email
        );
        if (res.success) {
          success(res.message || `User ${selectedUser.fullName} has been suspended.`);
          StorageService.updateUserAccountStatus(currentUser.id, selectedUser.id, 'suspended', fullReason);
        } else {
          showError(res.message || 'Failed to suspend user');
        }
      }
    } catch (err: any) {
      showError(err.message || 'Action failed');
    } finally {
      setShowModal(false);
      setSelectedUser(null);
      await fetchLiveUsers();
      onRefresh();
    }
  };

  const handleReactivate = async (user: UserProfile) => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const res = await SupabaseService.unbanUser(
        currentUser.id,
        user.id,
        'Account reactivated by administrator',
        currentUser.fullName,
        currentUser.email
      );
      if (res.success) {
        success(`User ${user.fullName} account reactivated.`);
        StorageService.updateUserAccountStatus(currentUser.id, user.id, 'active');
      } else {
        showError(res.message || 'Failed to reactivate user');
      }
    } catch (err: any) {
      showError(err.message || 'Reactivation failed');
    } finally {
      await fetchLiveUsers();
      onRefresh();
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.id && u.id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || u.accountStatus === statusFilter;
    const matchesCampus = campusFilter === 'all' || u.campusId === campusFilter;

    return matchesSearch && matchesStatus && matchesCampus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-slate-900 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Real Supabase Database
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            Registered Student Users & Moderation
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real student accounts stored in Supabase authentication and database profiles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-300 bg-white/10 px-3.5 py-2 rounded-2xl border border-white/10">
            Total Accounts: <span className="text-emerald-400 font-mono text-sm font-black">{users.length}</span>
          </div>
          <button
            onClick={fetchLiveUsers}
            disabled={isLoading}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95 disabled:opacity-50"
            title="Sync with Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Sync Live</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, email, username, UUID..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-2xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses ({users.length})</option>
            <option value="active">Active Only ({users.filter((u) => u.accountStatus === 'active').length})</option>
            <option value="suspended">Suspended ({users.filter((u) => u.accountStatus === 'suspended').length})</option>
            <option value="banned">Banned ({users.filter((u) => u.accountStatus === 'banned').length})</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Student Profile</th>
                <th className="py-3 px-4">Supabase ID</th>
                <th className="py-3 px-4">University & Campus</th>
                <th className="py-3 px-4">Department & Level</th>
                <th className="py-3 px-4">Role & Status</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <UserX className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No registered students found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Students who register on CampusPlug will appear here in real time.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSuper = SupabaseService.isSuperAdminEmail(u.email);
                  const isBanned = u.accountStatus === 'banned';
                  const isSuspended = u.accountStatus === 'suspended';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatarUrl}
                            alt={u.fullName}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {u.fullName}
                              {isSuper && (
                                <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[9px] font-black uppercase tracking-wider border border-amber-300">
                                  Super Admin
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <Mail className="w-2.5 h-2.5" />
                              {u.email}
                              {u.username && <span className="text-slate-500 font-sans">• @{u.username}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleCopyId(u.id)}
                          className="font-mono text-[10px] text-slate-500 hover:text-indigo-600 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors"
                          title="Click to copy full UUID"
                        >
                          <span>{u.id.substring(0, 8)}...</span>
                          {copiedId === u.id ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5 text-slate-400" />}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-semibold">{u.universityName || 'Osun State University'}</div>
                        <div className="text-[10px] text-slate-400">{u.campusName || 'Osogbo Main Campus'}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-semibold">{u.departmentName || 'General Studies'}</div>
                        <div className="text-[10px] text-slate-400">{u.level || '100L'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              u.accountStatus === 'active'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : u.accountStatus === 'banned'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300 font-black'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {u.accountStatus || 'active'}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 capitalize">
                            {u.role || 'STUDENT'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {!isSuper && (
                          <div className="flex items-center justify-end gap-1.5">
                            {u.accountStatus === 'active' ? (
                              <>
                                <button
                                  onClick={() => handleOpenActionModal(u, 'suspend')}
                                  className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[10px] transition-colors flex items-center gap-1 border border-amber-200"
                                >
                                  <AlertTriangle className="w-3 h-3 text-amber-600" /> Suspend
                                </button>
                                <button
                                  onClick={() => handleOpenActionModal(u, 'ban')}
                                  className="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] transition-colors flex items-center gap-1 border border-rose-200"
                                >
                                  <Ban className="w-3 h-3 text-rose-600" /> Ban
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleReactivate(u)}
                                className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] transition-colors flex items-center gap-1 border border-emerald-200"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Reactivate Account
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ban / Suspend Confirmation Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                  modalAction === 'ban' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                }`}
              >
                {modalAction === 'ban' ? <Ban className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {modalAction === 'ban' ? 'Ban Student from CampusPlug' : 'Suspend Student Account'}
                </h3>
                <p className="text-xs text-slate-500 font-mono">{selectedUser.fullName} ({selectedUser.email})</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Violation Category *
                </label>
                <select
                  value={violationCategory}
                  onChange={(e) => setViolationCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-2xl border border-slate-200 font-semibold focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Fraud / Scam">Fraud / Scam Activity</option>
                  <option value="Abusive Behavior">Abusive Behavior / Harassment</option>
                  <option value="Fake / Counterfeit Listings">Fake or Counterfeit Listings</option>
                  <option value="Spam / Deceptive Practices">Spam / Deceptive Practices</option>
                  <option value="Policy Violation">General Student Safety Policy Violation</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Specific Details / Moderation Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="Additional context recorded in audit log..."
                  className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] leading-relaxed">
                <strong>Enforcement:</strong> When {modalAction === 'ban' ? 'banned' : 'suspended'}, the student's active listings will be deactivated and any login attempts will be strictly rejected.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isLoading}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-all ${
                  modalAction === 'ban'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                }`}
              >
                {isLoading ? 'Updating Supabase...' : modalAction === 'ban' ? 'Confirm Ban' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
