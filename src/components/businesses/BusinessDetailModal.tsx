import React from 'react';
import { BusinessProfile } from '../../types';
import {
  X,
  Building2,
  MapPin,
  Star,
  Phone,
  Clock,
  CheckCircle2,
  Share2,
  Globe,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { motion } from 'motion/react';

interface BusinessDetailModalProps {
  business: BusinessProfile | null;
  onClose: () => void;
  onNavigateToChat?: (userId: string) => void;
}

export const BusinessDetailModal: React.FC<BusinessDetailModalProps> = ({
  business,
  onClose,
  onNavigateToChat,
}) => {
  if (!business) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Banner */}
        <div className="relative aspect-[16/8] bg-slate-900 overflow-hidden">
          <img
            src={business.banner || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'}
            alt={business.businessName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex items-end gap-4 text-white">
            <img
              src={business.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80'}
              alt={business.businessName}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-xl bg-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black">{business.businessName}</h1>
                {business.status === 'verified' && (
                  <CheckCircle2 className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <p className="text-xs text-slate-300 capitalize">{business.category} • {business.followersCount} followers</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Rating</span>
              <span className="font-black text-slate-900 text-sm flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {business.rating.toFixed(1)} ({business.totalReviews ?? business.reviewCount ?? 0} reviews)
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Working Hours</span>
              <span className="font-semibold text-slate-900">{business.openingHours || '08:00 AM - 08:00 PM'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Verification</span>
              <span className="font-bold text-blue-600 capitalize">{business.status} Business</span>
            </div>
          </div>

          {/* Location */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700">
            <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Store Location</span>
              <span>{business.address}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              About This Business
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              {business.description}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onNavigateToChat && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToChat(business.ownerId);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 text-indigo-600" /> Message Owner
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {business.whatsapp && (
              <a
                href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(
                  business.businessName
                )},%20I%20found%20your%20store%20on%20CampusCore.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
              >
                <Phone className="w-3.5 h-3.5" /> WhatsApp Order
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
