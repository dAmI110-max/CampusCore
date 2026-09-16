import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { AdPlacement } from '../../types';
import {
  X,
  Megaphone,
  Calendar,
  DollarSign,
  TrendingUp,
  Image,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';

interface CreateAdCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateAdCampaignModal: React.FC<CreateAdCampaignModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();
  const campuses = StorageService.getCampuses();

  const [title, setTitle] = useState('');
  const [placement, setPlacement] = useState<AdPlacement>('feed_sponsor');
  const [campusId, setCampusId] = useState(currentUser?.campusId || campuses[0]?.id || 'campus-osogbo');
  const [targetUrl, setTargetUrl] = useState('https://campusplug.app');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80'
  );
  const [durationDays, setDurationDays] = useState(7);
  const [dailyBudget, setDailyBudget] = useState(500); // ₦500/day
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !currentUser) return null;

  const totalCost = durationDays * dailyBudget;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toastError('Please specify an ad campaign title.');
      return;
    }
    if (!imageUrl.trim()) {
      toastError('Please provide a banner image URL.');
      return;
    }

    setSubmitting(true);
    try {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

      StorageService.createAdCampaign({
        advertiserId: currentUser.id,
        advertiserName: currentUser.fullName,
        advertiserEmail: currentUser.email,
        campaignName: title.trim(),
        title: title.trim(),
        description: `Sponsored promotion by ${currentUser.fullName}`,
        bannerImage: imageUrl.trim(),
        destinationUrl: targetUrl.trim(),
        placement,
        targetCampusId: campusId,
        targetUniversityId: currentUser.universityId || 'uni-uniosun',
        budget: totalCost,
        costPerClick: 25,
        startDate,
        endDate,
      });

      success(`Ad campaign launched! ₦${totalCost.toLocaleString()} paid from wallet.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err.message || 'Ad creation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-base">Promote with CampusCore Ads</h2>
              <p className="text-[11px] text-slate-500">Reach 10,000+ active students on campus</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Campaign Title / Headline *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 50% Off Campus Shawarma & Drinks This Week!"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Placement
              </label>
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value as AdPlacement)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium outline-none focus:border-indigo-500"
              >
                <option value="feed_banner">Home & Feed Banner</option>
                <option value="sidebar">Sidebar Featured Slot</option>
                <option value="search_top">Top of Search Results</option>
                <option value="services_banner">Services & Gigs Section</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Campus
              </label>
              <select
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium outline-none focus:border-indigo-500"
              >
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Creative Banner Image URL *
            </label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Destination URL or WhatsApp Link
            </label>
            <input
              type="url"
              required
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:border-indigo-500"
            />
          </div>

          {/* Budget & Duration */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Campaign Duration
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-indigo-500"
                >
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days (1 Week)</option>
                  <option value={14}>14 Days (2 Weeks)</option>
                  <option value={30}>30 Days (1 Month)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Daily Budget
                </label>
                <select
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-indigo-500"
                >
                  <option value={300}>₦300 / day (~600 views)</option>
                  <option value={500}>₦500 / day (~1,500 views)</option>
                  <option value={1000}>₦1,000 / day (~3,500 views)</option>
                  <option value={2500}>₦2,500 / day (~10,000 views)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">Total Campaign Investment:</span>
              <span className="text-base font-black text-indigo-600">
                ₦{totalCost.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? 'Launching...' : `Pay ₦${totalCost.toLocaleString()} & Launch`}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
