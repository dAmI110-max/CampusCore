import React, { useState } from 'react';
import { StorageService } from '../../services/storageService';
import {
  Store,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Package,
  DollarSign,
  ArrowRight,
  UserCheck,
  ExternalLink,
  Award,
  Layers,
} from 'lucide-react';

export const SellerMonitoringTab: React.FC = () => {
  const sellerAnalytics = StorageService.getSellerFunnelAnalytics();
  const { funnel, topSellers } = sellerAnalytics;

  const [searchQuery, setSearchQuery] = useState('');

  const filteredSellers = topSellers.filter(
    (s) =>
      s.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.user.departmentName && s.user.departmentName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-amber-400/30">
            <Store className="w-3 h-3 text-amber-300" /> Student Merchant Intelligence
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <Layers className="w-6 h-6 text-amber-400" />
          Seller Conversion Funnel & Merchant Oversight
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
          Track the complete student merchant journey from initial registration to regular marketplace sales and escrow settlement.
        </p>
      </div>

      {/* Seller Funnel Visualization */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              End-to-End Seller Activation Funnel
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Conversion rate across consecutive onboarding stages
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
            {funnel[funnel.length - 1].percentage}% Final Sale Conversion
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {funnel.map((step, idx) => (
            <div
              key={step.stage}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                  <span>Stage {idx + 1}</span>
                  <span className="text-indigo-600 font-black">{step.percentage}%</span>
                </div>
                <div className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                  {step.stage}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                  {step.description}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-lg font-black text-slate-900 font-mono">
                  {step.count}
                </span>
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Active Sellers Directory Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Active Student Sellers & Merchants
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing performance, active catalog items, and sales volume
            </p>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sellers by name, department..."
            className="text-xs px-3.5 py-2 rounded-2xl border border-slate-200 max-w-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 px-3">Student Vendor</th>
                <th className="pb-3 px-3">Campus & Dept</th>
                <th className="pb-3 px-3">Catalog</th>
                <th className="pb-3 px-3">Completed Sales</th>
                <th className="pb-3 px-3">Est. Volume</th>
                <th className="pb-3 px-3">Verification</th>
                <th className="pb-3 px-3 text-right">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <p className="font-semibold text-slate-600">No active sellers found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Students who register as sellers will be listed here.</p>
                  </td>
                </tr>
              ) : (
                filteredSellers.map((item) => (
                  <tr key={item.user.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.user.avatarUrl}
                        alt={item.user.fullName}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          {item.user.fullName}
                          {item.user.verificationBadge === 'verified_student' && (
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.user.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-slate-600">
                    <div className="font-semibold">{item.user.campusName || 'Main Campus'}</div>
                    <div className="text-[10px] text-slate-400">
                      {item.user.departmentName || 'Student'} ({item.user.level || '100L'})
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {item.listingsCount} items
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-mono font-bold text-emerald-600">
                    {item.salesCount} orders
                  </td>

                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                    ₦{(item.revenueEstimate || 0).toLocaleString()}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {item.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    {item.user.whatsapp ? (
                      <a
                        href={`https://wa.me/${item.user.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] transition-colors"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" /> WhatsApp
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
