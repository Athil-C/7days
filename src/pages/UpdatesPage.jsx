import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  MessageCircle, 
  PhoneCall, 
  Wrench, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  X, 
  Sparkles, 
  ArrowRight,
  Store
} from 'lucide-react';
import { useUpdates } from '../hooks/useUpdates';
import { usePageSEO } from '../hooks/usePageSEO';
import { 
  SHOP_FULL_NAME, 
  SHOP_PHONE_CALL, 
  SHOP_PHONE_DISPLAY, 
  SHOP_PHONE_SECONDARY,
  SHOP_PHONE_SECONDARY_CALL,
  createWhatsAppUrl 
} from '../data/config';

export default function UpdatesPage() {
  usePageSEO({
    title: 'Store Announcements & Updates | 7Days Toys & Babyshop',
    description: 'Check out the latest showroom announcements, electric vehicle & cycle repairs, fresh stock arrivals, and notices from 7Days Toys & Babyshop in Payod, Mananthavady.',
    canonicalPath: '/updates'
  });

  const { updates, loading } = useUpdates();
  const [lightboxImage, setLightboxImage] = useState(null);

  return (
    <main className="py-10 sm:py-16 bg-[#FFF9F0] min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FB8500]/15 text-[#FB8500] text-xs font-bold uppercase tracking-wider mb-3">
            <Bell className="w-3.5 h-3.5" />
            <span>Showroom News &amp; Notices</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#263238] font-heading tracking-tight mb-3">
            Store Announcements &amp; Updates
          </h1>

          <p className="text-[#546E7A] text-sm sm:text-base leading-relaxed">
            Stay informed with the latest service expansions, spare parts availability, seasonal offers, and verified notices from our Payod store in Mananthavady, Wayanad.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-black/10 shadow-sm max-w-xl mx-auto">
            <div className="w-10 h-10 border-4 border-[#FB8500] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#546E7A]">Loading store announcements...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && (!updates || updates.length === 0) && (
          <div className="bg-white rounded-3xl p-8 sm:p-14 border border-black/10 shadow-sm text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#FB8500]/10 text-[#FB8500] flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#263238] mb-2 font-heading">
              No Active Announcements Right Now
            </h2>
            <p className="text-sm text-[#546E7A] max-w-md mx-auto mb-6 leading-relaxed">
              We update this page regularly with special discounts, service notices, holiday schedules, and fresh arrival alerts.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={createWhatsAppUrl("Hi 7Days Toys, I'm checking for the latest store offers and arrivals!")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat with Us on WhatsApp</span>
              </a>

              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-[#263238] hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold transition"
              >
                <Store className="w-4 h-4" />
                <span>Browse Products</span>
              </Link>
            </div>
          </div>
        )}

        {/* Updates Grid / Cards */}
        {!loading && updates && updates.length > 0 && (
          <div className="space-y-8 sm:space-y-12">
            {updates.map((update) => (
              <article
                key={update.id}
                className="bg-white rounded-3xl border border-black/10 shadow-sm overflow-hidden transition hover:shadow-md"
              >
                {/* Meta Header Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-8 py-3.5 bg-[#FAF8F5] border-b border-black/10">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-[#D90429] uppercase tracking-wider flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{update.badge || 'Store Notice'}</span>
                    </span>
                    {update.date && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold text-[#546E7A] bg-white border border-black/10 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{update.date}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-[#263238]">
                    <PhoneCall className="w-3.5 h-3.5 text-[#D90429]" />
                    <span className="text-[#546E7A]">Service Helpline:</span>
                    <a href={`tel:${SHOP_PHONE_SECONDARY_CALL}`} className="font-bold text-[#D90429] hover:underline">
                      {SHOP_PHONE_SECONDARY}
                    </a>
                  </div>
                </div>

                {/* Content Layout: Poster + Details */}
                <div className="p-5 sm:p-8 lg:p-10">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left: Poster Box */}
                    <div className="lg:col-span-5">
                      <div
                        onClick={() => setLightboxImage(update.bannerImage)}
                        className="relative rounded-2xl overflow-hidden bg-slate-50 border border-black/10 cursor-pointer group shadow-2xs"
                        title="Click to zoom poster"
                      >
                        <img
                          src={update.bannerImage}
                          alt={update.title}
                          className="w-full h-auto object-contain max-h-[360px] mx-auto transition-transform duration-300 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 text-white text-xs font-bold px-3 py-1.5 rounded-full pointer-events-none">
                            🔍 Click to Enlarge
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Info, Highlights & Actions */}
                    <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-6">
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#263238] font-heading tracking-tight mb-3">
                          {update.title}
                        </h2>

                        <p className="text-sm sm:text-base text-[#546E7A] leading-relaxed mb-6 font-normal">
                          {update.description}
                        </p>

                        {/* Bullet Highlights */}
                        {update.highlights && update.highlights.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl border border-black/5">
                            {update.highlights.map((highlight, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[#263238] font-medium">
                                <CheckCircle2 className="w-4 h-4 text-[#6A994E] shrink-0 mt-0.5" />
                                <span>{highlight}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Strip */}
                      <div className="pt-4 border-t border-black/10 flex flex-wrap items-center gap-3">
                        <a
                          href={createWhatsAppUrl(update.whatsappMessage || `Hi 7Days Toys, inquiring about: ${update.title}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-colors shadow-xs"
                        >
                          <MessageCircle className="w-4 h-4 fill-white" />
                          <span>Inquire on WhatsApp</span>
                        </a>

                        <a
                          href={`tel:${SHOP_PHONE_SECONDARY_CALL}`}
                          className="inline-flex items-center gap-2 bg-[#D90429] hover:bg-[#b00320] text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-colors shadow-xs"
                        >
                          <PhoneCall className="w-4 h-4 fill-white" />
                          <span>Call Helpline: {SHOP_PHONE_SECONDARY}</span>
                        </a>

                        <a
                          href={`tel:${SHOP_PHONE_CALL}`}
                          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-[#263238] border border-black/15 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-colors"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-[#546E7A]" />
                          <span>Showroom Desk</span>
                        </a>
                      </div>

                    </div>

                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Permanent Care & Service Notice Footer Strip */}
        <div className="mt-14 sm:mt-20 bg-white rounded-3xl p-6 sm:p-10 border border-black/10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#6A994E]/15 text-[#6A994E] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#263238] font-heading">
                Need Service, Battery Tuning or Spare Parts?
              </h3>
              <p className="text-xs sm:text-sm text-[#546E7A] mt-0.5 max-w-xl">
                We provide complete in-store maintenance for all kids electric ride-on cars, bikes, and multi-speed gear cycles at our Payod showroom.
              </p>
            </div>
          </div>

          <a
            href={`tel:${SHOP_PHONE_SECONDARY_CALL}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#263238] hover:bg-black text-white font-bold text-xs sm:text-sm transition whitespace-nowrap"
          >
            <PhoneCall className="w-4 h-4 text-[#FFB703]" />
            <span>Call Service Team: {SHOP_PHONE_SECONDARY}</span>
          </a>
        </div>

      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-3 sm:p-6 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-5xl w-full bg-white rounded-2xl p-4 overflow-hidden cursor-default shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close poster view"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={lightboxImage}
              alt="7Days notice poster full size"
              className="w-full h-auto object-contain rounded-xl max-h-[82vh]"
            />

            <div className="pt-3 text-center flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-[#546E7A]">
              <span>7Days Toys &amp; Babyshop • Payod, Mananthavady</span>
              <a href={`tel:${SHOP_PHONE_SECONDARY_CALL}`} className="text-[#D90429] hover:underline">
                📞 {SHOP_PHONE_SECONDARY}
              </a>
              <span className="text-black/20">•</span>
              <a href={`tel:${SHOP_PHONE_CALL}`} className="text-[#263238] hover:underline">
                📞 {SHOP_PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
