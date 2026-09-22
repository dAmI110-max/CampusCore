import React, { useState } from 'react';
import { ReportReason } from '../../types';
import { StorageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Flag, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'product' | 'accommodation' | 'user';
  targetId: string;
  targetTitle?: string;
  targetName?: string;
  targetUserName?: string;
}

const REPORT_REASONS: ReportReason[] = [
  'Scam or Fraud',
  'Fake / Counterfeit Item',
  'Prohibited / Illegal Item',
  'Misleading Information',
  'Wrong / Deceptive Price',
  'Harassment / Inappropriate Behavior',
  'Spam or Duplicate',
  'Other',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
  targetUserName,
}) => {
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const [reason, setReason] = useState<ReportReason>('Scam or Fraud');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      error('Please provide a brief description for our moderation team.');
      return;
    }

    setIsSubmitting(true);

    try {
      StorageService.createReport({
        reporterId: currentUser?.id || 'usr-anonymous',
        reporterName: currentUser?.fullName || 'Anonymous Student',
        reporterEmail: currentUser?.email || 'anonymous@campuscore.ng',
        productId: targetType === 'product' ? targetId : undefined,
        productTitle: targetType === 'product' ? targetTitle : undefined,
        accommodationId: targetType === 'accommodation' ? targetId : undefined,
        accommodationTitle: targetType === 'accommodation' ? targetTitle : undefined,
        reportedUserId: targetType === 'user' ? targetId : undefined,
        reportedUserName: targetType === 'user' ? targetUserName : undefined,
        reason,
        description: description.trim(),
      });

      success('Report submitted successfully. Ace Tech safety moderators will review this immediately.');
      setDescription('');
      onClose();
    } catch {
      error('Could not submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 overflow-hidden relative"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Report {targetType === 'product' ? 'Listing' : targetType === 'accommodation' ? 'Accommodation' : 'User'}
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">
                {targetTitle || targetUserName || 'Flag suspicious student activity'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reason for Reporting *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Details / Evidence *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe why this listing or user violates CampusCore safety standards (e.g. asked for advance fee, fake item, wrong campus location)..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 placeholder:text-slate-400 resize-none"
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                False or abusive reports may lead to account penalties. All reports are strictly confidential.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm shadow-rose-600/20 active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
