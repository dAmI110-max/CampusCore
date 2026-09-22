import React, { useState } from 'react';
import { FilterOptions, Category, Campus, ProductCondition } from '../../types';
import { Search, SlidersHorizontal, X, RefreshCw, ChevronDown, Layers } from 'lucide-react';
import { getCategoryLucideIcon } from '../../utils/categoryIcons';

interface ProductFiltersProps {
  filters: FilterOptions;
  categories: Category[];
  campuses: Campus[];
  onFilterChange: (newFilters: FilterOptions) => void;
  onReset: () => void;
  totalResults: number;
}

const CONDITIONS: (ProductCondition | 'All')[] = ['All', 'New', 'Like New', 'Used', 'Fair', 'Refurbished'];

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  categories,
  campuses,
  onFilterChange,
  onReset,
  totalResults,
}) => {
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  const handleCategorySelect = (categoryId: string) => {
    onFilterChange({ ...filters, category: categoryId });
  };

  const handleCampusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, campusId: e.target.value });
  };

  const handleConditionSelect = (cond: ProductCondition | 'All') => {
    onFilterChange({ ...filters, condition: cond });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, sortBy: e.target.value as FilterOptions['sortBy'] });
  };

  const activeFilterCount =
    (filters.searchQuery ? 1 : 0) +
    (filters.category && filters.category !== 'all' ? 1 : 0) +
    (filters.campusId && filters.campusId !== 'all' ? 1 : 0) +
    (filters.condition && filters.condition !== 'All' ? 1 : 0) +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0);

  return (
    <div className="space-y-4 mb-6">
      {/* Top Search & Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={filters.searchQuery || ''}
            onChange={handleSearchChange}
            placeholder="Search phones, laptops, textbooks, footwear in UNIOSUN..."
            className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Campus & Sort Dropdowns + Mobile Filter Button */}
        <div className="flex items-center gap-2">
          {/* Campus Selector */}
          <div className="relative min-w-[150px] sm:min-w-[180px]">
            <select
              value={filters.campusId || 'all'}
              onChange={handleCampusChange}
              className="w-full appearance-none pl-3 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500 shadow-2xs cursor-pointer"
            >
              <option value="all">All UNIOSUN Campuses</option>
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>

          {/* Sort Selector */}
          <div className="relative min-w-[130px] hidden sm:block">
            <select
              value={filters.sortBy || 'newest'}
              onChange={handleSortChange}
              className="w-full appearance-none pl-3 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500 shadow-2xs cursor-pointer"
            >
              <option value="newest">Newest Listed</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="views_desc">Most Popular</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>

          {/* Mobile Filter Trigger */}
          <button
            onClick={() => setShowMobileDrawer(true)}
            className="sm:hidden flex items-center gap-1.5 px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
        <button
          onClick={() => handleCategorySelect('all')}
          className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            !filters.category || filters.category === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Items ({totalResults})</span>
        </button>

        {categories.map((cat) => {
          const isSelected = filters.category === cat.id;
          const Icon = getCategoryLucideIcon(cat);
          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
              {cat.itemCount !== undefined && cat.itemCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {cat.itemCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Desktop Condition Filter & Results Count */}
      <div className="hidden sm:flex items-center justify-between pt-1 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1">Condition:</span>
          {CONDITIONS.map((cond) => {
            const isSelected = (!filters.condition && cond === 'All') || filters.condition === cond;
            return (
              <button
                key={cond}
                onClick={() => handleConditionSelect(cond)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cond}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {activeFilterCount > 0 && (
            <button
              onClick={onReset}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Reset Filters ({activeFilterCount})
            </button>
          )}
          <span className="text-slate-400 dark:text-slate-500 font-medium">{totalResults} products found</span>
        </div>
      </div>

      {/* Mobile Drawer */}
      {showMobileDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs sm:hidden">
          <div className="bg-white dark:bg-slate-900 w-4/5 max-w-sm h-full p-5 overflow-y-auto flex flex-col justify-between shadow-2xl border-l border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Filter Products</h3>
                </div>
                <button
                  onClick={() => setShowMobileDrawer(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sort In Mobile */}
              <div className="py-4 border-b border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Sort Order
                </label>
                <select
                  value={filters.sortBy || 'newest'}
                  onChange={handleSortChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200"
                >
                  <option value="newest">Newest Listed</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="views_desc">Most Viewed</option>
                </select>
              </div>

              {/* Condition */}
              <div className="py-4 border-b border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Item Condition
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CONDITIONS.map((cond) => (
                    <button
                      key={cond}
                      onClick={() => handleConditionSelect(cond)}
                      className={`p-2 rounded-xl text-xs font-medium border text-center transition-colors ${
                        (!filters.condition && cond === 'All') || filters.condition === cond
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="py-4 border-b border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Price Range (₦)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min ₦"
                    value={filters.minPrice || ''}
                    onChange={(e) =>
                      onFilterChange({
                        ...filters,
                        minPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="number"
                    placeholder="Max ₦"
                    value={filters.maxPrice || ''}
                    onChange={(e) =>
                      onFilterChange({
                        ...filters,
                        maxPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  onReset();
                  setShowMobileDrawer(false);
                }}
                className="w-full py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => setShowMobileDrawer(false)}
                className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Apply Filters ({totalResults})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
