import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';
import { products } from '../data/products';
import ProductCard from './ProductCard';

export default function FeaturedProducts() {
  // Show featured products or top 8 products
  const featuredList = products.filter(p => p.isFeatured).slice(0, 8);

  return (
    <section className="py-14 sm:py-20 bg-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FB8500]/15 text-[#FB8500] text-xs font-bold uppercase tracking-wider mb-2">
              <Heart className="w-3.5 h-3.5 fill-[#FB8500]" />
              <span>Handpicked For You</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#263238] font-heading tracking-tight">
              Little Favorites
            </h2>
            <p className="text-[#546E7A] text-sm sm:text-base mt-2 max-w-xl">
              Some of the things our little customers love.
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-white hover:bg-amber-50/50 border border-black/10 px-5 py-2.5 rounded-full text-sm font-bold text-[#263238] shadow-xs hover:shadow transition-all group"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4 text-[#FB8500] transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Responsive Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredList.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
}
