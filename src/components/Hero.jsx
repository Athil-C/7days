import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight, MapPin } from 'lucide-react';
import { SHOP_FULL_NAME, createWhatsAppUrl } from '../data/config';
import { useHeroShowcase } from '../hooks/useHeroShowcase';

export default function Hero() {
  const { slots } = useHeroShowcase();
  const slot1 = slots.find((s) => s.slot === 1) || slots[0];
  const slot2 = slots.find((s) => s.slot === 2) || slots[1];
  const slot3 = slots.find((s) => s.slot === 3) || slots[2];

  return (
    <section className="relative pt-6 sm:pt-8 pb-12 sm:pb-16 bg-[#FFF9F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* ========================================================= */}
          {/* LEFT COLUMN: HERO CONTENT                                */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">

            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF3DF] border border-[#FFE2BA] text-xs font-bold text-[#FF8A00] mb-4 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#FF8A00]" />
              <span className="tracking-wide">YOUR HAPPY PLACE FOR KIDS</span>
            </div>

            {/* Brand Title & Big Headline */}
            <div className="mb-4">
              <p className="text-xl sm:text-2xl font-black text-[#263238] tracking-tight mb-1 font-heading">
                7Days Toys &amp; Babyshop
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-black text-[#263238] leading-[1.08] tracking-tight font-heading">
                Little Things. <br />
                <span className="text-[#FF7A00]">Big Smiles.</span>
              </h1>
            </div>

            {/* Description Paragraph */}
            <p className="text-sm sm:text-base text-[#546E7A] leading-relaxed max-w-lg mb-4 font-normal">
              Discover toys, baby essentials, gifts and kids&apos; products at{' '}
              <strong className="text-[#263238] font-bold">7Days Toys &amp; Babyshop</strong> in Payod,
              Mananthavady, Wayanad.
            </p>

            {/* Location Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF3DF] border border-[#FFE2BA] text-xs font-semibold text-[#263238] mb-6">
              <span className="text-xs font-bold text-[#475569]">Payod, Mananthavady, Wayanad</span>
            </div>

            {/* Call To Action Buttons (Full-width on mobile, side-by-side on desktop) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-6">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 bg-[#FF7A00] hover:bg-[#e66d00] text-white px-8 py-3.5 rounded-full font-black text-sm shadow-md shadow-[#FF7A00]/25 transition-all duration-200 active:scale-95 text-center"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={createWhatsAppUrl(`Hi ${SHOP_FULL_NAME}, I'd like to ask about available products in your store!`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-emerald-50/50 text-[#16a34a] border-2 border-[#22c55e]/60 hover:border-[#22c55e] px-7 py-3.5 rounded-full font-black text-sm shadow-2xs transition-all duration-200 active:scale-95 text-center"
              >
                <MessageCircle className="w-4 h-4 text-[#22c55e] fill-[#22c55e]" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Trust Micro-dots */}
            <div className="flex items-center gap-6 text-xs text-[#546E7A] font-medium flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                <span>Open for Local Visits</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
                <span>Direct WhatsApp Inquiries</span>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: SHOWCASE CARD                               */}
          {/* ========================================================= */}
          <div className="lg:col-span-6">
            <div className="bg-white p-3.5 sm:p-5 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/50">
              <div className="grid grid-cols-12 gap-3.5">

                {/* Slot 1: Large Featured Left */}
                <div className="col-span-7 relative rounded-2xl overflow-hidden bg-slate-100 aspect-[4/4.7] group">
                  <Link
                    to={slot1?.productId ? `/product/${slot1.productId}` : '/products'}
                    className="w-full h-full block relative"
                  >
                    <picture>
                      {slot1?.image && slot1.image.endsWith('.jpg') && (
                        <source srcSet={slot1.image.replace(/\.jpg$/, '.webp')} type="image/webp" />
                      )}
                      <img
                        src={slot1?.image || '/products/baybee/baybee-copster-electric-jeep.jpg'}
                        alt={slot1?.title || 'Featured Hero Product'}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        loading="eager"
                        fetchPriority="high"
                        width="500"
                        height="580"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/products/baybee/baybee-copster-electric-jeep.jpg';
                        }}
                      />
                    </picture>
                    {/* Bottom Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                    {/* Floating Badge & Title */}
                    <div className="absolute bottom-3 left-3 right-3 z-10">
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black bg-[#FFB703] text-black uppercase tracking-wider shadow-xs">
                        {slot1?.tag || 'RIDE-ON JEEPS'}
                      </span>
                      <p className="text-white font-bold text-xs sm:text-sm mt-1 drop-shadow-md truncate">
                        {slot1?.title || 'Electric 4×4 Jeeps with Remote'}
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Right Column: Slot 2 & Slot 3 */}
                <div className="col-span-5 flex flex-col gap-3.5">
                  {/* Slot 2: Top Right */}
                  <div className="flex-1 relative rounded-2xl overflow-hidden bg-slate-100 aspect-[4/3] group">
                    <Link
                      to={slot2?.productId ? `/product/${slot2.productId}` : '/products'}
                      className="w-full h-full block relative"
                    >
                      <picture>
                        {slot2?.image && slot2.image.endsWith('.jpg') && (
                          <source srcSet={slot2.image.replace(/\.jpg$/, '.webp')} type="image/webp" />
                        )}
                        <img
                          src={slot2?.image || '/products/baybee/baybee-velzo-battery-bike.jpg'}
                          alt={slot2?.title || 'Hero product 2'}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          loading="lazy"
                          decoding="async"
                          width="300"
                          height="225"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/products/baybee/baybee-velzo-battery-bike.jpg';
                          }}
                        />
                      </picture>
                      <div className="absolute bottom-2 left-2 z-10">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[9px] font-black bg-[#FF7A00] text-white shadow-xs">
                          {slot2?.tag || 'Electric Bikes'}
                        </span>
                      </div>
                    </Link>
                  </div>

                  {/* Slot 3: Bottom Right */}
                  <div className="flex-1 relative rounded-2xl overflow-hidden bg-slate-100 aspect-[4/3] group">
                    <Link
                      to={slot3?.productId ? `/product/${slot3.productId}` : '/products'}
                      className="w-full h-full block relative"
                    >
                      <picture>
                        {slot3?.image && slot3.image.endsWith('.jpg') && (
                          <source srcSet={slot3.image.replace(/\.jpg$/, '.webp')} type="image/webp" />
                        )}
                        <img
                          src={slot3?.image || '/products/baybee/baybee-magic-twister-swing-car.jpg'}
                          alt={slot3?.title || 'Hero product 3'}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          loading="lazy"
                          decoding="async"
                          width="300"
                          height="225"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/products/baybee/baybee-magic-twister-swing-car.jpg';
                          }}
                        />
                      </picture>
                      <div className="absolute bottom-2 left-2 z-10">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[9px] font-black bg-[#0284c7] text-white shadow-xs">
                          {slot3?.tag || 'Magic Swing Cars'}
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Bottom Strip: Study Desks & Baby Tricycles */}
                <div className="col-span-12 grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <Link
                    to="/products?category=Education"
                    className="flex items-center gap-2.5 p-2 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 shadow-2xs transition group"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100 group-hover:scale-105 transition">
                      <img
                        src="/products/baybee/baybee-convertible-study-table.jpg"
                        alt="Study Desks"
                        className="w-full h-full object-contain p-0.5"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#263238] truncate group-hover:text-[#FF7A00] transition">
                        Study Desks
                      </p>
                      <p className="text-[10px] text-[#546E7A] truncate">
                        Ergonomic Table &amp; Chair
                      </p>
                    </div>
                  </Link>

                  <Link
                    to="/products?category=Bicycles"
                    className="flex items-center gap-2.5 p-2 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 shadow-2xs transition group"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100 group-hover:scale-105 transition">
                      <img
                        src="/products/baybee/baybee-nova-baby-tricycle.jpg"
                        alt="Baby Tricycles"
                        className="w-full h-full object-contain p-0.5"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#263238] truncate group-hover:text-[#FF7A00] transition">
                        Baby Tricycles
                      </p>
                      <p className="text-[10px] text-[#546E7A] truncate">
                        Parent Push &amp; Canopy
                      </p>
                    </div>
                  </Link>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
