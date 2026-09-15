import React from 'react';
import { PackageOpen, Heart, Bell, Home, Search, PlusCircle, Sparkles, Wrench, Briefcase, Calendar } from 'lucide-react';

interface EmptyStateProps {
  type?: 'products' | 'favorites' | 'notifications' | 'accommodation' | 'search' | 'reports' | 'services' | 'jobs' | 'events' | 'study';
  title?: string;
  description?: string;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'products',
  title,
  description,
  actionText,
  actionLabel,
  onAction,
}) => {
  const effectiveActionText = actionText || actionLabel;
  const getDefaults = () => {
    switch (type) {
      case 'favorites':
        return {
          icon: <Heart className="w-10 h-10 text-rose-500 stroke-[1.8]" />,
          iconBg: 'bg-rose-50 border-rose-100',
          btnBg: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20',
          title: title || 'Your saved items will appear here',
          description: description || 'Tap the heart icon on any product to save it to your favorites list for quick access later.',
          actionText: effectiveActionText || 'Explore Marketplace',
        };
      case 'notifications':
        return {
          icon: <Bell className="w-10 h-10 text-amber-500 stroke-[1.8]" />,
          iconBg: 'bg-amber-50 border-amber-100',
          btnBg: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20',
          title: title || "You're all caught up!",
          description: description || 'No new alerts or listing notifications right now.',
          actionText: effectiveActionText || undefined,
        };
      case 'accommodation':
        return {
          icon: <Home className="w-10 h-10 text-emerald-600 stroke-[1.8]" />,
          iconBg: 'bg-emerald-50 border-emerald-100',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20',
          title: title || 'No accommodation listings available yet',
          description: description || 'Try adjusting your campus or room type filters, or be the first student hostel owner to list a room!',
          actionText: effectiveActionText || 'Post Hostel Listing',
        };
      case 'services':
        return {
          icon: <Wrench className="w-10 h-10 text-purple-600 stroke-[1.8]" />,
          iconBg: 'bg-purple-50 border-purple-100',
          btnBg: 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20',
          title: title || 'No student services listed in this category',
          description: description || 'Offer your design, typing, tutorial or repair skills to fellow students and earn income.',
          actionText: effectiveActionText || 'Offer a Service',
        };
      case 'jobs':
        return {
          icon: <Briefcase className="w-10 h-10 text-teal-600 stroke-[1.8]" />,
          iconBg: 'bg-teal-50 border-teal-100',
          btnBg: 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20',
          title: title || 'No open campus jobs matching criteria',
          description: description || 'Check back soon for new student gigs, tutoring jobs, or campus vendor vacancies.',
          actionText: effectiveActionText || 'Post a Campus Job',
        };
      case 'events':
        return {
          icon: <Calendar className="w-10 h-10 text-pink-600 stroke-[1.8]" />,
          iconBg: 'bg-pink-50 border-pink-100',
          btnBg: 'bg-pink-600 hover:bg-pink-700 shadow-pink-600/20',
          title: title || 'No upcoming campus events found',
          description: description || 'Be the first department or club executive to publish an event ticket on CampusPlug.',
          actionText: effectiveActionText || 'Host an Event',
        };
      case 'study':
        return {
          icon: <Sparkles className="w-10 h-10 text-cyan-600 stroke-[1.8]" />,
          iconBg: 'bg-cyan-50 border-cyan-100',
          btnBg: 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/20',
          title: title || 'No academic study files in this category',
          description: description || 'Upload your department past questions or study summaries to help your fellow coursemates.',
          actionText: effectiveActionText || 'Upload Study Material',
        };
      case 'search':
        return {
          icon: <Search className="w-10 h-10 text-indigo-500 stroke-[1.8]" />,
          iconBg: 'bg-indigo-50 border-indigo-100',
          btnBg: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20',
          title: title || 'No matching items found',
          description: description || 'We could not find any listings matching your search query or active campus filters. Try broader terms.',
          actionText: effectiveActionText || 'Clear All Filters',
        };
      case 'reports':
        return {
          icon: <PackageOpen className="w-10 h-10 text-emerald-600 stroke-[1.8]" />,
          iconBg: 'bg-emerald-50 border-emerald-100',
          btnBg: 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20',
          title: title || 'No active moderation reports',
          description: description || 'The marketplace is clean and in full compliance with safety standards.',
          actionText: effectiveActionText || undefined,
        };
      case 'products':
      default:
        return {
          icon: <PackageOpen className="w-10 h-10 text-indigo-600 stroke-[1.8]" />,
          iconBg: 'bg-indigo-50 border-indigo-100',
          btnBg: 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-indigo-600/20',
          title: title || 'No products available yet',
          description: description || 'New products will appear here as students start selling on CampusPlug.',
          actionText: effectiveActionText || 'Be the first seller to list yours.',
        };
    }
  };

  const defaults = getDefaults();

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 bg-white rounded-3xl border border-slate-200 shadow-xs max-w-md mx-auto my-8">
      <div className={`w-20 h-20 rounded-3xl ${defaults.iconBg} flex items-center justify-center mb-4 border shadow-xs`}>
        {defaults.icon}
      </div>
      <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1.5">{defaults.title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{defaults.description}</p>
      {defaults.actionText && onAction && (
        <button
          onClick={onAction}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl ${defaults.btnBg} text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98 cursor-pointer`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>{defaults.actionText}</span>
        </button>
      )}
    </div>
  );
};

