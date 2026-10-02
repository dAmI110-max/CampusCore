import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MarketService } from '../../services/marketService';
import { Product, Order } from '../../types';
import {
  ShieldCheck,
  Lock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Info,
  Calendar,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';

interface EscrowCheckoutModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: (order: Order) => void;
  onNavigateToWallet?: () => void;
}

export const EscrowCheckoutModal: React.FC<EscrowCheckoutModalProps> = ({
  product,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { success, error: showError } = useToast();

  const [deliveryCampus, setDeliveryCampus] = useState(product.sellerCampus || 'Osogbo (Main Campus)');
  const [deliveryLocation, setDeliveryLocation] = useState('Student Union Building (SUB)');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!currentUser) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    if (!MarketService.enabled) {
      showError('Online payments are not available right now. Please contact the seller directly.');
      return;
    }
    if (product.sellerId === currentUser.id) {
      showError('You cannot buy your own listing.');
      return;
    }

    setIsProcessing(true);
    // Server looks up the real price, creates the escrow order, and returns Paystack's secure checkout page.
    const res = await MarketService.startCheckout(product.id, {
      campus: deliveryCampus,
      location: deliveryLocation,
      notes: deliveryNotes,
    });

    if (res.success && res.data?.url) {
      success('Redirecting you to Paystack to complete payment…');
      window.location.assign(res.data.url); // full-page redirect works reliably on iOS, Android and desktop
      return; // keep the spinner until the browser navigates away
    }
    setIsProcessing(false);
    showError(res.message || 'Could not start payment. Please try again.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Campus Safe Order & Escrow</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">UNIOSUN Verified Student Buyer Protection</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Card Summary */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 mb-5 flex items-center gap-3">
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'}
            alt={product.title}
            className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{product.title}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>Seller: {product.sellerName}</span>
              <span>&bull;</span>
              <span>{product.sellerCampus}</span>
            </div>
            <div className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
              ₦{product.price.toLocaleString()}
            </div>
          </div>
        </div>

        <form onSubmit={handleCheckout} className="space-y-4">
          {/* Meetup / Delivery Info */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Pickup Campus & Meetup Point *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              <select
                value={deliveryCampus}
                onChange={(e) => setDeliveryCampus(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="Osogbo (Main Campus)" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Osogbo (Main Campus)</option>
                <option value="Okuku Campus" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Okuku Campus</option>
                <option value="Ikire Campus" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Ikire Campus</option>
                <option value="Ejigbo Campus" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Ejigbo Campus</option>
                <option value="Ifetedo Campus" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Ifetedo Campus</option>
                <option value="Ipetu-Ijesha Campus" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Ipetu-Ijesha Campus</option>
              </select>

              <select
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="Student Union Building (SUB)" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Student Union Building (SUB)</option>
                <option value="Campus Main Gate / Security Post" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Campus Main Gate</option>
                <option value="University Library" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">University Library</option>
                <option value="Central Cafeteria" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Central Cafeteria</option>
                <option value="Faculty Lecture Theater" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Faculty Lecture Theater</option>
                <option value="Hostel Area (Public Lounge)" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Hostel Area (Public Lounge)</option>
              </select>
            </div>

            <input
              type="text"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Specific meetup time or landmark (e.g. 2 PM after MAT101 lecture)"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Safety Notice */}
          <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2 bg-indigo-50/70 dark:bg-indigo-950/40 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
            <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <span>
              <strong>Escrow protected:</strong> Your payment is held safely by CampusCore and only released to the seller after you confirm you received the item. Pay by card, bank transfer or USSD.
            </span>
          </div>

          {/* Price Breakdown */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
            <div className="flex justify-between">
              <span>Item Price:</span>
              <span className="font-bold text-slate-900 dark:text-white">₦{product.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Buyer Protection:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Free (no extra fees)</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1.5 font-bold text-slate-900 dark:text-white">
              <span>Total to Pay Now:</span>
              <span className="text-indigo-600 dark:text-indigo-400 text-sm font-black">₦{product.price.toLocaleString()}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-sm transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Connecting to Paystack...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Pay ₦{product.price.toLocaleString()} Securely with Paystack
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
