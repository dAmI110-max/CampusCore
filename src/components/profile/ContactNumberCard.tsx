import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useProfileEditor } from '../../context/ProfileEditorContext';
import { normalizePhone, formatPhoneDisplay } from '../../lib/phone';

/**
 * Shown inside every "create listing" form. Reads the contact number from the user's profile (global state):
 *  - number on file  → confirms it and offers "Change"
 *  - no number       → lets the user add it right here (saved to their profile) without leaving the form
 */
export const ContactNumberCard: React.FC<{ audience?: string }> = ({ audience = 'Buyers' }) => {
  const { currentUser, contactPhone, hasContactNumber, isProfileLoading, updateProfile } = useAuth();
  const { openEditProfile } = useProfileEditor();
  const { success, error } = useToast();
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  if (!currentUser) return null;

  if (isProfileLoading && !hasContactNumber) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading your contact details…
      </div>
    );
  }

  if (hasContactNumber) {
    return (
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50">
        <div className="flex items-start gap-2 text-xs text-emerald-900 dark:text-emerald-200 min-w-0">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{audience} will contact you on <b className="whitespace-nowrap">{formatPhoneDisplay(contactPhone)}</b></span>
        </div>
        <button type="button" onClick={openEditProfile} className="shrink-0 text-xs font-bold text-emerald-700 dark:text-emerald-300 underline underline-offset-2">
          Change
        </button>
      </div>
    );
  }

  const save = async () => {
    const n = normalizePhone(value);
    if (!n) return error('Enter a valid phone number, e.g. 0803 123 4567.');
    setSaving(true);
    const res = await updateProfile({ phone: n, whatsapp: n });
    setSaving(false);
    if (res.success) success('Phone number saved to your profile.');
    else error(res.message || 'Could not save your number. Please try again.');
  };

  return (
    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
      <div className="flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <span><b>Add your phone number</b> so {audience.toLowerCase()} can reach you. It's saved to your profile for next time.</span>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); save(); } }}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0803 123 4567"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-amber-300/70 dark:border-amber-800 bg-white dark:bg-slate-900 text-base sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>
        <button type="button" onClick={save} disabled={saving} className="px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-60">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
};
