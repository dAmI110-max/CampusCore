import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { StorageService } from '../../services/storageService';
import { AppViewMode } from './Navbar';
import {
  Home,
  Compass,
  Sparkles,
  Plus,
  MessageCircle,
  User,
  ShoppingBag,
} from 'lucide-react';

interface BottomNavProps {
  currentView: AppViewMode;
  onNavigate: (view: AppViewMode) => void;
  onOpenCreateProduct: () => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenCreateProduct,
  onOpenAuth,
}) => {
  const { currentUser, isSeller } = useAuth();
  const { openModal } = useModal();

  const conversations = currentUser ? StorageService.getConversations(currentUser.id) : [];
  const unreadMessagesCount = conversations.reduce(
    (acc, c) => acc + (c.unreadCount?.[currentUser?.id || ''] || 0),
    0
  );

  const handlePostClick = () => {
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-slate-800/90 shadow-2xl transition-colors">
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {/* 1. Home Tab */}
        <button
          onClick={() => {
            onNavigate('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[44px] touch-manipulation transition-colors ${
            currentView === 'home'
              ? 'text-purple-600 dark:text-purple-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
          aria-label="Home"
        >
          <Home className={`w-5 h-5 ${currentView === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Home</span>
        </button>

        {/* 2. Explore / Marketplace Tab */}
        <button
          onClick={() => {
            onNavigate('marketplace');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[44px] touch-manipulation transition-colors ${
            isExploreActive
              ? 'text-purple-600 dark:text-purple-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
          aria-label="Marketplace"
        >
          <ShoppingBag className={`w-5 h-5 ${isExploreActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Market</span>
        </button>

        {/* 3. Center Sell / Post Action Button */}
        <div className="flex-1 flex justify-center -mt-5">
          <button
            onClick={handlePostClick}
            className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 border-2 border-white dark:border-slate-900 transition-all touch-manipulation cursor-pointer"
            aria-label="Post or Sell item"
          >
            <Plus className="w-6 h-6 stroke-[2.8]" />
          </button>
        </div>

        {/* 4. Study / StudyGen AI Tab */}
        <button
          onClick={() => {
            onNavigate('study');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[44px] touch-manipulation relative transition-colors ${
            currentView === 'study'
              ? 'text-cyan-500 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
          aria-label="Campus Study"
        >
          <div className="relative">
            <Sparkles className={`w-5 h-5 text-cyan-500 ${currentView === 'study' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="absolute -top-1.5 -right-2 px-1 py-0.2 text-[8px] font-black bg-cyan-500 text-white rounded-full">
              AI
            </span>
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Study</span>
        </button>

        {/* 5. Messages or Profile / Dashboard Tab */}
        {currentUser ? (
          <button
            onClick={() => {
              onNavigate('messages');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[44px] touch-manipulation relative transition-colors ${
              currentView === 'messages'
                ? 'text-purple-600 dark:text-purple-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
            aria-label="Messages"
          >
            <div className="relative">
              <MessageCircle className={`w-5 h-5 ${currentView === 'messages' ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1.5 py-0.2 text-[9px] font-black bg-purple-600 text-white rounded-full">
                  {unreadMessagesCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Inbox</span>
          </button>
        ) : (
          <button
            onClick={() => onOpenAuth('login')}
            className="flex-1 flex flex-col items-center justify-center py-1 min-h-[44px] touch-manipulation text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            aria-label="Sign In"
          >
            <User className="w-5 h-5 stroke-2" />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Sign In</span>
          </button>
        )}
      </div>
    </div>
  );
};
