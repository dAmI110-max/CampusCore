import React from 'react';
import {
  ShoppingBag,
  Home,
  Users,
  Wrench,
  Briefcase,
  Calendar,
  Building2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Search,
  ArrowLeft,
  GraduationCap,
  Megaphone,
} from 'lucide-react';
import { AppViewMode } from '../layout/Navbar';
import { StorageService } from '../../services/storageService';

interface ExploreViewProps {
  onNavigate: (view: AppViewMode) => void;
  onBack?: () => void;
  onOpenSearch?: () => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  onNavigate,
  onBack,
  onOpenSearch,
}) => {
  // Live stats from storage
  const productsCount = StorageService.getProducts().filter((p) => p.status === 'active').length;
  const accommodationsCount = StorageService.getAccommodations().filter((a) => a.available).length;
  const servicesCount = StorageService.getServices().length;
  const jobsCount = StorageService.getJobs().length;
  const eventsCount = StorageService.getEvents().length;
  const communitiesCount = StorageService.getCommunities().length;
  const businessesCount = StorageService.getBusinesses().length;
  const roommatesCount = StorageService.getRoommateProfiles().filter((r) => r.isActive).length;

  const exploreSections = [
    {
      id: 'marketplace' as AppViewMode,
      title: 'Student Marketplace',
      tagline: 'Buy & sell gadgets, textbooks, clothes & dorm essentials',
      count: `${productsCount} active listings`,
      icon: ShoppingBag,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-100',
      badge: 'Escrow Protected',
      features: ['Direct student trade', 'Funds held safely in escrow', '6 UNIOSUN campuses'],
    },
    {
      id: 'study' as AppViewMode,
      title: 'Campus Study',
      tagline: 'Your academic space for studying, sharing resources and getting help',
      count: 'Free Academic Space',
      icon: Sparkles,
      color: 'from-cyan-600 to-blue-600',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      borderColor: 'border-cyan-100',
      badge: '100% Free Access',
      features: ['StudyGen AI assistant', 'Past questions & lecture notes', 'Textbooks & course guides'],
    },
    {
      id: 'services' as AppViewMode,
      title: 'Campus Student Services',
      tagline: 'Hire skilled student freelancers, tutors, stylists & technicians',
      count: `${servicesCount} skill offerings`,
      icon: Wrench,
      color: 'from-purple-600 to-indigo-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-100',
      badge: 'Escrow Milestone Pay',
      features: ['Assignments & coding', 'Hair & beauty styling', 'Gadget & phone repair'],
    },
    {
      id: 'accommodation' as AppViewMode,
      title: 'Campus Hostels & Lodges',
      tagline: 'Verified off-campus student accommodation & apartments',
      count: `${accommodationsCount} verified hostels`,
      icon: Home,
      color: 'from-emerald-600 to-teal-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-100',
      badge: 'Verified Landlords',
      features: ['Self-contains & flats', 'Near university gates', 'Direct caretaker contact'],
    },
    {
      id: 'jobs' as AppViewMode,
      title: 'Campus Jobs & Gigs',
      tagline: 'Flexible part-time student jobs, tutoring gigs & internships',
      count: `${jobsCount} open roles`,
      icon: Briefcase,
      color: 'from-teal-600 to-cyan-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      borderColor: 'border-teal-100',
      badge: 'Student Friendly',
      features: ['Part-time & weekend shifts', 'Remote online gigs', 'Verified campus employers'],
    },
    {
      id: 'events' as AppViewMode,
      title: 'Events & Ticketing',
      tagline: 'Conferences, departmental dinners, parties & workshops',
      count: `${eventsCount} upcoming events`,
      icon: Calendar,
      color: 'from-pink-600 to-rose-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      borderColor: 'border-pink-100',
      badge: 'Instant QR Tickets',
      features: ['Secure ticket checkout', 'Digital wallet pass', 'Door scanner validation'],
    },
    {
      id: 'communities' as AppViewMode,
      title: 'Student Communities',
      tagline: 'Join departmental associations, clubs, and student interest groups',
      count: `${communitiesCount} active clubs`,
      icon: Users,
      color: 'from-indigo-600 to-purple-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      borderColor: 'border-indigo-100',
      badge: 'Campus Life',
      features: ['Discussion forums', 'Study materials sharing', 'Club announcements'],
    },
    {
      id: 'roommates' as AppViewMode,
      title: 'Roommate Finder',
      tagline: 'Find compatible, verified student roommates to split rent',
      count: `${roommatesCount} looking for flatmates`,
      icon: Users,
      color: 'from-purple-600 to-indigo-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-100',
      badge: 'Compatibility Match',
      features: ['Budget & lifestyle filter', 'Department & faculty match', 'In-app student chat'],
    },
    {
      id: 'businesses' as AppViewMode,
      title: 'Campus Stores & Vendors',
      tagline: 'Directory of verified campus restaurants, cyber cafes & shops',
      count: `${businessesCount} registered merchants`,
      icon: Building2,
      color: 'from-amber-600 to-orange-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-100',
      badge: 'Verified Vendors',
      features: ['Food & cafeteria menus', 'Printing & photocopying', 'Student discount perks'],
    },
  ];

  return (
    <div className="min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              UNIOSUN Campus Ecosystem
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Explore CampusCore
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Everything you need for student life — trade items safely, discover verified lodges, hire student skills, apply for gigs, and attend campus events.
          </p>
        </div>

        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="self-start sm:self-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4 text-purple-400" />
            <span>Search All CampusCore</span>
          </button>
        )}
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-indigo-900/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-sm border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Unified Student Super-App</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            One Unified Platform for All 6 UNIOSUN Campuses
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            From buying your first textbook in Osogbo to finding a lodge in Ikire or booking a barber in Okuku, CampusCore connects university students securely with Escrow Buyer Protection.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Escrow Protection</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Verified Student Community</span>
            </div>
          </div>
        </div>
      </div>

      {/* The 8 Main Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {exploreSections.map((sec) => {
          const Icon = sec.icon;
          return (
            <div
              key={sec.id}
              onClick={() => onNavigate(sec.id)}
              className="group bg-white rounded-3xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${sec.bgColor} ${sec.textColor} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    {sec.badge}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {sec.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {sec.tagline}
                </p>

                {/* Features list */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  {sec.features.map((f, i) => (
                    <div key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom count & action */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">
                  {sec.count}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                  Open <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
