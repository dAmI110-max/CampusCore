import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export interface CampusCoreLogoProps {
  variant?: 'full' | 'icon' | 'compact';
  theme?: 'light' | 'dark' | 'auto';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}

/**
 * Official CampusCore Brand Logo & Icon Component
 * Features the concentric geometric "Core" nexus emblem with lilac and royal purple styling.
 */
export const CampusCoreLogo: React.FC<CampusCoreLogoProps> = ({
  variant = 'full',
  theme = 'auto',
  size = 'md',
  className = '',
  showBadge = false,
}) => {
  let isDarkTheme = false;
  try {
    const themeContext = useTheme();
    if (theme === 'auto') {
      isDarkTheme = themeContext.resolvedTheme === 'dark';
    } else {
      isDarkTheme = theme === 'dark';
    }
  } catch {
    isDarkTheme = theme === 'dark';
  }

  // Lilac & Purple Theme Colors
  const purplePrimary = isDarkTheme ? '#c084fc' : '#7e22ce';
  const lilacAccent = isDarkTheme ? '#e9d5ff' : '#a855f7';
  const coreNodeColor = isDarkTheme ? '#faf5ff' : '#6b21a8';

  // Dimensions
  const iconDimensions = {
    xs: { w: 22, h: 22 },
    sm: { w: 28, h: 28 },
    md: { w: 36, h: 36 },
    lg: { w: 44, h: 44 },
    xl: { w: 56, h: 56 },
  };

  const textStyles = {
    xs: 'text-sm tracking-tight',
    sm: 'text-base tracking-tight',
    md: 'text-lg sm:text-xl tracking-tight',
    lg: 'text-xl sm:text-2xl tracking-tight',
    xl: 'text-2xl sm:text-3xl tracking-tight',
  };

  const currentDim = iconDimensions[size];

  // SVG Symbol: The Official CampusCore Concentric Orbit & Nucleus Monogram
  const SymbolSVG = (
    <svg
      width={currentDim.w}
      height={currentDim.h}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200 group-hover:scale-105"
      aria-label="CampusCore Symbol"
    >
      <defs>
        <linearGradient id="ccGradPrimary" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor={purplePrimary} />
          <stop offset="1" stopColor={lilacAccent} />
        </linearGradient>
        <linearGradient id="ccGradCore" x1="70" y1="70" x2="130" y2="130" gradientUnits="userSpaceOnUse">
          <stop stopColor={lilacAccent} />
          <stop offset="1" stopColor={coreNodeColor} />
        </linearGradient>
      </defs>

      {/* Outer Campus Orbit (Stylized Open 'C') */}
      <path
        d="M148 52 C120 28, 68 32, 44 60 C20 88, 22 132, 48 156 C74 180, 126 178, 152 148"
        stroke="url(#ccGradPrimary)"
        strokeWidth="18"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner Concentric Core Arc */}
      <path
        d="M130 80 C114 66, 84 68, 72 82 C60 96, 62 118, 76 130 C90 142, 118 140, 132 122"
        stroke="url(#ccGradCore)"
        strokeWidth="14"
        strokeLinecap="round"
      />

      {/* Central Luminous Core Nucleus */}
      <circle cx="100" cy="100" r="16" fill="url(#ccGradPrimary)" />
      <circle cx="100" cy="100" r="8" fill={isDarkTheme ? '#ffffff' : '#faf5ff'} />

      {/* Satellite Sparkle / Connectivity Node */}
      <circle cx="156" cy="44" r="9" fill={lilacAccent} />
      <circle cx="160" cy="156" r="7" fill={purplePrimary} />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {SymbolSVG}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {SymbolSVG}

      {/* CampusCore Brand Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black ${textStyles[size]} ${
              isDarkTheme ? 'text-white' : 'text-slate-900'
            } transition-colors tracking-tight`}
            style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
          >
            Campus<span className="text-purple-600 dark:text-purple-400">Core</span>
          </span>

          {showBadge && (
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
              UNIOSUN
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Backwards compatibility export
export const CampusPlugLogo = CampusCoreLogo;
export type CampusPlugLogoProps = CampusCoreLogoProps;

