import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { MarketService } from '../../services/marketService';
import { compressImage } from '../../lib/imageUtils';
import { uploadImageToSupabase } from '../../lib/supabase';
import { RoomType, RentalPeriod, Campus } from '../../types';
import { X, Home, Plus, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CreateAccommodationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const COMMON_AMENITIES = [
  'Running Borehole Water',
  'Prepaid Electricity Meter',
  'Fenced & Gated Compound',
  '24/7 Security Guard',
  'Tiled Floor',
  'Kitchen Cabinet',
  'Balcony',
  'Wardrobe',
  'Solar / Inverter Lighting',
  'Waste Disposal',
];

export const CreateAccommodationModal: React.FC<CreateAccommodationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const campuses: Campus[] = StorageService.getCampuses('uni-uniosun');

  const [title, setTitle] = useState('');
  const [roomType, setRoomType] = useState<RoomType>('Self-contain');
  const [rentalPeriod, setRentalPeriod] = useState<RentalPeriod>('Per Session');
  const [price, setPrice] = useState<number | ''>('');
  const [campusId, setCampusId] = useState(currentUser?.campusId || 'campus-osogbo');
  const [location, setLocation] = useState('');
  const [distanceToCampus, setDistanceToCampus] = useState('5 mins walk to Campus Gate');
  const [description, setDescription] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Running Borehole Water',
    'Prepaid Electricity Meter',
    'Fenced & Gated Compound',
  ]);
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    if (imageUrls.length >= 4) {
      error('Maximum 4 images allowed.');
      return;
    }
    setImageUrls([...imageUrls, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from((e.target.files || []) as ArrayLike<File>);
    e.target.value = '';
    for (const file of files) {
      if (!file.type.startsWith('image/')) { error('Only image files are allowed.'); continue; }
      if (file.size > 15 * 1024 * 1024) { error('Image is too large (max 15MB).'); continue; }
      setIsUploading(true);
      try {
        const blob = await compressImage(file);
        if (MarketService.enabled) {
          const { url, error: upErr } = await uploadImageToSupabase(blob, 'accommodations');
          if (!url) { error(upErr || 'Image upload failed. Please try again.'); continue; }
          setImageUrls((prev) => (prev.length >= 4 ? prev : [...prev, url]));
        } else {
          const dataUrl: string = await new Promise((res, rej) => {
            const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(blob);
          });
          setImageUrls((prev) => (prev.length >= 4 ? prev : [...prev, dataUrl]));
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isUploading) return;

    if (!currentUser) { error('Please log in to post accommodation listings.'); return; }
    if (!title.trim() || !price || !description.trim() || !location.trim()) {
      error('Please fill in the title, price, location, and description.');
      return;
    }
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum <= 0 || priceNum > 50_000_000) { error('Enter a valid rent amount.'); return; }
    const phone = currentUser.phone || currentUser.whatsapp || '';
    if (!phone) { error('Add a phone or WhatsApp number to your profile so students can contact you.'); return; }

    const payload = {
      ownerId: currentUser.id,
      ownerName: currentUser.fullName,
      ownerAvatar: currentUser.avatarUrl,
      ownerPhone: phone,
      ownerWhatsapp: (currentUser.whatsapp || phone).replace(/[^0-9]/g, ''),
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      distanceToCampus: distanceToCampus.trim(),
      campusId,
      universityId: currentUser.universityId || 'uni-uniosun',
      price: priceNum,
      currency: 'NGN',
      rentalPeriod,
      roomType,
      available: true,
      images: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
      amenities: selectedAmenities,
      status: 'active' as const,
      featured: false,
    };

    setIsSubmitting(true);
    try {
      if (MarketService.enabled) {
        const res = await MarketService.createAccommodation(payload);
        if (!res.success || !res.data) {
          error(res.message || 'Failed to post accommodation. Please try again.');
          return;
        }
        StorageService.upsertAccommodationFromServer(res.data);
        MarketService.syncAll();
      } else {
        StorageService.createAccommodation(payload);
      }
      success('Hostel accommodation listing posted successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      error('Failed to create accommodation listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 relative my-6 max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">List Student Accommodation</h2>
                <p className="text-xs text-slate-500">Post student hostels, self-contained rooms, or shared apartments</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 py-4 space-y-4 flex-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Listing Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Shalom Villa — Executive Self-Contained Student Room"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Room Type *</label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value as RoomType)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="Self-contain">Self-contain</option>
                  <option value="Single Room">Single Room</option>
                  <option value="2-Bedroom Flat">2-Bedroom Flat</option>
                  <option value="Shared Apartment">Shared Apartment</option>
                  <option value="Off-Campus Hostel">Off-Campus Hostel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rent Period *</label>
                <select
                  value={rentalPeriod}
                  onChange={(e) => setRentalPeriod(e.target.value as RentalPeriod)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="Per Session">Per Session</option>
                  <option value="Per Year">Per Year</option>
                  <option value="Per Semester">Per Semester</option>
                  <option value="Per Month">Per Month</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₦) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 180000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Location *</label>
                <select
                  value={campusId}
                  onChange={(e) => setCampusId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:border-emerald-500"
                >
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Walking Distance</label>
                <input
                  type="text"
                  value={distanceToCampus}
                  onChange={(e) => setDistanceToCampus(e.target.value)}
                  placeholder="e.g. 5 mins walk to Main Gate"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Address / Street Landmark *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Oke-Baale Road, Opposite Health Sciences Hostel, Osogbo"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            {/* Amenities Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Available Lodge Amenities</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COMMON_AMENITIES.map((amenity) => {
                  const isChecked = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`p-2 rounded-xl text-xs text-left font-medium border transition-colors flex items-center justify-between ${
                        isChecked
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{amenity}</span>
                      <span className={`w-2 h-2 rounded-full ${isChecked ? 'bg-emerald-600' : 'bg-transparent'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lodge Photos (URLs)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                    <img src={url} alt="Hostel" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-0.5 bg-rose-600 text-white rounded-full"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Paste direct hostel photo URL..."
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                <label className="px-3 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer">
                  {isUploading ? 'Uploading…' : 'Upload'}
                  <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lodge Description *</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe room condition, water reliability, electricity transformer, gate curfew, or caretaker contact..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-98 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Lodge Listing'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
