import React from 'react';
import { MessageCircle, Sparkles, Video } from 'lucide-react';
import { getProductInquiryUrl } from '../data/config';
import { isProductVideoEligible, generateWhatsAppProductInquiry } from '../utils/shoppingEngine';

// Category color mappings matching the brand design system
const CATEGORY_COLORS = {
  Toys: 'bg-amber-50 text-amber-900 border-amber-200/70',
  Outdoors: 'bg-sky-50 text-sky-900 border-sky-200/70',
  Baby: 'bg-rose-50 text-rose-900 border-rose-200/70',
  Education: 'bg-emerald-50 text-emerald-900 border-emerald-200/70',
  Music: 'bg-purple-50 text-purple-900 border-purple-200/70',
  Accessories: 'bg-orange-50 text-orange-900 border-orange-200/70',
  Gifts: 'bg-pink-50 text-pink-900 border-pink-200/70',
  School: 'bg-teal-50 text-teal-900 border-teal-200/70'
};

export default function ProductCard({ product, showVideoAction = true, giftContext = null }) {
  const { id, name, category, description, price, image, badge } = product;
  const inquiryUrl = giftContext 
    ? generateWhatsAppProductInquiry({ product, inquiryType: 'gift', giftContext })
    : getProductInquiryUrl(product);

  const videoUrl = generateWhatsAppProductInquiry({ product, inquiryType: 'video' });
  const categoryStyle = CATEGORY_COLORS[category] || 'bg-slate-50 text-slate-900 border-slate-200/70';
  const hasVideoOption = showVideoAction && isProductVideoEligible(id);

  const hasPrice = typeof price === 'number' && price !== null && !Number.isNaN(price);

  return (
    <div className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden card-shadow card-hover border border-black/5 flex flex-col justify-between transition-all duration-300">
      
      {/* Product Image Stage: Isolated on clean white background, centered object-contain */}
      <div className="relative aspect-square overflow-hidden bg-white p-5 sm:p-6 flex items-center justify-center border-b border-black/5">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          width="300"
          height="300"
        />

        {/* Category & Badge Pills */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10 pointer-events-none">
          <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full shadow-xs tracking-wide border ${categoryStyle}`}>
            {category}
          </span>
          {badge && (
            <span className="text-[9px] sm:text-[10px] font-bold bg-[#FB8500] text-white px-2 py-0.5 rounded-full shadow-xs tracking-wider uppercase inline-flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              {badge}
            </span>
          )}
        </div>

        {/* Check In-Store Availability Status */}
        <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-none">
          <span className="text-[10px] font-semibold bg-[#263238]/85 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-md shadow-xs flex items-center gap-1 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFB703] animate-pulse"></span>
            Check availability
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-white">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#263238] font-heading group-hover:text-[#FB8500] transition-colors leading-snug line-clamp-2">
            {name}
          </h3>
          {description && (
            <p className="text-xs text-[#546E7A] mt-1.5 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Action area */}
        <div className="mt-4 pt-3.5 border-t border-black/5 flex flex-col gap-2.5">
          {(hasPrice || hasVideoOption) && (
            <div className={`flex items-center ${hasPrice ? 'justify-between' : 'justify-end'}`}>
              {hasPrice && (
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#546E7A] uppercase tracking-wider font-semibold">
                    Price
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#263238]">
                    ₹{price}
                  </span>
                </div>
              )}

              {/* Video Request CTA (for eligible motion / vehicles / cycles) */}
              {hasVideoOption && (
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#219EBC] hover:text-[#18758d] bg-sky-50 hover:bg-sky-100/70 border border-sky-200/60 px-2.5 py-1 rounded-full transition-colors"
                  title={`Request a live video of ${name}`}
                  aria-label={`Ask for a video of ${name} on WhatsApp`}
                >
                  <Video className="w-3 h-3 text-[#219EBC]" />
                  <span>Ask for Video</span>
                </a>
              )}
            </div>
          )}

          {/* Primary WhatsApp Inquiry CTA */}
          <a
            href={inquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-3.5 py-2.5 rounded-full text-xs font-bold shadow-xs hover:shadow transition-all duration-200 active:scale-95"
            aria-label={`Ask about ${name} on WhatsApp`}
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
            <span>Ask about this product</span>
          </a>
        </div>

      </div>

    </div>
  );
}
