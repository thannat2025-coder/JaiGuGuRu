import React from 'react';

interface CrayonDrawingProps {
  quadrant: 'high-positive' | 'high-negative' | 'low-negative' | 'low-positive';
  size?: 'sm' | 'md' | 'lg';
}

export default function CrayonDrawing({ quadrant, size = 'md' }: CrayonDrawingProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  };

  const currentSize = sizeClasses[size];

  // Render hand-drawn styled SVGs based on quadrant
  switch (quadrant) {
    case 'high-positive': // Yellow - Happy/Energized
      return (
        <div className={`relative ${currentSize} select-none flex items-center justify-center`}>
          {/* Soft crayon paint aura */}
          <div className="absolute inset-2 bg-amber-200 rounded-full blur-xl opacity-60 animate-pulse" />
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-md text-amber-500 fill-none filter sepia-[0.1]"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Sketchy Face Outline */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#eab308"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="280 10"
              className="opacity-90"
            />
            <circle
              cx="51"
              cy="49"
              r="39.5"
              stroke="#ca8a04"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="30 20 60 10"
              className="opacity-70"
            />
            
            {/* Sketchy Wide Grinning Eyes */}
            <path
              d="M 33 42 C 33 34, 41 34, 41 42"
              stroke="#854d0e"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M 59 42 C 59 34, 67 34, 67 42"
              stroke="#854d0e"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            
            {/* Blushing cheek circles */}
            <circle cx="28" cy="52" r="6" fill="#fca5a5" className="opacity-60" />
            <circle cx="72" cy="52" r="6" fill="#fca5a5" className="opacity-60" />

            {/* Huge Sketchy Laughing Smile */}
            <path
              d="M 32 54 C 35 68, 65 68, 68 54"
              stroke="#854d0e"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <path
              d="M 30 53 Q 50 53 70 53"
              stroke="#854d0e"
              strokeWidth="3"
              strokeLinecap="round"
            />
            
            {/* Sparkles / Little energy stars */}
            <path d="M 15 20 L 17 25 L 22 27 L 17 29 L 15 34 L 13 29 L 8 27 L 13 25 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M 85 22 L 87 25 L 91 26 L 87 27 L 85 30 L 83 27 L 79 26 L 83 25 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
      );

    case 'high-negative': // Red - Angry/Stressed
      return (
        <div className={`relative ${currentSize} select-none flex items-center justify-center`}>
          {/* Soft crayon paint aura */}
          <div className="absolute inset-2 bg-rose-200 rounded-full blur-xl opacity-60 animate-bounce [animation-duration:3s]" />
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-md text-rose-500 fill-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Sketchy Face Outline */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#ef4444"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="270 15 20"
              className="opacity-90"
            />
            <path
              d="M 12 48 C 10 40, 90 40, 88 48"
              stroke="#b91c1c"
              strokeWidth="1.5"
              strokeDasharray="5 5"
              className="opacity-40"
            />

            {/* Angry Brows */}
            <path d="M 28 34 L 43 40" stroke="#991b1b" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 72 34 L 57 40" stroke="#991b1b" strokeWidth="4.5" strokeLinecap="round" />

            {/* Tense squinting eyes */}
            <path d="M 30 43 L 40 43" stroke="#7f1d1d" strokeWidth="4" strokeLinecap="round" />
            <path d="M 60 43 L 70 43" stroke="#7f1d1d" strokeWidth="4" strokeLinecap="round" />

            {/* Grumpy Zigzag mouth */}
            <path
              d="M 33 62 L 40 58 L 47 63 L 53 58 L 60 63 L 67 58"
              stroke="#7f1d1d"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Red anger veins / stress symbols overhead */}
            <path d="M 45 10 L 48 18 M 52 10 L 49 18" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 78 15 L 83 23 L 88 18" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
      );

    case 'low-negative': // Blue - Sad/Drained
      return (
        <div className={`relative ${currentSize} select-none flex items-center justify-center`}>
          {/* Soft crayon paint aura */}
          <div className="absolute inset-2 bg-blue-200 rounded-full blur-xl opacity-60" />
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-md text-blue-500 fill-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Sketchy Drooping Face Outline */}
            <path
              d="M 50 10 C 75 10, 88 35, 87 60 C 85 85, 15 85, 13 60 C 12 35, 25 10, 50 10"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="260 20"
              className="opacity-90"
            />

            {/* Sad Drooping Eyebrows */}
            <path d="M 28 36 C 33 32, 42 34, 42 40" stroke="#1e40af" strokeWidth="3" strokeLinecap="round" />
            <path d="M 72 36 C 67 32, 58 34, 58 40" stroke="#1e40af" strokeWidth="3" strokeLinecap="round" />

            {/* Heavy Tired Eyes */}
            <path d="M 30 46 C 30 46, 35 44, 40 46" stroke="#172554" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 60 46 C 60 46, 65 44, 70 46" stroke="#172554" strokeWidth="3.5" strokeLinecap="round" />

            {/* Teardrop dripping on cheek */}
            <path
              d="M 33 53 C 33 53, 31 63, 35 63 C 39 63, 37 53, 34 53"
              fill="#93c5fd"
              stroke="#2563eb"
              strokeWidth="1.5"
              strokeLinejoin="round"
              className="animate-pulse"
            />

            {/* Sad Curved-Down Mouth */}
            <path
              d="M 38 66 C 44 60, 56 60, 62 66"
              stroke="#172554"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            
            {/* Rain cloud overlay */}
            <path d="M 75 13 C 78 10, 83 11, 85 13 C 88 12, 92 15, 90 18 C 93 20, 91 24, 87 23 L 73 23 Z" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
      );

    case 'low-positive': // Green - Calm/Peaceful/Serene
      return (
        <div className={`relative ${currentSize} select-none flex items-center justify-center`}>
          {/* Soft crayon paint aura */}
          <div className="absolute inset-2 bg-emerald-100 rounded-full blur-xl opacity-60" />
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-md text-emerald-500 fill-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Sketchy Soft Face Outline */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#10b981"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="290 10"
              className="opacity-90"
            />
            <circle
              cx="49.5"
              cy="50.5"
              r="39.5"
              stroke="#059669"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="40 50 100 20"
              className="opacity-60"
            />

            {/* Peaceful Sleeping Eyes (^^ Style) */}
            <path
              d="M 28 44 C 31 49, 39 49, 42 44"
              stroke="#064e3b"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M 58 44 C 61 49, 69 49, 72 44"
              stroke="#064e3b"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Generous Rosy Cheek Pastel glow */}
            <circle cx="26" cy="51" r="5" fill="#a7f3d0" className="opacity-70" />
            <circle cx="74" cy="51" r="5" fill="#a7f3d0" className="opacity-70" />

            {/* Happy Calm Cute Smile */}
            <path
              d="M 42 58 C 45 63, 55 63, 58 58"
              stroke="#064e3b"
              strokeWidth="4"
              strokeLinecap="round"
            />
            
            {/* Tiny leaves floating / sprouts */}
            <path d="M 82 25 Q 88 20 90 28 Q 83 31 82 25 Z" fill="#6ee7b7" stroke="#059669" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M 12 28 Q 15 22 22 25 Q 18 31 12 28 Z" fill="#6ee7b7" stroke="#059669" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
      );

    default:
      return null;
  }
}
