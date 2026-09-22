import React from 'react';
import { Category } from '../../types';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { getCategoryLucideIcon, getCategoryBadgeColor } from '../../utils/categoryIcons';

interface CategorySliderProps {
  categories: Category[];
  onSelectCategory: (categoryId: string) => void;
}

export const CategorySlider: React.FC<CategorySliderProps> = ({
  categories,
  onSelectCategory,
}) => {
  return (
    <section className="py-8 bg-transparent transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Explore by Category</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Discover items listed specifically by students around your campus</p>
          </div>
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs font-bold text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 flex items-center gap-1 cursor-pointer bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-purple-200/60 dark:border-purple-800/60 shadow-2xs"
          >
            All Categories <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Categories Bento Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = getCategoryLucideIcon(cat);
            const badgeColor = getCategoryBadgeColor(cat.slug || cat.name);
            return (
              <motion.button
                key={cat.id}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectCategory(cat.id)}
                className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md rounded-[24px] p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs hover:shadow-md hover:border-purple-400 dark:hover:border-purple-500 transition-all flex flex-col items-center text-center group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-2xl ${badgeColor.bg} ${badgeColor.text} border ${badgeColor.border} group-hover:scale-105 flex items-center justify-center transition-all mb-2.5 shadow-2xs`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  {cat.itemCount || 0} items
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
