import React, { useState } from 'react';
import { Accommodation } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  X,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Flag,
  Share2,
  Check,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AccommodationDetailModalProps {
  accommodation: Accommodation | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReport: (accommodation: Accommodation) => void;
}

export const AccommodationDetailModal: React.FC<AccommodationDetailModalProps> = ({
  accommodation,
  isOpen,
  onClose,
  onOpenReport,
}) => {
  const { success } = useToast();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !accommodation) return null;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getWhatsAppUrl = () => {
    const cleanNum = accommodation.ownerWhatsapp.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Hello, I saw your accommodation listing "${accommodation.title}" on CampusCore UNIOSUN (₦${accommodation.price.toLocaleString()} ${accommodation.rentalPeriod}) and I'd like to schedule an inspection.`
    );
    return `https://wa.me/${cleanNum}?text=${msg}`;
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    success('Lodge link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const images = accommodation.images && accommodation.images.length > 0 ? accommodation.images : [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-7 shadow-2xl border border-slate-100 relative my-6 max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {accommodation.roomType}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  accommodation.available
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {accommodation.available ? 'Available for Rent' : 'Occupied'}
              </span>
              {accommodation.featured && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500 text-white flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Featured
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleShare}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Share link"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
              </button>

              <button
                onClick={() => onOpenReport(accommodation)}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Report lodge"
              >
                <Flag className="w-5 h-5" />
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto pr-1 py-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Photo Column */}
            <div className="lg:col-span-6 space-y-3">
              <div className="relative w-full aspect-4/3 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                <img
                  src={images[selectedImageIndex]}
                  alt={accommodation.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Box */}
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-xs text-emerald-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Accommodation Safety Notice
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-900/80">
                  Never transfer advance inspection fees or rent deposits prior to visiting the lodge in person and meeting the caretaker or landlord.
                </p>
              </div>
            </div>

            {/* Right Details Column */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
                      {formatPrice(accommodation.price)}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">
                      / {(accommodation.rentalPeriod || 'year').toLowerCase()}
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 leading-snug">
                    {accommodation.title}
                  </h1>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">{accommodation.location}</span>
                    <span className="text-slate-400 block text-[11px]">{accommodation.distanceToCampus}</span>
                  </div>
                </div>

                {/* Amenities List */}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Lodge Features & Amenities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {accommodation.amenities?.map((amenity, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/60 p-3.5 rounded-2xl border border-slate-100">
                    {accommodation.description}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  Schedule Inspection on WhatsApp
                </a>

                {accommodation.ownerPhone && (
                  <a
                    href={`tel:${accommodation.ownerPhone}`}
                    className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Caretaker / Owner ({accommodation.ownerPhone})
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
