import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { SupabaseService } from '../../services/supabaseService';
import { uploadImageToSupabase, isSupabaseConfigured } from '../../lib/supabase';
import { ProductCondition, Category, Campus } from '../../types';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Eye,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SAMPLE_IMAGE_PRESETS = [
  'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80', // Phone
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80', // Laptop
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80', // Shoes
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', // Book
  'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80', // Fan
];

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const categories: Category[] = StorageService.getCategories();
  const campuses: Campus[] = StorageService.getCampuses('uni-uniosun');

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-phones');
  const [price, setPrice] = useState<number | ''>('');
  const [condition, setCondition] = useState<ProductCondition>('Like New');
  const [campusId, setCampusId] = useState(currentUser?.campusId || 'campus-osogbo');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddImage = (url: string) => {
    if (!url.trim()) return;
    if (imageUrls.length >= 5) {
      error('Maximum 5 images allowed per listing.');
      return;
    }
    setImageUrls([...imageUrls, url.trim()]);
    setCustomImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, idx) => idx !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        error('Image size exceeds 5MB limit.');
        return;
      }
      if (isSupabaseConfigured()) {
        const { url: uploadedUrl } = await uploadImageToSupabase(file, 'listings');
        if (uploadedUrl) {
          handleAddImage(uploadedUrl);
          return;
        }
      }
      // Create local object URL for preview
      const localUrl = URL.createObjectURL(file);
      handleAddImage(localUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      error('You must be logged in to create a listing.');
      return;
    }

    if (!title.trim() || !price || !description.trim()) {
      error('Please complete all required fields (title, price, and description).');
      return;
    }

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const selectedCampus = campuses.find((c) => c.id === campusId);

    const imagesToUse =
      imageUrls.length > 0
        ? imageUrls
        : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'];

    setIsSubmitting(true);

    try {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

      // 1. Supabase insert if configured
      if (isSupabaseConfigured()) {
        await SupabaseService.createListing({
          sellerId: currentUser.id,
          sellerName: currentUser.fullName,
          sellerAvatar: currentUser.avatarUrl,
          sellerCampus: selectedCampus?.name || currentUser.campusName || 'Osogbo Main Campus',
          sellerPhone: currentUser.phone,
          sellerWhatsapp: currentUser.whatsapp || currentUser.phone,
          categoryId,
          categoryName: selectedCategory?.name || 'General',
          title: title.trim(),
          slug,
          description: description.trim(),
          price: Number(price),
          condition,
          campusId,
          images: imagesToUse,
          status: 'active',
        });
      }

      // 2. Local cache insert
      StorageService.createProduct({
        sellerId: currentUser.id,
        sellerName: currentUser.fullName,
        sellerAvatar: currentUser.avatarUrl,
        sellerCampus: selectedCampus?.name || currentUser.campusName || 'Osogbo Main Campus',
        sellerWhatsapp: currentUser.whatsapp || currentUser.phone,
        sellerTelegram: currentUser.telegram,
        sellerPhone: currentUser.phone,
        sellerRating: currentUser.rating || 5.0,
        sellerTotalSales: (currentUser.totalRatings || 0) + 1,
        categoryId,
        categoryName: selectedCategory?.name || 'General',
        title: title.trim(),
        slug,
        description: description.trim(),
        price: Number(price),
        currency: 'NGN',
        condition,
        location: location.trim() || selectedCampus?.name || 'UNIOSUN Campus',
        campusId,
        universityId: currentUser.universityId || 'uni-uniosun',
        status: 'active',
        featured: false,
        images: imagesToUse,
      });

      success('Your listing is live on CampusCore marketplace!');
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      error('Failed to publish listing. Please try again.');
      setIsSubmitting(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);
  const selectedCampusObj = campuses.find((c) => c.id === campusId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative my-6 max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Sell Something on Campus</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Post items to UNIOSUN students with zero listing fees</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  showPreview
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                {showPreview ? 'Edit Form' : 'Preview'}
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto pr-1 py-4 flex-1">
            {showPreview ? (
              /* LIVE PREVIEW CARD */
              <div className="max-w-md mx-auto p-4 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Listing Card Preview</div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                  <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative">
                    <img
                      src={
                        imageUrls[0] ||
                        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80'
                      }
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {condition}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₦ {price ? Number(price).toLocaleString() : '0'}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{title || 'Your Product Title'}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{description || 'Product description will appear here...'}</p>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{selectedCampusObj?.name || 'UNIOSUN'}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{currentUser?.fullName}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="w-full py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Continue Editing
                </button>
              </div>
            ) : (
              /* FORM FIELDS */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. iPhone 13 128GB Midnight or Casio fx-991EX Calculator"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Category & Condition */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Condition *</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as ProductCondition)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      <option value="New" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">New (Brand New in Box)</option>
                      <option value="Like New" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Like New (Mint Condition)</option>
                      <option value="Used" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Used (Good Condition)</option>
                      <option value="Fair" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Fair (Has signs of wear)</option>
                      <option value="Refurbished" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Refurbished</option>
                    </select>
                  </div>
                </div>

                {/* Price & Campus */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Price (₦ Naira) *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-500 dark:text-slate-400">₦</span>
                      <input
                        type="number"
                        required
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g. 35000"
                        className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Campus Location *</label>
                    <select
                      value={campusId}
                      onChange={(e) => setCampusId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      {campuses.map((c) => (
                        <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Specific Spot */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pickup Location / Meeting Landmark
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Near UNIOSUN Main Gate / Health Sciences Lodge / Library"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Images Upload & Presets */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Product Images (Up to 5)
                  </label>

                  {/* Image Previews */}
                  <div className="flex flex-wrap gap-2.5 mb-3">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                        <img src={url} alt="Listing" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {imageUrls.length < 5 && (
                      <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-semibold">Upload</span>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* Add URL input */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      placeholder="Paste direct Image URL (e.g. from Unsplash or Cloudinary)..."
                      className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddImage(customImageUrl)}
                      className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add URL
                    </button>
                  </div>

                  {/* Quick Preset Images */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" /> Quick sample photos:
                    </span>
                    <div className="flex gap-1">
                      {SAMPLE_IMAGE_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddImage(preset)}
                          className="w-6 h-6 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-emerald-500 cursor-pointer"
                        >
                          <img src={preset} alt="preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Detailed Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the item's features, reason for selling, battery life, included accessories, or how to test on campus..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none transition-colors"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Sellers receive direct WhatsApp messages from verified students.
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-98 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish Listing Now'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
