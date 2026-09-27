import React from 'react';
import { MessageCircle, Phone, Sparkles } from 'lucide-react';
import { SHOP_FULL_NAME, SHOP_PHONE_CALL, SHOP_PHONE_DISPLAY, createWhatsAppUrl } from '../data/config';

export default function ContactCTA() {
  return (
    <section className="py-14 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFB703] via-[#FB8500] to-[#FB8500] p-8 sm:p-12 text-white text-center shadow-xl">
          
          {/* Decorative floating shapes */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-black/10 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>We're Happy to Help</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight mb-4 leading-tight">
              Looking for Something Specific?
            </h2>

            <p className="text-white/90 text-sm sm:text-base mb-8 max-w-xl mx-auto leading-relaxed">
              Send us a message and ask about a product, availability, or anything you need.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Primary CTA: WhatsApp */}
              <a
                href={createWhatsAppUrl(`Hi ${SHOP_FULL_NAME}, I'm looking for a specific item, can you help me find it?`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-[#263238] px-8 py-4 rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 group"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366] fill-[#25D366]" />
                <span>WhatsApp Us</span>
              </a>

              {/* Secondary CTA: Call */}
              <a
                href={`tel:${SHOP_PHONE_CALL}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-black/20 hover:bg-black/30 text-white border border-white/30 px-7 py-4 rounded-full font-bold text-sm sm:text-base transition-all duration-200"
                title={`Call ${SHOP_PHONE_DISPLAY}`}
              >
                <Phone className="w-5 h-5" />
                <span>Call the Shop</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
