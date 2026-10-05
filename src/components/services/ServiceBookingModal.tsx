import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MarketService } from '../../services/marketService';
import { StorageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { ServiceListing } from '../../types';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';

interface ServiceBookingModalProps {
  service: ServiceListing | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AVAILABLE_TIMES = [
  '09:00 AM - 10:00 AM',
  '10:30 AM - 11:30 AM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
  '03:30 PM - 04:30 PM',
  '05:00 PM - 06:00 PM',
];

export const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({
  service,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, contactPhone, hasContactNumber } = useAuth();
  const { success, error: toastError } = useToast();

  const [date, setDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState(AVAILABLE_TIMES[0]);
  const [customerLocation, setCustomerLocation] = useState(
    currentUser?.campusName || 'Faculty Complex / Hostel Block'
  );
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !service || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (MarketService.enabled && !hasContactNumber) {
      toastError('Add your phone number first so the provider can reach you (Profile → Edit Profile).');
      return;
    }
    setSubmitting(true);

    try {
      const bookingData = {
        serviceId: service.id,
        serviceTitle: service.title,
        customerId: currentUser.id,
        customerName: currentUser.fullName,
        customerAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        customerPhone: contactPhone || undefined,
        providerId: service.providerId,
        providerName: service.providerName,
        providerAvatar: service.providerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        campusId: service.campusId || 'main-campus',
        locationVenue: customerLocation,
        date,
        timeSlot,
        durationMinutes: 60,
        price: service.startingPrice,
        currency: 'NGN',
        notes: notes.trim() || undefined,
      };
      const res: { success: boolean; error?: string } = MarketService.enabled
        ? await MarketService.createBooking(bookingData as any).then((r) => ({ success: r.success, error: r.message }))
        : StorageService.createBooking(bookingData as any);

      if (!res.success) {
        toastError(res.error || 'Failed to create booking.');
        return;
      }

      success('Booking confirmed! Provider has been notified.');
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err.message || 'Error completing booking.');
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
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-base">Book Appointment</h2>
              <p className="text-[11px] text-slate-500">Service: {service.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={service.providerAvatar}
                alt={service.providerName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900">{service.providerName}</h4>
                <p className="text-[11px] text-slate-500">{service.providerCampus}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Rate</span>
              <span className="text-sm font-black text-indigo-600">
                ₦{service.startingPrice.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Appointment Date *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Available Time Slot *
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-indigo-500"
              >
                {AVAILABLE_TIMES.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Meeting Location / Delivery Place *
            </label>
            <input
              type="text"
              required
              value={customerLocation}
              onChange={(e) => setCustomerLocation(e.target.value)}
              placeholder="e.g. Science Library Study Room / Male Hostel A / Google Meet"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Special Instructions / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific tools needed, preferences, or preparation notes..."
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 text-sm outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
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
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {submitting ? 'Confirming...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
