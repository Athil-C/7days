import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, Sparkles, LayoutGrid, SlidersHorizontal } from 'lucide-react';
import { AGE_GROUPS } from '../data/shoppingConfig';
import { products } from '../data/products';
import { filterProductsByAge } from '../utils/shoppingEngine';
import ProductCard from './ProductCard';

export default function AgeShop() {
  const [selectedAge, setSelectedAge] = useState(AGE_GROUPS[1].id); // default to 1-3 years
  const [displayCount, setDisplayCount] = useState(4);
  const [viewMode, setViewMode] = useState('pills'); // 'pills' (compact, visible products) | 'cards'
  const resultsRef = useRef(null);

  const currentAgeGroup = AGE_GROUPS.find(g => g.id === selectedAge) || AGE_GROUPS[0];
  const allMatchedProducts = filterProductsByAge(products, selectedAge);
  const visibleProducts = allMatchedProducts.slice(0, displayCount);

  const handleAgeChange = (id) => {
    setSelectedAge(id);
    setDisplayCount(4); // reset visible count on tab change

    // Smoothly ensure product results are immediately visible on screen
    if (resultsRef.current) {
      const rect = resultsRef.current.getBoundingClientRect();
      // If the results top is out of view or too low down, scroll into view
      if (rect.top < 0 || rect.top > window.innerHeight * 0.4) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <section id="shop-by-age" className="py-10 sm:py-16 bg-white/50 border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#219EBC]/15 text-[#219EBC] text-xs font-bold uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Browse by Age Group</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#263238] font-heading tracking-tight">
              Shop by Age
            </h2>
            <p className="text-[#546E7A] text-xs sm:text-base mt-1 max-w-xl">
              Tap any age group to instantly filter toys and essentials right below.
            </p>
          </div>

          {/* Desktop/Tablet Controls: View Toggle & Explore link */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* View Mode Toggle: Compact Pills vs Expanded Cards */}
            <div className="bg-[#FFF9F0] border border-black/10 p-1 rounded-full flex items-center gap-1">
              <button
                onClick={() => setViewMode('pills')}
                type="button"
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'pills'
                    ? 'bg-[#219EBC] text-white shadow-2xs'
                    : 'text-[#546E7A] hover:text-[#263238]'
                }`}
                title="Compact filter bar (products stay visible)"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Quick Filter</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                type="button"
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-[#219EBC] text-white shadow-2xs'
                    : 'text-[#546E7A] hover:text-[#263238]'
                }`}
                title="Expanded stage cards overview"
              >
                <LayoutGrid className="w-3 h-3" />
                <span>All Stages</span>
              </button>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 bg-white hover:bg-amber-50/50 border border-black/10 px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-[#263238] shadow-2xs hover:shadow transition-all shrink-0"
            >
              <span>Catalog</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FB8500]" />
            </Link>
          </div>
        </div>

        {/* ======================================================== */}
        {/* FILTER METHOD 1: COMPACT SWIPEABLE PILLS (DEFAULT)        */}
        {/* Solves mobile issue: products are immediately visible!   */}
        {/* ======================================================== */}
        {viewMode === 'pills' && (
          <div className="mb-5 sm:mb-6">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
              {AGE_GROUPS.map((group) => {
                const isActive = selectedAge === group.id;
                const count = filterProductsByAge(products, group.id).length;
                return (
                  <button
                    key={group.id}
                    onClick={() => handleAgeChange(group.id)}
                    type="button"
                    className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
                      isActive
                        ? 'bg-[#219EBC] text-white border-[#219EBC] shadow-sm scale-102 ring-2 ring-[#219EBC]/20'
                        : 'bg-white text-[#263238] border-black/10 hover:border-[#219EBC]/40 hover:bg-sky-50/40 card-shadow'
                    }`}
                    aria-pressed={isActive}
                  >
                    <span className="text-base">{group.icon}</span>
                    <span>{group.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-black/5 text-[#546E7A]'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* FILTER METHOD 2: EXPANDED STAGE CARDS OVERVIEW           */}
        {/* Optional mode for parents who want deep stage reading    */}
        {/* ======================================================== */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 mb-6">
            {AGE_GROUPS.map((group) => {
              const isActive = selectedAge === group.id;
              const count = filterProductsByAge(products, group.id).length;
              return (
                <button
                  key={group.id}
                  onClick={() => handleAgeChange(group.id)}
                  type="button"
                  className={`p-3 rounded-2xl text-left transition-all duration-200 cursor-pointer border flex flex-col justify-between ${
                    isActive
                      ? 'bg-[#219EBC] text-white border-[#219EBC] shadow-md scale-102 ring-2 ring-[#219EBC]/25'
                      : 'bg-white text-[#263238] border-black/5 hover:border-black/15 card-shadow'
                  }`}
                  aria-pressed={isActive}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{group.icon}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-black/5 text-[#546E7A]'
                    }`}>
                      {count} items
                    </span>
                  </div>
                  <div>
                    <p className={`text-[10px] font-bold tracking-wider uppercase ${isActive ? 'text-white/80' : 'text-[#546E7A]'}`}>
                      {group.tagline}
                    </p>
                    <p className="text-sm font-extrabold font-heading mt-0.5">
                      {group.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Compact Result Indicator & Stage Details Strip */}
        <div
          ref={resultsRef}
          className="bg-white p-3.5 sm:p-4 rounded-2xl border border-black/5 card-shadow mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#219EBC]/15 text-[#219EBC] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold text-[#263238] font-heading">
                  {currentAgeGroup.label}
                </span>
                <span className="text-[10px] font-bold bg-[#219EBC]/15 text-[#219EBC] px-2 py-0.5 rounded-full">
                  {allMatchedProducts.length} items found
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#546E7A] line-clamp-1 mt-0.5">
                {currentAgeGroup.description}
              </p>
            </div>
          </div>

          <Link
            to="/products"
            className="text-[11px] sm:text-xs font-bold text-[#FB8500] hover:text-[#d46f00] flex items-center gap-1 self-start sm:self-center shrink-0"
          >
            <span>Explore full catalog</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Product Cards Grid: Smoothly re-renders when age changes */}
        <div key={selectedAge} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-fadeIn">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* "Show More" Button for stages with more than 4 products */}
        {allMatchedProducts.length > 4 && (
          <div className="mt-8 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
            {displayCount < allMatchedProducts.length ? (
              <button
                onClick={() => setDisplayCount(prev => Math.min(prev + 4, allMatchedProducts.length))}
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#263238] hover:bg-[#37474F] text-white px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer"
              >
                <span>Show More ({allMatchedProducts.length - displayCount} more items)</span>
              </button>
            ) : (
              <button
                onClick={() => setDisplayCount(4)}
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-black/5 text-[#546E7A] border border-black/10 px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer"
              >
                <span>Show Fewer</span>
              </button>
            )}

            <Link
              to="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FB8500] hover:bg-[#e07500] text-white px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all"
            >
              <span>View All on Catalog Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
