import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sparkles, MessageCircle, X, RefreshCw, Coins } from 'lucide-react';
import { products, PRODUCT_CATEGORIES } from '../data/products';
import { BUDGET_TIERS } from '../data/shoppingConfig';
import { searchProducts, filterProductsByBudget, parseSearchIntent } from '../utils/shoppingEngine';
import ProductCard from '../components/ProductCard';
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

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const budgetFromUrl = searchParams.get('budget');
  
  const selectedCategory = categoryFromUrl && PRODUCT_CATEGORIES.includes(categoryFromUrl) ? categoryFromUrl : 'All';
  const selectedBudget = budgetFromUrl || 'all';
  const [searchQuery, setSearchQuery] = useState('');

  const pageTitle = selectedCategory === 'All' 
    ? 'Products | 7Days Toys & Babyshop' 
    : `${selectedCategory} Products | 7Days Toys & Babyshop`;

  usePageSEO({
    title: pageTitle,
    description: "Browse toys, cycles, baby trikes, study tables, and gifts at 7Days Toys & Babyshop in Payod, Mananthavady, Wayanad. Check in-store availability.",
    canonicalPath: '/products'
  });

  const handleCategoryChange = (cat) => {
    const nextParams = new URLSearchParams(searchParams);
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

  // Detect any intent from the search query (e.g. "birthday gift under 1000 for 5 year old")
  const detectedIntent = useMemo(() => {
    return parseSearchIntent(searchQuery);
  }, [searchQuery]);

  // Combined client-side filtering: Search + Category + Budget
  const filteredProducts = useMemo(() => {
    // 1. Search filter with semantic synonym interpretation
    let result = searchProducts(products, searchQuery);

    // If query had a detected budget and user didn't explicitly override budget filter, apply it
    if (detectedIntent.budget && selectedBudget === 'all') {
      result = filterProductsByBudget(result, detectedIntent.budget);
    }

    // 2. Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(item => item.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 3. Explicit Budget filter
    if (selectedBudget !== 'all') {
      result = filterProductsByBudget(result, selectedBudget);
    }

    return result;
  }, [searchQuery, selectedCategory, selectedBudget, detectedIntent.budget]);

  const clearFilters = () => {
    setSearchQuery('');
    setSearchParams({});
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

        {/* Filter and Search Bar Container */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl card-shadow border border-black/5 mb-10">
          
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
              Showing <span className="text-[#263238] font-bold">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'item' : 'items'}
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

          {/* Category Filter Pills */}
          <div className="mb-4">
            <span className="text-xs font-bold text-[#546E7A] uppercase tracking-wider block mb-2">Category:</span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {PRODUCT_CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      active
                        ? 'bg-[#FB8500] text-white shadow-xs scale-102'
                        : 'bg-[#FFF9F0] text-[#263238] hover:bg-black/5 border border-black/5'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

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

        {/* Product Grid Area */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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


