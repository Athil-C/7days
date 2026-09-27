import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { createWhatsAppUrl, SHOP_FULL_NAME } from '../data/config';

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <aside 
      aria-label="WhatsApp quick chat"
      className="fixed bottom-6 right-5 sm:bottom-7 sm:right-7 z-50 flex items-center gap-2"
    >
      {/* Small popover tooltip */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white text-[#263238] px-3.5 py-2 rounded-2xl shadow-xl border border-black/5 text-xs font-semibold animate-fadeIn">
          <span>Chat with us on WhatsApp!</span>
          <button 
            onClick={() => setShowTooltip(false)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Dismiss tooltip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating round action button */}
      <a
        href={createWhatsAppUrl(`Hi ${SHOP_FULL_NAME}, I'm browsing your website and would like some assistance!`)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with 7Days Toys and Babyshop on WhatsApp"
        onMouseEnter={() => setShowTooltip(true)}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-108 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
      >
        <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 fill-white text-white group-hover:rotate-12 transition-transform duration-300" />
        
        {/* Pulsing indicator dot */}
        <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-white border-2 border-[#25D366] rounded-full"></span>
      </a>
    </aside>
  );
}
