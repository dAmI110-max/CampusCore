import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MarketService } from '../../services/marketService';
import { StorageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { ServiceListing } from '../../types';
import {
  X,
  Send,
  Calendar,
  DollarSign,
  FileText,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { motion } from 'motion/react';

interface ServiceRequestModalProps {
  service: ServiceListing | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  service,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState<number>(service?.startingPrice || 5000);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !service || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!description.trim() || description.length < 15) {
      toastError('Please describe your project requirements (at least 15 characters).');
      return;
    }
    if (budget <= 0) {
      toastError('Please enter a realistic estimated budget.');
      return;
    }

    setSubmitting(true);
    try {
      if (MarketService.enabled) {
        const res = await MarketService.createServiceRequest({
          serviceId: service.id,
          description: description.trim(),
          budget: Number(budget),
          deadlineDate: deadline,
        });
        if (!res.success) {
          toastError(res.message || 'Failed to submit request.');
          return;
        }
        success('Request sent! The provider will review it and send you a quote.');
        onSuccess();
        onClose();
        return;
      }
      StorageService.createServiceRequest({
        serviceId: service.id,
        serviceTitle: service.title,
        clientId: currentUser.id,
        clientName: currentUser.fullName,
        clientAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        clientCampus: currentUser.campusName || 'Main Campus',
        providerId: service.providerId,
        providerName: service.providerName,
        providerAvatar: service.providerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        description: description.trim(),
        budget: Number(budget),
        deadlineDate: deadline,
        maxRevisions: 2,
      });

      success('Service request submitted! The provider will review and send a formal quote.');
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err.message || 'Failed to submit request.');
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
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-base">Request Custom Scope & Quote</h2>
              <p className="text-[11px] text-slate-500">For {service.providerName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center gap-3">
            <img
              src={service.portfolioImages[0]}
              alt={service.title}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 truncate">{service.title}</h4>
              <p className="text-[11px] text-indigo-700 font-semibold">
                Base rate: ₦{service.startingPrice.toLocaleString()} ({service.pricingModel})
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Project Description & Requirements *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain exactly what you need done, format specifications, guidelines, or attach references..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Budget (₦) *
              </label>
              <input
                type="number"
                min="500"
                step="500"
                required
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Expected Deadline *
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl flex items-start gap-2 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <span>
              Once the provider accepts and sends a formal quote, your wallet funds are held securely in Escrow until the job is delivered and approved.
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Sending Request...' : 'Send Request to Provider'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
