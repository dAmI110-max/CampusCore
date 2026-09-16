import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { SubscriptionTier } from '../../types';
import {
  X,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Crown,
  CreditCard,
} from 'lucide-react';
import { motion } from 'motion/react';

interface SubscriptionPlansModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onOpenWallet?: () => void;
}

export const SubscriptionPlansModal: React.FC<SubscriptionPlansModalProps> = ({
  isOpen = true,
  onClose,
  onSuccess,
  onOpenWallet,
}) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !currentUser) return null;

  const currentPlan = currentUser.subscriptionTier || currentUser.plan || 'free';

  const handleUpgrade = (tier: SubscriptionTier) => {
    setSubmitting(true);
    try {
      const res = StorageService.upgradeUserSubscription(currentUser.id, tier);
      if (!res.success) {
        toastError(res.error || 'Failed to upgrade subscription.');
        return;
      }
      success(`Successfully subscribed to the ${(tier || 'PRO').toUpperCase()} plan!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err.message || 'Subscription failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const plans = [
    {
      tier: 'free' as SubscriptionTier,
      name: 'Student Basic',
      price: 0,
      period: 'Forever free',
      description: 'Everything you need to buy and sell on campus.',
      features: [
        'Up to 5 active marketplace listings',
        'Standard search ranking',
        'Direct buyer WhatsApp & chat',
        'Basic campus wallet access',
        'Standard escrow protection',
      ],
      badge: 'Current',
      highlight: false,
    },
    {
      tier: 'pro_student' as SubscriptionTier,
      name: 'Pro Student',
      price: 1500,
      period: 'per month',
      description: 'For active student freelancers, tutors, and sellers.',
      features: [
        'Unlimited active listings',
        '3x Higher search & explore priority',
        'Exclusive Pro Verified Student badge',
        'Post unlimited freelance services & gigs',
        'Apply to priority campus jobs first',
        'Zero commission on first 3 wallet withdrawals',
      ],
      badge: 'Popular',
      highlight: true,
    },
    {
      tier: 'campus_merchant' as SubscriptionTier,
      name: 'Campus Merchant',
      price: 4500,
      period: 'per month',
      description: 'For full businesses, eateries, printers, and brands.',
      features: [
        'Dedicated Verified Storefront Page',
        'Top-of-Feed Banner Ad Placements',
        'Organize and sell unlimited event tickets',
        'Direct customer phone & WhatsApp ordering',
        'Priority customer support ticket routing',
        'Comprehensive sales & profile analytics',
      ],
      badge: 'Enterprise',
      highlight: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-base">CampusCore Pro Subscriptions</h2>
              <p className="text-[11px] text-slate-500">Accelerate your campus business and freelance revenue</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => {
              const isCurrent = currentPlan === p.tier;

              return (
                <div
                  key={p.tier}
                  className={`rounded-3xl p-6 flex flex-col justify-between border-2 transition-all relative ${
                    p.highlight
                      ? 'border-indigo-600 bg-indigo-50/20 shadow-xl shadow-indigo-500/5 ring-2 ring-indigo-600/20'
                      : 'border-slate-200 bg-white shadow-sm'
                  }`}
                >
                  {p.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-black text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" /> Best Value
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">{p.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{p.description}</p>
                    </div>

                    <div className="pt-2">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900">
                        {p.price === 0 ? '₦0' : `₦${p.price.toLocaleString()}`}
                      </span>
                      <span className="text-xs text-slate-500 ml-1.5 font-medium">{p.period}</span>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-2.5">
                      {p.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs cursor-default"
                      >
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(p.tier)}
                        disabled={submitting}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 ${
                          p.highlight
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-slate-900 hover:bg-black text-white'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        {p.price === 0 ? 'Switch to Free' : `Upgrade (₦${p.price.toLocaleString()})`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
