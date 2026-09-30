import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { SHOP_FULL_NAME, SHOP_ADDRESS } from '../data/config';

export default function StoreGallery() {
  const photos = [
    {
      src: '/store/store-toys-shelves.png',
      alt: 'Toy shelves and board games display inside 7Days showroom',
      caption: 'Toy & Games Aisles',
      tag: 'Wide Selection'
    },
    {
      src: '/store/store-front-cycles.png',
      alt: 'Kids bicycles, mountain bikes and trikes display at 7Days',
      caption: 'Bicycles & Ride-ons',
      tag: 'Cycles'
    },
    {
      src: '/store/store-dolls-babycare.png',
      alt: 'Baby care essentials and doll collections at 7Days Toys & Babyshop',
      caption: 'Baby Care & Dolls',
      tag: 'Infant Essentials'
    },
    {
      src: '/store/store-diecast-cars.png',
      alt: 'Die-cast metal cars and RC vehicles shelf at 7Days',
      caption: 'Die-Cast & Action',
      tag: 'Vehicles'
    }
  ];

  return (
    <section id="store-gallery" className="py-14 sm:py-20 bg-white/60 border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6A994E]/15 text-[#6A994E] text-xs font-bold uppercase tracking-wider mb-2.5">
            <Camera className="w-3.5 h-3.5" />
            <span>Payod Showroom Tour</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#263238] font-heading tracking-tight">
            See the Real 7Days Store
          </h2>
          <p className="text-[#546E7A] text-sm sm:text-base mt-2">
            Thousands of little things, all under one roof in Payod, Mananthavady.
          </p>
        </div>

        {/* Gallery Grid: 1 large featured + 3 smaller grid items */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 mb-10">
          
          {/* Main Large Featured Photo */}
          <div className="md:col-span-7 group relative rounded-3xl overflow-hidden card-shadow border border-black/5 bg-white min-h-[300px] sm:min-h-[420px]">
            <img
              src={photos[0].src}
              alt={photos[0].alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            
            <div className="absolute top-4 left-4">
              <span className="text-[11px] font-extrabold bg-[#FB8500] text-white px-3 py-1 rounded-full shadow-xs tracking-wide uppercase inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Featured Display
              </span>
            </div>

            <div className="absolute bottom-5 left-5 right-5 text-white">
              <p className="text-lg sm:text-2xl font-extrabold font-heading">
                {photos[0].caption}
              </p>
              <p className="text-xs sm:text-sm text-white/80 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FFB703]" />
                <span>{SHOP_FULL_NAME} — {SHOP_ADDRESS.short}</span>
              </p>
            </div>
          </div>

          {/* Right Column with 3 Sub Photos */}
          <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 sm:gap-6">
            {photos.slice(1).map((photo, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl overflow-hidden card-shadow border border-black/5 bg-white h-[180px] sm:h-[195px]"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent"></div>
                
                <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold font-heading">{photo.caption}</p>
                    <span className="text-[10px] text-white/80">{photo.tag}</span>
                  </div>
                  <span className="text-[10px] bg-white/25 backdrop-blur-xs text-white px-2 py-0.5 rounded-md font-semibold">
                    In Store
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            to="/about"
            className="inline-flex items-center gap-2 bg-[#263238] hover:bg-[#37474F] text-white px-6 py-3 rounded-full text-sm font-bold shadow-xs hover:shadow transition-all"
          >
            <span>Explore Our Store</span>
            <ArrowRight className="w-4 h-4 text-[#FFB703]" />
          </Link>

          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-[#FB8500] hover:bg-[#e07500] text-white px-6 py-3 rounded-full text-sm font-bold shadow-xs hover:shadow transition-all"
          >
            <span>Visit 7Days</span>
            <MapPin className="w-4 h-4 text-white" />
          </Link>
        </div>

      </div>
    </section>
  );
}
