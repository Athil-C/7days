import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import CategoryCarousel from './CategoryCarousel';
import { SHOWCASE_CATEGORIES } from '../data/categories';
import { createWhatsAppUrl, SHOP_FULL_NAME } from '../data/config';

export default function CategoriesSection() {
  const navigate = useNavigate();
  // Default active is "battery-jeep" matching the user's reference mockup
  const [activeCategory, setActiveCategory] = useState(
    SHOWCASE_CATEGORIES.find(c => c.isDefaultActive) || SHOWCASE_CATEGORIES[0]
  );

  const handleSelectCategory = (category) => {
    setActiveCategory(category);
  };

  const handleBrowseCategory = () => {
    if (activeCategory.id === 'all') {
      navigate('/products');
    } else {
      navigate(`/products?catId=${encodeURIComponent(activeCategory.id)}`);
    }
  };

  return (
    <section id="categories" className="py-12 sm:py-20 bg-gradient-to-b from-[#FFFDF9] via-white to-[#FFFDF9] border-y border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Category Carousel with Navigation Arrows */}
        <CategoryCarousel
          selectedId={activeCategory?.id}
          onSelectCategory={handleSelectCategory}
          title="Shop Toys & Baby Essentials"
          subtitle="Explore by department — battery-operated jeeps, kids cycles, study tables, tricycles and more."
          showHeading={true}
          actionButton={
            <Link
              to="/categories"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#FB8500] hover:text-[#d46f00] group"
            >
              <span>All Categories A–Z</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          }
        />

        {/* Selected Category Action Bar */}
        {activeCategory && (
          <div 
            className="mt-6 sm:mt-8 p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-black/5 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-shadow"
            style={{ backgroundColor: activeCategory.bgColor }}
          >
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-1">
                <span 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: activeCategory.accentColor }} 
                />
                <span className="text-xs font-bold uppercase tracking-wider text-[#546E7A]">
                  Selected Category
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#1E293B] font-heading">
                {activeCategory.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] mt-1">
                {activeCategory.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={handleBrowseCategory}
                type="button"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold text-white shadow-xs transition-all duration-200 hover:scale-102 active:scale-98 cursor-pointer"
                style={{ backgroundColor: activeCategory.accentColor || '#FB8500' }}
              >
                <span>Browse {activeCategory.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={createWhatsAppUrl(`Hi ${SHOP_FULL_NAME}, I'm inquiring about available models and stock for ${activeCategory.name} in your Mananthavady store.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xs transition-all duration-200 hover:scale-102"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span className="hidden sm:inline">Ask on WhatsApp</span>
                <span className="sm:hidden">WhatsApp</span>
              </a>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
