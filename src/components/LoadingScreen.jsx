import React, { useState, useEffect } from 'react';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isRendered, setIsRendered] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2000; // 2 seconds smooth loading duration

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            setIsRendered(false);
            if (onComplete) onComplete();
          }, 600);
        }, 250);
      }
    }, 20);

    return () => clearInterval(timer);
  }, [onComplete]);

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FFFBF7] select-none transition-all duration-700 ease-out ${isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
        }`}
      aria-label="Loading 7Days Toys & Babyshop"
      role="status"
    >


      {/* Background Soft Doodles: Cloud Silhouettes (Left & Right) */}
      <div className="absolute top-20 left-4 sm:left-12 pointer-events-none opacity-40">
        <svg viewBox="0 0 120 70" className="w-24 sm:w-32 h-auto fill-white drop-shadow-xs">
          <path d="M 20,50 A 15,15 0 0,1 35,28 A 22,22 0 0,1 70,22 A 20,20 0 0,1 98,34 A 14,14 0 0,1 100,50 Z" />
        </svg>
      </div>

      <div className="absolute bottom-16 left-6 sm:left-16 pointer-events-none opacity-40">
        <svg viewBox="0 0 120 70" className="w-20 sm:w-28 h-auto fill-white drop-shadow-xs">
          <path d="M 20,50 A 15,15 0 0,1 35,28 A 22,22 0 0,1 70,22 A 20,20 0 0,1 98,34 A 14,14 0 0,1 100,50 Z" />
        </svg>
      </div>

      <div className="absolute top-1/2 right-4 sm:right-10 -translate-y-1/2 pointer-events-none opacity-40">
        <svg viewBox="0 0 120 70" className="w-24 sm:w-32 h-auto fill-white drop-shadow-xs">
          <path d="M 20,50 A 15,15 0 0,1 35,28 A 22,22 0 0,1 70,22 A 20,20 0 0,1 98,34 A 14,14 0 0,1 100,50 Z" />
        </svg>
      </div>

      {/* Main Centered Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm sm:max-w-md w-full">

        {/* 1. Circular Red 3D Glossy Badge Logo */}
        <div className="relative mb-3 sm:mb-4">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden  border-2 border-white/60  flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
            <img
              src="/7days-logo.png"
              alt="7Days Toys & Babyshop Logo"
              className="w-full h-full object-contain"
              width="128"
              height="128"
            />
          </div>
        </div>

        {/* 2. Brand Name Typography Matching Reference Image */}
        <div className="flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-black text-[#1E293B] font-heading tracking-tight leading-none">
            7Days
          </h1>

          <p className="text-xs sm:text-sm font-extrabold text-[#FB8500] tracking-[0.22em] uppercase mt-1.5 sm:mt-2">
            TOYS &amp; BABYSHOP
          </p>

          <p
            className="text-2xl sm:text-3xl text-[#334155] font-medium mt-1 leading-tight tracking-normal"
            style={{ fontFamily: "'Caveat', 'Patrick Hand', cursive, sans-serif" }}
          >
            Little Things. Big Smiles.
          </p>
        </div>

        {/* 3. Candy-Striped Progress Bar & Percentage */}
        <div className="w-full max-w-[320px] sm:max-w-[360px] mt-8 sm:mt-10">
          <div className="flex items-center gap-3">
            {/* Outer Capsule Track with Inner Shadow & White Border */}
            <div className="flex-1 h-6 sm:h-7 rounded-full bg-[#F6EBE0] p-1 border-2 border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_2px_6px_rgba(251,133,0,0.06)] relative overflow-hidden">
              {/* Inner Gradient Animated Striped Fill */}
              <div
                className="h-full rounded-full transition-all duration-100 ease-out"
                style={{
                  width: `${progress}%`,
                  backgroundImage: `
                    repeating-linear-gradient(
                      -45deg,
                      rgba(255, 255, 255, 0.28) 0,
                      rgba(255, 255, 255, 0.28) 9px,
                      transparent 9px,
                      transparent 18px
                    ),
                    linear-gradient(90deg, #FF5E00 0%, #FF8500 50%, #FFB700 100%)
                  `,
                  backgroundSize: '36px 36px, 100% 100%',
                  animation: 'candyStripeMove 1.2s linear infinite'
                }}
              />
            </div>

            {/* Percentage Display on Right */}
            <span className="font-extrabold text-sm sm:text-base text-[#1E293B] min-w-[38px] text-left tabular-nums">
              {progress}%
            </span>
          </div>

          {/* 4. Caption Below Progress Bar */}
          <p className="text-xs sm:text-sm font-medium text-[#64748B] tracking-wider mt-3 text-center">
            Loading a world of happiness...
          </p>
        </div>

      </div>
    </div>
  );
}
