import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { AdCampaign } from '../../types';
import { CreateAdCampaignModal } from './CreateAdCampaignModal';
import { EmptyState } from '../common/EmptyState';
import {
  Megaphone,
  Plus,
  Eye,
  MousePointer,
  DollarSign,
  TrendingUp,
  BarChart2,
  Calendar,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';

export const AdsManagerView: React.FC = () => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [createAdOpen, setCreateAdOpen] = useState(false);

  const loadData = () => {
    if (currentUser) {
      setCampaigns(StorageService.getUserAdCampaigns(currentUser.id));
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('campuscore_storage_update', handleUpdate);
    return () => window.removeEventListener('campuscore_storage_update', handleUpdate);
  }, [currentUser]);

  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  return (
    <div className="min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-indigo-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold backdrop-blur-sm border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>CampusCore Ad Network & Marketing</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Ad Campaign Manager
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Launch targeted banner campaigns, track student impressions, monitor click-through rates (CTR), and grow your campus brand.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentUser && (
              <button
                id="launch-campaign-btn"
                onClick={() => setCreateAdOpen(true)}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Launch Campaign
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Impressions</span>
            <Eye className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 mt-2">
            {totalImpressions.toLocaleString()}
          </span>
          <span className="text-[11px] text-emerald-600 font-bold mt-1">Student Views</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Clicks</span>
            <MousePointer className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 mt-2">
            {totalClicks.toLocaleString()}
          </span>
          <span className="text-[11px] text-blue-600 font-bold mt-1">Direct Engagements</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Average CTR</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 mt-2">{avgCtr}%</span>
          <span className="text-[11px] text-amber-600 font-bold mt-1">Conversion Rate</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Campaign Spend</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 mt-2">
            ₦{totalSpent.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-1">From Wallet</span>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900">
          Your Advertising Campaigns ({campaigns.length})
        </h2>

        {campaigns.length === 0 ? (
          <EmptyState
            title="No ad campaigns running"
            description="Create your first campaign to feature your business, products, or services at the top of students' feeds."
            actionLabel="Launch Ad Campaign"
            onAction={() => setCreateAdOpen(true)}
          />
        ) : (
          <div className="space-y-4">
            {campaigns.map((ad) => {
              const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00';

              return (
                <div
                  key={ad.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      referrerPolicy="no-referrer"
                      className="w-24 h-16 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ad.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {ad.status}
                        </span>
                        <span className="text-[11px] font-bold text-indigo-600 uppercase">
                          {ad.placement.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mt-1">{ad.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(ad.startDate).toLocaleDateString()} -{' '}
                        {new Date(ad.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Performance Indicators */}
                  <div className="flex items-center gap-6 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Views</span>
                      <span className="font-bold text-slate-900">{ad.impressions.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Clicks</span>
                      <span className="font-bold text-slate-900">{ad.clicks.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">CTR</span>
                      <span className="font-bold text-indigo-600">{ctr}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Budget</span>
                      <span className="font-bold text-slate-900">₦{ad.budget.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateAdCampaignModal
        isOpen={createAdOpen}
        onClose={() => setCreateAdOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
