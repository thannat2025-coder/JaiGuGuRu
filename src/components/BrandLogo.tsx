import React from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  lightText?: boolean;
}

export default function BrandLogo({ size = 'md', showText = false, lightText = false }: BrandLogoProps) {
  // Dimensions adaptation
  const containerSizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  const outerHeartSizes = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-18 h-18',
  };

  const innerHeartSizes = {
    sm: 'w-3 h-3',
    md: 'w-4.5 h-4.5',
    lg: 'w-6 h-6',
    xl: 'w-9 h-9',
  };

  const sparkleSizes = {
    sm: 'w-3.5 h-3.5 -top-0.5 -right-0.5',
    md: 'w-4.5 h-4.5 -top-0.5 -right-0.5',
    lg: 'w-6 h-6 -top-1 -right-1',
    xl: 'w-9 h-9 -top-1.5 -right-1.5',
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`relative flex items-center justify-center rounded-2xl bg-indigo-50/50 ${containerSizes[size]} border border-indigo-100/30 overflow-visible`}>
        {/* Animated halo background representing inner peace/knowing */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.4, 0.15],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-indigo-400 rounded-2xl blur-md"
        />

        {/* Outer Heart (The knowing mind, "กูรู้") */}
        <Heart 
          className={`${outerHeartSizes[size]} text-indigo-600 stroke-[1.5] relative z-10 fill-indigo-50/10`} 
        />

        {/* Inner Heart (The beautiful core self, "ใจกู") */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Heart 
              className={`${innerHeartSizes[size]} text-rose-500 fill-rose-400 stroke-[1.5]`} 
            />
          </motion.div>
        </div>

        {/* The sparkle of realization/awakening */}
        <motion.div
          animate={{
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
          className={`absolute z-30 ${sparkleSizes[size]}`}
        >
          <Sparkles className="w-full h-full text-amber-500 drop-shadow-sm" />
        </motion.div>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className={`font-black tracking-tight leading-none ${size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-xl' : 'text-base'} ${lightText ? 'text-white' : 'text-slate-900'}`}>
            JaiGu (GuRu.D)
          </span>
          <span className={`font-medium tracking-wide ${size === 'lg' ? 'text-sm mt-1.5' : 'text-[10px] mt-0.5'} ${lightText ? 'text-indigo-200' : 'text-slate-400 font-sans'}`}>
            ใจกุ (กูรู ดี)
          </span>
        </div>
      )}
    </div>
  );
}
