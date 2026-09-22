import React, { useState } from 'react';
import { StorageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { ServiceRequest } from '../../types';
import {
  X,
  CheckCircle,
  FileCheck,
  Link,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { motion } from 'motion/react';

interface ServiceDeliveryModalProps {
  request: ServiceRequest | null;
  mode: 'submit_delivery' | 'review_delivery';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ServiceDeliveryModal: React.FC<ServiceDeliveryModalProps> = ({
  request,
  mode,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success, error: toastError } = useToast();

  const [deliveryNotes, setDeliveryNotes] = useState(
    'I have completed the requested deliverables according to your specifications. Please find the work summary and files below.'
  );
  const [workUrl, setWorkUrl] = useState('https://drive.google.com/drive/folders/campuscore-demo-delivery');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const isProviderSubmitting = mode === 'submit_delivery';

  const handleProviderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryNotes.trim()) {
      toastError('Please describe the delivered work.');
      return;
    }

    setSubmitting(true);
    try {
      const urls = workUrl.trim() ? [workUrl.trim()] : [];
      StorageService.submitServiceDelivery(request.id, deliveryNotes, urls);
      success('Work deliverables submitted to client for approval!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err.message || 'Failed to submit deliverables.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClientApprove = () => {
    setSubmitting(true);
    try {
      const res = StorageService.approveServiceDelivery(request.id);
      if (!res.success) {
        toastError(res.error || 'Failed to approve delivery.');
        return;
      }
      success('Work approved! Escrow payment has been released to the service provider.');
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err.message || 'Failed to release escrow.');
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
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-base">
                {isProviderSubmitting ? 'Submit Work Deliverables' : 'Review & Approve Delivery'}
              </h2>
              <p className="text-[11px] text-slate-500">Order: {request.requestNumber}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <h4 className="text-xs font-bold text-slate-900">{request.serviceTitle}</h4>
            <div className="flex justify-between items-center mt-2 text-xs text-slate-600">
              <span>Client: {request.clientName}</span>
              <span className="font-bold text-indigo-600">
                Escrow Value: ₦{(request.quoteAmount || request.budget).toLocaleString()}
              </span>
            </div>
          </div>

          {isProviderSubmitting ? (
            <form onSubmit={handleProviderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Completion Notes & Summary *
                </label>
                <textarea
                  required
                  rows={4}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Explain what was accomplished, access credentials, instructions for testing or viewing..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Deliverable Files / Link URL (Google Drive, GitHub, Figma, etc.)
                </label>
                <div className="relative">
                  <Link className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={workUrl}
                    onChange={(e) => setWorkUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 text-sm outline-none"
                  />
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
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  {submitting ? 'Submitting...' : 'Submit Completed Work'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Provider Delivery Notes
                </span>
                <p className="text-xs text-emerald-950 whitespace-pre-line leading-relaxed">
                  {request.deliveryNotes || 'Work has been completed and is ready for inspection.'}
                </p>
                {request.deliveryWorkUrls && request.deliveryWorkUrls.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-emerald-800 block mb-1">
                      Deliverable Links:
                    </span>
                    {request.deliveryWorkUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-indigo-700 hover:underline flex items-center gap-1"
                      >
                        <Link className="w-3.5 h-3.5" /> {url}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Escrow Release Confirmation</span>
                  Approving this delivery will immediately release ₦
                  {(request.quoteAmount || request.budget).toLocaleString()} from Escrow to{' '}
                  {request.providerName}'s wallet.
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleClientApprove}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  {submitting ? 'Releasing...' : 'Approve & Release Funds'}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
