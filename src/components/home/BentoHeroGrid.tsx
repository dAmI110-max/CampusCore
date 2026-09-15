import React, { useState } from 'react';
import { Product, Accommodation, Category } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import {
  Search,
  ArrowRight,
  Sparkles,
  Smartphone,
  BookOpen,
  Shirt,
  Home,
  Laptop,
  Flame,
  CheckCircle2,
  TrendingUp,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck,
  PackageOpen,
  PlusCircle,
} from 'lucide-react';
import { motion } from 'motion/react';

interface BentoHeroGridProps {
  categories: Category[];
  featuredProducts: Product[];
  featuredAccommodations: Accommodation[];
  onSearch: (query: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onProductClick: (product: Product) => void;
  onAccommodationClick: (accommodation: Accommodation) => void;
  onOpenCreateProduct: () => void;
  onExploreMarketplace: () => void;
  onExploreAccommodation: () => void;
}

export const BentoHeroGrid: React.FC<BentoHeroGridProps> = ({
  categories,
  featuredProducts,
  featuredAccommodations,
  onSearch,
  onSelectCategory,
  onProductClick,
  onAccommodationClick,
  onOpenCreateProduct,
  onExploreMarketplace,
  onExploreAccommodation,
}) => {
  const { currentUser } = useAuth();
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    } else {
      onExploreMarketplace();
    }
  };

  // Real stats for currentUser (Dave Brown or any user)
  const userProducts = currentUser ? StorageService.getUserProducts(currentUser.id) : [];
  const userAds = userProducts.filter((p) => p.status === 'active').length;
  const userSold = userProducts.filter((p) => p.status === 'sold').length;
  const userLikes = userProducts.reduce((sum, p) => sum + (p.favoritesCount || 0), 0);

  // Hot product pick for the featured bento tile (real product or null)
  const hotProduct = featuredProducts.length > 0 ? featuredProducts[0] : null;

  const sampleHostels = featuredAccommodations.slice(0, 2);

  return (
    <section className="py-6 sm:py-8 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* 1. HERO BENTO CARD (Col-span 8) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-8 bg-indigo-600 dark:bg-indigo-900/90 rounded-[28px] sm:rounded-[32px] p-6 sm:p-10 relative overflow-hidden flex flex-col justify-between border border-indigo-400/80 dark:border-indigo-700/80 shadow-xl shadow-indigo-600/10 text-white min-h-[360px]"
          >
            {/* Ambient Blurred Orbs */}
            <div className="absolute -right-16 -bottom-16 w-72 h-72 bg-indigo-400/30 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -right-8 -top-8 w-44 h-44 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/40 border border-indigo-300/30 text-indigo-100 text-xs font-bold backdrop-blur-xs tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                UNIOSUN Marketplace
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Your Campus.<br />
                Your Marketplace.
              </h1>

              <p className="text-indigo-100 text-sm sm:text-base leading-relaxed max-w-md">
                The premier platform for Osun State University students to buy, sell, and find accommodation across all 6 campuses.
              </p>

              {/* Integrated Search Bar inside Hero */}
              <form onSubmit={handleSearchSubmit} className="pt-2 relative flex items-center max-w-lg">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search gadgets, textbooks, hostels..."
                  className="w-full pl-10 pr-24 py-2.5 sm:py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-300 shadow-md border border-transparent dark:border-slate-700"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-3.5 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg sm:rounded-xl transition-all shadow-xs"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Quick Action Buttons */}
            <div className="relative z-10 pt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={onExploreMarketplace}
                className="bg-white text-indigo-600 hover:bg-indigo-50 px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                Explore Market <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenCreateProduct}
                className="bg-indigo-500/50 hover:bg-indigo-500/70 text-white border border-indigo-300/40 px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm backdrop-blur-xs transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                + Sell Something
              </button>
            </div>
          </motion.div>

          {/* 2. STUDENT PROFILE / DEMO ACCOUNT BENTO TILE (Col-span 4) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] sm:rounded-[32px] p-6 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Student Profile</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verified Student Account</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE
                </span>
              </div>

              {/* Student info box */}
              <div className="mt-4 flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                <img
                  src={
                    currentUser?.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={currentUser?.fullName || 'Student'}
                  referrerPolicy="no-referrer"
                  className="w-13 h-13 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                />
                <div className="truncate">
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                    {currentUser?.fullName || 'Student Guest'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {currentUser
                      ? `${currentUser.department || currentUser.departmentName || 'UNIOSUN Student'} • ${currentUser.level || '300L'}`
                      : 'Campus Commerce Hub'}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">
                    {currentUser
                      ? `ID: UNIOSUN-${currentUser.id?.slice(-4).toUpperCase() || 'MEMBER'}`
                      : 'UNIOSUN TRUST NETWORK'}
                  </p>
                </div>
              </div>
            </div>

            {/* Account mini statistics */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2">
              <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{userAds}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Ads</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{userSold}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Sold</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{userLikes}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Likes</p>
              </div>
            </div>
          </motion.div>

          {/* 3. CATEGORY QUICK PILLS BENTO TILE (Col-span 4) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] sm:rounded-[32px] p-4 sm:p-5 flex items-center justify-around shadow-xs"
          >
            <button
              onClick={() => onSelectCategory('cat-phones')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-11 h-11 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xs">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Phones</span>
            </button>

            <button
              onClick={() => onSelectCategory('cat-laptops')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xs">
                <Laptop className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Laptops</span>
            </button>

            <button
              onClick={() => onSelectCategory('cat-fashion')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-11 h-11 bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 rounded-2xl flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-all shadow-2xs">
                <Shirt className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Fashion</span>
            </button>

            <button
              onClick={() => onSelectCategory('cat-books')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-11 h-11 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all shadow-2xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Books</span>
            </button>

            <button
              onClick={onExploreAccommodation}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs">
                <Home className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Hostels</span>
            </button>
          </motion.div>

          {/* 4. HOT FEATURED ITEM BENTO TILE / EMPTY STATE (Col-span 4) */}
          {hotProduct ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              onClick={() => onProductClick(hotProduct)}
              className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-xs flex flex-col group cursor-pointer hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
            >
              <div className="h-44 bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
                <img
                  src={hotProduct.images[0]}
                  alt={hotProduct.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="text-[10px] absolute top-3.5 left-3.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 rounded-full font-bold text-indigo-600 dark:text-indigo-400 shadow-xs flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                  <Flame className="w-3 h-3 text-rose-500 fill-rose-500" /> HOT ITEM
                </span>
                <span className="text-[10px] absolute bottom-2 right-2 bg-slate-900/80 text-white backdrop-blur-xs px-2 py-0.5 rounded-md font-medium">
                  {hotProduct.condition}
                </span>
              </div>

              <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex justify-between items-start mb-1.5">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {hotProduct.title}
                    </h4>
                    <p className="text-indigo-600 dark:text-indigo-400 font-black text-sm shrink-0 ml-2">
                      ₦{hotProduct.price.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {hotProduct.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <img
                      src={hotProduct.sellerAvatar}
                      alt={hotProduct.sellerName}
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{hotProduct.sellerName}</span>
                  </div>
                  <button
                    type="button"
                    className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline flex items-center gap-1"
                  >
                    VIEW DETAILS <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              onClick={onOpenCreateProduct}
              className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] sm:rounded-[32px] p-6 shadow-xs flex flex-col justify-between group cursor-pointer hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-center"
            >
              <div className="flex flex-col items-center justify-center flex-1 py-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 border border-indigo-100 dark:border-indigo-900/50 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                  No products available yet
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed mb-4">
                  New products will appear here as students start selling on CampusPlug.
                </p>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors">
                  <PlusCircle className="w-4 h-4" />
                  Be the first seller to list yours.
                </span>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                Verified Student Commerce • Escrow Protected
              </div>
            </motion.div>
          )}

          {/* 5. HOSTEL LISTINGS BENTO TILE (Col-span 5) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Home className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Hostel Listings
              </h3>
              <button
                onClick={onExploreAccommodation}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                SEE ALL <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {sampleHostels.length > 0 ? (
                sampleHostels.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => onAccommodationClick(acc)}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-3.5 hover:bg-indigo-50/50 dark:hover:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer group"
                  >
                    <img
                      src={acc.images[0]}
                      alt={acc.title}
                      referrerPolicy="no-referrer"
                      className="w-13 h-13 rounded-xl object-cover shrink-0"
                    />
                    <div className="truncate flex-1">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {acc.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-indigo-500" /> {acc.distanceToCampus}
                      </p>
                      <p className="text-indigo-600 dark:text-indigo-400 font-bold text-xs mt-0.5">
                        ₦{acc.price.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">/{(acc.rentalPeriod || 'year').toLowerCase()}</span>
                      </p>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        acc.available
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {acc.available ? 'AVAILABLE' : 'OCCUPIED'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 px-4 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700/60">
                  <Home className="w-8 h-8 text-indigo-500/60 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No hostel listings yet</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                    Off-campus lodges and student rooms will appear here as caretakers list them.
                  </p>
                  <button
                    onClick={onExploreAccommodation}
                    className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    View Hostels Hub
                  </button>
                </div>
              )}
            </div>

            {/* Roommate tip */}
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-2.5 text-xs text-indigo-900 dark:text-indigo-200 font-medium">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs">
                💡
              </div>
              <p className="text-[11px] leading-tight">
                Searching for accommodation near UNIOSUN gate? Direct caretaker contacts with 0% middleman fees.
              </p>
            </div>
          </motion.div>

          {/* 6. REAL-TIME CAMPUS ACTIVITY BENTO TILE (Col-span 3) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="lg:col-span-3 bg-slate-900 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 text-white shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base sm:text-lg font-bold">Campus Pulse</h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-slate-400 text-xs font-medium mb-4">Live updates from 6 campuses</p>

              <div className="space-y-3.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-100">Live Escrow Engine</p>
                    <p className="text-[10px] text-slate-400">Buyer & seller protection active</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-100">Multi-Campus Network</p>
                    <p className="text-[10px] text-slate-400">All 6 UNIOSUN campuses ready</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-100">Student Marketplace</p>
                    <p className="text-[10px] text-slate-400">Open for new student listings</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onExploreMarketplace}
              className="mt-6 w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
            >
              Browse All Listings
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
