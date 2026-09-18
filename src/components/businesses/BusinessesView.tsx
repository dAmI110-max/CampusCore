import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { BusinessProfile } from '../../types';
import { BusinessCard } from './BusinessCard';
import { BusinessDetailModal } from './BusinessDetailModal';
import { CreateBusinessModal } from './CreateBusinessModal';
import { EmptyState } from '../common/EmptyState';
import {
  Search,
  Plus,
  Building2,
  Layers,
  Sparkles,
  MapPin,
  Star,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BusinessesViewProps {
  onBack?: () => void;
  onOpenChat?: (userId: string) => void;
  onNavigateToChat?: (userId: string) => void;
  onOpenAuth?: () => void;
}

export const BusinessesView: React.FC<BusinessesViewProps> = ({
  onBack,
  onOpenChat,
  onNavigateToChat,
  onOpenAuth,
}) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();
  const handleChat = onOpenChat || onNavigateToChat;

  const [activeTab, setActiveTab] = useState<'explore' | 'following' | 'my_business'>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCampus, setSelectedCampus] = useState('all');

  // Modals
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessProfile | null>(null);
  const [createBusinessOpen, setCreateBusinessOpen] = useState(false);

  // Data
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [followedIds, setFollowedIds] = useState<string[]>([]);

  const loadData = () => {
    setCampuses(StorageService.getCampuses());
    setBusinesses(
      StorageService.getBusinesses({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        campusId: selectedCampus === 'all' ? undefined : selectedCampus,
        search: searchQuery,
      })
    );
    if (currentUser) {
      setFollowedIds(StorageService.getUserFollowedBusinessIds(currentUser.id));
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('campusplug_storage_update', handleUpdate);
    return () => window.removeEventListener('campusplug_storage_update', handleUpdate);
  }, [selectedCategory, selectedCampus, searchQuery, currentUser?.id]);

  const handleToggleFollow = (biz: BusinessProfile) => {
    if (!currentUser) {
      toastError('Please log in to follow businesses.');
      return;
    }
    const res = StorageService.toggleFollowBusiness(biz.id, currentUser.id);
    if (res.isFollowing) {
      success(`Following ${biz.businessName}!`);
    } else {
      success(`Unfollowed ${biz.businessName}`);
    }
    loadData();
  };

  const followedBusinesses = businesses.filter((b) => followedIds.includes(b.id));
  const myBusinesses = businesses.filter((b) => b.ownerId === currentUser?.id);

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
          <span className="text-xs text-slate-400">/ Stores & Merchants</span>
        </div>
      )}

      {/* Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-indigo-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-sm border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Campus Merchant Directory & Storefronts</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Campus Businesses & Shops
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Explore trusted restaurants, cyber cafes, laundromats, gadget technicians, and student boutiques situated right around your campus.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="create-business-btn"
              onClick={() => {
                if (!currentUser) {
                  if (onOpenAuth) onOpenAuth();
                  return;
                }
                setCreateBusinessOpen(true);
              }}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Register Business
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
            <Layers className="w-3.5 h-3.5" /> All Stores ({businesses.length})
          </button>

          {currentUser && (
            <>
              <button
                onClick={() => setActiveTab('following')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'following'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Star className="w-3.5 h-3.5" /> Following ({followedBusinesses.length})
              </button>

              <button
                onClick={() => setActiveTab('my_business')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'my_business'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> My Storefronts ({myBusinesses.length})
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
                placeholder="Search campus stores by name, food, laundry, repairs, printing..."
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
                <option value="food">Food & Eatery</option>
                <option value="salon">Salon & Barber</option>
                <option value="laundry">Laundry & Cleaners</option>
                <option value="print">Printing & Cyber</option>
                <option value="gadgets">Gadgets & Tech</option>
                <option value="fashion">Fashion & Boutique</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="groceries">Groceries & Mart</option>
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
            </div>
          </div>

          {/* Grid */}
          {businesses.length === 0 ? (
            <EmptyState
              title="No business pages found"
              description="Be the first to list your campus brand, store, or service."
              actionLabel="List Your Business"
              onAction={() => setCreateBusinessOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((biz) => (
                <BusinessCard
                  key={biz.id}
                  business={biz}
                  isFollowing={followedIds.includes(biz.id)}
                  onSelect={(b) => setSelectedBusiness(b)}
                  onToggleFollow={(b) => handleToggleFollow(b)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* FOLLOWING TAB */}
      {activeTab === 'following' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900">
            Stores You Follow ({followedBusinesses.length})
          </h2>

          {followedBusinesses.length === 0 ? (
            <EmptyState
              title="You haven't followed any campus businesses yet"
              description="Follow your favorite food spots, printing presses, and barbers to keep tabs on them."
              actionLabel="Explore Stores"
              onAction={() => setActiveTab('explore')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {followedBusinesses.map((biz) => (
                <BusinessCard
                  key={biz.id}
                  business={biz}
                  isFollowing={true}
                  onSelect={(b) => setSelectedBusiness(b)}
                  onToggleFollow={(b) => handleToggleFollow(b)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* MY BUSINESS TAB */}
      {activeTab === 'my_business' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">
              Your Registered Storefronts ({myBusinesses.length})
            </h2>
            <button
              onClick={() => setCreateBusinessOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Another Store
            </button>
          </div>

          {myBusinesses.length === 0 ? (
            <EmptyState
              title="You haven't registered a business yet"
              description="Create a branded storefront on CampusCore to accept orders and promote to students."
              actionLabel="Register Store Now"
              onAction={() => setCreateBusinessOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myBusinesses.map((biz) => (
                <BusinessCard
                  key={biz.id}
                  business={biz}
                  isFollowing={false}
                  onSelect={(b) => setSelectedBusiness(b)}
                  onToggleFollow={(b) => handleToggleFollow(b)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {selectedBusiness && (
        <BusinessDetailModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
          onNavigateToChat={onNavigateToChat}
        />
      )}

      <CreateBusinessModal
        isOpen={createBusinessOpen}
        onClose={() => setCreateBusinessOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
