import { MarketService } from '../../services/marketService';
import { ContactNumberCard } from '../profile/ContactNumberCard';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import {
  ServicePricingModel,
  ServiceDeliveryMethod,
} from '../../types';
import {
  X,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  AlertCircle,
  Briefcase,
  Clock,
  DollarSign,
  MapPin,
  Tag,
} from 'lucide-react';
import { motion } from 'motion/react';

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateServiceModal: React.FC<CreateServiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, contactPhone, contactWhatsapp, hasContactNumber } = useAuth();
  const { success, error: toastError } = useToast();

  const categories = StorageService.getServiceCategories();
  const campuses = StorageService.getCampuses();

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'scat-tech');
  const [campusId, setCampusId] = useState(currentUser?.campusId || campuses[0]?.id || 'campus-osogbo');
  const [pricingModel, setPricingModel] = useState<ServicePricingModel>('fixed');
  const [startingPrice, setStartingPrice] = useState<number>(5000);
  const [deliveryMethod, setDeliveryMethod] = useState<ServiceDeliveryMethod>('hybrid');
  const [turnaroundTime, setTurnaroundTime] = useState('2-3 Days');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
  ]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleAddImage = () => {
    if (customImageUrl.trim()) {
      setPortfolioUrls([...portfolioUrls, customImageUrl.trim()]);
      setCustomImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setPortfolioUrls(portfolioUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!title.trim()) {
      toastError('Please enter a service title.');
      return;
    }
    if (!description.trim() || description.length < 20) {
      toastError('Please write a detailed description of your service (at least 20 characters).');
      return;
    }
    if (startingPrice <= 0) {
      toastError('Please enter a valid starting rate.');
      return;
    }

    if (!hasContactNumber) {
      toastError('Add your phone number above so clients can reach you.');
      return;
    }

    setSubmitting(true);

    try {
      const cat = categories.find((c) => c.id === categoryId);
      const campus = campuses.find((c) => c.id === campusId);
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = {
        providerId: currentUser.id,
        providerName: currentUser.fullName,
        providerAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        providerCampus: campus?.name || currentUser.campusName || 'Main Campus',
        providerUniversity: currentUser.universityName || 'Osun State University',
        providerVerification: currentUser.verificationBadge || 'unverified',
        providerPhone: contactPhone,
        providerWhatsapp: contactWhatsapp,
        categoryId,
        categoryName: cat?.name || 'General Service',
        campusId,
        universityId: currentUser.universityId || 'uni-uniosun',
        title: title.trim(),
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: description.trim(),
        pricingModel,
        startingPrice: Number(startingPrice),
        deliveryMethod,
        estimatedDeliveryDays: 2,
        location: campus?.name || 'Main Campus',
        features: tags.length > 0 ? tags : ['Professional Work', 'Student Friendly'],
        portfolioImages: portfolioUrls.length > 0 ? portfolioUrls : [
          'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
        ],
        status: 'active',
        featured: false,
      };

      if (MarketService.enabled) {
        // Only "published" once the SERVER has stored it, so every device sees it.
        const res = await MarketService.createService(payload as any);
        if (!res.success || !res.data) {
          toastError(res.message || 'Failed to publish your service. Please try again.');
          return;
        }
        StorageService.upsertServiceFromServer(res.data);
        MarketService.syncAll();
      } else {
        StorageService.createService(payload as any);
      }

      success('Service published to the Campus Marketplace!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err.message || 'Failed to create service.');
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
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-base">Offer a Campus Service</h2>
              <p className="text-[11px] text-slate-500">
                Monetize your skills with guaranteed escrow payments from students
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Service Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Professional UI/UX Design & Mobile App Prototyping"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Service Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Campus *
              </label>
              <select
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-indigo-500"
              >
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pricing Model *
              </label>
              <select
                value={pricingModel}
                onChange={(e) => setPricingModel(e.target.value as ServicePricingModel)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-indigo-500"
              >
                <option value="fixed">Fixed Price</option>
                <option value="starting_from">Starting From</option>
                <option value="hourly">Hourly Rate</option>
                <option value="custom_quote">Custom Quote Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Starting Rate (₦) *
              </label>
              <input
                type="number"
                min="500"
                step="500"
                required
                value={startingPrice}
                onChange={(e) => setStartingPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Turnaround Time
              </label>
              <input
                type="text"
                value={turnaroundTime}
                onChange={(e) => setTurnaroundTime(e.target.value)}
                placeholder="e.g. 24 Hours, 3 Days"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Delivery Method
              </label>
              <select
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value as ServiceDeliveryMethod)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-indigo-500"
              >
                <option value="hybrid">Hybrid (Online & In Person)</option>
                <option value="on_campus">On-Campus In-Person</option>
                <option value="online">Online / Digital Files</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Skill Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Figma, React, Assignment Help"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Service Description & Deliverables *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail what you provide, your process, tools used, requirements from buyer, and sample past experience..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none"
            />
          </div>

          {/* Portfolio Images */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Portfolio & Sample Work Photos (Image URLs)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="Paste image URL (Unsplash, Imgur, Cloudinary, etc.)"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Add Image
              </button>
            </div>

            {portfolioUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {portfolioUrls.map((url, i) => (
                  <div key={i} className="relative w-20 h-16 rounded-xl overflow-hidden border border-slate-200 group">
                    <img
                      src={url}
                      alt={`portfolio-${i}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <ContactNumberCard audience="Clients" />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Service Listing'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
