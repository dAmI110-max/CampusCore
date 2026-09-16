import React from 'react';
import { ShieldCheck, MapPin, Eye, AlertTriangle, X } from 'lucide-react';
import { motion } from 'motion/react';

interface SafetyGuidelinesModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export const SafetyGuidelinesModal: React.FC<SafetyGuidelinesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-slate-900 rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close safety guidelines"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Campus Safety Guidelines</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">CampusCore Student Safety & Trust Framework</p>
          </div>
        </div>

        <div className="space-y-3.5 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Meet in Public Campus Locations</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Always arrange physical handoffs inside university grounds (Student Union Building, Main Gate, Departmental Foyers, or Central Library) during daylight hours.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Inspect Item Before Payment</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Test electronics, verify phone battery health & IMEI, and inspect condition thoroughly before completing payments or releasing escrow.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Zero Advance Commitment Fees</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Never pay "delivery booking fees" or "hostel inspection deposits" prior to seeing the product or lodge in person.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center sm:text-left font-medium">
            Support: <span className="text-indigo-600 dark:text-indigo-400 font-bold">cplugsupport@gmail.com</span>
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </motion.div>
    </div>
  );
};
