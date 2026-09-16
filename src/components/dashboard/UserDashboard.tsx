import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { Product } from '../../types';
import { MyListingsTab } from './MyListingsTab';
import { MyFavoritesTab } from './MyFavoritesTab';
import { ProfileSettingsTab } from './ProfileSettingsTab';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Eye,
  CheckCircle2,
  TrendingUp,
  Plus,
  Home,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';

interface UserDashboardProps {
  onOpenCreateProduct: () => void;
  onOpenCreateAccommodation: () => void;
  onProductClick: (product: Product) => void;
  onFavoriteToggle: (productId: string) => void;
  onExploreMarketplace: () => void;
  onNavigateToOrders?: () => void;
}

type DashboardTab = 'overview' | 'listings' | 'favorites' | 'profile';

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onOpenCreateProduct,
  onOpenCreateAccommodation,
  onProductClick,
  onFavoriteToggle,
  onExploreMarketplace,
  onNavigateToOrders,
}) => {
  const { currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState<DashboardTab>('overview');
  const [, setTick] = useState(0);

  const forceRefresh = () => setTick((t) => t + 1);

  if (!currentUser) {
    return null;
  }

  const userWallet = StorageService.getWallet(currentUser.id);
  const pendingEscrow = userWallet?.pendingBalance || 0;
  const myListings = StorageService.getProductsBySeller(currentUser.id);
  const favoriteIds = StorageService.getFavorites(currentUser.id);
  const allProducts = StorageService.getProducts();
  const favoriteProducts = allProducts.filter((p) => favoriteIds.includes(p.id));

  const activeCount = myListings.filter((p) => p.status === 'active').length;
  const soldCount = myListings.filter((p) => p.status === 'sold').length;
  const totalViews = myListings.reduce((sum, p) => sum + (p.views || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden mb-8">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              referrerPolicy="no-referrer"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/10 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black">{currentUser.fullName}</h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {currentUser.role === 'admin' ? 'Campus Admin' : 'UNIOSUN Student'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {currentUser.department || currentUser.departmentName || 'UNIOSUN Student'} • {currentUser.level || '300L'} • {currentUser.campusName}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span>@{currentUser.username}</span>
                <span>•</span>
                <span>{currentUser.email}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenCreateProduct}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Sell Item
            </button>
            <button
              onClick={onOpenCreateAccommodation}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-xs transition-colors flex items-center gap-1.5"
            >
              <Home className="w-4 h-4 text-emerald-400" />
              Post Hostel
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3.5 backdrop-blur-xs">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" /> Active Listings
            </div>
            <div className="text-xl font-black text-white mt-1">{activeCount}</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 backdrop-blur-xs">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Items Sold
            </div>
            <div className="text-xl font-black text-white mt-1">{soldCount}</div>
          </div>

          <div className="bg-amber-500/10 border border-amber-400/20 rounded-2xl p-3.5 backdrop-blur-xs">
            <div className="text-xs text-amber-300 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Escrow Balance
            </div>
            <div className="text-xl font-black text-amber-200 mt-1">₦{pendingEscrow.toLocaleString()}</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 backdrop-blur-xs">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-400" /> Saved Items
            </div>
            <div className="text-xl font-black text-white mt-1">{favoriteProducts.length}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px mb-8 overflow-x-auto">
        <button
          onClick={() => setCurrentTab('overview')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            currentTab === 'overview'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Dashboard Overview
        </button>

        <button
          onClick={() => setCurrentTab('listings')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            currentTab === 'listings'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          My Listings ({myListings.length})
        </button>

        <button
          onClick={() => setCurrentTab('favorites')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            currentTab === 'favorites'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          My Favorites ({favoriteProducts.length})
        </button>

        <button
          onClick={() => setCurrentTab('profile')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            currentTab === 'profile'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          Profile Settings
        </button>
      </div>

      {/* Tab Content */}
      <motion.div
        key={currentTab}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {currentTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Actions & Recent Listings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Recent Listings */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Your Active Listings</h3>
                  <button
                    onClick={() => setCurrentTab('listings')}
                    className="text-xs text-emerald-700 font-bold hover:underline"
                  >
                    View All ({myListings.length})
                  </button>
                </div>

                {myListings.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                    <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-800">You haven't listed any items yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Clear out your used textbooks, electronics, shoes, or gadgets and make cash from fellow UNIOSUN students.
                    </p>
                    <button
                      onClick={onOpenCreateProduct}
                      className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      Post Your First Item
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myListings.slice(0, 3).map((product) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-2xl border border-slate-200 p-3.5 flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-shadow"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={product.images?.[0]}
                            alt={product.title}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{product.title}</h4>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="font-extrabold text-emerald-700">
                                ₦{product.price.toLocaleString()}
                              </span>
                              <span>•</span>
                              <span>{product.views || 0} views</span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                            product.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : product.status === 'sold'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {(product.status || 'ACTIVE').toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Col: Escrow Balance & Campus Safety */}
              <div className="space-y-4">
                {/* Escrow Balance Card */}
                <div className="bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-3xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Campus Escrow Balance
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200/80 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 rounded-full">
                      Protected
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-amber-950 dark:text-amber-100">
                      ₦{pendingEscrow.toLocaleString()}
                    </div>
                    <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 mt-1">
                      Held securely in UNIOSUN Escrow. Funds are released automatically once order meetup and inspection are confirmed.
                    </p>
                  </div>
                  {onNavigateToOrders && (
                    <button
                      onClick={onNavigateToOrders}
                      className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors text-center cursor-pointer shadow-xs"
                    >
                      Track Escrow Orders &rarr;
                    </button>
                  )}
                </div>

                {/* Campus Safety Tips */}
                <div className="bg-emerald-50/70 dark:bg-emerald-950/20 rounded-3xl p-5 border border-emerald-100 dark:border-emerald-900/40 space-y-3 text-xs text-emerald-950 dark:text-emerald-200">
                  <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    Ace Tech Safe Exchange Rules
                  </div>
                  <ul className="space-y-2 text-emerald-900/80 dark:text-emerald-300/80 text-[11px] list-disc list-inside">
                    <li>Always meet in public campus zones (SUB, Cafeteria, Campus Gate).</li>
                    <li>Inspect all gadgets thoroughly before transferring payment.</li>
                    <li>CampusCore will never ask for your account password or BVN.</li>
                    <li>Report suspicious accounts or scam attempts immediately to support.</li>
                  </ul>
                  <div className="pt-2 text-[10px] text-emerald-800/80 dark:text-emerald-400/80 font-medium">
                    Need support? Email <strong>cplugsupport@gmail.com</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'listings' && (
          <MyListingsTab
            products={myListings}
            onRefresh={forceRefresh}
            onEditProduct={(p) => {
              // Edit modal triggers from parent if needed
            }}
            onOpenCreate={onOpenCreateProduct}
          />
        )}

        {currentTab === 'favorites' && (
          <MyFavoritesTab
            favoriteProducts={favoriteProducts}
            onProductClick={onProductClick}
            onFavoriteToggle={(id) => {
              onFavoriteToggle(id);
              forceRefresh();
            }}
            onExploreMarketplace={onExploreMarketplace}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileSettingsTab user={currentUser} onRefresh={forceRefresh} />
        )}
      </motion.div>
    </div>
  );
};
