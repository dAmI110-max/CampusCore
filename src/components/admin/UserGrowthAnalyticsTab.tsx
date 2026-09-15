import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storageService';
import { SupabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';
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
} from 'lucide-react';

export const UserGrowthAnalyticsTab: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '6m' | '12m' | 'all'>('30d');
  const [analytics, setAnalytics] = useState(() => StorageService.getUserGrowthAnalytics('30d'));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadAnalytics() {
      setIsLoading(true);
      if (isSupabaseConfigured()) {
        try {
          const res = await SupabaseService.fetchUserGrowthAnalytics(timeframe);
          if (mounted && res && res.dataPoints.length > 0) {
            setAnalytics(res);
            setIsLoading(false);
            return;
          }
        } catch {
          // fallback
        }
      }
      if (mounted) {
        setAnalytics(StorageService.getUserGrowthAnalytics(timeframe));
        setIsLoading(false);
      }
    }

    loadAnalytics();
    return () => {
      mounted = false;
    };
  }, [timeframe]);

  const { dataPoints, metrics } = analytics;

  const maxUsers = Math.max(...dataPoints.map((d) => d.totalUsers), 10);
  const maxRevenue = Math.max(...dataPoints.map((d) => d.revenue), 1000);

  return (
    <div className="space-y-6">
      {/* Header with Timeframe Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-slate-900 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-400/30">
              <Activity className="w-3 h-3 text-emerald-300" /> Real-time Platform Metrics
            </span>
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

        {/* Campus Distribution */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            UNIOSUN Campus Activity Share
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex items-center justify-between font-bold text-slate-700 mb-1">
                <span>Osogbo Main Campus (Oke-Baale)</span>
                <span>48%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '48%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between font-bold text-slate-700 mb-1">
                <span>Ikire Campus (Humanities & Culture)</span>
                <span>22%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '22%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between font-bold text-slate-700 mb-1">
                <span>Okuku Campus (Management Sciences)</span>
                <span>15%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '15%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between font-bold text-slate-700 mb-1">
                <span>Ifetedo Law Campus</span>
                <span>10%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '10%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between font-bold text-slate-700 mb-1">
                <span>Ejigbo & Ipetu-Ijesha Campuses</span>
                <span>5%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '5%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
