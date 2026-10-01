import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sparkles, MessageCircle, X, RefreshCw, Coins, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { products, PRODUCT_CATEGORIES } from '../data/products';
import { SHOWCASE_CATEGORIES, isProductInShowcaseCategory } from '../data/categories';
import { BUDGET_TIERS } from '../data/shoppingConfig';
import { searchProducts, filterProductsByBudget, parseSearchIntent } from '../utils/shoppingEngine';
import ProductCard from '../components/ProductCard';
import CategoryCarousel from '../components/CategoryCarousel';
import { createWhatsAppUrl, SHOP_FULL_NAME } from '../data/config';
import { usePageSEO } from '../hooks/usePageSEO';

const QUICK_SEARCH_CHIPS = [
  'RC car',
  'Sports Bike',
  'Baby Walker',
  'Canopy Trike',
  'Doctor Set',
  'Football',
  'Building Blocks',
  'Guitar'
];

function generatePaginationPages(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, '...', totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const catIdFromUrl = searchParams.get('catId');
  const budgetFromUrl = searchParams.get('budget');
  const resultsRef = useRef(null);
  
  const activeShowcase = useMemo(() => {
    if (catIdFromUrl) {
      return SHOWCASE_CATEGORIES.find(c => c.id === catIdFromUrl) || null;
    }
    return null;
  }, [catIdFromUrl]);

  const selectedCategory = categoryFromUrl && PRODUCT_CATEGORIES.includes(categoryFromUrl) ? categoryFromUrl : 'All';
  const selectedBudget = budgetFromUrl || 'all';
  const [searchQuery, setSearchQuery] = useState('');

  const pageTitle = activeShowcase 
    ? `${activeShowcase.name} | 7Days Toys & Babyshop`
    : selectedCategory === 'All' 
      ? 'Products | 7Days Toys & Babyshop' 
      : `${selectedCategory} Products | 7Days Toys & Babyshop`;

  usePageSEO({
    title: pageTitle,
    description: "Browse toys, cycles, baby trikes, study tables, and gifts at 7Days Toys & Babyshop in Payod, Mananthavady, Wayanad. Check in-store availability.",
    canonicalPath: '/products'
  });

  const handleShowcaseSelect = (cat) => {
    const nextParams = new URLSearchParams(searchParams);
    if (cat.id === 'all' || catIdFromUrl === cat.id) {
      nextParams.delete('catId');
    } else {
      nextParams.set('catId', cat.id);
      // Remove generic category override to prevent conflicts
      nextParams.delete('category');
    }
    setSearchParams(nextParams);

    // Smoothly scroll down so user immediately sees filtered products
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleCategoryChange = (cat) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('catId');
    if (cat === 'All') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', cat);
    }
    setSearchParams(nextParams);
  };

  const handleBudgetChange = (tierId) => {
    const nextParams = new URLSearchParams(searchParams);
    if (tierId === 'all') {
      nextParams.delete('budget');
    } else {
      nextParams.set('budget', tierId);
    }
    setSearchParams(nextParams);
  };

  // Detect any intent from the search query (e.g. "birthday gift under 1000 for a 5 year old")
  const detectedIntent = useMemo(() => {
    return parseSearchIntent(searchQuery);
  }, [searchQuery]);

  // Combined client-side filtering: Search + Category / Showcase + Budget
  const filteredProducts = useMemo(() => {
    // 1. Start with full products list or search filter
    let result = searchQuery ? searchProducts(products, searchQuery) : [...products];

    // 2. Showcase Category filter if selected (e.g. 'battery-jeep', 'study-table')
    if (activeShowcase && activeShowcase.id !== 'all') {
      result = result.filter(item => isProductInShowcaseCategory(item, activeShowcase.id));
    } else if (selectedCategory !== 'All') {
      // 3. Fallback standard category filter
      result = result.filter(item => item.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 4. If query had a detected budget and user didn't explicitly override budget filter, apply it
    if (detectedIntent.budget && selectedBudget === 'all') {
      result = filterProductsByBudget(result, detectedIntent.budget);
    }

    // 5. Explicit Budget filter
    if (selectedBudget !== 'all') {
      result = filterProductsByBudget(result, selectedBudget);
    }

    return result;
  }, [searchQuery, activeShowcase, selectedCategory, selectedBudget, detectedIntent.budget]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

  // Reset page to 1 when filters or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, catIdFromUrl, categoryFromUrl, budgetFromUrl]);

  const totalItems = filteredProducts.length;
  const isAll = pageSize === 'all';
  const currentPerPage = isAll ? totalItems : Number(pageSize);
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalItems / currentPerPage));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedProducts = useMemo(() => {
    if (isAll) return filteredProducts;
    const start = (safePage - 1) * currentPerPage;
    return filteredProducts.slice(start, start + currentPerPage);
  }, [filteredProducts, isAll, safePage, currentPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSearchParams({});
    setCurrentPage(1);
  };

  return (
    <main className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB703]/20 text-[#FB8500] text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#263238] font-heading tracking-tight mb-3">
            {selectedCategory === 'All' ? 'Products | 7Days Toys & Babyshop' : `${selectedCategory} - 7Days Toys & Babyshop`}
          </h1>
          <p className="text-[#546E7A] text-sm sm:text-base leading-relaxed">
            Browse our handpicked toys, baby care items, school accessories, and heartwarming gifts in Payod, Mananthavady. Ask us anytime on WhatsApp for availability!
          </p>
        </div>

        {/* Visual Category Showcase Carousel */}
        <div className="mb-6">
          <CategoryCarousel
            selectedId={activeShowcase ? activeShowcase.id : (selectedCategory === 'All' ? 'all' : null)}
            onSelectCategory={handleShowcaseSelect}
            title="Browse by Category"
            subtitle="Click any category to filter catalog items instantly"
            showHeading={false}
          />
        </div>

        {/* Filter and Search Bar Container */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl card-shadow border border-black/5 mb-8">
          
          {/* Search Input Row */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 text-[#546E7A] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, category, or keyword (e.g. 'RC car', 'walker')..."
                className="w-full pl-11 pr-10 py-3 rounded-full bg-[#FFF9F0] border border-black/10 focus:border-[#FB8500] focus:ring-2 focus:ring-[#FB8500]/20 focus:outline-none text-sm font-medium transition-all"
                aria-label="Search products"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Results count info */}
            <div className="text-xs sm:text-sm font-semibold text-[#546E7A] self-start md:self-center">
              Showing <span className="text-[#263238] font-bold">
                {totalItems === 0 ? 0 : isAll ? `All ${totalItems}` : `${(safePage - 1) * currentPerPage + 1}–${Math.min(safePage * currentPerPage, totalItems)}`}
              </span> of <span className="text-[#263238] font-bold">{totalItems}</span> products
            </div>
          </div>

          {/* Quick search chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-4 border-b border-black/5">
            <span className="text-[11px] font-bold text-[#546E7A] whitespace-nowrap mr-1">Popular:</span>
            {QUICK_SEARCH_CHIPS.map(chip => (
              <button
                key={chip}
                onClick={() => setSearchQuery(chip)}
                type="button"
                className="px-2.5 py-1 rounded-full bg-[#FFF9F0] hover:bg-black/5 text-[#546E7A] text-[11px] font-medium whitespace-nowrap border border-black/5 transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Active Filter summary pill if filtered */}
          {(activeShowcase || selectedCategory !== 'All' || searchQuery || selectedBudget !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 mb-4 p-2.5 bg-[#FFF9F0] rounded-2xl border border-black/5">
              <span className="text-xs font-bold text-[#546E7A] flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-[#FB8500]" />
                Active Filters:
              </span>

              {activeShowcase && (
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#1E293B] shadow-2xs"
                  style={{ backgroundColor: activeShowcase.activeBg }}
                >
                  <span>Category: {activeShowcase.name}</span>
                  <button 
                    onClick={() => handleShowcaseSelect({ id: 'all' })}
                    className="hover:opacity-75 cursor-pointer ml-0.5"
                    aria-label="Remove category filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {!activeShowcase && selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FB8500] text-white text-xs font-bold shadow-2xs">
                  <span>Department: {selectedCategory}</span>
                  <button 
                    onClick={() => handleCategoryChange('All')}
                    className="hover:opacity-75 cursor-pointer ml-0.5"
                    aria-label="Remove department filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedBudget !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6A994E] text-white text-xs font-bold shadow-2xs">
                  <span>Budget: {BUDGET_TIERS.find(t => t.id === selectedBudget)?.label}</span>
                  <button 
                    onClick={() => handleBudgetChange('all')}
                    className="hover:opacity-75 cursor-pointer ml-0.5"
                    aria-label="Remove budget filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/10 text-[#263238] text-xs font-bold shadow-2xs">
                  <span>Keyword: "{searchQuery}"</span>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="hover:opacity-75 cursor-pointer ml-0.5"
                    aria-label="Remove keyword search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={clearFilters}
                className="text-xs font-bold text-[#FB8500] hover:underline ml-auto cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Budget Filter Pills */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Coins className="w-3.5 h-3.5 text-[#6A994E]" />
              <span className="text-xs font-bold text-[#546E7A] uppercase tracking-wider">Shop by Budget:</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => handleBudgetChange('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedBudget === 'all'
                    ? 'bg-[#6A994E] text-white shadow-xs'
                    : 'bg-[#FFF9F0] text-[#263238] hover:bg-black/5 border border-black/5'
                }`}
              >
                All Budgets
              </button>
              {BUDGET_TIERS.map(tier => {
                const active = selectedBudget === tier.id;
                return (
                  <button
                    key={tier.id}
                    onClick={() => handleBudgetChange(tier.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      active
                        ? 'bg-[#6A994E] text-white shadow-xs'
                        : 'bg-[#FFF9F0] text-[#263238] hover:bg-black/5 border border-black/5'
                    }`}
                  >
                    {tier.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Scroll Anchor */}
        <div ref={resultsRef} className="scroll-mt-6" />

        {/* Product Grid Area */}
        {paginatedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls Bar */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 p-4 sm:p-5 bg-white rounded-3xl border border-black/5 card-shadow">
                {/* Items Per Page Selector */}
                <div className="flex items-center gap-2 text-xs font-semibold text-[#546E7A]">
                  <span>Items per page:</span>
                  <div className="inline-flex rounded-xl border border-black/10 overflow-hidden p-0.5 bg-[#FFF9F0]">
                    {[24, 48, 96, 'all'].map((size) => (
                      <button
                        key={size}
                        onClick={() => handlePageSizeChange(size)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          pageSize === size
                            ? 'bg-[#FB8500] text-white shadow-xs'
                            : 'text-[#546E7A] hover:text-[#263238]'
                        }`}
                      >
                        {size === 'all' ? 'All' : size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Page Navigation Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <button
                    onClick={() => handlePageChange(safePage - 1)}
                    disabled={safePage === 1}
                    aria-label="Previous Page"
                    className={`p-2 rounded-xl border border-black/10 transition-colors flex items-center justify-center ${
                      safePage === 1
                        ? 'opacity-40 cursor-not-allowed text-gray-400 bg-gray-50'
                        : 'text-[#263238] hover:bg-black/5 cursor-pointer bg-white'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {generatePaginationPages(safePage, totalPages).map((p, idx) => {
                    if (p === '...') {
                      return <span key={`ellipsis-${idx}`} className="px-2 text-xs text-gray-400 font-bold">...</span>;
                    }
                    const isActive = p === safePage;
                    return (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`min-w-8 h-8 px-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#263238] text-white shadow-xs'
                            : 'text-[#546E7A] hover:bg-black/5 hover:text-[#263238] border border-black/5'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(safePage + 1)}
                    disabled={safePage === totalPages}
                    aria-label="Next Page"
                    className={`p-2 rounded-xl border border-black/10 transition-colors flex items-center justify-center ${
                      safePage === totalPages
                        ? 'opacity-40 cursor-not-allowed text-gray-400 bg-gray-50'
                        : 'text-[#263238] hover:bg-black/5 cursor-pointer bg-white'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty Search State */
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center card-shadow border border-black/5 max-w-md mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-3xl mx-auto mb-4">
              🧸
            </div>
            <h3 className="text-xl font-bold text-[#263238] font-heading mb-2">
              We couldn't find an exact match
            </h3>
            <p className="text-xs sm:text-sm text-[#546E7A] mb-6">
              We frequently carry additional items in our Payod showroom that may not be displayed online. Ask us directly on WhatsApp or reset filters!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={clearFilters}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFF9F0] hover:bg-black/5 text-[#263238] border border-black/10 px-5 py-2.5 rounded-full text-xs font-bold transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>

              <a
                href={createWhatsAppUrl(`Hi ${SHOP_FULL_NAME}, I was searching for "${searchQuery || 'products'}" on your website, could you confirm what is available in store?`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Ask on WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* Bottom Helper Note for Customers */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-[#FFB703]/15 border border-[#FFB703]/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#263238] font-heading">
              Need something not listed here?
            </h3>
            <p className="text-xs sm:text-sm text-[#546E7A] mt-0.5">
              We receive new toys and baby arrivals regularly at our Payod showroom. Chat with us!
            </p>
          </div>

          <a
            href={createWhatsAppUrl(`Hi ${SHOP_FULL_NAME}, I'm looking for a specific item, can you share what is available?`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#FB8500] hover:bg-[#e07500] text-white px-6 py-3 rounded-full text-sm font-bold shadow-xs shrink-0"
          >
            <MessageCircle className="w-4 h-4 fill-white text-white" />
            <span>Inquire on WhatsApp</span>
          </a>
        </div>

      </div>
    </main>
  );
}


