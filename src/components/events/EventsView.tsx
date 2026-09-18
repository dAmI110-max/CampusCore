import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import {
  CampusEvent,
  CampusEventCategory,
  EventTicket,
} from '../../types';
import { EventCard } from './EventCard';
import { EventDetailModal } from './EventDetailModal';
import { CreateEventModal } from './CreateEventModal';
import { TicketModal } from './TicketModal';
import { TicketScannerModal } from './TicketScannerModal';
import { EmptyState } from '../common/EmptyState';
import {
  Search,
  Plus,
  Calendar,
  Layers,
  MapPin,
  Clock,
  Ticket,
  Sparkles,
  Users,
  Scan,
  Zap,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EventsViewProps {
  onBack?: () => void;
  onOpenAuth?: () => void;
  onOpenWallet?: () => void;
}

export const EventsView: React.FC<EventsViewProps> = ({ onBack, onOpenAuth, onOpenWallet }) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'explore' | 'my_tickets' | 'my_hosted'>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [pricingFilter, setPricingFilter] = useState<'all' | 'free' | 'paid'>('all');

  // Modals
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [viewTicket, setViewTicket] = useState<EventTicket | null>(null);
  const [scannerEvent, setScannerEvent] = useState<CampusEvent | null>(null);

  // Data
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<EventTicket[]>([]);

  const loadData = () => {
    setCampuses(StorageService.getCampuses());
    setEvents(
      StorageService.getEvents({
        category: selectedCategory,
        campusId: selectedCampus,
        isPaid: pricingFilter === 'all' ? undefined : pricingFilter === 'paid',
        search: searchQuery,
      })
    );
    if (currentUser) {
      setMyTickets(StorageService.getUserTickets(currentUser.id));
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('campusplug_storage_update', handleUpdate);
    return () => window.removeEventListener('campusplug_storage_update', handleUpdate);
  }, [selectedCategory, selectedCampus, pricingFilter, searchQuery, currentUser?.id]);

  const handleBuyOrClaimTicket = (event: CampusEvent) => {
    if (!currentUser) {
      toastError('Please log in to purchase or claim tickets.');
      return;
    }

    const res = StorageService.buyEventTicket(
      event.id,
      currentUser.id,
      currentUser.fullName,
      currentUser.email
    );

    if (!res.success) {
      toastError(res.error || 'Failed to acquire ticket.');
      return;
    }

    success(event.isPaid ? 'Ticket purchased successfully from wallet balance!' : 'Free Entry Pass claimed!');
    loadData();
    if (res.ticket) {
      setViewTicket(res.ticket);
    }
  };

  const myHostedEvents = events.filter((e) => e.organizerId === currentUser?.id);

  return (
    <div className="min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Back Navigation Bar */}
      {onBack && (
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back</span>
          </button>
          <span className="text-xs text-slate-400">/ Events & Tickets</span>
        </div>
      )}

      {/* Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-indigo-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-sm border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Campus Life & Social Discovery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Campus Events & Ticketing
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Discover academic seminars, tech hackathons, departmental dinners, comedy nights, and sports tourneys with instant QR ticketing on your student device.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="create-event-btn"
              onClick={() => {
                if (!currentUser) {
                  if (onOpenAuth) onOpenAuth();
                  return;
                }
                setCreateEventOpen(true);
              }}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Host an Event
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'explore'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Explore Events ({events.length})
          </button>

          {currentUser && (
            <>
              <button
                onClick={() => setActiveTab('my_tickets')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'my_tickets'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" /> My Tickets & Passes ({myTickets.length})
              </button>

              <button
                onClick={() => setActiveTab('my_hosted')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'my_hosted'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" /> My Hosted Events ({myHostedEvents.length})
              </button>
            </>
          )}
        </div>
      </div>

      {/* EXPLORE TAB */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campus events, hackathons, dinners, workshops..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
              >
                <option value="all">All Categories</option>
                <option value="academic">Academic</option>
                <option value="workshop">Workshops</option>
                <option value="party">Parties & Social</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="religious">Religious</option>
                <option value="career">Career</option>
              </select>

              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
              >
                <option value="all">All Campuses</option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={pricingFilter}
                onChange={(e) => setPricingFilter(e.target.value as any)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
              >
                <option value="all">All Prices</option>
                <option value="free">Free Events Only</option>
                <option value="paid">Paid Passes Only</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {events.length === 0 ? (
            <EmptyState
              title="No events found"
              description="Be the first to organize a campus meet, seminar, or social night."
              actionLabel="Host an Event"
              onAction={() => setCreateEventOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onSelect={(e) => setSelectedEvent(e)}
                  onBuyTicket={(e) => handleBuyOrClaimTicket(e)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* MY TICKETS TAB */}
      {activeTab === 'my_tickets' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900">
            My Event Passes ({myTickets.length})
          </h2>

          {myTickets.length === 0 ? (
            <EmptyState
              title="No event tickets claimed yet"
              description="Get free passes or buy tickets to campus hackathons, symposiums, and dinners."
              actionLabel="Browse Events"
              onAction={() => setActiveTab('explore')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {ticket.ticketNumber}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          ticket.status === 'checked_in'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {ticket.status === 'checked_in' ? 'Checked In' : 'Active Pass'}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mt-2">
                      {ticket.eventTitle}
                    </h3>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Date:</span>
                      <span className="font-bold text-slate-900">{ticket.eventDate}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Venue:</span>
                      <span className="font-bold text-slate-900 truncate max-w-[150px]">
                        {ticket.eventVenue}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setViewTicket(ticket)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Ticket className="w-3.5 h-3.5" /> View Digital QR Pass
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MY HOSTED EVENTS TAB */}
      {activeTab === 'my_hosted' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">
              Events You are Hosting ({myHostedEvents.length})
            </h2>
            <button
              onClick={() => setCreateEventOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Host Another Event
            </button>
          </div>

          {myHostedEvents.length === 0 ? (
            <EmptyState
              title="You haven't hosted any events yet"
              description="Host departmental events, club meetings, and campus parties with automated QR check-ins."
              actionLabel="Host Your First Event"
              onAction={() => setCreateEventOpen(true)}
            />
          ) : (
            <div className="space-y-4">
              {myHostedEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={event.bannerImage}
                      alt={event.title}
                      referrerPolicy="no-referrer"
                      className="w-20 h-14 rounded-2xl object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{event.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {event.date} • {event.venue}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-700 mt-1">
                        <span>
                          <strong>{event.attendeesCount || 0}</strong> Registered
                        </span>
                        <span>•</span>
                        <span className="text-indigo-600 font-bold">
                          {event.isPaid ? `₦${event.ticketPrice.toLocaleString()} / ticket` : 'Free Entry'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setScannerEvent(event)}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                    >
                      <Scan className="w-3.5 h-3.5 text-cyan-400" /> Open Ticket Scanner
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onBuyTicket={(e) => handleBuyOrClaimTicket(e)}
        />
      )}

      <CreateEventModal
        isOpen={createEventOpen}
        onClose={() => setCreateEventOpen(false)}
        onSuccess={loadData}
      />

      <TicketModal
        ticket={viewTicket}
        isOpen={!!viewTicket}
        onClose={() => setViewTicket(null)}
      />

      <TicketScannerModal
        event={scannerEvent}
        isOpen={!!scannerEvent}
        onClose={() => setScannerEvent(null)}
        onRefresh={loadData}
      />
    </div>
  );
};
