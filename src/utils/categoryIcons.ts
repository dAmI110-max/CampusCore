import {
  Smartphone,
  Laptop,
  Shirt,
  Footprints,
  Sparkles,
  BookOpen,
  Utensils,
  Watch,
  Armchair,
  GraduationCap,
  Gamepad2,
  Briefcase,
  Layers,
  Wrench,
  Palette,
  Camera,
  Scissors,
  Code,
  Home,
  Tv,
  Package,
  Grid,
  LucideIcon,
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  Smartphone,
  Laptop,
  Shirt,
  Footprints,
  Sparkles,
  BookOpen,
  Utensils,
  Watch,
  Armchair,
  PenTool: GraduationCap,
  GraduationCap,
  Gamepad2,
  Briefcase,
  Grid,
  Package,
  Wrench,
  Palette,
  Camera,
  Scissors,
  Code,
  Home,
  Tv,
  Layers,
};

/**
 * Resolves a unique, contextual Lucide icon for any category item, slug, or name.
 * Fixes the issue where all categories would fallback to the same generic icon.
 */
export function getCategoryLucideIcon(
  catOrSlug?: string | { icon?: string; slug?: string; name?: string }
): LucideIcon {
  if (!catOrSlug) return Layers;

  if (typeof catOrSlug === 'object') {
    // 1. If explicit icon name exists in our icon map
    if (catOrSlug.icon && ICON_MAP[catOrSlug.icon]) {
      return ICON_MAP[catOrSlug.icon];
    }
    const combined = `${catOrSlug.slug || ''} ${catOrSlug.name || ''} ${catOrSlug.icon || ''}`.toLowerCase();
    return getIconFromText(combined);
  }

  // If string matches an icon key
  if (ICON_MAP[catOrSlug]) {
    return ICON_MAP[catOrSlug];
  }
  return getIconFromText(catOrSlug.toLowerCase());
}

function getIconFromText(text: string): LucideIcon {
  if (text.includes('phone') || text.includes('gadget') || text.includes('electronic')) return Smartphone;
  if (text.includes('laptop') || text.includes('comput') || text.includes('pc')) return Laptop;
  if (text.includes('fashion') || text.includes('wear') || text.includes('cloth') || text.includes('shirt')) return Shirt;
  if (text.includes('shoe') || text.includes('footwear') || text.includes('sneaker') || text.includes('slide')) return Footprints;
  if (text.includes('beauty') || text.includes('care') || text.includes('cosmetic') || text.includes('skincare')) return Sparkles;
  if (text.includes('book') || text.includes('textbook') || text.includes('novel') || text.includes('academic')) return BookOpen;
  if (text.includes('food') || text.includes('snack') || text.includes('pastr') || text.includes('meal') || text.includes('grocer')) return Utensils;
  if (text.includes('accessor') || text.includes('watch') || text.includes('jewel') || text.includes('cap') || text.includes('belt')) return Watch;
  if (text.includes('furnitur') || text.includes('decor') || text.includes('chair') || text.includes('desk') || text.includes('mattress') || text.includes('bed')) return Armchair;
  if (text.includes('suppl') || text.includes('school') || text.includes('stationer') || text.includes('calc')) return GraduationCap;
  if (text.includes('game') || text.includes('gaming') || text.includes('ps4') || text.includes('ps5')) return Gamepad2;
  if (text.includes('repair') || text.includes('tech-repair')) return Wrench;
  if (text.includes('design') || text.includes('graphic')) return Palette;
  if (text.includes('photo') || text.includes('video') || text.includes('camera')) return Camera;
  if (text.includes('barber') || text.includes('hair') || text.includes('braid') || text.includes('scissor')) return Scissors;
  if (text.includes('dev') || text.includes('code') || text.includes('software')) return Code;
  if (text.includes('service') || text.includes('freelance') || text.includes('gig')) return Briefcase;
  if (text.includes('hostel') || text.includes('lodge') || text.includes('room') || text.includes('house')) return Home;
  if (text.includes('appliance') || text.includes('tv')) return Tv;
  if (text.includes('other')) return Package;

  return Grid;
}

/**
 * Returns tailored color styles for each category icon badge
 */
export function getCategoryBadgeColor(slugOrName: string): { bg: string; text: string; border: string } {
  const s = slugOrName.toLowerCase();
  if (s.includes('phone') || s.includes('electronic')) {
    return { bg: 'bg-blue-50 dark:bg-blue-950/60', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' };
  }
  if (s.includes('laptop') || s.includes('comput')) {
    return { bg: 'bg-indigo-50 dark:bg-indigo-950/60', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' };
  }
  if (s.includes('fashion') || s.includes('wear')) {
    return { bg: 'bg-rose-50 dark:bg-rose-950/60', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' };
  }
  if (s.includes('shoe') || s.includes('footwear')) {
    return { bg: 'bg-amber-50 dark:bg-amber-950/60', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' };
  }
  if (s.includes('beauty') || s.includes('care')) {
    return { bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/60', text: 'text-fuchsia-600 dark:text-fuchsia-400', border: 'border-fuchsia-200 dark:border-fuchsia-800' };
  }
  if (s.includes('book') || s.includes('textbook')) {
    return { bg: 'bg-emerald-50 dark:bg-emerald-950/60', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' };
  }
  if (s.includes('food') || s.includes('snack')) {
    return { bg: 'bg-orange-50 dark:bg-orange-950/60', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' };
  }
  if (s.includes('accessor') || s.includes('watch')) {
    return { bg: 'bg-purple-50 dark:bg-purple-950/60', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' };
  }
  if (s.includes('furnitur') || s.includes('decor')) {
    return { bg: 'bg-teal-50 dark:bg-teal-950/60', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800' };
  }
  if (s.includes('suppl') || s.includes('school')) {
    return { bg: 'bg-sky-50 dark:bg-sky-950/60', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800' };
  }
  if (s.includes('game') || s.includes('gaming')) {
    return { bg: 'bg-violet-50 dark:bg-violet-950/60', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' };
  }
  if (s.includes('service') || s.includes('freelance')) {
    return { bg: 'bg-cyan-50 dark:bg-cyan-950/60', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800' };
  }
  return { bg: 'bg-slate-50 dark:bg-slate-850', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-800' };
}
