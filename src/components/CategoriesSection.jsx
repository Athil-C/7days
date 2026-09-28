import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { categoriesData } from '../data/categories';

export default function CategoriesSection() {
  return (
    <section id="categories" className="py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB703]/20 text-[#FB8500] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore by Category</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#263238] font-heading tracking-tight">
              Shop Toys &amp; Baby Essentials
            </h2>
            <p className="text-[#546E7A] text-sm sm:text-base mt-2 max-w-xl">
              Find something wonderful — everything little ones love, all in one place.
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <Link
              to="/categories"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#FB8500] hover:text-[#d46f00] group"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Categories Grid (Responsive 2-column on mobile, 3-column on desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6">
          {categoriesData.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${encodeURIComponent(category.filterKey)}`}
              className="group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden card-shadow card-hover border border-black/5 flex flex-col focus:outline-none"
            >
              {/* Category Image Area */}
              <div className="relative aspect-[4/3] overflow-hidden bg-amber-50/50">
                <img
                  src={category.image}
                  alt={`${category.name} at 7Days Toys & Babyshop`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-6 flex flex-col flex-1 justify-between bg-white">
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-[#263238] font-heading group-hover:text-[#FB8500] transition-colors leading-snug">
                    {category.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#546E7A] mt-1 line-clamp-2 leading-relaxed">
                    {category.description}
                  </p>
                </div>

                <div className="pt-3.5 mt-2 flex items-center justify-between border-t border-black/5">
                  <span className="text-[11px] sm:text-xs font-semibold text-[#FB8500]">
                    Browse Items
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FFB703]/20 flex items-center justify-center text-[#263238] group-hover:bg-[#FB8500] group-hover:text-white transition-colors duration-300">
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
