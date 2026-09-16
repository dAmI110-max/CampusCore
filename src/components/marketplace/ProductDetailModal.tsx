import React, { useState, useEffect } from 'react';
import { Product, Order } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { ReviewsList } from '../reviews/ReviewsList';
import { EscrowCheckoutModal } from './EscrowCheckoutModal';
import {
  X,
  Heart,
  Share2,
  Flag,
  MapPin,
  Eye,
  Calendar,
  ShieldCheck,
  Phone,
  MessageCircle,
  Sparkles,
  Send,
  Check,
  Lock,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReport: (product: Product) => void;
  onFavoriteToggle?: (productId: string) => void;
  onOpenChatWithSeller?: (sellerId: string, productId: string) => void;
  onOrderCreated?: (order: Order) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onOpenReport,
  onFavoriteToggle,
  onOpenChatWithSeller,
  onOrderCreated,
}) => {
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showEscrowModal, setShowEscrowModal] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      setSelectedImageIndex(0);
      StorageService.incrementProductViews(product.id);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const isFav = currentUser ? StorageService.isFavorite(currentUser.id, product.id) : false;
  const sellerReviews = StorageService.getReviewsForUser(product.sellerId);

  const handleFavoriteClick = () => {
    if (!currentUser) {
      error('Please log in to add items to your favorites.');
      return;
    }
    const added = StorageService.toggleFavorite(currentUser.id, product.id);
    if (added) {
      success(`Saved "${product.title}" to your favorites.`);
    } else {
      success(`Removed "${product.title}" from favorites.`);
    }
    if (onFavoriteToggle) {
      onFavoriteToggle(product.id);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    success('Product link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // WhatsApp Pre-filled message generator
  const getWhatsAppUrl = () => {
    const whatsappNum = product.sellerWhatsapp || (product.sellerPhone ? product.sellerPhone.replace(/[^0-9]/g, '') : '');
    const cleanNum = whatsappNum.startsWith('0') ? '234' + whatsappNum.substring(1) : whatsappNum;
    const msg = encodeURIComponent(
      `Hello, I found your "${product.title}" on CampusCore UNIOSUN Marketplace (₦${product.price.toLocaleString()}) and I'm interested. Is it still available?`
    );
    return `https://wa.me/${cleanNum}?text=${msg}`;
  };

  const getTelegramUrl = () => {
    if (product.sellerTelegram) {
      const cleanUser = product.sellerTelegram.replace('@', '');
      return `https://t.me/${cleanUser}`;
    }
    return null;
  };

  const images = product.images && product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-4 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 relative my-6 max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
        >
          {/* Header Action Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {product.categoryName}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {product.condition}
              </span>
              {product.featured && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500 text-white flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Featured
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleFavoriteClick}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                title="Favorite"
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Share link"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
              </button>

              <button
                onClick={() => onOpenReport(product)}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                title="Report listing"
              >
                <Flag className="w-5 h-5" />
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="overflow-y-auto pr-1 py-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Gallery Column */}
            <div className="lg:col-span-6 space-y-3">
              {/* Main Photo */}
              <div className="relative w-full aspect-4/3 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                <img
                  src={images[selectedImageIndex]}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {product.status === 'sold' && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center">
                    <span className="px-5 py-2 bg-rose-600 text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-xl transform -rotate-6">
                      Item Sold Out
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        selectedImageIndex === idx
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Escrow Guarantee Badge Box */}
              <div className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/50 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-950 dark:text-indigo-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-extrabold text-indigo-900 dark:text-indigo-300">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Campus Safety & Verified Students
                </div>
                <p className="text-[11px] leading-relaxed text-indigo-900/80 dark:text-indigo-300/80">
                  CampusCore protects both buyers and sellers. Inspect goods in campus safe zones before finalizing payment.
                </p>
              </div>

              {/* Verified Student Reviews Section */}
              <div className="pt-2">
                <ReviewsList reviews={sellerReviews} />
              </div>
            </div>

            {/* Product Details & Actions Column */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                    {formatPrice(product.price)}
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                    {product.title}
                  </h1>
                </div>

                {/* Metadata tags */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 dark:text-slate-400 pt-1 border-y border-slate-200 dark:border-slate-800 py-2.5">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{product.sellerCampus || product.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>{product.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Description</h3>
                  <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-slate-50/80 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    {product.description}
                  </div>
                </div>

                {/* Seller Card */}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Seller Profile</h3>
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.sellerAvatar}
                        alt={product.sellerName}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white dark:ring-slate-700 shadow-xs"
                      />
                      <div>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {product.sellerName}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                            Verified Student
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{product.sellerCampus}</p>
                        <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {product.sellerRating || 5.0} rating &bull; {sellerReviews.length} reviews
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
                {product.status === 'active' ? (
                  <div className="space-y-2">
                    {/* PRIMARY ACTION: BUY WITH ESCROW / CAMPUS ORDER */}
                    {currentUser?.id !== product.sellerId ? (
                      <button
                        onClick={() => setShowEscrowModal(true)}
                        className="w-full py-3.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                      >
                        <Lock className="w-4 h-4" />
                        Safe Campus Order (₦{product.price.toLocaleString()})
                      </button>
                    ) : (
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-center text-xs font-bold text-slate-600 dark:text-slate-300">
                        This is your active listing.
                      </div>
                    )}

                    {/* SECONDARY ACTIONS: IN-APP CHAT & WHATSAPP */}
                    <div className="grid grid-cols-2 gap-2">
                      {currentUser?.id !== product.sellerId && (
                        <button
                          onClick={() => {
                            if (onOpenChatWithSeller) {
                              onClose();
                              onOpenChatWithSeller(product.sellerId, product.id);
                            }
                          }}
                          className="py-2.5 px-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-indigo-400" />
                          Chat in App
                        </button>
                      )}

                      <a
                        href={getWhatsAppUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 ${
                          currentUser?.id === product.sellerId ? 'col-span-2' : ''
                        }`}
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                    This item is currently {product.status === 'sold' ? 'marked as Sold Out' : 'paused by the seller'}.
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Escrow Checkout Modal */}
        <AnimatePresence>
          {showEscrowModal && (
            <EscrowCheckoutModal
              product={product}
              onClose={() => setShowEscrowModal(false)}
              onSuccess={(order) => {
                setShowEscrowModal(false);
                onClose();
                if (onOrderCreated) {
                  onOrderCreated(order);
                }
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
