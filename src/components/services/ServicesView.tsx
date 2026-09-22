import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import {
  ServiceListing,
  ServiceCategory,
  ServiceRequest,
  Booking,
} from '../../types';
import { ServiceCard } from './ServiceCard';
import { ServiceDetailModal } from './ServiceDetailModal';
import { CreateServiceModal } from './CreateServiceModal';
import { ServiceRequestModal } from './ServiceRequestModal';
import { ServiceBookingModal } from './ServiceBookingModal';
import { ServiceDeliveryModal } from './ServiceDeliveryModal';
import { EmptyState } from '../common/EmptyState';
import {
  Search,
  Plus,
  Briefcase,
  Filter,
  Layers,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  Package,
  Calendar,
  DollarSign,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ServicesViewProps {
  onBack?: () => void;
  onOpenChat?: (userId: string) => void;
  onNavigateToChat?: (userId: string) => void;
  onNavigateToWallet?: () => void;
  onOpenAuth?: () => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  onBack,
  onOpenChat,
  onNavigateToChat,
  onNavigateToWallet,
  onOpenAuth,
}) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();
  const handleChat = onOpenChat || onNavigateToChat;

  const [activeTab, setActiveTab] = useState<'explore' | 'my_requests' | 'my_bookings' | 'my_listings'>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [selectedPricingModel, setSelectedPricingModel] = useState('all');
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Modals
  const [selectedService, setSelectedService] = useState<ServiceListing | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [requestQuoteService, setRequestQuoteService] = useState<ServiceListing | null>(null);
  const [bookingService, setBookingService] = useState<ServiceListing | null>(null);
  const [deliveryModalData, setDeliveryModalData] = useState<{
    request: ServiceRequest;
    mode: 'submit_delivery' | 'review_delivery';
  } | null>(null);

  // Quote review modal
  const [quoteReviewRequest, setQuoteReviewRequest] = useState<ServiceRequest | null>(null);

  // Data states
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const loadData = () => {
    setCategories(StorageService.getServiceCategories());
    setCampuses(StorageService.getCampuses());
    setServices(
      StorageService.getServices({
        categoryId: selectedCategory,
        campusId: selectedCampus,
        pricingModel: selectedPricingModel,
        deliveryMethod: selectedDeliveryMethod,
        search: searchQuery,
      })
    );
    if (currentUser) {
      setServiceRequests(StorageService.getServiceRequests(currentUser.id));
      setBookings(StorageService.getBookings(currentUser.id));
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('campuscore_storage_update', handleUpdate);
    return () => window.removeEventListener('campuscore_storage_update', handleUpdate);
  }, [selectedCategory, selectedCampus, selectedPricingModel, selectedDeliveryMethod, searchQuery, currentUser?.id]);

  const handleAcceptQuote = (req: ServiceRequest) => {
    const res = StorageService.acceptServiceQuote(req.id);
    if (!res.success) {
      toastError(res.error || 'Failed to accept quote.');
      return;
    }
    success('Quote accepted! Escrow funds locked safely. Provider will begin work.');
    setQuoteReviewRequest(null);
    loadData();
  };

  const myListedServices = services.filter((s) => s.providerId === currentUser?.id);

  return (
    <div className="min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Back Navigation Bar */}
      {onBack && (
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back</span>
          </button>
          <span className="text-xs text-slate-400">/ Services</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-indigo-900/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-sm border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Campus Freelance & Student Skills Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Campus Services Marketplace
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Hire verified student experts for assignments, graphics, programming, hair styling, photography & repairs — backed by 100% Escrow Buyer Protection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="offer-service-btn"
              onClick={() => {
                if (!currentUser) {
                  if (onOpenAuth) onOpenAuth();
                  return;
                }
                setCreateModalOpen(true);
              }}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Offer a Campus Service
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'explore'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Explore Services
          </button>

          {currentUser && (
            <>
              <button
                onClick={() => setActiveTab('my_requests')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 relative ${
                  activeTab === 'my_requests'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Package className="w-3.5 h-3.5" /> My Service Requests & Quotes
                {serviceRequests.filter((r) => r.status === 'quoted' || r.status === 'ready_for_review').length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('my_bookings')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'my_bookings'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" /> Service Bookings ({bookings.length})
              </button>

              <button
                onClick={() => setActiveTab('my_listings')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'my_listings'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" /> My Offered Services ({myListedServices.length})
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'explore' && (
        <div className="space-y-6">
          {/* Category Horizontal Scrolling Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === c.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50'
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, skills, student providers..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 flex-1 sm:flex-none"
              >
                <option value="all">All Campuses</option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>

              <select
                value={selectedPricingModel}
                onChange={(e) => setSelectedPricingModel(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 flex-1 sm:flex-none"
              >
                <option value="all">All Rates</option>
                <option value="fixed">Fixed Price</option>
                <option value="starting_from">Starting From</option>
                <option value="hourly">Hourly</option>
                <option value="custom_quote">Custom Quote</option>
              </select>

              <select
                value={selectedDeliveryMethod}
                onChange={(e) => setSelectedDeliveryMethod(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 flex-1 sm:flex-none"
              >
                <option value="all">All Delivery</option>
                <option value="on_campus">On-Campus</option>
                <option value="online">Online/Digital</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Service Grid */}
          {services.length === 0 ? (
            <EmptyState
              title="No services found"
              description="Try adjusting your search terms, campus filter, or category selection."
              actionLabel="Offer This Service"
              onAction={() => setCreateModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onSelect={(s) => setSelectedService(s)}
                  onRequestQuote={(s) => setRequestQuoteService(s)}
                  onBook={(s) => setBookingService(s)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* MY REQUESTS & QUOTES TAB */}
      {activeTab === 'my_requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">
              Service Requests & Escrow Orders ({serviceRequests.length})
            </h2>
            <span className="text-xs text-slate-500">
              Auto-tracked under CampusCore Escrow Protocol
            </span>
          </div>

          {serviceRequests.length === 0 ? (
            <EmptyState
              title="No active service requests"
              description="When you request custom quotes or work from campus providers, they will show up here."
              actionLabel="Browse Available Services"
              onAction={() => setActiveTab('explore')}
            />
          ) : (
            <div className="space-y-3">
              {serviceRequests.map((req) => {
                const isClient = req.clientId === currentUser?.id;
                const isProvider = req.providerId === currentUser?.id;

                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-500">
                            {req.requestNumber}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                              req.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : req.status === 'ready_for_review'
                                ? 'bg-purple-100 text-purple-800'
                                : req.status === 'quoted'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {req.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base mt-1">
                          {req.serviceTitle}
                        </h3>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          {req.quoteAmount ? 'Quoted Rate' : 'Estimated Budget'}
                        </span>
                        <span className="text-lg font-black text-slate-900">
                          ₦{(req.quoteAmount || req.budget).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl">
                      {req.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Client: <strong className="text-slate-900">{req.clientName}</strong></span>
                        <span>Provider: <strong className="text-slate-900">{req.providerName}</strong></span>
                        {req.deadline && <span>Deadline: {req.deadline}</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* If quoted and current user is client -> Accept Quote & Lock Escrow */}
                        {req.status === 'quoted' && isClient && (
                          <button
                            onClick={() => setQuoteReviewRequest(req)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
                          >
                            Review & Fund Escrow (₦{req.quoteAmount?.toLocaleString()})
                          </button>
                        )}

                        {/* If in_progress and current user is provider -> Submit Work */}
                        {req.status === 'in_progress' && isProvider && (
                          <button
                            onClick={() => setDeliveryModalData({ request: req, mode: 'submit_delivery' })}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                          >
                            Submit Deliverables
                          </button>
                        )}

                        {/* If ready_for_review and current user is client -> Approve & Release Escrow */}
                        {req.status === 'ready_for_review' && isClient && (
                          <button
                            onClick={() => setDeliveryModalData({ request: req, mode: 'review_delivery' })}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm animate-pulse"
                          >
                            Inspect & Release Payment
                          </button>
                        )}

                        {onNavigateToChat && (
                          <button
                            onClick={() => onNavigateToChat(isClient ? req.providerId : req.clientId)}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                          >
                            Message {isClient ? 'Provider' : 'Client'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MY BOOKINGS TAB */}
      {activeTab === 'my_bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">
              My Service Bookings ({bookings.length})
            </h2>
          </div>

          {bookings.length === 0 ? (
            <EmptyState
              title="No service appointments booked"
              description="Booked time slots for services like haircuts, photography sessions, tutoring, and device repairs will appear here."
              actionLabel="Book a Service"
              onAction={() => setActiveTab('explore')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((b) => (
                <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-slate-400">{b.bookingNumber}</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{b.serviceTitle}</h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      {b.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Date & Time</span>
                      <span className="font-semibold text-slate-900">{b.date}</span>
                      <span className="text-slate-500 text-[11px] block">{b.timeSlot}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Location</span>
                      <span className="font-semibold text-slate-900 truncate block">{b.location}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 text-xs">
                    <span className="text-slate-500">
                      With: <strong>{b.customerId === currentUser?.id ? b.providerName : b.customerName}</strong>
                    </span>
                    <span className="font-black text-indigo-600">
                      ₦{b.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MY LISTINGS TAB */}
      {activeTab === 'my_listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">
              Services You Offer ({myListedServices.length})
            </h2>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add New Service
            </button>
          </div>

          {myListedServices.length === 0 ? (
            <EmptyState
              title="You haven't listed any services yet"
              description="Share your skills and earn money right on campus. Web design, tutoring, repairs, fashion styling, and more!"
              actionLabel="Offer Your First Service"
              onAction={() => setCreateModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myListedServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onSelect={(s) => setSelectedService(s)}
                  onRequestQuote={(s) => setRequestQuoteService(s)}
                  onBook={(s) => setBookingService(s)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onRequestQuote={(s) => setRequestQuoteService(s)}
          onBook={(s) => setBookingService(s)}
          onContactProvider={(pId) => {
            if (onNavigateToChat) onNavigateToChat(pId);
          }}
        />
      )}

      <CreateServiceModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={loadData}
      />

      <ServiceRequestModal
        service={requestQuoteService}
        isOpen={!!requestQuoteService}
        onClose={() => setRequestQuoteService(null)}
        onSuccess={loadData}
      />

      <ServiceBookingModal
        service={bookingService}
        isOpen={!!bookingService}
        onClose={() => setBookingService(null)}
        onSuccess={loadData}
      />

      {deliveryModalData && (
        <ServiceDeliveryModal
          request={deliveryModalData.request}
          mode={deliveryModalData.mode}
          isOpen={true}
          onClose={() => setDeliveryModalData(null)}
          onSuccess={loadData}
        />
      )}

      {/* Quote Review Modal */}
      {quoteReviewRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Review Quotation from Provider</h3>
              </div>
              <button
                onClick={() => setQuoteReviewRequest(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">{quoteReviewRequest.serviceTitle}</h4>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Quoted Amount:</span>
                  <span className="text-xl font-black text-indigo-700">
                    ₦{quoteReviewRequest.quoteAmount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Estimated Delivery:</span>
                  <span className="font-semibold text-slate-800">
                    {quoteReviewRequest.quoteDeliveryDays || 3} days
                  </span>
                </div>
              </div>

              {quoteReviewRequest.quoteTerms && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Provider Scope & Terms
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {quoteReviewRequest.quoteTerms}
                  </p>
                </div>
              )}

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Escrow Protected Payment</span>
                  ₦{quoteReviewRequest.quoteAmount?.toLocaleString()} will be temporarily debited from your wallet and held securely in Escrow. The provider will only receive it after you inspect and approve the completed deliverables.
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setQuoteReviewRequest(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
                >
                  Decline / Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleAcceptQuote(quoteReviewRequest)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
                >
                  Accept Quote & Fund Escrow
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
