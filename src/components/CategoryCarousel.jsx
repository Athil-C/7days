import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { SHOWCASE_CATEGORIES } from '../data/categories';

/**
 * CategoryCarousel - Interactive Horizontal Category Showcase
 * 
 * Features:
 * - Rounded pastel cards matching customer reference design
 * - Smooth horizontal scrolling with floating Left & Right chevron buttons
 * - Active category highlight with subtle scale and warm pastel tones
 * - Responsive touch drag & scroll
 * - Optional onSelectCategory callback for instant in-page filtering
 */
export default function CategoryCarousel({ 
  selectedId, 
  onSelectCategory, 
  title = "Shop by Category",
  subtitle = "Explore our handpicked collection of toys, cycles, baby essentials & gifts",
  showHeading = true,
  actionButton = null,
  autoScroll = true,
  autoScrollInterval = 3000
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimerRef = useRef(null);

  // Check scroll positions to toggle arrow states
  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const current = scrollRef.current;
    if (current) {
      current.addEventListener('scroll', updateScrollButtons);
      window.addEventListener('resize', updateScrollButtons);
      return () => {
        current.removeEventListener('scroll', updateScrollButtons);
        window.removeEventListener('resize', updateScrollButtons);
      };
    }
  }, []);

  // Automatic horizontal scroll animation loop
  useEffect(() => {
    if (!autoScroll || isPaused) return;

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;

      // If at or near the end, smoothly loop back to start
      if (scrollLeft >= maxScroll - 20) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Scroll forward by one card step (responsive width)
        const step = clientWidth < 640 ? 190 : 250;
        scrollRef.current.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [autoScroll, isPaused, autoScrollInterval]);

  // Clean up pause timer on unmount
  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
    };
  }, []);

  const pauseAutoScrollTemporarily = (duration = 4500) => {
    setIsPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, duration);
  };

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const step = scrollRef.current.clientWidth < 640 ? 200 : 280;
      const offset = direction === 'left' ? -step : step;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      pauseAutoScrollTemporarily(4500);
    }
  };

  return (
    <div className="relative w-full py-4">
      {/* Optional Header Row */}
      {showHeading && (
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 px-4 sm:px-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB703]/20 text-[#FB8500] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore by Category</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse ml-1" title="Auto-scrolling active" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#263238] font-heading tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[#546E7A] text-xs sm:text-sm mt-1.5 max-w-xl">
                {subtitle}
              </p>
            )}
          </div>

          {actionButton && (
            <div className="mt-4 md:mt-0">
              {actionButton}
            </div>
          )}
        </div>
      )}

      {/* Carousel Container with Floating Navigation Arrows */}
      <div 
        className="relative group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => pauseAutoScrollTemporarily(3500)}
      >
        
        {/* Left Scroll Arrow */}
        <button
          onClick={() => handleScroll('left')}
          disabled={!canScrollLeft}
          aria-label="Scroll categories left"
          className={`absolute left-0 sm:-left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-[#263238] shadow-md border border-black/5 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
            canScrollLeft ? 'opacity-90 hover:opacity-100 hover:shadow-lg' : 'opacity-0 pointer-events-none'
          }`}
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
        </button>

        {/* Right Scroll Arrow */}
        <button
          onClick={() => handleScroll('right')}
          disabled={!canScrollRight}
          aria-label="Scroll categories right"
          className={`absolute right-0 sm:-right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-[#263238] shadow-md border border-black/5 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
            canScrollRight ? 'opacity-90 hover:opacity-100 hover:shadow-lg' : 'opacity-0 pointer-events-none'
          }`}
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
        </button>

        {/* Horizontal Track */}
        <div
          ref={scrollRef}
          className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-6 px-2 sm:px-4 focus:outline-none"
          tabIndex={0}
          role="region"
          aria-label="Category Carousel"
        >
          {SHOWCASE_CATEGORIES.map((category) => {
            const isActive = selectedId 
              ? selectedId === category.id 
              : category.isDefaultActive;

            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory && onSelectCategory(category)}
                type="button"
                className={`flex-shrink-0 flex flex-col items-center justify-between rounded-[26px] sm:rounded-[30px] p-4 transition-all duration-300 cursor-pointer text-left select-none relative focus:outline-none ${
                  isActive
                    ? 'w-44 sm:w-56 h-[260px] sm:h-[310px] scale-102 sm:scale-105 shadow-lg ring-2 ring-black/10'
                    : 'w-40 sm:w-48 h-[240px] sm:h-[285px] hover:shadow-md hover:scale-101 opacity-90 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isActive ? category.activeBg : category.bgColor
                }}
              >
                {/* Active Indicator Pip */}
                {isActive && (
                  <span 
                    className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full shadow-xs animate-pulse"
                    style={{ backgroundColor: category.accentColor }}
                    aria-hidden="true"
                  />
                )}

                {/* Product/Category Image */}
                <div className="w-full flex-1 flex items-center justify-center overflow-hidden px-2 pt-1">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="max-h-[160px] sm:max-h-[190px] w-auto max-w-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* Category Title */}
                <div className="w-full text-center pt-2 pb-1">
                  <span 
                    className={`block font-heading tracking-tight leading-snug transition-colors ${
                      isActive 
                        ? 'text-sm sm:text-base font-bold text-[#1E293B]' 
                        : 'text-xs sm:text-sm font-semibold text-[#334155]'
                    }`}
                  >
                    {category.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
