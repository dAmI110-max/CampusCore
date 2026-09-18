import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModalProvider, useModal } from './context/ModalContext';
import { StorageService } from './services/storageService';
import { SupabaseService } from './services/supabaseService';
import { isSupabaseConfigured } from './lib/supabase';
import {
  Product,
  Accommodation,
  FilterOptions,
  AccommodationFilterOptions,
  Category,
  Campus,
  Order,
} from './types';

// Common Components
import { ToastContainer } from './components/common/ToastContainer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Navbar, AppViewMode } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/common/Footer';
import { ReportModal } from './components/common/ReportModal';
import { SafetyGuidelinesModal } from './components/common/SafetyGuidelinesModal';

// Phase 3 & 4 Views & Modals
import { ExploreView } from './components/explore/ExploreView';
import { StudyView } from './components/study/StudyView';
import { ServicesView } from './components/services/ServicesView';
import { JobsView } from './components/jobs/JobsView';
import { EventsView } from './components/events/EventsView';
import { CommunitiesView } from './components/communities/CommunitiesView';
import { BusinessesView } from './components/businesses/BusinessesView';
import { AdsManagerView } from './components/ads/AdsManagerView';
import { UnifiedSearchModal } from './components/search/UnifiedSearchModal';
import { SubscriptionPlansModal } from './components/subscriptions/SubscriptionPlansModal';
import { SupportTicketsModal } from './components/support/SupportTicketsModal';
import { SellerOnboardingModal } from './components/seller/SellerOnboardingModal';

// Modals
import { AuthModal } from './components/auth/AuthModal';
import { ProductDetailModal } from './components/marketplace/ProductDetailModal';
import { CreateProductModal } from './components/marketplace/CreateProductModal';
import { EditProductModal } from './components/marketplace/EditProductModal';
import { AccommodationDetailModal } from './components/accommodation/AccommodationDetailModal';
import { CreateAccommodationModal } from './components/accommodation/CreateAccommodationModal';
import { AboutModal } from './components/about/AboutModal';
import { VerificationModal } from './components/verification/VerificationModal';
import { ReviewModal } from './components/reviews/ReviewModal';

// Views
import { HomePage } from './components/home/HomePage';
import { ProductFilters } from './components/marketplace/ProductFilters';
import { ProductGrid } from './components/marketplace/ProductGrid';
import { AccommodationFilters } from './components/accommodation/AccommodationFilters';
import { AccommodationCard } from './components/accommodation/AccommodationCard';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { WalletView } from './components/wallet/WalletView';
import { OrdersView } from './components/orders/OrdersView';
import { MessagesView } from './components/messages/MessagesView';
import { RoommateFinderView } from './components/roommates/RoommateFinderView';
import { EmptyState } from './components/common/EmptyState';

