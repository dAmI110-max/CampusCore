import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import {
  ShoppingBag,
  Home,
  LogOut,
  ShieldCheck,
  Plus,
  Menu,
  X,
  ShieldAlert,
  Sparkles,
  Wallet,
  MessageCircle,
  Users,
  Wrench,
  Briefcase,
  Calendar,
  Building2,
  Search,
  Crown,
  LifeBuoy,
  ChevronDown,
  Compass,
} from 'lucide-react';
import { CampusCoreLogo } from '../common/CampusCoreLogo';
import { ThemeToggle } from '../common/ThemeToggle';
import { AppViewMode } from '../../types';

export type { AppViewMode };

interface NavbarProps {
  currentView: AppViewMode;
  onNavigate: (view: AppViewMode) => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenCreateProduct: () => void;
  onOpenAbout: () => void;
  onOpenVerificationModal?: () => void;
  onOpenUnifiedSearch?: () => void;
  onOpenSubscriptions?: () => void;
  onOpenSupport?: () => void;
  onOpenSellerOnboarding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenCreateProduct,
  onOpenAbout,
  onOpenVerificationModal,
  onOpenUnifiedSearch,
  onOpenSubscriptions,
  onOpenSupport,
  onOpenSellerOnboarding,
}) => {
  const { currentUser, isSuperAdmin, isAdmin, isSeller, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showExploreDropdown, setShowExploreDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const exploreRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setShowExploreDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userWallet = currentUser ? StorageService.getWallet(currentUser.id) : null;
  const userOrders = currentUser ? StorageService.getOrdersForUser(currentUser.id) : [];
  const activeOrdersCount = userOrders.filter(
    (o) => o.status !== 'completed' && o.status !== 'cancelled' && o.status !== 'refunded'
  ).length;

  const conversations = currentUser ? StorageService.getConversations(currentUser.id) : [];
  const unreadMessagesCount = conversations.reduce(
    (acc, c) => acc + (c.unreadCount?.[currentUser?.id || ''] || 0),
    0
  );

  const userVerification = currentUser ? StorageService.getUserVerification(currentUser.id) : null;

  const handleSellClick = () => {
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    if (isSeller) {
      onOpenCreateProduct();
    } else if (onOpenSellerOnboarding) {
      onOpenSellerOnboarding();
    } else {
      onOpenCreateProduct();
    }
  };

  const isExploreActive = [
    'marketplace',
    'accommodation',
    'roommates',
    'services',
    'jobs',
    'events',
    'communities',
    'businesses',
  ].includes(currentView);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white text-[11px] py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              UNIOSUN Campus Trust:
            </span>
            <span className="text-slate-300 hidden sm:inline">
              Safe student marketplace, escrow protection, verified hostels & academic tools.
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-300">
            <span className="hidden md:inline text-slate-400">
              Support:{' '}
              <a
                href="mailto:cplugsupport@gmail.com"
                className="text-amber-300 hover:text-white transition-colors"
              >
                cplugsupport@gmail.com
              </a>
            </span>
            <button
              onClick={onOpenAbout}
              className="text-slate-300 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
            >
              About CampusCore
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo */}
          <div
            onClick={() => {
              onNavigate('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center cursor-pointer group select-none shrink-0"
          >
            <CampusCoreLogo variant="full" theme="auto" size="md" showBadge={true} />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                currentView === 'home'
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              Home
            </button>

            {/* Centralized Explore Dropdown */}
            <div className="relative" ref={exploreRef}>
              <button
                onClick={() => setShowExploreDropdown(!showExploreDropdown)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isExploreActive
                    ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                Explore
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    showExploreDropdown ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showExploreDropdown && (
                <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-3 py-1.5 uppercase tracking-wider">
                    Campus Ecosystem
                  </div>

                  {/* 1. Study */}
                  <button
                    onClick={() => {
                      onNavigate('study');
                      setShowExploreDropdown(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-2xl transition-colors flex items-center gap-3 ${
                      currentView === 'study'
                        ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1">
                        Campus Study
                        <span className="text-[8px] font-black bg-cyan-500 text-white px-1 py-0.2 rounded-sm">FREE</span>
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">StudyGen AI, past questions, notes & books</div>
                    </div>
                  </button>

                  {/* 2. Marketplace */}
                  <button
                    onClick={() => {
                      onNavigate('marketplace');
                      setShowExploreDropdown(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-2xl transition-colors flex items-center gap-3 ${
                      currentView === 'marketplace'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Student Marketplace</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">Buy & sell gadgets, fashion & items</div>
                    </div>
                  </button>

                  {/* 3. Hostels */}
                  <button
                    onClick={() => {
                      onNavigate('accommodation');
                      setShowExploreDropdown(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-2xl transition-colors flex items-center gap-3 ${
                      currentView === 'accommodation'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Home className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Campus Hostels</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">Verified off-campus student housing</div>
                    </div>
                  </button>

                  {/* 4. Roommates */}
                  <button
                    onClick={() => {
                      onNavigate('roommates');
                      setShowExploreDropdown(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-2xl transition-colors flex items-center gap-3 ${
                      currentView === 'roommates'
                        ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Roommate Finder</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">Match with compatible student flatmates</div>
                    </div>
                  </button>

                  {/* 5. Services */}
                  <button
                    onClick={() => {
                      onNavigate('services');
                      setShowExploreDropdown(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-2xl transition-colors flex items-center gap-3 ${
                      currentView === 'services'
                        ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Student Services</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">Repairs, design, tutoring & laundry</div>
                    </div>
                  </button>

                  {/* 6. Jobs */}
                  <button
                    onClick={() => {
                      onNavigate('jobs');
                      setShowExploreDropdown(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-2xl transition-colors flex items-center gap-3 ${
                      currentView === 'jobs'
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Campus Jobs & Gigs</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">Flexible student opportunities</div>
                    </div>
                  </button>

                  {/* 7. Events */}
                  <button
                    onClick={() => {
                      onNavigate('events');
                      setShowExploreDropdown(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-2xl transition-colors flex items-center gap-3 ${
                      currentView === 'events'
                        ? 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Events & Tickets</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">Galas, parties, summits & ticketing</div>
                    </div>
                  </button>

                  {/* 8. Communities */}
                  <button
                    onClick={() => {
                      onNavigate('communities');
                      setShowExploreDropdown(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-2xl transition-colors flex items-center gap-3 ${
                      currentView === 'communities'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Student Communities</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">Faculty clubs & student groups</div>
                    </div>
                  </button>

                  {/* 9. Businesses */}
                  <button
                    onClick={() => {
                      onNavigate('businesses');
                      setShowExploreDropdown(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-2xl transition-colors flex items-center gap-3 ${
                      currentView === 'businesses'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Campus Stores & Vendors</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">Verified cafes, print shops & stores</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Direct Study Link */}
            <button
              onClick={() => onNavigate('study')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'study'
                  ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/50 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              Study
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-cyan-500 text-white">
                AI
              </span>
            </button>

            {/* Messages */}
            {currentUser && (
              <button
                onClick={() => onNavigate('messages')}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 relative ${
                  currentView === 'messages'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Messages
                {unreadMessagesCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                )}
              </button>
            )}

            {/* Admin Console (Only visible to Admin & Super Admin) */}
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 shadow-xs font-black'
                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50/60 dark:hover:bg-rose-950/40'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                {isSuperAdmin ? 'Super Admin' : 'Admin Console'}
              </button>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Global Search button */}
            {onOpenUnifiedSearch && (
              <button
                onClick={onOpenUnifiedSearch}
                className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-white dark:bg-slate-900/90 hover:bg-purple-50 dark:hover:bg-purple-950/50 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-purple-100/80 dark:border-purple-950/60 shadow-2xs"
                title="Global Campus Search"
              >
                <Search className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="hidden xl:inline text-slate-500 dark:text-slate-400 font-normal">Search...</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <ThemeToggle variant="dropdown" />

            {/* Escrow balance indicator if logged in */}
            {currentUser && (
              <button
                onClick={() => onNavigate('orders')}
                className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  currentView === 'orders'
                    ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/50 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-purple-50/60 dark:hover:bg-purple-950/40'
                }`}
                title="Your Campus Escrow Balance"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Escrow:</span>
                <span className="font-mono text-purple-700 dark:text-purple-300 font-bold">
                  ₦{(userWallet?.pendingBalance || 0).toLocaleString()}
                </span>
              </button>
            )}

            {/* Sell / Post Button */}
            <button
              onClick={handleSellClick}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm shadow-purple-600/25 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Post / Sell</span>
              <span className="sm:hidden">Sell</span>
            </button>

            {/* Auth / Profile Area */}
            {currentUser ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-2xl border border-purple-100/80 dark:border-purple-950/60 hover:bg-purple-50/50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer bg-white dark:bg-slate-900/90 shadow-2xs"
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-purple-500/30"
                  />
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1">
                      {currentUser.fullName.split(' ')[0]}
                      {userVerification?.status === 'approved' && (
                        <span title="Verified Student">
                          <ShieldCheck className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
                      {isSuperAdmin ? 'Super Admin' : isSeller ? 'Seller' : 'Student'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{currentUser.fullName}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{currentUser.email}</div>
                    </div>

                    <button
                      onClick={() => {
                        onNavigate('dashboard');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2.5"
                    >
                      <Home className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      My Profile & Listings
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('orders');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <div>
                          <div>Orders & Escrow</div>
                          <div className="text-[10px] font-normal text-slate-400">
                            ₦{(userWallet?.pendingBalance || 0).toLocaleString()} in escrow
                          </div>
                        </div>
                      </div>
                      {activeOrdersCount > 0 && (
                        <span className="px-1.5 py-0.2 text-[9px] font-black bg-purple-600 text-white rounded-full">
                          {activeOrdersCount}
                        </span>
                      )}
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-2.5"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        {isSuperAdmin ? 'Super Admin Console' : 'Admin Console'}
                      </button>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-2.5"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="hidden sm:inline-flex px-3.5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm shadow-purple-600/25 transition-all cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle Mobile Navigation"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[80vh] overflow-y-auto">
          {/* Quick User / Theme Header on Mobile */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Appearance</span>
            <ThemeToggle variant="buttons" />
          </div>

          <div className="space-y-1">
            <button
              onClick={() => {
                onNavigate('home');
                setShowMobileMenu(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-3"
            >
              <Home className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Home
            </button>

            <button
              onClick={() => {
                onNavigate('study');
                setShowMobileMenu(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4" />
                Campus Study (StudyGen AI & Books)
              </div>
              <span className="text-[9px] font-black bg-cyan-500 text-white px-1.5 py-0.2 rounded-md">FREE</span>
            </button>

            <button
              onClick={() => {
                onNavigate('marketplace');
                setShowMobileMenu(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-3"
            >
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              Student Marketplace
            </button>

            <button
              onClick={() => {
                onNavigate('accommodation');
                setShowMobileMenu(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-3"
            >
              <Home className="w-4 h-4 text-emerald-500" />
              Campus Hostels & Lodges
            </button>

            <button
              onClick={() => {
                onNavigate('roommates');
                setShowMobileMenu(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-3"
            >
              <Users className="w-4 h-4 text-purple-500" />
              Roommate Finder
            </button>

            <button
              onClick={() => {
                onNavigate('services');
                setShowMobileMenu(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-3"
            >
              <Wrench className="w-4 h-4 text-purple-500" />
              Student Services & Freelancers
            </button>

            <button
              onClick={() => {
                onNavigate('jobs');
                setShowMobileMenu(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-3"
            >
              <Briefcase className="w-4 h-4 text-teal-500" />
              Campus Jobs & Gigs
            </button>

            <button
              onClick={() => {
                onNavigate('events');
                setShowMobileMenu(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-3"
            >
              <Calendar className="w-4 h-4 text-pink-500" />
              Campus Events & Ticketing
            </button>

            <button
              onClick={() => {
                onNavigate('communities');
                setShowMobileMenu(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-3"
            >
              <Users className="w-4 h-4 text-indigo-500" />
              Student Communities & Clubs
            </button>

            <button
              onClick={() => {
                onNavigate('businesses');
                setShowMobileMenu(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-3"
            >
              <Building2 className="w-4 h-4 text-amber-600" />
              Campus Stores & Local Vendors
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  onNavigate('admin');
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 flex items-center gap-3"
              >
                <ShieldAlert className="w-4 h-4" />
                {isSuperAdmin ? 'Super Admin Console' : 'Admin Console'}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
