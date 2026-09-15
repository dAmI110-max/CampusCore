import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from '../../services/storageService';
import { SupabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Product, Accommodation, Report, Order, Dispute, VerificationRequest, AuditLog } from '../../types';
import { AdminManagementTab } from './AdminManagementTab';
import { UserGrowthAnalyticsTab } from './UserGrowthAnalyticsTab';
import { SellerMonitoringTab } from './SellerMonitoringTab';
import { UserModerationTab } from './UserModerationTab';
import {
  ShieldAlert,
  ShoppingBag,
  Home,
  Users,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  GraduationCap,
  ShieldCheck,
  Wallet,
  Lock,
  Scale,
  Settings,
  FileText,
  DollarSign,
  ArrowUpRight,
  Clock,
  Eye,
  Check,
  X,
  RefreshCw,
  TrendingUp,
  Store,
  Crown,
  KeyRound,
  Mail,
  ToggleLeft,
  ToggleRight,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  onProductClick: (product: Product) => void;
  onAccommodationClick: (accommodation: Accommodation) => void;
}

export type AdminTab =
  | 'overview'
  | 'analytics'
  | 'seller_funnel'
  | 'admin_management'
  | 'users'
  | 'escrow'
  | 'disputes'
  | 'verifications'
  | 'listings'
  | 'study_resources'
  | 'accommodation'
  | 'reports'
  | 'settings'
  | 'audit';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onProductClick,
  onAccommodationClick,
}) => {
  const { currentUser, isSuperAdmin } = useAuth();
  const { success, error: showError } = useToast();
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [, setTick] = useState(0);

  const [dbStats, setDbStats] = useState<any>(null);
  const [dbReports, setDbReports] = useState<Report[]>([]);
  const [dbAuditLogs, setDbAuditLogs] = useState<AuditLog[]>([]);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchSupabaseData = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setIsSyncing(true);
    try {
      const [fetchedStats, fetchedReports, fetchedLogs, fetchedListings] = await Promise.all([
        SupabaseService.fetchPlatformStats(),
        SupabaseService.fetchReports(),
        SupabaseService.fetchAuditLogs(50),
        SupabaseService.fetchListings(),
      ]);

      if (fetchedStats) setDbStats(fetchedStats);
      if (fetchedReports) setDbReports(fetchedReports);
      if (fetchedLogs) setDbAuditLogs(fetchedLogs);
      if (fetchedListings && fetchedListings.length > 0) setDbProducts(fetchedListings);
    } catch {
      // Keep local state
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchSupabaseData();

    const unsubProfiles = SupabaseService.subscribeToProfiles(() => {
      fetchSupabaseData();
    });
    const unsubListings = SupabaseService.subscribeToListings(() => {
      fetchSupabaseData();
    });

    return () => {
      unsubProfiles();
      unsubListings();
    };
  }, [fetchSupabaseData]);

  const forceRefresh = () => {
    setTick((t) => t + 1);
    fetchSupabaseData();
  };

  const localStats = StorageService.getPlatformStats();
  const stats = dbStats
    ? {
        ...localStats,
        totalUsers: dbStats.totalUsers || localStats.totalUsers,
        totalProducts: dbStats.totalProducts || localStats.totalProducts,
        totalReports: dbStats.totalReports ?? localStats.totalReports,
        totalOrders: dbStats.totalOrders ?? localStats.totalOrders,
        totalEscrowVolume: dbStats.totalVolume ?? localStats.totalEscrowVolume,
        activeEscrowHold: dbStats.escrowHeldTotal ?? localStats.activeEscrowHold,
      }
    : localStats;

  const products = dbProducts.length > 0 ? dbProducts : StorageService.getProducts();
  const accommodations = StorageService.getAccommodations();
  const reports = dbReports.length > 0 ? dbReports : StorageService.getReports();
  const orders = StorageService.getOrders();
  const disputes = StorageService.getDisputes();
  const verifications = StorageService.getVerificationRequests();
  const auditLogs = dbAuditLogs.length > 0 ? dbAuditLogs : StorageService.getAuditLogs(50);
  const platformSettings = StorageService.getPlatformSettings();
  const studyResources = StorageService.getStudyResources();

  const [searchQuery, setSearchQuery] = useState('');

  // Selected for inspection modals
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [disputeResolutionDecision, setDisputeResolutionDecision] = useState<'refund_buyer' | 'release_seller' | 'split'>('refund_buyer');
  const [disputeNotes, setDisputeNotes] = useState('');
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Financial & Platform Settings State
  const [escrowFeePercent, setEscrowFeePercent] = useState(platformSettings.escrowFeePercent);
  const [minDeposit, setMinDeposit] = useState(platformSettings.minDepositAmount);
  const [minWithdrawal, setMinWithdrawal] = useState(platformSettings.minWithdrawalAmount);
  const [withdrawalFeeFixed, setWithdrawalFeeFixed] = useState(platformSettings.withdrawalFeeFixed);
  const [supportEmail, setSupportEmail] = useState('cplugsupport@gmail.com');
  const [featureEscrow, setFeatureEscrow] = useState(platformSettings.featureFlags?.escrowEnabled ?? true);
  const [featureDirectPay, setFeatureDirectPay] = useState(platformSettings.featureFlags?.servicesEnabled ?? true);
  const [maintenanceMode, setMaintenanceMode] = useState(platformSettings.maintenanceMode ?? false);

  // Dispute resolution handler
  const handleResolveDispute = (dispute: Dispute) => {
    if (!disputeNotes.trim()) {
      showError('Please enter admin resolution notes for the decision');
      return;
    }

    const res = StorageService.resolveDispute(
      dispute.id,
      currentUser?.id || 'usr-admin',
      disputeResolutionDecision,
      disputeNotes
    );

    if (res.success) {
      success('Dispute resolved and financial balances adjusted atomically!');
      setSelectedDispute(null);
      setDisputeNotes('');
      forceRefresh();
    } else {
      showError(res.message || 'Failed to resolve dispute');
    }
  };

  // Verification review handler
  const handleReviewVerification = (
    requestId: string,
    status: 'approved' | 'rejected',
    badge: 'verified_student' | 'trusted_seller' = 'verified_student'
  ) => {
    const ok = StorageService.reviewVerificationRequest(
      requestId,
      currentUser?.id || 'usr-admin',
      status,
      status === 'rejected' ? rejectionReason : undefined,
      badge
    );

    if (ok) {
      success(status === 'approved' ? `Verification approved! Badge awarded.` : `Verification rejected.`);
      setSelectedVerification(null);
      setRejectionReason('');
      forceRefresh();
    }
  };

  // Handle report status change
  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    if (isSupabaseConfigured()) {
      await SupabaseService.updateReportStatus(reportId, status, undefined, currentUser?.fullName || 'Admin');
    }
    const updated = StorageService.updateReportStatus(reportId, status);
    if (updated) {
      success(`Report marked as ${status}.`);
      forceRefresh();
    }
  };

  // Handle listing moderation
  const handleToggleFeatured = (productId: string, currentFeatured: boolean) => {
    const updated = StorageService.updateProduct(productId, { featured: !currentFeatured });
    if (updated) {
      success(currentFeatured ? 'Removed from featured listings.' : 'Listing boosted to Featured!');
      forceRefresh();
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Admin Action: Permanently delete this listing from CampusPlug?')) {
      if (isSupabaseConfigured()) {
        await SupabaseService.deleteListing(productId);
      }
      const deleted = StorageService.deleteProduct(productId);
      if (deleted) {
        success('Listing deleted by Admin.');
        forceRefresh();
      }
    }
  };

  const handleApproveStudyResource = (resourceId: string) => {
    StorageService.updateStudyResourceStatus(resourceId, 'approved');
    success('Study material approved & published to student library.');
    forceRefresh();
  };

  const handleRejectStudyResource = (resourceId: string) => {
    StorageService.updateStudyResourceStatus(resourceId, 'rejected');
    success('Study material rejected.');
    forceRefresh();
  };

  const handleDeleteStudyResource = (resourceId: string) => {
    if (window.confirm('Admin Action: Permanently delete this study material?')) {
      StorageService.deleteStudyResource(resourceId);
      success('Study material deleted.');
      forceRefresh();
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.updatePlatformSettings({
      escrowFeePercent: Number(escrowFeePercent),
      minDepositAmount: Number(minDeposit),
      minWithdrawalAmount: Number(minWithdrawal),
      withdrawalFeeFixed: Number(withdrawalFeeFixed),
      maintenanceMode,
      featureFlags: {
        ...platformSettings.featureFlags,
        escrowEnabled: featureEscrow,
        servicesEnabled: featureDirectPay,
      } as any,
    });
    success('Platform settings & parameters updated successfully!');
    forceRefresh();
  };

  const pendingDisputesCount = disputes.filter((d) => d.status === 'under_review').length;
  const pendingVerificationsCount = verifications.filter((v) => v.status === 'pending').length;
  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Admin Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden mb-8 border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> CampusPlug Control Center
              </span>
              {isSuperAdmin && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black uppercase tracking-wider flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-300" /> Super Admin Active
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-2">Campus Administration & Trust Desk</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Escrow vault operations, dispute arbitration, student verification, RBAC permissions, and platform velocity.
            </p>
          </div>

          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-bold flex items-center gap-2">
            <GraduationCap className="w-4 h-4" /> UNIOSUN (6 Campuses Live)
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-6 mt-6 border-t border-slate-800">
          {[
            { id: 'overview', label: 'Overview', icon: Sparkles },
            { id: 'analytics', label: 'Growth Analytics', icon: TrendingUp },
            { id: 'seller_funnel', label: 'Seller Funnel', icon: Store },
            { id: 'admin_management', label: 'Admin RBAC', icon: KeyRound },
            { id: 'users', label: 'User Moderation', icon: Users },
            { id: 'escrow', label: `Escrow Orders (${orders.length})`, icon: Lock },
            { id: 'disputes', label: `Disputes (${pendingDisputesCount})`, icon: Scale },
            { id: 'verifications', label: `Verifications (${pendingVerificationsCount})`, icon: ShieldCheck },
            { id: 'listings', label: `Listings (${products.length})`, icon: ShoppingBag },
            { id: 'study_resources', label: `Study Materials (${studyResources.length})`, icon: BookOpen },
            { id: 'accommodation', label: `Hostels (${accommodations.length})`, icon: Home },
            { id: 'reports', label: `Reports (${pendingReportsCount})`, icon: AlertTriangle },
            { id: 'settings', label: 'Platform Settings', icon: Settings },
            { id: 'audit', label: 'Audit Logs', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as AdminTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- TAB: OVERVIEW --- */}
      {currentTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics Bento */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Escrow Volume</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                ₦{(stats.totalEscrowVolume || 0).toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                {stats.totalOrders} total campus orders
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Active Escrow Hold</span>
                <Lock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600">
                ₦{(stats.activeEscrowHold || 0).toLocaleString()}
              </div>
              <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
                Secured in vault
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Pending Verifications</span>
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-indigo-600">
                {pendingVerificationsCount}
              </div>
              <button
                onClick={() => setCurrentTab('verifications')}
                className="text-[11px] text-indigo-600 font-bold hover:underline mt-1 block cursor-pointer"
              >
                Review Student IDs &rarr;
              </button>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Active Disputes</span>
                <Scale className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-600">
                {pendingDisputesCount}
              </div>
              <button
                onClick={() => setCurrentTab('disputes')}
                className="text-[11px] text-rose-600 font-bold hover:underline mt-1 block cursor-pointer"
              >
                Arbitrate cases &rarr;
              </button>
            </div>
          </div>

          {/* Quick Action Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Escrow Activity */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  Recent Escrow Transactions
                </h3>
                <button
                  onClick={() => setCurrentTab('escrow')}
                  className="text-xs text-indigo-600 font-bold hover:underline"
                >
                  View All ({orders.length})
                </button>
              </div>

              <div className="space-y-3">
                {orders.slice(0, 4).map((o) => (
                  <div
                    key={o.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{o.productTitle}</span>
                      <span className="text-slate-500 block text-[11px]">
                        Buyer: {o.buyerName} &bull; Seller: {o.sellerName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 block">
                        ₦{o.amount.toLocaleString()}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-indigo-600">{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Administrative Quick Actions
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  onClick={() => setCurrentTab('analytics')}
                  className="p-4 rounded-2xl bg-indigo-50/60 hover:bg-indigo-100/60 text-indigo-900 font-bold border border-indigo-100 flex flex-col items-start gap-1 text-left transition-colors"
                >
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <span>Growth Analytics</span>
                  <span className="text-[10px] font-normal text-indigo-700">Track user trajectory</span>
                </button>

                <button
                  onClick={() => setCurrentTab('seller_funnel')}
                  className="p-4 rounded-2xl bg-amber-50/60 hover:bg-amber-100/60 text-amber-900 font-bold border border-amber-100 flex flex-col items-start gap-1 text-left transition-colors"
                >
                  <Store className="w-5 h-5 text-amber-600" />
                  <span>Seller Funnel</span>
                  <span className="text-[10px] font-normal text-amber-700">Merchant activations</span>
                </button>

                <button
                  onClick={() => setCurrentTab('admin_management')}
                  className="p-4 rounded-2xl bg-purple-50/60 hover:bg-purple-100/60 text-purple-900 font-bold border border-purple-100 flex flex-col items-start gap-1 text-left transition-colors"
                >
                  <KeyRound className="w-5 h-5 text-purple-600" />
                  <span>Admin RBAC</span>
                  <span className="text-[10px] font-normal text-purple-700">Team permissions</span>
                </button>

                <button
                  onClick={() => setCurrentTab('users')}
                  className="p-4 rounded-2xl bg-rose-50/60 hover:bg-rose-100/60 text-rose-900 font-bold border border-rose-100 flex flex-col items-start gap-1 text-left transition-colors"
                >
                  <Users className="w-5 h-5 text-rose-600" />
                  <span>User Moderation</span>
                  <span className="text-[10px] font-normal text-rose-700">Protect community</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: GROWTH ANALYTICS --- */}
      {currentTab === 'analytics' && <UserGrowthAnalyticsTab />}

      {/* --- TAB: SELLER FUNNEL --- */}
      {currentTab === 'seller_funnel' && <SellerMonitoringTab />}

      {/* --- TAB: ADMIN MANAGEMENT (RBAC) --- */}
      {currentTab === 'admin_management' && <AdminManagementTab onRefresh={forceRefresh} />}

      {/* --- TAB: USER MODERATION --- */}
      {currentTab === 'users' && <UserModerationTab onRefresh={forceRefresh} />}

      {/* --- TAB: ESCROW ORDERS --- */}
      {currentTab === 'escrow' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Escrow Vault Transactions</h2>
              <p className="text-xs text-slate-500">Live order audit and escrow release status</p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order #, buyer, seller..."
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Buyer</th>
                  <th className="py-3 px-4">Seller</th>
                  <th className="py-3 px-4">Escrow Amount</th>
                  <th className="py-3 px-4">Platform Fee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders
                  .filter(
                    (o) =>
                      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      o.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      o.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      o.productTitle.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{o.productTitle}</td>
                      <td className="py-3 px-4">{o.buyerName}</td>
                      <td className="py-3 px-4">{o.sellerName}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        ₦{o.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-600 font-bold">
                        ₦{(o.platformFee || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB: DISPUTES --- */}
      {currentTab === 'disputes' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="mb-6">
            <h2 className="text-lg font-black text-slate-900">Escrow Dispute Arbitration Desk</h2>
            <p className="text-xs text-slate-500">
              Review flagged orders, inspect buyer claims, and execute binding escrow payouts or refunds.
            </p>
          </div>

          <div className="space-y-4">
            {disputes.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No active dispute cases reported.</div>
            ) : (
              disputes.map((d) => (
                <div
                  key={d.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-xs">Order #{d.orderNumber}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                        {d.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800">Reason: {d.reason}</div>
                    <p className="text-xs text-slate-600 italic max-w-xl">"{d.description}"</p>
                  </div>

                  {d.status === 'under_review' && (
                    <button
                      onClick={() => setSelectedDispute(d)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 cursor-pointer"
                    >
                      Arbitrate Case
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- TAB: VERIFICATIONS --- */}
      {currentTab === 'verifications' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="mb-6">
            <h2 className="text-lg font-black text-slate-900">Student Identity Verification Queue</h2>
            <p className="text-xs text-slate-500">
              Review uploaded UNIOSUN ID cards and portal registration documents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verifications.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-2xl border border-slate-200 flex flex-col justify-between gap-3 bg-white"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{v.userName}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        v.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : v.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-indigo-600 font-bold block mt-0.5">
                    Matric: {v.matricNumber}
                  </span>
                  <span className="text-xs text-slate-500 block">
                    {v.department} &bull; {v.level} &bull; {v.campusName}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedVerification(v)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Inspect Documents & Review
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB: LISTINGS MODERATION --- */}
      {currentTab === 'listings' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Manage Marketplace Listings</h2>
              <p className="text-xs text-slate-500">Feature top student listings or remove non-compliant items.</p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search listings..."
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Seller</th>
                  <th className="py-3 px-4">Campus</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 flex items-center gap-2">
                      <img src={p.images[0]} alt={p.title} className="w-8 h-8 rounded-lg object-cover" />
                      <span className="font-bold text-slate-900">{p.title}</span>
                    </td>
                    <td className="py-3 px-4">{p.sellerName}</td>
                    <td className="py-3 px-4">{p.sellerCampus}</td>
                    <td className="py-3 px-4 font-black">₦{p.price.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] uppercase">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleFeatured(p.id, !!p.featured)}
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          p.featured ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {p.featured ? '★ Featured' : 'Boost'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => onProductClick(p)}
                        className="p-1 hover:bg-slate-100 rounded text-indigo-600"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1 hover:bg-rose-50 rounded text-rose-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB: STUDY RESOURCES MODERATION --- */}
      {currentTab === 'study_resources' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Academic & Study Resources Library</h2>
              <p className="text-xs text-slate-500">
                Review, verify, and moderate student-uploaded past questions, lecture notes, textbooks, and study guides.
              </p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search course code or title..."
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Contributor</th>
                  <th className="py-3 px-4">Downloads</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {studyResources
                  .filter((r) => {
                    const q = searchQuery.toLowerCase();
                    return (
                      !q ||
                      r.courseCode.toLowerCase().includes(q) ||
                      r.title.toLowerCase().includes(q) ||
                      r.authorName.toLowerCase().includes(q)
                    );
                  })
                  .map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                          {r.courseCode}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 line-clamp-1">{r.title}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{r.courseTitle}</div>
                      </td>
                      <td className="py-3 px-4 capitalize text-slate-600 font-semibold">
                        {r.category.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-bold">{r.level}</td>
                      <td className="py-3 px-4 text-slate-600">{r.authorName}</td>
                      <td className="py-3 px-4 text-slate-600 font-bold">{r.downloadsCount}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            r.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700'
                              : r.verified || r.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {r.status || (r.verified ? 'approved' : 'pending')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        {r.status !== 'approved' && (
                          <button
                            onClick={() => handleApproveStudyResource(r.id)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            title="Approve & Verify"
                          >
                            Approve
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button
                            onClick={() => handleRejectStudyResource(r.id)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            title="Reject"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteStudyResource(r.id)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors cursor-pointer"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB: ACCOMMODATION MODERATION --- */}
      {currentTab === 'accommodation' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-lg font-black text-slate-900 mb-4">Campus Hostels & Accommodation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accommodations.map((a) => (
              <div key={a.id} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={a.images[0]} alt={a.title} className="w-16 h-16 rounded-xl object-cover" />
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{a.title}</h3>
                    <span className="text-[11px] text-slate-500 block">{a.location}</span>
                    <span className="text-xs font-black text-indigo-600">₦{a.price.toLocaleString()}/yr</span>
                  </div>
                </div>
                <button
                  onClick={() => onAccommodationClick(a)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
                >
                  Inspect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB: REPORTS --- */}
      {currentTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-lg font-black text-slate-900 mb-4">Student Safety Reports</h2>
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{r.reason}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{r.description || r.details || 'No additional details'}</p>
                </div>
                {r.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolveReport(r.id, 'resolved')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleResolveReport(r.id, 'dismissed')}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB: PLATFORM SETTINGS --- */}
      {currentTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-black text-slate-900">Platform Financial & System Parameters</h2>
            <p className="text-xs text-slate-500">Configure global transaction fees, escrow rates, and feature flags.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Support & Dispute Resolution Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">CampusPlug Ace Tech student support address</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Marketplace Escrow Platform Fee (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={escrowFeePercent}
                onChange={(e) => setEscrowFeePercent(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Standard rate applied to student transactions</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Min Deposit (NGN)
                </label>
                <input
                  type="number"
                  value={minDeposit}
                  onChange={(e) => setMinDeposit(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Min Withdrawal (NGN)
                </label>
                <input
                  type="number"
                  value={minWithdrawal}
                  onChange={(e) => setMinWithdrawal(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fixed Bank Transfer Withdrawal Fee (NGN)
              </label>
              <input
                type="number"
                value={withdrawalFeeFixed}
                onChange={(e) => setWithdrawalFeeFixed(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">NIBSS transfer gateway cost</span>
            </div>

            {/* Feature Flags */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                System Feature Switches
              </label>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-900">Escrow System Active</div>
                  <div className="text-[10px] text-slate-500">Hold funds safely until buyer confirms receipt</div>
                </div>
                <input
                  type="checkbox"
                  checked={featureEscrow}
                  onChange={(e) => setFeatureEscrow(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-900">Direct Pay Wallet</div>
                  <div className="text-[10px] text-slate-500">Allow instant student-to-student wallet transfers</div>
                </div>
                <input
                  type="checkbox"
                  checked={featureDirectPay}
                  onChange={(e) => setFeatureDirectPay(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              Save Platform Parameters
            </button>
          </form>
        </div>
      )}

      {/* --- TAB: AUDIT LOGS --- */}
      {currentTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="mb-6">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Immutable Financial & Moderation Audit Log
            </h2>
            <p className="text-xs text-slate-500">Every wallet credit, escrow transition, dispute, and verification action.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4">Metadata</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {auditLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-indigo-600">{l.action}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{l.actorName}</td>
                    <td className="py-3 px-4 uppercase text-[10px] text-slate-500 font-bold">{l.entityType}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{l.entityId}</td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-600 max-w-xs truncate">
                      {JSON.stringify(l.metadata || {})}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(l.createdAt).toLocaleString('en-NG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- MODAL: ARBITRATE DISPUTE --- */}
      <AnimatePresence>
        {selectedDispute && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="font-black text-base text-slate-900">Arbitrate Escrow Dispute</h3>
                <button onClick={() => setSelectedDispute(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                  &times;
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1 mb-4">
                <div className="font-bold text-slate-900">Order #{selectedDispute.orderNumber}</div>
                <div className="text-slate-600">Reason: {selectedDispute.reason}</div>
                <div className="text-slate-600 italic">"{selectedDispute.description}"</div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Binding Action</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDisputeResolutionDecision('refund_buyer')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        disputeResolutionDecision === 'refund_buyer'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      100% Refund Buyer
                    </button>
                    <button
                      type="button"
                      onClick={() => setDisputeResolutionDecision('release_seller')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        disputeResolutionDecision === 'release_seller'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      Release to Seller
                    </button>
                    <button
                      type="button"
                      onClick={() => setDisputeResolutionDecision('split')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        disputeResolutionDecision === 'split'
                          ? 'border-amber-600 bg-amber-50 text-amber-800'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      Split 50 / 50
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Resolution Summary Note (Logged)</label>
                  <textarea
                    value={disputeNotes}
                    onChange={(e) => setDisputeNotes(e.target.value)}
                    placeholder="State reason for resolution decision..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500"
                    required
                  />
                </div>

                <button
                  onClick={() => handleResolveDispute(selectedDispute)}
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  Execute Binding Resolution
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: INSPECT VERIFICATION --- */}
      <AnimatePresence>
        {selectedVerification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="font-black text-base text-slate-900">Student Identity Verification</h3>
                <button onClick={() => setSelectedVerification(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                  &times;
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block text-sm">{selectedVerification.userName}</span>
                  <span className="font-mono text-indigo-700 font-bold block">
                    Matric: {selectedVerification.matricNumber}
                  </span>
                  <span className="text-slate-500">
                    {selectedVerification.department} &bull; {selectedVerification.level} &bull; {selectedVerification.campusName}
                  </span>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-1">Student ID Card:</span>
                  <img
                    src={selectedVerification.studentIdCardUrl}
                    alt="ID Card"
                    className="w-full h-40 object-cover rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-1">UNIOSUN Portal Registration Form:</span>
                  <img
                    src={selectedVerification.portalScreenshotUrl}
                    alt="Portal screenshot"
                    className="w-full h-40 object-cover rounded-xl border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleReviewVerification(selectedVerification.id, 'approved', 'verified_student')}
                    className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    Approve (Verified Student)
                  </button>
                  <button
                    onClick={() => handleReviewVerification(selectedVerification.id, 'approved', 'trusted_seller')}
                    className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                  >
                    Approve (Trusted Seller)
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection (if declining)..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs mb-2"
                  />
                  <button
                    onClick={() => handleReviewVerification(selectedVerification.id, 'rejected')}
                    className="w-full py-2 rounded-xl border border-rose-200 text-rose-700 font-bold text-xs hover:bg-rose-50"
                  >
                    Reject Application
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
