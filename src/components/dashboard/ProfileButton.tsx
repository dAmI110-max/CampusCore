import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Edit, LogOut, Settings } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileButtonProps {
  onEditProfile: () => void;
  onLogout: () => void;
}

export const ProfileButton: React.FC<ProfileButtonProps> = ({ onEditProfile, onLogout }) => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  if (!currentUser) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full border-2 border-indigo-600/30 hover:border-indigo-600 transition-all overflow-hidden flex items-center justify-center group"
        title={currentUser.fullName}
      >
        <img
          src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
          alt={currentUser.fullName}
          className="w-full h-full object-cover"
        />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-50"
        >
          {/* User Info */}
          <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <p className="font-bold text-slate-900 dark:text-white text-sm">{currentUser.fullName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{currentUser.email || currentUser.username}</p>
            {currentUser.phone && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                📞 {currentUser.phone}
              </p>
            )}
          </div>

          {/* Menu Items */}
          <div className="space-y-2">
            <button
              onClick={() => {
                onEditProfile();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center gap-2 transition-all"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>

            <button
              onClick={onLogout}
              className="w-full px-4 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-sm flex items-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </motion.div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};
