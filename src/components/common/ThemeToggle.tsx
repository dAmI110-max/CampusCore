import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'compact' | 'dropdown' | 'buttons';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'dropdown', className = '' }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { id: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  if (variant === 'buttons') {
    return (
      <div className={`inline-flex p-1 rounded-2xl bg-purple-50/50 dark:bg-slate-900/80 border border-purple-100/80 dark:border-purple-950/50 ${className}`}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 shadow-xs border border-purple-200/60 dark:border-purple-800/40'
                  : 'text-slate-500 hover:text-purple-700 dark:text-slate-400 dark:hover:text-purple-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'compact') {
    const CurrentIcon = resolvedTheme === 'dark' ? Moon : Sun;
    return (
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className={`p-2 rounded-2xl border border-purple-100/80 dark:border-purple-950/60 bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors cursor-pointer ${className}`}
        title={`Current: ${theme === 'system' ? 'System (' + resolvedTheme + ')' : theme}. Tap to toggle.`}
        aria-label="Toggle theme"
      >
        <CurrentIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
      </button>
    );
  }

  // Default Dropdown
  const CurrentIcon = theme === 'system' ? Monitor : resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 sm:px-2.5 sm:py-2 rounded-2xl border border-purple-100/80 dark:border-purple-950/60 bg-white dark:bg-slate-900/90 hover:bg-purple-50 dark:hover:bg-purple-950/50 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-2xs"
        title="Theme Settings"
        aria-label="Theme Settings"
      >
        <CurrentIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span className="hidden xl:inline text-slate-600 dark:text-slate-300 capitalize">{theme}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-950/80 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="text-[9px] font-bold text-purple-500/80 dark:text-purple-400/80 px-2.5 py-1 uppercase tracking-wider">
            Theme Mode
          </div>
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
