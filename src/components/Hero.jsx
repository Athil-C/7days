import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';
import { SHOP_FULL_NAME, SHOP_ADDRESS, createWhatsAppUrl } from '../data/config';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-6 pb-12 md:py-16 lg:py-20">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-10 w-96 h-96 bg-[#FFB703]/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#219EBC]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-[#FB8500]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#FFB703]/30 shadow-xs mb-5">
              <span className="flex h-2 w-2 rounded-full bg-[#FB8500] animate-pulse"></span>
              <span className="text-[11px] sm:text-xs font-bold tracking-widest text-[#FB8500] uppercase">
                YOUR HAPPY PLACE FOR KIDS
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#FFB703]" />
            </div>

            {/* Large Heading with Business Name + Slogan */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#263238] leading-[1.1] tracking-tight font-heading mb-4">
              <span className="block text-2xl sm:text-3xl lg:text-4xl text-[#263238] font-bold mb-1.5 tracking-tight">
                7Days Toys &amp; Babyshop
              </span>
              <span>
                Little Things. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB8500] via-[#FFB703] to-[#FB8500]">
                  Big Smiles.
                </span>
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-[#546E7A] leading-relaxed max-w-xl mb-4 font-normal">
              Discover toys, baby essentials, gifts and kids' products at <span className="font-semibold text-[#263238]">{SHOP_FULL_NAME}</span> in Payod, Mananthavady, Wayanad.
            </p>

            {/* Location Text */}
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#263238] bg-[#FFB703]/15 px-3 py-1.5 rounded-xl mb-7">
              <MapPin className="w-4 h-4 text-[#FB8500] shrink-0" />
              <span>📍 {SHOP_ADDRESS.short}</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
              <Link
                to="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FB8500] hover:bg-[#e07500] text-white px-7 py-3.5 rounded-full font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={createWhatsAppUrl(`Hi ${SHOP_FULL_NAME}, I'd like to ask about available products in your store!`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-[#25D366] border border-[#25D366]/30 px-6 py-3.5 rounded-full font-bold text-sm sm:text-base shadow-sm hover:shadow transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5 fill-[#25D366] text-white" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Trust Mini Counter */}
            <div className="mt-8 pt-6 border-t border-[#263238]/10 flex items-center gap-6 text-xs text-[#546E7A]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6A994E]"></span>
                <span>Open for Local Visits</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#219EBC]"></span>
                <span>Direct WhatsApp Inquiries</span>
              </div>
            </div>
          </div>

          {/* Right Product Collage without outer floating badges */}
          <div className="lg:col-span-6 relative mt-4 lg:mt-0">
            {/* Visual Collage Grid */}
            <div className="grid grid-cols-12 gap-3 sm:gap-4 p-2 sm:p-4 rounded-3xl bg-white/60 backdrop-blur-xs border border-white/80 shadow-lg">
              
              {/* Main Feature: Kids Sport Bicycle */}
              <div className="col-span-7 relative rounded-2xl overflow-hidden shadow-sm group aspect-[4/5] bg-white">
                <img
                  src="/products/kids-sport-bicycle.jpg"
                  alt="Kids sport bicycle at 7Days Toys & Babyshop"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                  fetchPriority="high"
                  width="400"
                  height="500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FFB703] text-[#263238] px-2 py-0.5 rounded-full inline-block mb-1">
                    Sport Cycles
                  </span>
                  <p className="text-xs sm:text-sm font-bold leading-tight drop-shadow-xs">
                    Kids Bicycles with Basket
                  </p>
                </div>
              </div>

              {/* Right Stack: RC Monster Truck & Panda Swing Car */}
              <div className="col-span-5 flex flex-col gap-3 sm:gap-4">
                
                {/* RC Stunt Car */}
                <div className="relative rounded-2xl overflow-hidden shadow-sm group aspect-[1/1] bg-white">
                  <img
                    src="/products/rc-stunt-car.jpg"
                    alt="RC monster truck at 7Days Toys & Babyshop"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="eager"
                    width="250"
                    height="250"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <span className="text-[9px] font-semibold bg-[#FB8500] text-white px-2 py-0.5 rounded-full">
                      RC Monster Cars
                    </span>
                  </div>
                </div>

                {/* Panda Magic Swing Car */}
                <div className="relative rounded-2xl overflow-hidden shadow-sm group aspect-[1/1] bg-white">
                  <img
                    src="/products/panda-magic-swing-car.jpg"
                    alt="Panda magic swing car at 7Days Toys & Babyshop"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="eager"
                    width="250"
                    height="250"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <span className="text-[9px] font-semibold bg-[#219EBC] text-white px-2 py-0.5 rounded-full">
                      Panda Swing Cars
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Strip: Toy Drones & Baby Tricycles */}
              <div className="col-span-12 grid grid-cols-2 gap-3 sm:gap-4 pt-1">
                
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#FFB703]/20 shadow-xs">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    <img 
                      src="/products/kids-toy-drone.jpg" 
                      alt="Kids toy drone" 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                      width="40"
                      height="40"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-[#263238] truncate">Kids Toy Drones</p>
                    <p className="text-[10px] text-[#546E7A] truncate">LED Flyer with Remote</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#219EBC]/20 shadow-xs">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    <img 
                      src="/products/baby-canopy-tricycle.jpg" 
                      alt="Baby tricycle" 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                      width="40"
                      height="40"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-[#263238] truncate">Baby Tricycles</p>
                    <p className="text-[10px] text-[#546E7A] truncate">Push Handle & Canopy</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
