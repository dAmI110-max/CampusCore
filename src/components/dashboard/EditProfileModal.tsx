import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { uploadImageToSupabase, isSupabaseConfigured } from '../../lib/supabase';
import { compressImage } from '../../lib/imageUtils';
import { normalizePhone, formatPhoneDisplay } from '../../lib/phone';
import { X, Camera, Phone, MessageCircle, User, Save, Loader2, Send } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputCls =
  'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 disabled:opacity-60';

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile, isSeller } = useAuth();
  const { success, error } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [telegram, setTelegram] = useState('');
  const [bio, setBio] = useState('');
  const [showPhonePublicly, setShowPhonePublicly] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Always start from the latest profile each time the editor opens.
  useEffect(() => {
    if (!isOpen || !currentUser) return;
    setFullName(currentUser.fullName || '');
    setPhone(currentUser.phone ? formatPhoneDisplay(currentUser.phone) : '');
    const wa = currentUser.whatsapp || '';
    setWhatsapp(wa ? formatPhoneDisplay(wa) : '');
    setSameAsPhone(!wa || normalizePhone(wa) === normalizePhone(currentUser.phone));
    setTelegram(currentUser.telegram || '');
    setBio(currentUser.bio && currentUser.bio !== 'Student on CampusCore' ? currentUser.bio : '');
    setShowPhonePublicly(currentUser.showPhonePublicly ?? true);
    setAvatarUrl(currentUser.avatarUrl || '');
  }, [isOpen, currentUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !saving && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, saving, onClose]);

  if (!isOpen || !currentUser) return null;

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return error('Please choose an image file.');
    if (file.size > 15 * 1024 * 1024) return error('That photo is too large (max 15MB).');

    setUploading(true);
    try {
      const blob = await compressImage(file, 512, 0.85); // small, fast avatar
      if (isSupabaseConfigured()) {
        const res = await uploadImageToSupabase(blob, 'avatars');
        if (!res.url) return error(res.error || 'Photo upload failed. Please try again.');
        setAvatarUrl(res.url);
      } else {
        const dataUrl: string = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
        setAvatarUrl(dataUrl);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || uploading) return;

    if (fullName.trim().length < 2) return error('Please enter your full name.');
    const phoneTrim = phone.trim();
    if (phoneTrim && !normalizePhone(phoneTrim)) return error('Enter a valid phone number, e.g. 0803 123 4567.');
    if (isSeller && !phoneTrim) return error('Sellers need a phone number so buyers can reach them.');
    const waTrim = sameAsPhone ? phoneTrim : whatsapp.trim();
    if (waTrim && !normalizePhone(waTrim)) return error('Enter a valid WhatsApp number.');

    setSaving(true);
    const res = await updateProfile({
      fullName: fullName.trim(),
      phone: phoneTrim,
      whatsapp: waTrim,
      telegram: telegram.trim(),
      bio: bio.trim(),
      avatarUrl,
      showPhonePublicly,
    });
    setSaving(false);

    if (res.success) {
      success('Profile updated!');
      onClose();
    } else {
      error(res.message || 'Could not save your profile. Please try again.');
    }
  };

  const busy = saving || uploading;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs"
      onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Edit profile"
    >
      <form
        onSubmit={handleSave}
        className="bg-white dark:bg-[#130b21] w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-purple-950/70 text-slate-900 dark:text-slate-100"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white/95 dark:bg-[#130b21]/95 backdrop-blur border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-black">Edit Profile</h2>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Photo */}
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="relative group shrink-0" aria-label="Change profile photo">
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                alt="Profile"
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover ring-4 ring-purple-500/20"
              />
              <span className="absolute inset-0 rounded-full bg-slate-950/45 flex items-center justify-center text-white">
                {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
              </span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
            <div className="min-w-0">
              <p className="font-bold truncate">@{currentUser.username}</p>
              <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
              <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="mt-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                {uploading ? 'Uploading…' : 'Change photo'}
              </button>
            </div>
          </div>

          <label className="block">
            <span className="flex items-center gap-1.5 text-xs font-bold mb-1.5"><User className="w-3.5 h-3.5" /> Full name</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={80} autoComplete="name" className={inputCls} />
          </label>

          <label className="block">
            <span className="flex items-center gap-1.5 text-xs font-bold mb-1.5"><Phone className="w-3.5 h-3.5" /> Phone number {isSeller && <span className="text-rose-500">*</span>}</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="0803 123 4567" className={inputCls} />
            <span className="block text-[11px] text-slate-500 mt-1">Buyers and students use this to contact you.</span>
          </label>

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold mb-2 cursor-pointer">
              <input type="checkbox" checked={sameAsPhone} onChange={(e) => setSameAsPhone(e.target.checked)} className="w-4 h-4 accent-purple-600" />
              My WhatsApp number is the same as my phone number
            </label>
            {!sameAsPhone && (
              <label className="block">
                <span className="flex items-center gap-1.5 text-xs font-bold mb-1.5"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp number</span>
                <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} type="tel" inputMode="tel" placeholder="0803 123 4567" className={inputCls} />
              </label>
            )}
          </div>

          <label className="block">
            <span className="flex items-center gap-1.5 text-xs font-bold mb-1.5"><Send className="w-3.5 h-3.5" /> Telegram username (optional)</span>
            <input value={telegram} onChange={(e) => setTelegram(e.target.value)} maxLength={40} placeholder="@yourname" autoCapitalize="none" className={inputCls} />
          </label>

          <label className="block">
            <span className="text-xs font-bold mb-1.5 block">Bio</span>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={300} rows={3} placeholder="Tell students a little about you…" className={inputCls + ' resize-none'} />
            <span className="block text-right text-[11px] text-slate-400">{bio.length}/300</span>
          </label>

          <label className="flex items-start gap-2.5 text-xs cursor-pointer">
            <input type="checkbox" checked={showPhonePublicly} onChange={(e) => setShowPhonePublicly(e.target.checked)} className="w-4 h-4 mt-0.5 accent-purple-600" />
            <span><b>Show my phone number on my profile</b><br /><span className="text-slate-500">Your number is still used on your own listings so buyers can reach you.</span></span>
          </label>
        </div>

        <div className="sticky bottom-0 flex gap-3 p-4 bg-white/95 dark:bg-[#130b21]/95 backdrop-blur border-t border-slate-100 dark:border-slate-800">
          <button type="button" onClick={onClose} disabled={busy} className="px-5 py-3 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
            Cancel
          </button>
          <button type="submit" disabled={busy} className="flex-1 px-5 py-3 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
