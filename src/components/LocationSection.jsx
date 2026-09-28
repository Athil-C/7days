import React from 'react';
import { MapPin, Phone, MessageCircle, Navigation, ExternalLink } from 'lucide-react';
import { InstagramIcon } from './Icons';
import { 
  SHOP_FULL_NAME, 
  SHOP_ADDRESS, 
  SHOP_PHONE_DISPLAY, 
  SHOP_PHONE_CALL, 
  SHOP_PHONE_SECONDARY,
  SHOP_PHONE_SECONDARY_CALL,
  SHOP_INSTAGRAM_URL, 
  createWhatsAppUrl 
} from '../data/config';

export default function LocationSection() {
  return (
    <section id="location" className="py-14 sm:py-20 bg-white/60 border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6A994E]/15 text-[#6A994E] text-xs font-bold uppercase tracking-wider mb-2.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>Store Location</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#263238] font-heading tracking-tight">
            Visit 7Days Toys &amp; Babyshop in Mananthavady
          </h2>
          <p className="text-[#546E7A] text-sm sm:text-base mt-2">
            Come say hello 👋 — Visit our neighborhood store in Payod, Mananthavady.
          </p>
        </div>

        {/* Content Card with Details & Map View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white rounded-3xl p-6 sm:p-8 card-shadow border border-black/5">
          
          {/* Left Details */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6A994E] animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#6A994E]">
                  Open for Walk-ins
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#263238] font-heading mb-4">
                {SHOP_FULL_NAME}
              </h3>

              {/* Address Block */}
              <div className="p-4 rounded-2xl bg-[#FFF9F0] border border-[#FFB703]/20 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FB8500]/15 flex items-center justify-center text-[#FB8500] shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#546E7A] uppercase tracking-wider font-semibold">
                      Shop Address
                    </p>
                    <p className="text-sm sm:text-base font-bold text-[#263238] mt-0.5 leading-snug">
                      📍 {SHOP_ADDRESS.line1}, {SHOP_ADDRESS.town},<br />
                      {SHOP_ADDRESS.district}, {SHOP_ADDRESS.state}, {SHOP_ADDRESS.country}
                    </p>
                  </div>
                </div>
              </div>

              {/* Directions Button */}
              <a
                href={SHOP_ADDRESS.mapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#263238] hover:bg-[#37474F] text-white px-5 py-3.5 rounded-2xl font-bold text-sm shadow-sm hover:shadow transition-all duration-200 mb-6 group"
              >
                <Navigation className="w-4 h-4 text-[#FFB703] transition-transform group-hover:translate-x-0.5" />
                <span>Get Directions →</span>
              </a>
            </div>

            {/* Quick Contact Buttons Row */}
            <div className="pt-4 border-t border-black/5 flex flex-wrap gap-2">
              {/* WhatsApp Button */}
              <a
                href={createWhatsAppUrl(`Hi ${SHOP_FULL_NAME}, I'd like to check directions and visit your store in Payod!`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp</span>
              </a>

              {/* Primary Call Button */}
              <a
                href={`tel:${SHOP_PHONE_CALL}`}
                className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-[#263238] border border-amber-200 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors"
                title={`Call ${SHOP_PHONE_DISPLAY}`}
              >
                <Phone className="w-4 h-4 text-[#FB8500]" />
                <span>Call ({SHOP_PHONE_DISPLAY})</span>
              </a>

              {/* Secondary Call Button */}
              <a
                href={`tel:${SHOP_PHONE_SECONDARY_CALL}`}
                className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-[#263238] border border-amber-200 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors"
                title={`Call ${SHOP_PHONE_SECONDARY}`}
              >
                <Phone className="w-4 h-4 text-[#219EBC]" />
                <span>Call ({SHOP_PHONE_SECONDARY})</span>
              </a>

              {/* Instagram Button */}
              <a
                href={SHOP_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-3 py-2.5 bg-pink-50 hover:bg-pink-100 text-[#E1306C] border border-pink-200 rounded-xl text-xs font-bold transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            </div>

          </div>

          {/* Right Visual Map Area */}
          <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-[380px] rounded-2xl overflow-hidden bg-[#FFF9F0] border border-black/5 flex flex-col items-center justify-center p-6 text-center">
            
            {/* Soft decorative background map styling */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#263238_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Center Map Location Marker Pin Card */}
            <div className="relative z-10 max-w-sm bg-white/95 backdrop-blur-md p-6 rounded-2xl card-shadow border border-[#FFB703]/30 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FFB703] to-[#FB8500] flex items-center justify-center text-white shadow-md mb-3 animate-bounce">
                <MapPin className="w-7 h-7" />
              </div>
              
              <p className="text-base font-extrabold text-[#263238] font-heading">
                {SHOP_FULL_NAME}
              </p>
              <p className="text-xs text-[#546E7A] mt-1 font-medium">
                Payod, Mananthavady, Wayanad
              </p>
              
              <p className="text-[11px] text-amber-700 bg-amber-50 px-3 py-1 rounded-full mt-3 font-semibold border border-amber-200">
                Wayanad District, Kerala
              </p>

              <a
                href={SHOP_ADDRESS.mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#FB8500] hover:text-[#d46f00] hover:underline"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
