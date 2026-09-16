import React from 'react';
import { Accommodation } from '../../types';
import { MapPin, Sparkles, MessageCircle, Home } from 'lucide-react';
import { motion } from 'motion/react';

interface AccommodationCardProps {
  accommodation: Accommodation;
  onClick: (accommodation: Accommodation) => void;
}

export const AccommodationCard: React.FC<AccommodationCardProps> = ({
  accommodation,
  onClick,
}) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const primaryImage =
    accommodation.images?.[0] ||
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80';

  const getWhatsAppUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanNum = accommodation.ownerWhatsapp.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Hello, I saw your accommodation listing "${accommodation.title}" on CampusCore UNIOSUN (₦${accommodation.price.toLocaleString()} ${accommodation.rentalPeriod}) and I'd like to schedule an inspection.`
    );
    window.open(`https://wa.me/${cleanNum}?text=${msg}`, '_blank');
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(accommodation)}
      className="group relative bg-white dark:bg-slate-900 rounded-[26px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer flex flex-col h-full"
    >
      {/* Image & Badges */}
      <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={primaryImage}
          alt={accommodation.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <div className="flex flex-wrap gap-1.5 pointer-events-auto">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900/85 text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
              <Home className="w-2.5 h-2.5" /> {accommodation.roomType}
            </span>
            {accommodation.featured && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" /> Featured Lodge
              </span>
            )}
          </div>

          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs shadow-xs ${
              accommodation.available
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            {accommodation.available ? 'Available' : 'Occupied'}
          </span>
        </div>

        {/* Distance tag */}
        <div className="absolute bottom-2 left-2.5">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-950/80 text-indigo-200 backdrop-blur-xs flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5 text-indigo-400" /> {accommodation.distanceToCampus}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              {formatPrice(accommodation.price)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/{(accommodation.rentalPeriod || 'year').toLowerCase()}</span>
          </div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {accommodation.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {accommodation.description}
          </p>
        </div>

        {/* Amenities preview */}
        <div className="flex flex-wrap gap-1">
          {accommodation.amenities?.slice(0, 3).map((amenity, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
            >
              {amenity}
            </span>
          ))}
          {accommodation.amenities && accommodation.amenities.length > 3 && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium self-center">
              +{accommodation.amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Owner & WhatsApp button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={accommodation.ownerAvatar}
              alt={accommodation.ownerName}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{accommodation.ownerName}</span>
          </div>

          <button
            onClick={getWhatsAppUrl}
            className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-indigo-600 dark:fill-indigo-400 text-indigo-600 dark:text-indigo-400" />
            Inspect
          </button>
        </div>
      </div>
    </motion.div>
  );
};
