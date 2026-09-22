import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import flowerImg from '../../assets/images/purple_flower_wallpaper_1790085161596.jpg';

interface Petal {
  id: number;
  x: number; // percentage across
  size: number; // px
  duration: number; // seconds
  delay: number; // seconds
  rotateStart: number;
  rotateEnd: number;
  swayAmount: number;
  opacity: number;
}

export const PurpleFlowerLiveBackground: React.FC = () => {
  // Generate a steady array of floating flower petals with deterministic organic variations
  const petals: Petal[] = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: (i * 5.5 + (i % 3) * 7) % 100,
      size: 14 + (i % 5) * 6,
      duration: 16 + (i % 6) * 3,
      delay: -(i * 1.8),
      rotateStart: (i * 45) % 360,
      rotateEnd: ((i * 45) % 360) + 360,
      swayAmount: 20 + (i % 4) * 15,
      opacity: 0.35 + (i % 4) * 0.12,
    }));
  }, []);

  // Ambient floating glowing sparkles/pollen
  const sparkles = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      x: (i * 7.1 + 4) % 96,
      y: (i * 9.3 + 10) % 90,
      size: 3 + (i % 3) * 2,
      duration: 6 + (i % 4) * 2,
      delay: (i * 0.7) % 5,
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* 1. Main Live Purple Flower Wallpaper Canvas */}
      <motion.div
        animate={{
          scale: [1.02, 1.08, 1.03, 1.02],
          x: ['0%', '1.5%', '-1%', '0%'],
          y: ['0%', '-1%', '0.8%', '0%'],
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -inset-8 bg-cover bg-center"
        style={{
          backgroundImage: `url(${flowerImg})`,
          backgroundPosition: 'center 38%',
        }}
      />

      {/* 2. Ethereal Soft Light & Contrast Protective Layer */}
      {/* Light Mode: creates a soft frosted floral glow with high legibility */}
      <div className="absolute inset-0 bg-slate-50/75 dark:bg-slate-950/85 backdrop-blur-[3px] transition-colors" />

      {/* 3. Deep Radial Vignette to focus attention on central content */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, transparent 15%, rgba(107, 33, 168, 0.12) 55%, rgba(15, 23, 42, 0.35) 100%)',
        }}
      />

      {/* 4. Top and Bottom Ambient Gradient Blend */}
      <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-slate-50 dark:from-slate-950 to-transparent opacity-90" />
      <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent opacity-90" />

      {/* 5. Live Floating Translucent Purple Petals */}
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          initial={{
            y: '-10vh',
            x: `${petal.x}vw`,
            rotate: petal.rotateStart,
            opacity: 0,
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [
              `${petal.x}vw`,
              `${petal.x + petal.swayAmount * 0.05}vw`,
              `${petal.x - petal.swayAmount * 0.05}vw`,
              `${petal.x}vw`,
            ],
            rotate: [petal.rotateStart, petal.rotateEnd],
            opacity: [0, petal.opacity, petal.opacity, 0],
          }}
          transition={{
            duration: petal.duration,
            repeat: Infinity,
            delay: petal.delay,
            ease: 'linear',
          }}
          className="absolute pointer-events-none"
          style={{ width: petal.size, height: petal.size * 1.4 }}
        >
          {/* Stylized organic violet floral petal SVG */}
          <svg
            viewBox="0 0 30 42"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_2px_8px_rgba(168,85,247,0.35)]"
          >
            <path
              d="M15 0C23 12 30 24 26 34C22 44 8 44 4 34C0 24 7 12 15 0Z"
              fill="url(#purplePetalGrad)"
            />
            <defs>
              <linearGradient
                id="purplePetalGrad"
                x1="15"
                y1="0"
                x2="15"
                y2="42"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#c084fc" stopOpacity="0.85" />
                <stop offset="0.6" stopColor="#a855f7" stopOpacity="0.75" />
                <stop offset="1" stopColor="#7e22ce" stopOpacity="0.6" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      ))}

      {/* 6. Live Ambient Bioluminescent Pollen Sparkles */}
      {sparkles.map((sp) => (
        <motion.div
          key={sp.id}
          initial={{
            opacity: 0.1,
            scale: 0.8,
          }}
          animate={{
            opacity: [0.2, 0.85, 0.2],
            scale: [0.8, 1.3, 0.8],
            y: ['0px', '-24px', '0px'],
          }}
          transition={{
            duration: sp.duration,
            repeat: Infinity,
            delay: sp.delay,
            ease: 'easeInOut',
          }}
          className="absolute rounded-full bg-purple-300 dark:bg-purple-200 pointer-events-none shadow-[0_0_10px_#c084fc]"
          style={{
            left: `${sp.x}%`,
            top: `${sp.y}%`,
            width: sp.size,
            height: sp.size,
          }}
        />
      ))}
    </div>
  );
};
