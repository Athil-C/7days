import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bell,
  MessageCircle,
  PhoneCall,
  Wrench,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Pause
} from 'lucide-react';
import { useUpdates } from '../hooks/useUpdates';
import {
  SHOP_FULL_NAME,
  SHOP_PHONE_CALL,
  SHOP_PHONE_DISPLAY,
  SHOP_PHONE_SECONDARY,
  SHOP_PHONE_SECONDARY_CALL,
  createWhatsAppUrl
} from '../data/config';

const AUTO_SLIDE_INTERVAL_MS = 4500;

export default function UpdatesSection() {
  const [lightboxImage, setLightboxImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);
  const { updates: storeUpdates } = useUpdates();

  const totalUpdates = storeUpdates?.length || 0;
  const isMulti = totalUpdates > 1;

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? totalUpdates - 1 : prev - 1));
  }, [totalUpdates]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === totalUpdates - 1 ? 0 : prev + 1));
  }, [totalUpdates]);

  // Automatic slide rotation (auto-slides every 4.5s, pauses on hover/touch)
  useEffect(() => {
    if (!isMulti || isPaused) return;

    const interval = setInterval(() => {
      handleNext();
    }, AUTO_SLIDE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isMulti, isPaused, handleNext]);

  if (!storeUpdates || storeUpdates.length === 0) return null;

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) {
      setIsPaused(false);
      return;
    }
    const distance = touchStartXRef.current - touchEndXRef.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && isMulti) {
      handleNext();
    } else if (isRightSwipe && isMulti) {
      handlePrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
    setTimeout(() => setIsPaused(false), 2000);
  };

  const activeUpdate = storeUpdates[currentIndex] || storeUpdates[0];

  return (
    <section id="updates" className="py-14 sm:py-20 bg-white border-y border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Editorial Section Header with Carousel Navigation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12 pb-6 border-b border-black/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FB8500] mb-2">
              <Bell className="w-3.5 h-3.5" />
              <span>Store Announcements &amp; Notices</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#263238] font-heading tracking-tight">
              What's New at {SHOP_FULL_NAME}
            </h2>

            <p className="text-[#546E7A] text-xs sm:text-base mt-1.5 max-w-2xl font-normal">
              Latest service expansions, spare parts availability, and verified announcements from our Payod store.
            </p>
          </div>

          {/* Carousel Slide Controls (Active when multiple updates exist) */}
          {isMulti && (
            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FB8500] hidden sm:inline-flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${!isPaused ? 'bg-[#25D366] animate-pulse' : 'bg-gray-400'}`} />
                  <span>{!isPaused ? 'Auto-Sliding' : 'Paused'}</span>
                </span>
                <div className="text-xs font-mono font-bold text-[#546E7A] px-2.5 py-1 rounded bg-[#FAF8F5] border border-black/10">
                  {String(currentIndex + 1).padStart(2, '0')} / {String(totalUpdates).padStart(2, '0')}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsPaused((prev) => !prev)}
                  type="button"
                  className="w-9 h-9 rounded-lg border border-black/15 bg-white hover:bg-slate-50 flex items-center justify-center text-[#546E7A] hover:text-[#263238] transition-colors cursor-pointer"
                  title={isPaused ? "Resume auto-slide" : "Pause auto-slide"}
                  aria-label={isPaused ? "Resume auto-slide" : "Pause auto-slide"}
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                </button>
                <button
                  onClick={handlePrev}
                  type="button"
                  className="w-9 h-9 rounded-lg border border-black/15 bg-white hover:bg-slate-50 flex items-center justify-center text-[#263238] transition-colors cursor-pointer"
                  aria-label="Previous announcement"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  type="button"
                  className="w-9 h-9 rounded-lg border border-black/15 bg-white hover:bg-slate-50 flex items-center justify-center text-[#263238] transition-colors cursor-pointer"
                  aria-label="Next announcement"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Carousel Slide Showcase */}
        <div
          className="relative overflow-hidden rounded-2xl group shadow-sm border border-black/10"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Animated Auto-Slide Progress Bar */}
          {isMulti && (
            <div className="w-full h-1 bg-black/5 overflow-hidden">
              <div
                key={currentIndex + (isPaused ? '_paused' : '_play')}
                className="h-full bg-gradient-to-r from-[#FB8500] to-[#D90429]"
                style={{
                  animation: !isPaused ? `autoSlideProgress ${AUTO_SLIDE_INTERVAL_MS}ms linear infinite` : 'none',
                  width: isPaused ? '100%' : '0%',
                  opacity: isPaused ? 0.35 : 1
                }}
              />
            </div>
          )}

          <div
            key={activeUpdate.id}
            className="bg-[#FAF8F5] overflow-hidden transition-all duration-500 ease-in-out"
          >
            {/* Top Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 sm:px-6 py-3 bg-white border-b border-black/10">
              <div className="flex items-center flex-wrap gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold text-white bg-[#D90429] uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3 h-3" />
                  <span>{activeUpdate.badge || "Store Notice"}</span>
                </span>
                {activeUpdate.date && (
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold text-[#546E7A] bg-[#FAF8F5] border border-black/10 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-[#546E7A]" />
                    <span>{activeUpdate.date}</span>
                  </span>
                )}
              </div>

              {/* Direct quick call info */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#263238]">
                <PhoneCall className="w-3.5 h-3.5 text-[#D90429]" />
                <span className="text-[#546E7A]">Service Desk:</span>
                <a href={`tel:${SHOP_PHONE_SECONDARY_CALL}`} className="font-bold text-[#D90429] hover:underline">
                  {SHOP_PHONE_SECONDARY}
                </a>
              </div>
            </div>

            {/* Poster Section with Lightbox Click */}
            <div
              onClick={() => setLightboxImage(activeUpdate.bannerImage)}
              className="relative w-full bg-white/70 cursor-pointer overflow-hidden border-b border-black/10 flex flex-col items-center justify-center p-2 sm:p-4 group"
              title="Click to view full banner"
            >
              <img
                src={activeUpdate.bannerImage}
                alt={activeUpdate.title}
                className="w-full h-auto object-contain max-h-[440px] rounded-lg transition-transform duration-300 group-hover:scale-[1.01]"
                loading="eager"
              />

              {/* Helpline Quick-Strip Attached Directly to Poster */}
              <div className="w-full mt-3 py-2 px-3 sm:px-4 bg-[#263238] text-white rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-bold">
                  <PhoneCall className="w-3.5 h-3.5 text-[#FB8500]" />
                  <span>Service &amp; Spares Helpline:</span>
                </div>

                <div className="flex items-center flex-wrap gap-3 font-semibold">
                  <a
                    href={`tel:${SHOP_PHONE_SECONDARY_CALL}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[#FFB703] hover:underline"
                    title="Call service helpline"
                  >
                    <span>{SHOP_PHONE_SECONDARY}</span>
                  </a>

                  <span className="text-white/40">/</span>

                  <a
                    href={`tel:${SHOP_PHONE_CALL}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-white/90 hover:text-white hover:underline"
                    title="Call showroom desk"
                  >
                    <span>{SHOP_PHONE_DISPLAY}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Content Details & Action Grid */}
            <div className="p-5 sm:p-8 lg:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column: Titles & Description */}
                <div className="lg:col-span-7">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#263238] leading-tight mb-3 font-heading">
                    {activeUpdate.title}
                  </h3>

                  <p className="text-sm sm:text-base text-[#546E7A] leading-relaxed mb-6 font-normal">
                    {activeUpdate.description}
                  </p>

                  {/* Bullet Highlights */}
                  {activeUpdate.highlights && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeUpdate.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-[#263238] font-medium">
                          <CheckCircle2 className="w-4 h-4 text-[#6A994E] shrink-0" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: In-Store Contact Card */}
                <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-xl border border-black/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#263238] uppercase tracking-wider mb-2">
                      <ShieldCheck className="w-4 h-4 text-[#6A994E]" />
                      <span>In-Store Service in Payod</span>
                    </div>
                    <p className="text-xs text-[#546E7A] mb-5 leading-relaxed">
                      Bring your kids' electric vehicles or gear cycles directly to our showroom for inspection and immediate advice.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <a
                      href={createWhatsAppUrl(activeUpdate.whatsappMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-5 py-3 rounded-lg font-bold text-xs sm:text-sm transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Inquire on WhatsApp</span>
                    </a>

                    <a
                      href={`tel:${SHOP_PHONE_SECONDARY_CALL}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#D90429] hover:bg-[#b00320] text-white px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-colors"
                    >
                      <PhoneCall className="w-4 h-4 fill-white" />
                      <span>Call Service Desk: {SHOP_PHONE_SECONDARY}</span>
                    </a>

                    <a
                      href={`tel:${SHOP_PHONE_CALL}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#FAF8F5] hover:bg-slate-100 text-[#263238] border border-black/10 px-5 py-2 rounded-lg font-semibold text-xs transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-[#546E7A]" />
                      <span>Showroom Desk: {SHOP_PHONE_DISPLAY}</span>
                    </a>
                  </div>
                </div>

              </div>
            </div>

            {/* Pagination Dots (if multi updates) */}
            {isMulti && (
              <div className="py-3 bg-white border-t border-black/10 flex items-center justify-center gap-2">
                {storeUpdates.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${currentIndex === i ? 'w-6 bg-[#FB8500]' : 'w-2 bg-black/15 hover:bg-black/30'
                      }`}
                    aria-label={`Go to announcement ${i + 1}`}
                  />
                ))}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Full-Screen Poster Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-3 sm:p-6 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-white rounded-xl p-3 sm:p-4 overflow-hidden cursor-default"
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
              alt="7Days notice poster"
              className="w-full h-auto object-contain rounded-lg max-h-[82vh]"
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
    </section>
  );
}
