import React, { useState } from 'react';
import { 
  Bell, 
  MessageCircle, 
  PhoneCall, 
  Wrench, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  X
} from 'lucide-react';
import { storeUpdates } from '../data/updates';
import { SHOP_FULL_NAME, SHOP_PHONE_CALL, SHOP_PHONE_DISPLAY, createWhatsAppUrl } from '../data/config';

export default function UpdatesSection() {
  const [lightboxImage, setLightboxImage] = useState(null);

  if (!storeUpdates || storeUpdates.length === 0) return null;

  return (
    <section id="updates" className="py-12 sm:py-16 bg-gradient-to-b from-[#FFFDF9] via-white to-[#FFF9F0] border-y border-amber-900/5 relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-10 right-5 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-5 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider mb-2.5">
              <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping"></span>
              <Bell className="w-3.5 h-3.5" />
              <span>Latest Store Updates & News</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#263238] font-heading tracking-tight">
              What's New at {SHOP_FULL_NAME}
            </h2>
            
            <p className="text-[#546E7A] text-sm sm:text-base mt-1.5 max-w-2xl">
              Stay informed about our latest service expansions, spare parts availability, and special notices.
            </p>
          </div>

          <div className="mt-3 md:mt-0 flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs">
              Updated Regularly
            </span>
          </div>
        </div>

        {/* Updates List / Cards */}
        <div className="space-y-8">
          {storeUpdates.map((update) => (
            <div
              key={update.id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Top Meta Bar: Separated Above the Poster (So poster is 100% visible on mobile) */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-3 bg-gray-50/90 border-b border-gray-200/80">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold text-white bg-red-600 shadow-2xs flex items-center gap-1.5">
                    <Wrench className="w-3 h-3" />
                    <span>{update.badge || "Store Notice"}</span>
                  </span>
                  {update.date && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-gray-700 bg-white border border-gray-200 shadow-2xs flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>{update.date}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Poster Container - 100% Uncovered & Fully Responsive */}
              <div 
                onClick={() => setLightboxImage(update.bannerImage)}
                className="relative w-full bg-neutral-900/5 cursor-pointer overflow-hidden border-b border-gray-200/80 flex items-center justify-center p-1 sm:p-2"
              >
                <img
                  src={update.bannerImage}
                  alt={update.title}
                  className="w-full h-auto object-contain max-h-[460px] rounded-lg"
                  loading="eager"
                />
              </div>

              {/* Card Details & Action Row */}
              <div className="p-5 sm:p-7 lg:p-9">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                  
                  {/* Left Column: Titles & Description */}
                  <div className="lg:col-span-7">
                    {update.titleMalayalam && (
                      <h4 className="text-base sm:text-xl font-bold text-red-700 leading-snug mb-2 font-heading">
                        {update.titleMalayalam}
                      </h4>
                    )}

                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#263238] leading-tight mb-3 font-heading">
                      {update.title}
                    </h3>

                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-5 font-normal">
                      {update.description}
                    </p>

                    {/* Bullet Highlights */}
                    {update.highlights && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
                        {update.highlights.map((highlight, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Instant Contact & Action Card */}
                  <div className="lg:col-span-5 bg-gradient-to-br from-amber-50/70 to-red-50/50 p-5 sm:p-6 rounded-2xl border border-amber-200/70 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                        <ShieldCheck className="w-4 h-4 text-red-600" />
                        <span>Available at Payod Showroom</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                        Bring your kids' electric vehicles or gear cycles for inspection, or contact our support desk for spare parts pricing.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <a
                        href={createWhatsAppUrl(update.whatsappMessage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-5 py-3 rounded-xl font-bold text-sm shadow-xs hover:shadow transition-all"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>Inquire on WhatsApp</span>
                      </a>

                      <a
                        href={`tel:${SHOP_PHONE_CALL}`}
                        className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-2xs hover:shadow-xs transition-all"
                      >
                        <PhoneCall className="w-4 h-4 text-[#FB8500]" />
                        <span>Call Service Desk: {SHOP_PHONE_DISPLAY}</span>
                      </a>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Full-Screen Poster Lightbox Modal (for Mobile & Desktop) */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fadeIn cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-5xl w-full bg-white rounded-2xl p-2 sm:p-3 shadow-2xl overflow-hidden cursor-default"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
              aria-label="Close poster view"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={lightboxImage}
              alt="Full Size Service Poster"
              className="w-full h-auto object-contain rounded-xl max-h-[85vh]"
            />

            <div className="p-3 text-center">
              <p className="text-xs text-gray-500 font-medium">
                7Days Toys & Babyshop • Payod, Mananthavady • Ph: {SHOP_PHONE_DISPLAY}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
