import React from 'react';
import { Product, Accommodation, Category, AppViewMode } from '../../types';
import { BentoHeroGrid } from './BentoHeroGrid';
import { CategorySlider } from './CategorySlider';
import { ProductCard } from '../marketplace/ProductCard';
import { AccommodationCard } from '../accommodation/AccommodationCard';
import { HowItWorks } from './HowItWorks';
import { SafetyBanner } from '../common/SafetyBanner';
import { CampusAnnouncementsWidget } from '../announcements/CampusAnnouncementsWidget';
import {
  Sparkles,
  ArrowRight,
  Home,
  ShoppingBag,
  Flame,
  Wrench,
  Briefcase,
  Calendar,
  Users,
  Building2,
  Megaphone,
} from 'lucide-react';

interface HomePageProps {
  categories: Category[];
  featuredProducts: Product[];
  latestProducts: Product[];
  featuredAccommodations: Accommodation[];
  onSearch: (query: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onProductClick: (product: Product) => void;
  onAccommodationClick: (accommodation: Accommodation) => void;
  onFavoriteToggle: (productId: string) => void;
  onExploreMarketplace: () => void;
  onExploreAccommodation: () => void;
  onOpenCreateProduct: () => void;
  onNavigateToView?: (view: AppViewMode) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  categories,
  featuredProducts,
  latestProducts,
  featuredAccommodations,
  onSearch,
  onSelectCategory,
  onProductClick,
  onAccommodationClick,
  onFavoriteToggle,
  onExploreMarketplace,
  onExploreAccommodation,
  onOpenCreateProduct,
  onNavigateToView,
}) => {
  return (
    <div className="space-y-0 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors">
      {/* 0. Official UNIOSUN Announcements Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <CampusAnnouncementsWidget />
      </div>

      {/* 1. Bento Grid Hero Section */}
      <BentoHeroGrid
        categories={categories}
        featuredProducts={featuredProducts}
        featuredAccommodations={featuredAccommodations}
        onSearch={onSearch}
        onSelectCategory={onSelectCategory}
        onProductClick={onProductClick}
        onAccommodationClick={onAccommodationClick}
        onOpenCreateProduct={onOpenCreateProduct}
        onExploreMarketplace={onExploreMarketplace}
        onExploreAccommodation={onExploreAccommodation}
      />

      {/* 1.5 Campus Life Hub Quick Grid */}
      {onNavigateToView && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div
              onClick={() => onNavigateToView('services')}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="mt-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Student Services</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">Graphics, tutoring, hair & tech</p>
              </div>
            </div>

            <div
              onClick={() => onNavigateToView('jobs')}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="mt-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">Campus Jobs</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">Gigs, part-time & internships</p>
              </div>
            </div>

            <div
              onClick={() => onNavigateToView('events')}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-pink-500 dark:hover:border-pink-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-2xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="mt-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">Events & Tickets</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">Dinners, tech fests & sports</p>
              </div>
            </div>

            <div
              onClick={() => onNavigateToView('communities')}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div className="mt-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Communities</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">Departmental clubs & groups</p>
              </div>
            </div>

            <div
              onClick={() => onNavigateToView('businesses')}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between col-span-2 sm:col-span-1"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="mt-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Campus Stores</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">Verified local student vendors</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Bento Category Explorer */}
      <CategorySlider
        categories={categories}
        onSelectCategory={onSelectCategory}
      />

      {/* 3. Safety Notice Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <SafetyBanner />
      </div>

      {/* 4. Featured Listings Bento Section */}
      {featuredProducts.length > 0 && (
        <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Top Picks
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Trending Student Deals at UNIOSUN
              </h2>
            </div>
            <button
              onClick={onExploreMarketplace}
              className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center gap-1 group cursor-pointer"
            >
              See All <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={onProductClick}
                onFavoriteToggle={onFavoriteToggle}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. Latest Marketplace Listings */}
      <section className="py-10 bg-white dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                <ShoppingBag className="w-3.5 h-3.5" /> Just Listed
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Fresh Campus Listings
              </h2>
            </div>
            <button
              onClick={onExploreMarketplace}
              className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center gap-1 group cursor-pointer"
            >
              Explore All <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {latestProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {latestProducts.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={onProductClick}
                  onFavoriteToggle={onFavoriteToggle}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center mb-3">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No products available yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                New products will appear here as students start selling on CampusCore.
              </p>
              <button
                onClick={onOpenCreateProduct}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-colors shadow-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Be the first seller to list yours.
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 6. Accommodation & Hostels Preview */}
      {featuredAccommodations.length > 0 && (
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                <Home className="w-3.5 h-3.5" /> Off-Campus Accommodation
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Hostels & Student Lodges near Campus
              </h2>
            </div>
            <button
              onClick={onExploreAccommodation}
              className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center gap-1 group cursor-pointer"
            >
              View All Lodges <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredAccommodations.slice(0, 3).map((acc) => (
              <AccommodationCard
                key={acc.id}
                accommodation={acc}
                onClick={onAccommodationClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. How CampusCore Works */}
      <HowItWorks
        onOpenCreateProduct={onOpenCreateProduct}
        onExploreMarketplace={onExploreMarketplace}
      />
    </div>
  );
};

