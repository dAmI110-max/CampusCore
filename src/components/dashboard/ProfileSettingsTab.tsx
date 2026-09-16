import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Campus, Faculty, Department, Category } from '../../types';
import { StorageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { uploadImageToSupabase } from '../../lib/supabase';
import {
  Save,
  Shield,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Building,
  GraduationCap,
  Store,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface ProfileSettingsTabProps {
  user: UserProfile;
  onRefresh: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
];

export const ProfileSettingsTab: React.FC<ProfileSettingsTabProps> = ({
  user,
  onRefresh,
}) => {
  const { updateProfile, isSeller } = useAuth();
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const campuses: Campus[] = StorageService.getCampuses(user.universityId || 'uni-uniosun');
  const faculties: Faculty[] = StorageService.getFaculties(user.universityId || 'uni-uniosun');
  const categories: Category[] = StorageService.getCategories();

  // Basic Profile State
  const [fullName, setFullName] = useState(user.fullName || '');
  const [username, setUsername] = useState(user.username || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [whatsapp, setWhatsapp] = useState(user.whatsapp || '');
  const [telegram, setTelegram] = useState(user.telegram || '');
  const [campusId, setCampusId] = useState(user.campusId || (campuses[0]?.id || 'campus-osogbo'));
  const [facultyId, setFacultyId] = useState(user.facultyId || (faculties[0]?.id || 'fac-computing'));
  const [departmentId, setDepartmentId] = useState(user.departmentId || 'dept-comp-cs');
  const [level, setLevel] = useState(user.level || '300L');
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || PRESET_AVATARS[0]);

  // Sync user prop updates
  useEffect(() => {
    if (user.facultyId) setFacultyId(user.facultyId);
    if (user.departmentId) setDepartmentId(user.departmentId);
    if (user.fullName) setFullName(user.fullName);
    if (user.phone) setPhone(user.phone);
    if (user.whatsapp) setWhatsapp(user.whatsapp || user.phone || '');
    if (user.telegram) setTelegram(user.telegram || '');
    if (user.campusId) setCampusId(user.campusId);
    if (user.level) setLevel(user.level);
    if (user.bio) setBio(user.bio);
    if (user.avatarUrl) setAvatarUrl(user.avatarUrl);
  }, [user]);

  // Seller-specific State
  const [sellerBio, setSellerBio] = useState(user.sellerBio || user.bio || '');
  const [sellerCategory, setSellerCategory] = useState(user.sellerCategory || 'Phones & Electronics');
  const [pickupLocations, setPickupLocations] = useState<string>(
    user.sellerPickupLocations?.join(', ') || 'Oke-Baale Campus Gate, Faculty Lobby'
  );

  // Privacy toggles
  const [showPhonePublicly, setShowPhonePublicly] = useState(
    user.showPhonePublicly ?? true
  );
  const [showDepartmentPublicly, setShowDepartmentPublicly] = useState(
    user.showDepartmentPublicly ?? true
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const departments: Department[] = StorageService.getDepartments(facultyId);

  // Ensure department is always valid for the chosen faculty
  useEffect(() => {
    if (departments.length > 0 && !departments.some((d) => d.id === departmentId)) {
      setDepartmentId(departments[0].id);
    }
  }, [facultyId, departments, departmentId]);

  // Handle Photo File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setImageError('Please upload a valid image file (JPEG, PNG, or WebP).');
      error('Please upload a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size exceeds 5MB limit. Please choose a smaller photo.');
      error('Image size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    // Try Supabase Storage upload
    const { url: supabaseUrl, error: uploadErr } = await uploadImageToSupabase(file, 'avatars', `avatar_${user.id}_${Date.now()}`);
    if (supabaseUrl && !uploadErr) {
      setAvatarUrl(supabaseUrl);
      success('Photo uploaded to storage! Click Save Profile Changes to apply.');
      return;
    }

    // Fallback to Data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setAvatarUrl(event.target.result);
        success('Photo selected! Click Save Profile Changes to apply.');
      }
    };
    reader.onerror = () => {
      setImageError('Failed to read image file.');
      error('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      error('Full Name and Phone Number are required.');
      return;
    }

    const selectedCampus = campuses.find((c) => c.id === campusId);
    const selectedFaculty = faculties.find((f) => f.id === facultyId);
    const selectedDepartment = departments.find((d) => d.id === departmentId);

    const parsedLocations = pickupLocations
      .split(',')
      .map((loc) => loc.trim())
      .filter((loc) => loc.length > 0);

    setIsSubmitting(true);

    try {
      const res = await updateProfile({
        fullName: fullName.trim(),
        username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || user.username,
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        telegram: telegram.trim(),
        campusId,
        campusName: selectedCampus?.name || user.campusName,
        facultyId,
        facultyName: selectedFaculty?.name || user.facultyName,
        departmentId,
        departmentName: selectedDepartment?.name || user.departmentName,
        level: level as any,
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim() || user.avatarUrl,
        sellerBio: sellerBio.trim(),
        sellerCategory: sellerCategory.trim(),
        sellerPickupLocations: parsedLocations.length > 0 ? parsedLocations : ['Main Campus Gate'],
        showPhonePublicly,
        showDepartmentPublicly,
      });

      setIsSubmitting(false);

      if (res.success) {
        success('Profile updated successfully.');
        onRefresh();
      } else {
        error(res.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      error(err?.message || 'An error occurred while saving profile changes.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* Profile Photo Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Profile Avatar & Photo
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative group">
            <img
              src={avatarUrl || user.avatarUrl}
              alt={fullName}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-emerald-500/20 dark:ring-emerald-400/20 shadow-md bg-slate-100 dark:bg-slate-800"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-transform hover:scale-105 cursor-pointer"
              title="Upload new photo"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Choose a preset avatar or upload your photo
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Supports JPG, PNG, WebP up to 2MB.
              </p>
            </div>

            {/* Avatar Presets Grid */}
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_AVATARS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarUrl(preset)}
                  className={`w-9 h-9 rounded-xl overflow-hidden ring-2 transition-all cursor-pointer ${
                    avatarUrl === preset
                      ? 'ring-emerald-500 scale-110 shadow-xs'
                      : 'ring-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={preset}
                    alt={`Avatar ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Custom Image URL fallback */}
            <div>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Or paste external image URL..."
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            {imageError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {imageError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Student Information */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Academic & Personal Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Oluwadamilare Bhadmus"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Username / Display Handle
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. damilare_plug"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address (Account ID)
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +2348012345678"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="e.g. 2348012345678"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Telegram Handle (@)
            </label>
            <input
              type="text"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="e.g. damilare_plug"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              UNIOSUN Campus *
            </label>
            <select
              value={campusId}
              onChange={(e) => setCampusId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Faculty
            </label>
            <select
              value={facultyId}
              onChange={(e) => {
                setFacultyId(e.target.value);
                const firstDept = StorageService.getDepartments(e.target.value)[0];
                if (firstDept) setDepartmentId(firstDept.id);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Department / Course
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Academic Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              <option value="100L">100 Level (Freshman)</option>
              <option value="200L">200 Level</option>
              <option value="300L">300 Level</option>
              <option value="400L">400 Level</option>
              <option value="500L">500 Level (Final Year)</option>
              <option value="Postgraduate">Postgraduate / Alum</option>
            </select>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Bio / Profile Summary
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell fellow students about your course, interests, or what you offer on campus..."
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 resize-none"
          />
        </div>
      </div>

      {/* Seller Profile Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Campus Seller & Merchant Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Primary Business / Listing Niche
            </label>
            <select
              value={sellerCategory}
              onChange={(e) => setSellerCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Preferred Campus Pickup Spots
            </label>
            <input
              type="text"
              value={pickupLocations}
              onChange={(e) => setPickupLocations(e.target.value)}
              placeholder="e.g. Main Gate, Faculty Block, ETF Building"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Seller Storefront Bio / Vendor Note
          </label>
          <textarea
            rows={2}
            value={sellerBio}
            onChange={(e) => setSellerBio(e.target.value)}
            placeholder="Introduce your campus store, warranty policies, delivery availability, etc..."
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 resize-none"
          />
        </div>
      </div>

      {/* Privacy & Visibility Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Privacy & Visibility Controls
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={showPhonePublicly}
            onChange={(e) => setShowPhonePublicly(e.target.checked)}
            className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 cursor-pointer"
          />
          Show my verified phone number on my active listings
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={showDepartmentPublicly}
            onChange={(e) => setShowDepartmentPublicly(e.target.checked)}
            className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 cursor-pointer"
          />
          Show my department and academic level on my public profile
        </label>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>
      </div>
    </form>
  );
};
