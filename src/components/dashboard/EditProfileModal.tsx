import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { uploadImageToSupabase } from '../../lib/supabase';
import { UserProfile } from '../../types';
import { X, Camera, Mail, Phone, MessageCircle, User, MapPin, Briefcase, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile } = useAuth();
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [whatsapp, setWhatsapp] = useState(currentUser?.whatsapp || '');
  const [telegram, setTelegram] = useState(currentUser?.telegram || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      error('Image must be less than 5 MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase
    setLoading(true);
    const res = await uploadImageToSupabase(file, 'avatars');
    setLoading(false);

    if (res.error) {
      error(`Failed to upload avatar: ${res.error}`);
      setAvatarPreview(null);
      return;
    }

    if (res.url) {
      setAvatarUrl(res.url);
      setAvatarPreview(null);
      success('Avatar uploaded successfully');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      error('Full name is required');
      return;
    }

    if (!phone.trim()) {
      error('Phone number is required');
      return;
    }

    setLoading(true);
    const res = await updateProfile({
      fullName: fullName.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      telegram: telegram.trim(),
      bio: bio.trim(),
      avatarUrl,
    });
    setLoading(false);

    if (res.success) {
      success('Profile updated successfully!');
      onClose();
    } else {
      error(res.message || 'Failed to update profile');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-[#130b21] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-purple-950/70 relative my-8 text-slate-900 dark:text-slate-100"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-purple-950/50 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Edit Your Profile</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Update your profile information, photo, and contact details
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={avatarPreview || avatarUrl}
                  alt={fullName}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-indigo-600/30"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg transition-all disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={loading}
              />
              <div className="text-center">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Click the camera icon to change your photo</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">JPG, PNG or WebP. Max 5MB</p>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={currentUser.email || ''}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-600 dark:text-slate-400 cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08012345678"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Required for contact & orders</p>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" />
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="08012345678 (optional)"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Buyers will contact you here</p>
            </div>

            {/* Telegram */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" />
                Telegram Handle
              </label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@yourusername (optional)"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Bio / About */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" />
                About You / Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell buyers a bit about yourself (optional)"
                maxLength={250}
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{bio.length}/250 characters</p>
            </div>

            {/* Read-only Info */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <div>
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Campus</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{currentUser.campusName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Department</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{currentUser.departmentName || 'Not set'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Academic Level</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{currentUser.level}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Seller Status</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{currentUser.sellerStatus}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md shadow-indigo-600/20 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
