import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { CampusEventCategory } from '../../types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Image,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import { motion } from 'motion/react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();
  const campuses = StorageService.getCampuses();

  const [title, setTitle] = useState('');
  const [organizerName, setOrganizerName] = useState(
    currentUser?.fullName ? `${currentUser.fullName} / Association` : 'Campus Organization'
  );
  const [category, setCategory] = useState<CampusEventCategory>('workshop');
  const [campusId, setCampusId] = useState(currentUser?.campusId || campuses[0]?.id || 'campus-osogbo');
  const [venue, setVenue] = useState('Main University Auditorium, Main Campus');
  const [date, setDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [time, setTime] = useState('10:00 AM - 02:00 PM');
  const [isPaid, setIsPaid] = useState(false);
  const [ticketPrice, setTicketPrice] = useState<number>(1000);
  const [totalCapacity, setTotalCapacity] = useState<number>(200);
  const [bannerImage, setBannerImage] = useState(
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80'
  );
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toastError('Please enter an event title.');
      return;
    }
    if (!description.trim() || description.length < 20) {
      toastError('Please write a detailed event description (at least 20 characters).');
      return;
    }

    setSubmitting(true);
    try {
      StorageService.createEvent({
        organizerId: currentUser.id,
        organizerName: organizerName.trim(),
        organizerAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        organizerVerified: true,
        organizerContact: currentUser.phone || currentUser.email,
        campusId,
        universityId: currentUser.universityId || 'uni-uniosun',
        title: title.trim(),
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: description.trim(),
        category,
        venue: venue.trim(),
        date,
        startTime: time.trim() || '16:00',
        endTime: '20:00',
        bannerImage: bannerImage.trim(),
        isPaid,
        ticketPrice: isPaid ? Number(ticketPrice) : 0,
        currency: 'NGN',
        capacity: Number(totalCapacity) || 200,
        tags: [category, 'campuscore-event'],
        status: 'upcoming',
        featured: false,
      });

      success('Event created and published to CampusCore!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err.message || 'Failed to create event.');
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
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-base">Create Campus Event</h2>
              <p className="text-[11px] text-slate-500">Sell tickets or host free student meetups</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. UNIOSUN Annual Tech Summit & Hackathon"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Host / Organizer Name *
              </label>
              <input
                type="text"
                required
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                placeholder="e.g. Google Developer Student Club"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CampusEventCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium outline-none focus:border-indigo-500"
              >
                <option value="academic">Academic & Seminar</option>
                <option value="workshop">Workshop & Tech</option>
                <option value="party">Party & Social</option>
                <option value="cultural">Cultural & Arts</option>
                <option value="sports">Sports & Gaming</option>
                <option value="religious">Religious / Fellowship</option>
                <option value="career">Career Fair</option>
                <option value="other">General Meetup</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Campus Location *
              </label>
              <select
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium outline-none focus:border-indigo-500"
              >
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Specific Venue / Hall *
            </label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. ETF Lecture Hall 3 / Sports Pavilion"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Event Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Time *
              </label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 10:00 AM - 02:00 PM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-xs block">Ticket Pricing</span>
                <span className="text-[11px] text-slate-500">
                  Is this a paid event or free entry for students?
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaid(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    !isPaid ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-700'
                  }`}
                >
                  Free Event
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaid(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isPaid ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-700'
                  }`}
                >
                  Paid Ticket
                </button>
              </div>
            </div>

            {isPaid && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Ticket Price (₦) *
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Max Ticket Capacity
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={totalCapacity}
                    onChange={(e) => setTotalCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Banner Image URL
            </label>
            <input
              type="url"
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Event Description & Agenda *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide event details, guest speakers, key activities, dress code, and what attendees should bring..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 text-sm outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Campus Event'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
