import React, { useState } from 'react';
import { ServiceListing } from '../../types';
import {
  X,
  Star,
  CheckCircle2,
  MapPin,
  Clock,
  Briefcase,
  ShieldCheck,
  Zap,
  Calendar,
  Phone,
  MessageCircle,
  Share2,
  ArrowRight,
  Package,
} from 'lucide-react';
import { motion } from 'motion/react';

interface ServiceDetailModalProps {
  service: ServiceListing | null;
  onClose: () => void;
  onRequestQuote: (service: ServiceListing) => void;
  onBook: (service: ServiceListing) => void;
  onContactProvider: (providerId: string) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  onClose,
  onRequestQuote,
  onBook,
  onContactProvider,
}) => {
  if (!service) return null;

  const [selectedImage, setSelectedImage] = useState(
    service.portfolioImages[0] || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80'
  );

  const isFixed = service.pricingModel === 'fixed';
  const isHourly = service.pricingModel === 'hourly';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              {service.categoryName}
            </span>
            {service.featured && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-600 fill-amber-600" /> Featured
              </span>
            )}
            <span className="text-xs text-slate-500 font-medium">
              Delivery: {(service.deliveryMethod || 'STANDARD').replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Gallery & Description */}
            <div className="lg:col-span-7 space-y-5">
              {/* Main Image */}
              <div className="relative aspect-[16/10] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <img
                  src={selectedImage}
                  alt={service.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails */}
              {service.portfolioImages && service.portfolioImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {service.portfolioImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                        selectedImage === img
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`thumb-${i}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Service Title */}
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {service.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1 font-bold text-slate-900">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{service.providerRating.toFixed(1)}</span>
                    <span className="text-slate-500 font-normal">({service.providerReviewCount} reviews)</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{service.providerCompletedJobs} Completed Orders</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{service.turnaroundTime || '2-3 Days Turnaround'}</span>
                  </div>
                </div>
              </div>

              {/* Service Description */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  About This Service
                </h3>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Service Packages / Tiers if available */}
              {service.packages && service.packages.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Available Service Packages
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {service.packages.map((pkg, idx) => (
                      <div
                        key={idx}
                        className="border border-slate-200 rounded-2xl p-3.5 bg-white hover:border-indigo-300 transition-colors flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-900 text-xs">{pkg.name}</h4>
                            <span className="text-xs font-black text-indigo-600">
                              ₦{pkg.price.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">{pkg.description}</p>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2">
                            <Clock className="w-3 h-3" />
                            <span>{pkg.deliveryDays} day(s) delivery</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Provider Profile & Actions */}
            <div className="lg:col-span-5 space-y-5">
              {/* Pricing & Booking Card */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-lg space-y-4">
                <div>
                  <span className="text-xs text-indigo-300 font-medium uppercase tracking-wider block">
                    {isFixed ? 'Guaranteed Escrow Rate' : 'Starting Price'}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black">
                      ₦{service.startingPrice.toLocaleString()}
                    </span>
                    {isHourly && <span className="text-xs text-indigo-200">/ hour</span>}
                  </div>
                  <p className="text-xs text-indigo-200/80 mt-1">
                    Protected by CampusCore Escrow Guarantee. Funds released only when you approve the work.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    id="service-modal-book-btn"
                    onClick={() => {
                      onClose();
                      onBook(service);
                    }}
                    className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" /> Book Service Appointment
                  </button>

                  <button
                    id="service-modal-quote-btn"
                    onClick={() => {
                      onClose();
                      onRequestQuote(service);
                    }}
                    className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Package className="w-3.5 h-3.5" /> Request Custom Scope & Quote
                  </button>
                </div>
              </div>

              {/* Provider Info Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={service.providerAvatar}
                    alt={service.providerName}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="font-bold text-slate-900 text-base">{service.providerName}</h4>
                      {service.providerVerification && (
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {service.providerCampus} ({service.providerUniversity || 'UNIOSUN'})
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Rating</span>
                    <span className="text-sm font-black text-slate-900 flex items-center justify-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {service.providerRating.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Jobs Completed</span>
                    <span className="text-sm font-black text-slate-900">
                      {service.providerCompletedJobs}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => {
                      onClose();
                      onContactProvider(service.providerId);
                    }}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-indigo-600" /> Chat with Provider
                  </button>

                  {service.providerWhatsapp && (
                    <a
                      href={`https://wa.me/${service.providerWhatsapp.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(
                        service.providerName
                      )},%20I%20saw%20your%20service%20"${encodeURIComponent(
                        service.title
                      )}"%20on%20CampusCore.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Provider
                    </a>
                  )}
                </div>
              </div>

              {/* Escrow Guarantee Banner */}
              <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <span className="font-bold block">CampusCore Service Protection</span>
                  Never pay off-platform! All service bookings are locked in Escrow. If the provider fails to deliver to specifications, your payment is refunded 100%.
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
