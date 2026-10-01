import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storageService';
import { SupabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { UserProfile } from '../../types';
import {
  TrendingUp,
  Users,
  Store,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Percent,
  RefreshCw,
  GraduationCap,
  Building2,
  BookOpen,
  AlertTriangle,
} from 'lucide-react';

export const UserGrowthAnalyticsTab: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '6m' | '12m' | 'all'>('30d');
  const [analytics, setAnalytics] = useState<{
    labels: string[];
    dataPoints: Array<{
      date: string;
      label: string;
      totalUsers: number;
      newSignups: number;
      activeSellers: number;
      ordersPlaced: number;
      revenue: number;
    }>;
    metrics: {
      growthRatePercent: number;
      totalRegistered: number;
      activeSellersCount: number;
      sellerConversionRate: number;
      retentionRatePercent: number;
    };
  }>({
    labels: [],
    dataPoints: [],
    metrics: {
      growthRatePercent: 0,
      totalRegistered: 0,
      activeSellersCount: 0,
      sellerConversionRate: 0,
      retentionRatePercent: 0,
    },
  });
  const [realUsers, setRealUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isShowingLiveData, setIsShowingLiveData] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isTableMissing, setIsTableMissing] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadAnalytics() {
      setIsLoading(true);
      setQueryError(null);
      setIsTableMissing(false);

      if (isSupabaseConfigured()) {
        try {
          const detailed = await SupabaseService.fetchAllProfilesDetailed();
          if (!mounted) return;

          if (detailed.error) {
            console.error('UserGrowthAnalyticsTab profiles fetch error:', detailed.error);
            setQueryError(detailed.error);
            setIsTableMissing(detailed.isTableMissing);
            setRealUsers([]);
            setIsShowingLiveData(false);
          } else {
            setRealUsers(detailed.profiles);
            setIsShowingLiveData(true);
          }

          const analyticsRes = await SupabaseService.fetchUserGrowthAnalytics(
            timeframe,
            detailed.profiles
          );
          if (mounted) {
            setAnalytics(analyticsRes);
            if (analyticsRes.error && !detailed.error) {
              setQueryError(analyticsRes.error);
              setIsTableMissing(Boolean(analyticsRes.isTableMissing));
            }
          }
        } catch (err: any) {
          console.error('UserGrowthAnalyticsTab load exception:', err);
          if (mounted) {
            setQueryError(err?.message || 'Failed to fetch analytics from Supabase');
            setRealUsers([]);
            setIsShowingLiveData(false);
          }
        } finally {
          if (mounted) setIsLoading(false);
        }
      } else {
        if (mounted) {
          setQueryError('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
          setIsShowingLiveData(false);
          setIsLoading(false);
        }
      }
    }

    loadAnalytics();
    return () => {
      mounted = false;
    };
  }, [timeframe]);

  const { dataPoints, metrics } = analytics;
  const maxUsers = Math.max(...dataPoints.map((d) => d.totalUsers), 1);

  const totalStudents = realUsers.length;

  // Calculate Total Students in selected timeframe (Last 30D, etc.) using actual profile timestamps
  const now = Date.now();
  const daysMap: Record<string, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '6m': 180,
    '12m': 365,
    'all': Infinity,
  };
  const timeframeDays = daysMap[timeframe] ?? 30;
  const cutoffTime = timeframeDays === Infinity ? 0 : now - timeframeDays * 24 * 60 * 60 * 1000;

  const studentsInTimeframe = realUsers.filter((u) => {
    if (!u.createdAt) return true;
    const t = new Date(u.createdAt).getTime();
    return !isNaN(t) && t >= cutoffTime;
  }).length;

  // 1. Campus Stats (Dynamic from real profiles only)
  const allCampuses = StorageService.getCampuses();
  const campusStats = allCampuses.map((c) => {
    const count = realUsers.filter(
      (u) =>
        u.campusId === c.id ||
        (u.campusName && u.campusName.toLowerCase().includes(c.name.toLowerCase()))
    ).length;
    const pct = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
    return { ...c, count, pct };
  });

  // 2. Faculty Stats (Strictly from real profiles, honest empty state if none)
  const allFaculties = StorageService.getFaculties();
  const facultyCounts: Record<string, { id: string; name: string; count: number }> = {};
  let usersWithFacultyCount = 0;

  realUsers.forEach((u) => {
    if (u.facultyName && u.facultyName.trim()) {
      usersWithFacultyCount++;
      const name = u.facultyName.trim();
      const facId = u.facultyId || name;
      if (!facultyCounts[name]) {
        facultyCounts[name] = { id: facId, name, count: 0 };
      }
      facultyCounts[name].count += 1;
    } else if (u.facultyId) {
      const matched = allFaculties.find((f) => f.id === u.facultyId);
      if (matched) {
        usersWithFacultyCount++;
        if (!facultyCounts[matched.name]) {
          facultyCounts[matched.name] = { id: matched.id, name: matched.name, count: 0 };
        }
        facultyCounts[matched.name].count += 1;
      }
    }
  });

  const facultyStats = Object.values(facultyCounts)
    .map((f) => ({
      ...f,
      pct: totalStudents > 0 ? Math.round((f.count / totalStudents) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // 3. Level Stats (From actual user profile records only)
  const academicLevels = ['100L', '200L', '300L', '400L', '500L', 'Postgraduate'] as const;
  const usersWithLevelCount = realUsers.filter((u) => u.level).length;
  const levelStats = academicLevels.map((lvl) => {
    const count = realUsers.filter((u) => u.level === lvl).length;
    const pct = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
    return { level: lvl, count, pct };
  });

  // 4. Department Stats (From real users only)
  const departmentCounts: Record<string, { name: string; facultyName?: string; count: number }> = {};
  realUsers.forEach((u) => {
    if (u.departmentName && u.departmentName.trim()) {
      const name = u.departmentName.trim();
      if (!departmentCounts[name]) {
        departmentCounts[name] = {
          name,
          facultyName: u.facultyName,
          count: 0,
        };
      }
      departmentCounts[name].count += 1;
    }
  });
  const topDepartments = Object.values(departmentCounts).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      {/* Header with Timeframe Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-slate-900 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isShowingLiveData ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-400/30">
                <ShieldCheck className="w-3 h-3 text-emerald-300" /> Real Supabase Database
              </span>
            ) : isTableMissing ? (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-amber-400/30">
                <AlertTriangle className="w-3 h-3 text-amber-300" /> Database Setup Required
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-400/20 text-rose-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-rose-400/30">
                <AlertTriangle className="w-3 h-3 text-rose-300" /> Database Connection Notice
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            User Growth & Platform Velocity
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Monitor UNIOSUN student signups, seller activations, and marketplace transaction volume.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/10 border border-white/10 shrink-0 self-start sm:self-auto">
          {(['7d', '30d', '90d', '6m', '12m'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframe === t
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Database Setup Notice if table missing */}
      {isTableMissing && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="font-bold text-sm flex items-center gap-2 text-amber-950 mb-1">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              Supabase Database Setup Required (public.profiles table not found)
            </div>
            <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
              Supabase Auth contains your real user accounts, but the <code>public.profiles</code> table has not been created in your Supabase database yet. Run the SQL migration script from <code>supabase/schema.sql</code> in your Supabase SQL Editor to automatically link your accounts.
            </p>
          </div>
        </div>
      )}

      {/* Query error notice */}
      {queryError && !isTableMissing && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Error querying Supabase analytics: {queryError}</span>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Students
            </span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {metrics.totalRegistered}
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +{metrics.growthRatePercent}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active UNIOSUN student accounts</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Sellers
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {metrics.activeSellersCount}
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Verified student merchants</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Seller Conversion
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {metrics.sellerConversionRate}%
            </span>
            <span className="text-xs font-bold text-slate-500">of total users</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Students who activate selling</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Student Retention
            </span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {metrics.retentionRatePercent}%
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> High Trust
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">30-day returning active students</p>
        </div>
      </div>

      {/* Main Growth Chart Visualization */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Cumulative Student Growth & Daily Signups
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Visual trajectory over the selected period ({timeframe.toUpperCase()})
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-indigo-600">
              <span className="w-3 h-3 rounded-md bg-indigo-600 inline-block" /> Total Users
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" /> New Signups
            </span>
          </div>
        </div>

        {/* CSS/SVG Bar Chart */}
        <div className="pt-6 pb-2">
          <div className="h-56 flex items-end justify-between gap-2 border-b border-slate-200 px-2">
            {dataPoints.map((pt) => {
              const heightPercent = Math.max(12, Math.round((pt.totalUsers / maxUsers) * 100));
              const signupHeight = Math.max(6, Math.round((pt.newSignups / 6) * 100));

              return (
                <div key={pt.date} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] rounded-xl py-1 px-2.5 pointer-events-none whitespace-nowrap shadow-xl z-20">
                    <div className="font-bold">{pt.label}</div>
                    <div>Total Users: {pt.totalUsers}</div>
                    <div>New Signups: +{pt.newSignups}</div>
                    <div>Orders Placed: {pt.ordersPlaced}</div>
                  </div>

                  <div className="w-full max-w-[28px] flex items-end justify-center gap-0.5 h-full">
                    {/* Primary Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-indigo-600 rounded-t-lg transition-all duration-300 group-hover:bg-indigo-700"
                    />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 rotate-0 truncate max-w-[36px] block text-center">
                    {pt.label.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Secondary Velocity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Marketplace Velocity Breakdown */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Escrow Volume & Fee Projection
          </h3>

          <div className="space-y-3">
            {dataPoints.slice(-5).map((pt) => (
              <div
                key={pt.date}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{pt.label}</div>
                  <div className="text-[10px] text-slate-400">{pt.ordersPlaced} Escrow orders completed</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-indigo-900 text-sm">
                    ₦{(pt.revenue || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold">
                    Fee Revenue: ₦{Math.round((pt.revenue || 0) * 0.025).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* UNIOSUN Campus Distribution (Calculated from Real Profiles) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              UNIOSUN Campus Distribution (Real Data)
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {totalStudents} Enrolled Students
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {campusStats.map((c) => (
              <div key={c.id}>
                <div className="flex items-center justify-between font-bold text-slate-700 mb-1">
                  <span>{c.name} ({c.location || 'Campus'})</span>
                  <span className="font-mono text-slate-500">
                    {c.count} {c.count === 1 ? 'student' : 'students'} ({c.pct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(c.pct, c.count > 0 ? 3 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real Academic Demographics: Faculty & Level Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real Faculty Distribution */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              Real Faculty Distribution
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Live UNIOSUN Faculties
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Real student distribution across accredited faculties. If no students are enrolled in a faculty, 0 is displayed.
          </p>

          <div className="space-y-3 text-xs max-h-96 overflow-y-auto pr-1">
            {facultyStats.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No student faculty data available yet.
              </p>
            ) : (
              facultyStats.map((f) => (
                <div key={f.id} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                    <span className="truncate pr-2">{f.name}</span>
                    <span className="font-mono text-xs font-bold text-emerald-700 shrink-0">
                      {f.count} ({f.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(f.pct, f.count > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Academic Level & Departments */}
        <div className="space-y-6">
          {/* Level Distribution */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              Student Academic Levels
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {levelStats.map((l) => (
                <div key={l.level} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                  <div className="text-base font-black text-slate-900">{l.count}</div>
                  <div className="text-xs font-bold text-slate-600">{l.level}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{l.pct}% of students</div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Departments */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Top Active Student Departments
            </h3>
            {topDepartments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No active student department data recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
                {topDepartments.map((dept) => (
                  <div key={dept.name} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{dept.name}</div>
                      {dept.facultyName && <div className="text-[10px] text-slate-400 truncate max-w-xs">{dept.facultyName}</div>}
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-mono font-bold text-xs">
                      {dept.count} {dept.count === 1 ? 'student' : 'students'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
