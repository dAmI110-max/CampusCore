import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { AppNotification } from '../../types';
import {
  Bell,
  X,
  CheckCircle2,
  Package,
  MessageCircle,
  ShieldCheck,
  Wallet,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppViewMode } from '../layout/Navbar';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: AppViewMode, contextId?: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'orders' | 'messages' | 'wallet'>('all');
  const [, setRefreshKey] = useState(0);

  if (!isOpen) return null;

  const notifications = currentUser ? StorageService.getNotifications(currentUser.id) : [];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    const type = n.type as string;
    if (activeFilter === 'orders') {
      return type.includes('order') || type.includes('escrow') || type.includes('payment') || type.includes('service');
    }
    if (activeFilter === 'messages') {
      return type.includes('message') || type.includes('inquiry') || type.includes('interest');
    }
    if (activeFilter === 'wallet') {
      return type.includes('deposit') || type.includes('withdrawal') || type.includes('funds') || type.includes('escrow');
    }
    return true;
  });

  const handleMarkAllRead = () => {
    if (currentUser) {
      StorageService.markAllNotificationsAsRead(currentUser.id);
      setRefreshKey((k) => k + 1);
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    StorageService.markNotificationAsRead(notif.id);
    setRefreshKey((k) => k + 1);

    const type = notif.type as string;
    if (type.includes('order') || type.includes('escrow') || type.includes('payment')) {
      onNavigate('orders', notif.link);
      onClose();
    } else if (type.includes('message') || type.includes('inquiry')) {
      onNavigate('messages', notif.link);
      onClose();
    } else if (type.includes('verification')) {
      onNavigate('dashboard');
      onClose();
    } else if (type.includes('deposit') || type.includes('withdrawal')) {
      onNavigate('wallet');
      onClose();
    } else {
      onNavigate('home');
      onClose();
    }
  };

  const getIcon = (type: string) => {
    if (type.includes('order') || type.includes('payment') || type.includes('package')) {
      return <Package className="w-4 h-4 text-emerald-600" />;
    }
    if (type.includes('message') || type.includes('inquiry')) {
      return <MessageCircle className="w-4 h-4 text-indigo-600" />;
    }
    if (type.includes('verification')) {
      return <ShieldCheck className="w-4 h-4 text-blue-600" />;
    }
    if (type.includes('wallet') || type.includes('deposit') || type.includes('withdrawal') || type.includes('funds')) {
      return <Wallet className="w-4 h-4 text-amber-600" />;
    }
    if (type.includes('warning') || type.includes('dispute') || type.includes('security')) {
      return <AlertCircle className="w-4 h-4 text-rose-600" />;
    }
    return <Sparkles className="w-4 h-4 text-purple-600" />;
  };

  const getBgColor = (type: string) => {
    if (type.includes('order') || type.includes('payment')) return 'bg-emerald-50 text-emerald-600';
    if (type.includes('message')) return 'bg-indigo-50 text-indigo-600';
    if (type.includes('verification')) return 'bg-blue-50 text-blue-600';
    if (type.includes('warning') || type.includes('dispute')) return 'bg-rose-50 text-rose-600';
    if (type.includes('wallet') || type.includes('deposit')) return 'bg-amber-50 text-amber-600';
    return 'bg-purple-50 text-purple-600';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative my-6 overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white">
                      {unreadCount} new
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500">Stay updated on escrow orders, chats & campus alerts</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Pills & Mark All Read */}
          <div className="flex items-center justify-between gap-2 py-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['all', 'unread', 'orders', 'messages'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                    activeFilter === filter
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                <p className="text-xs font-semibold text-slate-500">No notifications in this view.</p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    n.read
                      ? 'bg-white border-slate-150 hover:bg-slate-50/80'
                      : 'bg-indigo-50/40 border-indigo-200 shadow-2xs hover:bg-indigo-50/70'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl ${getBgColor(n.type)} flex items-center justify-center shrink-0 mt-0.5`}>
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-bold truncate ${n.read ? 'text-slate-800' : 'text-indigo-950 font-black'}`}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(n.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                  </div>

                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Powered by CampusCore Security Engine</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
