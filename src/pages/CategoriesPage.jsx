import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, MessageCircle } from 'lucide-react';
import { categoriesData } from '../data/categories';
import { SHOP_FULL_NAME, createWhatsAppUrl } from '../data/config';
import { usePageSEO } from '../hooks/usePageSEO';

export default function CategoriesPage() {
  usePageSEO({
    title: 'Toy & Baby Product Categories | 7Days Toys & Babyshop',
    description: "Explore toy and baby product categories at 7Days Toys & Babyshop in Mananthavady, Wayanad. From RC cars to baby gear and school essentials.",
    canonicalPath: '/categories'
  });

  return (
    <main className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB703]/20 text-[#FB8500] text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Store Aisles &amp; Departments</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#263238] font-heading tracking-tight mb-3">
            Toy &amp; Baby Product Categories
          </h1>
          <p className="text-[#546E7A] text-sm sm:text-base leading-relaxed">
            Discover all collections available at {SHOP_FULL_NAME} in Payod, Mananthavady. Select any category to view our verified products or inquire directly on WhatsApp.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {categoriesData.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${encodeURIComponent(category.filterKey)}`}
              className="group relative bg-white rounded-3xl overflow-hidden card-shadow card-hover border border-black/5 flex flex-col focus:outline-none transition-all duration-300"
            >
              {/* Category Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-amber-50/50">
                <img
                  src={category.image}
                  alt={`${category.name} collection at 7Days Toys & Babyshop`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  width="400"
                  height="300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                
                {/* Count Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs text-[#263238] text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                  {category.count}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-1 justify-between bg-white">
                <div>
                  <h2 className="text-xl font-bold text-[#263238] font-heading group-hover:text-[#FB8500] transition-colors leading-snug">
                    {category.name}
                  </h2>
                  <p className="text-sm text-[#546E7A] mt-2 line-clamp-2 leading-relaxed">
                    {category.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 flex items-center justify-between border-t border-black/5">
                  <span className="text-xs font-bold text-[#FB8500] group-hover:underline">
                    Explore {category.name}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#FFB703]/20 flex items-center justify-center text-[#263238] group-hover:bg-[#FB8500] group-hover:text-white transition-colors duration-300">
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Catalog CTA Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/70 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#263238] font-heading mb-1.5">
              Looking for our complete catalog?
            </h2>
            <p className="text-sm text-[#546E7A]">
              View all products across all categories in one place, or chat with our team on WhatsApp for custom requests.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-[#FB8500] hover:bg-[#e07500] text-white px-6 py-3 rounded-full text-sm font-bold shadow-xs transition-colors"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={createWhatsAppUrl(`Hi ${SHOP_FULL_NAME}, I'd like to ask about category availability in your shop!`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-5 py-3 rounded-full text-sm font-bold shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Ask on WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </main>
  );
}
