import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, ArrowRight } from 'lucide-react';
import { SHOP_FULL_NAME, SHOP_ADDRESS } from '../data/config';

export default function AboutSection() {
  return (
    <section id="about" className="py-14 sm:py-20 bg-white/50 border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left: Store Showcase Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden card-shadow border-4 border-white aspect-[4/3] sm:aspect-[16/11]">
              <img
                src="/store/store-front-cycles.png"
                alt="7Days Toys & Babyshop Store Showcase in Payod"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              
              {/* Overlay Badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl flex items-center justify-between border border-black/5">
                <div>
                  <p className="text-xs font-bold text-[#263238]">{SHOP_FULL_NAME}</p>
                  <p className="text-[11px] text-[#546E7A] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#FB8500]" />
                    {SHOP_ADDRESS.short}
                  </p>
                </div>
                <span className="text-[10px] font-bold bg-[#6A994E]/15 text-[#6A994E] px-2.5 py-1 rounded-full">
                  Local Store
                </span>
              </div>
            </div>

            {/* Decorative Floating Accent */}
            <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] -z-10 hidden sm:block rotate-6"></div>
          </div>

          {/* Right: Content */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FB8500]/15 text-[#FB8500] text-xs font-bold uppercase tracking-wider mb-3">
              <Heart className="w-3.5 h-3.5 fill-[#FB8500]" />
              <span>ABOUT 7DAYS</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#263238] font-heading tracking-tight leading-tight mb-5">
              Made for Little Moments.
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[#546E7A] leading-relaxed">
              <p>
                <strong className="text-[#263238]">{SHOP_FULL_NAME}</strong> is a local destination for toys, baby essentials, gifts and kids' products in Payod, Mananthavady.
              </p>
              <p>
                Whether you're looking for something fun for your little one, a thoughtful gift, or everyday baby essentials, drop by 7Days.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-[#263238] hover:bg-[#37474F] text-white px-7 py-3.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200"
              >
                <span>Visit Our Store</span>
                <ArrowRight className="w-4 h-4 text-[#FFB703]" />
              </Link>

              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#FB8500] hover:text-[#d46f00] px-4 py-2"
              >
                <span>Browse Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
