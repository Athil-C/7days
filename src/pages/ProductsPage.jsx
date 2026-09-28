import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sparkles, MessageCircle, X, RefreshCw } from 'lucide-react';
import { products, PRODUCT_CATEGORIES } from '../data/products';
import ProductCard from '../components/ProductCard';
import { createWhatsAppUrl, SHOP_FULL_NAME } from '../data/config';
import { usePageSEO } from '../hooks/usePageSEO';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const selectedCategory = categoryFromUrl && PRODUCT_CATEGORIES.includes(categoryFromUrl) ? categoryFromUrl : 'All';
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
    if (cat === 'All') {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('category');
      setSearchParams(nextParams);
    } else {
      setSearchParams({ category: cat });
    }
  };

  // Client-side filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Category match
      const matchesCategory =
        selectedCategory === 'All' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      // Search match
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        item.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

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
          
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 text-[#546E7A] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
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

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {PRODUCT_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-[#FB8500] text-white shadow-sm scale-102'
                      : 'bg-[#FFF9F0] text-[#263238] hover:bg-black/5 border border-black/5'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
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
              No matching products found
            </h3>
            <p className="text-xs sm:text-sm text-[#546E7A] mb-6">
              We couldn't find anything matching your search. Can't find what you need? Ask us directly on WhatsApp!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={clearFilters}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFF9F0] hover:bg-black/5 text-[#263238] border border-black/10 px-5 py-2.5 rounded-full text-xs font-bold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>

              <a
                href={createWhatsAppUrl(`Hi ${SHOP_FULL_NAME}, I was searching for "${searchQuery}" on your website, do you have it in stock?`)}
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
              We frequently receive new toys and baby arrivals in our Payod shop. Send us a message!
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
