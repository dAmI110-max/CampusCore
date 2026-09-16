import React from 'react';
import { EventTicket } from '../../types';
import {
  X,
  QrCode,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Share2,
  Download,
  Sparkles,
  Ticket as TicketIcon,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../../context/ToastContext';

interface TicketModalProps {
  ticket: EventTicket | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ ticket, isOpen, onClose }) => {
  const { success } = useToast();

  if (!isOpen || !ticket) return null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `CampusCore Event Pass: ${ticket.eventTitle}\nTicket No: ${ticket.ticketNumber}\nAttendee: ${ticket.userName}`
      );
      success('Ticket details copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative"
      >
        {/* Ticket Top Header */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 text-center relative overflow-hidden">
          <div className="absolute right-3 top-3">
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-2 border border-indigo-500/30">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Verified CampusCore Pass
          </div>

          <h2 className="text-xl font-black leading-tight text-white px-4">
            {ticket.eventTitle}
          </h2>

          <p className="text-xs text-indigo-200/80 mt-1">
            Official E-Ticket & Access Permit
          </p>
        </div>

        {/* Ticket Perforated Cutout Separator */}
        <div className="relative bg-slate-50 flex items-center justify-between px-3 py-2 border-y border-dashed border-slate-300">
          <div className="w-5 h-5 bg-slate-950/70 rounded-full -ml-6" />
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            {ticket.ticketNumber}
          </span>
          <div className="w-5 h-5 bg-slate-950/70 rounded-full -mr-6" />
        </div>

        {/* Ticket Body & QR Code */}
        <div className="p-6 space-y-5">
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            {/* Real SVG QR code representation */}
            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
              <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
                {/* QR Pattern Simulation with high contrast */}
                <rect x="0" y="0" width="30" height="30" fill="#0f172a" rx="4" />
                <rect x="5" y="5" width="20" height="20" fill="white" rx="2" />
                <rect x="10" y="10" width="10" height="10" fill="#4f46e5" rx="1" />

                <rect x="70" y="0" width="30" height="30" fill="#0f172a" rx="4" />
                <rect x="75" y="5" width="20" height="20" fill="white" rx="2" />
                <rect x="80" y="10" width="10" height="10" fill="#4f46e5" rx="1" />

                <rect x="0" y="70" width="30" height="30" fill="#0f172a" rx="4" />
                <rect x="5" y="75" width="20" height="20" fill="white" rx="2" />
                <rect x="10" y="80" width="10" height="10" fill="#4f46e5" rx="1" />

                {/* Grid dots */}
                <rect x="38" y="10" width="8" height="8" fill="#0f172a" />
                <rect x="52" y="10" width="8" height="8" fill="#0f172a" />
                <rect x="38" y="24" width="8" height="8" fill="#4f46e5" />
                <rect x="10" y="38" width="8" height="8" fill="#0f172a" />
                <rect x="24" y="38" width="8" height="8" fill="#0f172a" />
                <rect x="38" y="38" width="8" height="8" fill="#0f172a" />
                <rect x="52" y="38" width="8" height="8" fill="#0f172a" />
                <rect x="66" y="38" width="8" height="8" fill="#0f172a" />
                <rect x="80" y="38" width="8" height="8" fill="#4f46e5" />
                <rect x="38" y="52" width="8" height="8" fill="#0f172a" />
                <rect x="52" y="52" width="8" height="8" fill="#4f46e5" />
                <rect x="66" y="52" width="8" height="8" fill="#0f172a" />
                <rect x="80" y="52" width="8" height="8" fill="#0f172a" />
                <rect x="38" y="66" width="8" height="8" fill="#0f172a" />
                <rect x="52" y="66" width="8" height="8" fill="#0f172a" />
                <rect x="66" y="66" width="8" height="8" fill="#0f172a" />
                <rect x="38" y="80" width="8" height="8" fill="#4f46e5" />
                <rect x="52" y="80" width="8" height="8" fill="#0f172a" />
                <rect x="66" y="80" width="8" height="8" fill="#0f172a" />
                <rect x="80" y="80" width="8" height="8" fill="#0f172a" />
              </svg>
            </div>

            <span className="text-[11px] font-bold text-slate-500 mt-2">
              Present this QR code at the entrance
            </span>
          </div>

          {/* Ticket Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Attendee</span>
              <span className="font-bold text-slate-900">{ticket.userName}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Status</span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  ticket.status === 'checked_in' ? 'text-emerald-600' : 'text-indigo-600'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {ticket.status === 'checked_in' ? 'Checked In' : 'Valid Entry Pass'}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Event Date</span>
              <span className="font-semibold text-slate-900">{ticket.eventDate}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Price Paid</span>
              <span className="font-black text-slate-900">
                {ticket.pricePaid === 0 ? 'Free' : `₦${ticket.pricePaid.toLocaleString()}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500 justify-center">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{ticket.eventVenue}</span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> Copy Pass Info
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