import {
  ShoppingBag,
  Home,
  Plus,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MainApp: React.FC = () => {
  const { currentUser, isSeller, isAdmin } = useAuth();
  const { activeModal, openModal, closeModal, isModalOpen } = useModal();
  const { success } = useToast();

  // Navigation State
  const [currentView, setCurrentView] = useState<AppViewMode>('home');
  const [, setRefreshKey] = useState(0);

  // Active chat targeting
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);

  // Filter States for Marketplace
  const [productFilters, setProductFilters] = useState<FilterOptions>({
    searchQuery: '',
    category: 'all',
    campusId: 'all',
    condition: 'All',
    sortBy: 'newest',
  });

  // Filter States for Accommodation
  const [accommodationFilters, setAccommodationFilters] = useState<AccommodationFilterOptions>({
    searchQuery: '',
    campusId: 'all',
    sortBy: 'newest',
  });

  // Re-fetch reactive state from StorageService & Supabase
  useEffect(() => {
    let updateTimer: number | undefined;
    const handleStorageUpdate = () => {
      if (updateTimer) window.clearTimeout(updateTimer);
      updateTimer = window.setTimeout(() => {
        setRefreshKey((prev) => prev + 1);
      }, 100);
    };
    window.addEventListener('campusplug_storage_update', handleStorageUpdate);

    // Sync live listings from Supabase on mount
    async function syncSupabaseData() {
      if (isSupabaseConfigured()) {
        try {
          const listings = await SupabaseService.fetchListings();
          if (listings) {
            StorageService.syncProductsFromSupabase(listings);
          }
        } catch {
          // ignore
        }
      }
    }
    syncSupabaseData();

    const unsubListings = SupabaseService.subscribeToListings(() => {
      syncSupabaseData();
    });

    return () => {
      if (updateTimer) window.clearTimeout(updateTimer);
      window.removeEventListener('campusplug_storage_update', handleStorageUpdate);
      unsubListings();
    };
  }, []);

  const categories: Category[] = StorageService.getCategories();
  const campuses: Campus[] = StorageService.getCampuses('uni-uniosun');

  // Filtered Products for Marketplace
  const allFilteredProducts = StorageService.getFilteredProducts(productFilters);

  // Filtered Accommodations
  const allFilteredAccommodations = StorageService.getFilteredAccommodations(accommodationFilters);

  // Homepage specific products
  const featuredProducts = StorageService.getFeaturedProducts();
  const latestProducts = StorageService.getProducts().filter((p) => p.status === 'active');
  const featuredAccommodations = StorageService.getAccommodations().filter((a) => a.featured || a.available);

  // Handlers
  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    openModal('auth', { initialMode: mode });
  };

  const handleOpenCreateProduct = () => {
    if (!currentUser) {
      openModal('auth', { initialMode: 'signup' });
      return;
    }
    if (isSeller) {
      openModal('create_product');
    } else {
      openModal('seller_onboarding');
    }
  };

  const handleOpenCreateAccommodation = () => {
    if (!currentUser) {
      openModal('auth', { initialMode: 'signup' });
      return;
    }
    openModal('create_accommodation');
  };

  const handleHomeCategorySelect = (categoryId: string) => {
    setProductFilters((prev) => ({
      ...prev,
      category: categoryId,
      searchQuery: '',
    }));
    setCurrentView('marketplace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHomeSearch = (query: string) => {
    setProductFilters((prev) => ({
      ...prev,
      searchQuery: query,
      category: 'all',
    }));
    setCurrentView('marketplace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetProductFilters = () => {
    setProductFilters({
      searchQuery: '',
      category: 'all',
      campusId: 'all',
      condition: 'All',
      sortBy: 'newest',
    });
  };

  const handleResetAccommodationFilters = () => {
    setAccommodationFilters({
      searchQuery: '',
      campusId: 'all',
      sortBy: 'newest',
    });
  };

  const handleStartChatWithSeller = (sellerId: string, productId?: string) => {
    if (!currentUser) {
      openModal('auth', { initialMode: 'login' });
      return;
    }

    const conv = StorageService.getOrCreateConversation(
      currentUser.id,
      sellerId,
      productId ? 'product' : 'general',
      productId
    );
    setActiveConversationId(conv.id);
    setCurrentView('messages');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white font-sans antialiased transition-colors">
      {/* 1. Global Desktop Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={(v) => {
          setCurrentView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={handleOpenAuth}
        onOpenCreateProduct={handleOpenCreateProduct}
        onOpenAbout={() => openModal('about')}
        onOpenVerificationModal={() => openModal('verification')}
        onOpenUnifiedSearch={() => openModal('search')}
        onOpenSubscriptions={() => openModal('subscriptions')}
        onOpenSupport={() => openModal('support')}
        onOpenSellerOnboarding={() => openModal('seller_onboarding')}
      />

      {/* 2. Main Content Router with Mobile-First padding for persistent BottomNav */}
      <main className="flex-1 pb-20 md:pb-0">
        <ErrorBoundary
          fallbackTitle="Navigation / View Error"
          fallbackDescription="CampusCore encountered a rendering issue while loading this view. You can safely retry or return home."
          onReset={() => setCurrentView('home')}
        >
          <AnimatePresence mode="wait">
          {/* HOME VIEW */}
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <HomePage
                categories={categories}
                featuredProducts={featuredProducts}
                latestProducts={latestProducts}
                featuredAccommodations={featuredAccommodations}
                onSearch={handleHomeSearch}
                onSelectCategory={handleHomeCategorySelect}
                onProductClick={(p) => openModal('product_detail', { product: p })}
                onAccommodationClick={(a) => openModal('accommodation_detail', { accommodation: a })}
                onFavoriteToggle={() => setRefreshKey((k) => k + 1)}
                onExploreMarketplace={() => {
                  handleResetProductFilters();
                  setCurrentView('marketplace');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onExploreAccommodation={() => {
                  handleResetAccommodationFilters();
                  setCurrentView('accommodation');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenCreateProduct={handleOpenCreateProduct}
                onNavigateToView={(view) => {
                  setCurrentView(view);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </motion.div>
          )}

          {/* EXPLORE HUB VIEW */}
          {currentView === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ExploreView
                onNavigate={(v) => {
                  setCurrentView(v);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onBack={() => setCurrentView('home')}
                onOpenSearch={() => openModal('search')}
              />
            </motion.div>
          )}

          {/* STUDY & STUDYGEN AI SUITE VIEW */}
          {currentView === 'study' && (
            <motion.div
              key="study"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <StudyView
                onBack={() => setCurrentView('home')}
                onOpenAuth={(mode) => handleOpenAuth(mode)}
              />
            </motion.div>
          )}

          {/* SERVICES & FREELANCERS VIEW */}
          {currentView === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ServicesView
                onOpenChat={(providerId) => handleStartChatWithSeller(providerId)}
                onOpenAuth={() => handleOpenAuth('signup')}
              />
            </motion.div>
          )}

          {/* JOBS & GIGS VIEW */}
          {currentView === 'jobs' && (
            <motion.div
              key="jobs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <JobsView
                onOpenChat={(posterId) => handleStartChatWithSeller(posterId)}
                onOpenAuth={() => handleOpenAuth('signup')}
              />
            </motion.div>
          )}

          {/* EVENTS & TICKETING VIEW */}
          {currentView === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <EventsView
                onOpenAuth={() => handleOpenAuth('signup')}
                onOpenWallet={() => setCurrentView('wallet')}
              />
            </motion.div>
          )}

          {/* STUDENT COMMUNITIES VIEW */}
          {currentView === 'communities' && (
            <motion.div
              key="communities"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CommunitiesView onOpenAuth={() => handleOpenAuth('signup')} />
            </motion.div>
          )}

          {/* LOCAL BUSINESSES VIEW */}
          {currentView === 'businesses' && (
            <motion.div
              key="businesses"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <BusinessesView
                onOpenAuth={() => handleOpenAuth('signup')}
                onOpenChat={(ownerId) => handleStartChatWithSeller(ownerId)}
              />
            </motion.div>
          )}

          {/* AD MANAGER VIEW */}
          {currentView === 'ads' && (
            <motion.div
              key="ads"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AdsManagerView />
            </motion.div>
          )}

          {/* MARKETPLACE VIEW */}
          {currentView === 'marketplace' && (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentView('home')}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      UNIOSUN Student Marketplace
                    </h1>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Direct student-to-student commerce with Escrow protection across all 6 Osun State University campuses.
                  </p>
                </div>

                <button
                  onClick={handleOpenCreateProduct}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Sell An Item
                </button>
              </div>

              {/* Filters */}
              <ProductFilters
                filters={productFilters}
                categories={categories}
                campuses={campuses}
                onFilterChange={(f) => setProductFilters(f)}
                onReset={handleResetProductFilters}
                totalResults={allFilteredProducts.length}
              />

              {/* Products Grid */}
              <ProductGrid
                products={allFilteredProducts}
                onProductClick={(p) => openModal('product_detail', { product: p })}
                onFavoriteToggle={() => setRefreshKey((k) => k + 1)}
                onResetFilters={handleResetProductFilters}
                onStartSelling={handleOpenCreateProduct}
              />
            </motion.div>
          )}

          {/* ACCOMMODATION VIEW */}
          {currentView === 'accommodation' && (
            <motion.div
              key="accommodation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentView('home')}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      Student Hostels & Lodges
                    </h1>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Discover off-campus rooms, self-contains, and flats near UNIOSUN gates.
                  </p>
                </div>

                <button
                  onClick={handleOpenCreateAccommodation}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  List Hostel / Room
                </button>
              </div>

              {/* Accommodation Filters */}
              <AccommodationFilters
                filters={accommodationFilters}
                campuses={campuses}
                onFilterChange={(f) => setAccommodationFilters(f)}
                onReset={handleResetAccommodationFilters}
                totalResults={allFilteredAccommodations.length}
              />

              {/* Accommodations Grid */}
              {allFilteredAccommodations.length === 0 ? (
                <EmptyState
                  type="accommodation"
                  title="No lodges found matching your search"
                  description="Try selecting a different campus or clearing your search filters."
                  actionText="Reset Filters"
                  onAction={handleResetAccommodationFilters}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {allFilteredAccommodations.map((acc) => (
                    <AccommodationCard
                      key={acc.id}
                      accommodation={acc}
                      onClick={(a) => openModal('accommodation_detail', { accommodation: a })}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ROOMMATE FINDER VIEW */}
          {currentView === 'roommates' && (
            <motion.div
              key="roommates"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <RoommateFinderView
                onOpenChatWithUser={(targetUserId) => handleStartChatWithSeller(targetUserId)}
                onOpenAuth={() => handleOpenAuth('signup')}
              />
            </motion.div>
          )}

          {/* ORDERS & ESCROW VIEW */}
          {currentView === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <OrdersView
                onOpenChat={(otherUserId, orderId) => {
                  const conv = StorageService.getOrCreateConversation(currentUser?.id || '', otherUserId, undefined, orderId);
                  setActiveConversationId(conv.id);
                  setCurrentView('messages');
                }}
                onOpenReview={(order) => openModal('review', { order })}
                onExploreMarketplace={() => setCurrentView('marketplace')}
              />
            </motion.div>
          )}

          {/* WALLET VIEW */}
          {currentView === 'wallet' && (
            <motion.div
              key="wallet"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <WalletView
                onNavigateToOrders={() => setCurrentView('orders')}
              />
            </motion.div>
          )}

          {/* MESSAGES VIEW */}
          {currentView === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessagesView
                initialConversationId={activeConversationId}
                onNavigateToOrder={(orderId) => setCurrentView('orders')}
                onNavigateToProduct={(productId) => {
                  const p = StorageService.getProductById(productId);
                  if (p) openModal('product_detail', { product: p });
                }}
              />
            </motion.div>
          )}

          {/* USER DASHBOARD VIEW */}
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <UserDashboard
                onOpenCreateProduct={handleOpenCreateProduct}
                onOpenCreateAccommodation={handleOpenCreateAccommodation}
                onProductClick={(p) => openModal('product_detail', { product: p })}
                onFavoriteToggle={() => setRefreshKey((k) => k + 1)}
                onNavigateToOrders={() => setCurrentView('orders')}
                onExploreMarketplace={() => {
                  handleResetProductFilters();
                  setCurrentView('marketplace');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </motion.div>
          )}

          {/* ADMIN CONSOLE VIEW (PROTECTED) */}
          {currentView === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isAdmin ? (
                <AdminDashboard
                  onProductClick={(p) => openModal('product_detail', { product: p })}
                  onAccommodationClick={(a) => openModal('accommodation_detail', { accommodation: a })}
                />
              ) : (
                <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Restricted Admin Portal</h2>
                  <p className="text-xs text-slate-500">
                    You do not have the required administrative credentials to access the Ace Tech trust & safety control desk.
                  </p>
                  <button
                    onClick={() => setCurrentView('home')}
                    className="px-6 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors"
                  >
                    Return to Homepage
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </ErrorBoundary>
      </main>

      {/* 3. Global Footer */}
      <Footer
        onNavigate={(v) => {
          setCurrentView(v as AppViewMode);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAbout={() => openModal('about')}
      />

      {/* 4. Mobile Bottom Navigation (Visible on screen < 768px) */}
      <BottomNav
        currentView={currentView}
        onNavigate={(v) => setCurrentView(v)}
        onOpenCreateProduct={handleOpenCreateProduct}
        onOpenAuth={handleOpenAuth}
      />

      {/* 5. Centralized Modal Overlay (Only ONE active modal at any time to eliminate overlap bugs) */}
      {isModalOpen('auth') && (
        <AuthModal
          isOpen={true}
          onClose={closeModal}
          initialMode={activeModal?.props?.initialMode || 'login'}
        />
      )}

      {isModalOpen('product_detail') && activeModal?.props?.product && (
        <ProductDetailModal
          product={activeModal.props.product}
          isOpen={true}
          onClose={closeModal}
          onOpenReport={(p) =>
            openModal('report', {
              targetId: p.id,
              targetType: 'product',
              targetName: p.title,
            })
          }
          onFavoriteToggle={() => setRefreshKey((k) => k + 1)}
          onOpenChatWithSeller={(sellerId, productId) => {
            closeModal();
            handleStartChatWithSeller(sellerId, productId);
          }}
          onOrderCreated={(order) => {
            closeModal();
            setCurrentView('orders');
          }}
        />
      )}

      {isModalOpen('accommodation_detail') && activeModal?.props?.accommodation && (
        <AccommodationDetailModal
          accommodation={activeModal.props.accommodation}
          isOpen={true}
          onClose={closeModal}
          onOpenReport={(a) =>
            openModal('report', {
              targetId: a.id,
              targetType: 'accommodation',
              targetName: a.title,
            })
          }
        />
      )}

      {isModalOpen('create_product') && (
        <CreateProductModal
          isOpen={true}
          onClose={closeModal}
          onSuccess={() => {
            closeModal();
            setRefreshKey((k) => k + 1);
            setCurrentView('marketplace');
          }}
        />
      )}

      {isModalOpen('create_accommodation') && (
        <CreateAccommodationModal
          isOpen={true}
          onClose={closeModal}
          onSuccess={() => {
            closeModal();
            setRefreshKey((k) => k + 1);
            setCurrentView('accommodation');
          }}
        />
      )}

      {isModalOpen('edit_product') && activeModal?.props?.product && (
        <EditProductModal
          product={activeModal.props.product}
          isOpen={true}
          onClose={closeModal}
          onSuccess={() => {
            closeModal();
            setRefreshKey((k) => k + 1);
          }}
        />
      )}

      {isModalOpen('seller_onboarding') && (
        <SellerOnboardingModal
          isOpen={true}
          onClose={closeModal}
          onSuccess={() => {
            openModal('create_product');
            setRefreshKey((k) => k + 1);
          }}
        />
      )}

      {isModalOpen('report') && activeModal?.props && (
        <ReportModal
          isOpen={true}
          targetId={activeModal.props.targetId || ''}
          targetType={activeModal.props.targetType || 'product'}
          targetName={activeModal.props.targetName || ''}
          onClose={closeModal}
        />
      )}

      {isModalOpen('about') && (
        <AboutModal
          isOpen={true}
          onClose={closeModal}
        />
      )}

      {isModalOpen('verification') && (
        <VerificationModal
          onClose={closeModal}
          onSuccess={() => {
            closeModal();
            setRefreshKey((k) => k + 1);
          }}
        />
      )}

      {isModalOpen('review') && activeModal?.props?.order && (
        <ReviewModal
          order={activeModal.props.order}
          onClose={closeModal}
          onSuccess={() => {
            closeModal();
            setRefreshKey((k) => k + 1);
          }}
        />
      )}

      {isModalOpen('search') && (
        <UnifiedSearchModal
          onClose={closeModal}
          onNavigate={(view) => {
            closeModal();
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectProduct={(p) => openModal('product_detail', { product: p })}
          onSelectAccommodation={(a) => openModal('accommodation_detail', { accommodation: a })}
        />
      )}

      {isModalOpen('subscriptions') && (
        <SubscriptionPlansModal
          onClose={closeModal}
          onSuccess={() => {
            closeModal();
            setRefreshKey((k) => k + 1);
          }}
          onOpenWallet={() => {
            closeModal();
            setCurrentView('wallet');
          }}
        />
      )}

      {isModalOpen('support') && (
        <SupportTicketsModal
          onClose={closeModal}
        />
      )}

      {isModalOpen('safety_guidelines') && (
        <SafetyGuidelinesModal
          isOpen={true}
          onClose={closeModal}
        />
      )}

      {/* 6. Global Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="CampusCore is loading..." fallbackDescription="If you are on an iPhone or Safari browser, tap Reload Page below to refresh your session.">
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <ModalProvider>
              <MainApp />
            </ModalProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
