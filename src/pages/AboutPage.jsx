import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Sparkles, CheckCircle2, ArrowRight, MessageCircle } from 'lucide-react';
import { SHOP_FULL_NAME, SHOP_ADDRESS, SHOP_INSTAGRAM_URL, createWhatsAppUrl } from '../data/config';
import Why7Days from '../components/Why7Days';

export default function AboutPage() {
  return (
    <div className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FB8500]/15 text-[#FB8500] text-xs font-bold uppercase tracking-wider mb-2.5">
            <Heart className="w-3.5 h-3.5 fill-[#FB8500]" />
            <span>Our Story</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#263238] font-heading tracking-tight mb-4">
            Made for Little Moments.
          </h1>
          <p className="text-[#546E7A] text-sm sm:text-base leading-relaxed">
            Welcome to {SHOP_FULL_NAME}, your neighborhood children's and baby boutique in Payod, Mananthavady, Wayanad.
          </p>
        </div>

        {/* Story Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          <div className="lg:col-span-6 space-y-5 text-sm sm:text-base text-[#546E7A] leading-relaxed">
            <p className="text-lg font-bold text-[#263238]">
              Bringing more smiles and warmth to families in Wayanad.
            </p>
            <p>
              <strong className="text-[#263238]">{SHOP_FULL_NAME}</strong> is a local destination for toys, baby essentials, gifts and kids' products in Payod, Mananthavady.
            </p>
            <p>
              Whether you're looking for something fun for your little one, a thoughtful gift, or everyday baby essentials, drop by 7Days. We believe childhood should be filled with wholesome curiosity, joyful play, and safe, comfortable essentials.
            </p>
            <div className="pt-2 flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#263238]">
                <CheckCircle2 className="w-4 h-4 text-[#FB8500]" />
                <span>Handpicked toys suitable for all age groups</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#263238]">
                <CheckCircle2 className="w-4 h-4 text-[#219EBC]" />
                <span>Comfortable and essential baby care items</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#263238]">
                <CheckCircle2 className="w-4 h-4 text-[#6A994E]" />
                <span>Warm, friendly local shopping experience</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-[#FB8500] hover:bg-[#e07500] text-white px-6 py-3 rounded-full text-sm font-bold shadow-sm transition-all"
              >
                <span>Visit Payod Store</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={createWhatsAppUrl(`Hi ${SHOP_FULL_NAME}, I'd like to ask a question about your shop!`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-6 py-3 rounded-full text-sm font-bold shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="rounded-3xl overflow-hidden card-shadow aspect-[4/5] bg-amber-50">
              <img
                src="/store/store-grand-opening.png"
                alt="7Days Toys & Babyshop Grand Opening Showroom"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl overflow-hidden card-shadow aspect-square bg-sky-50">
                <img
                  src="/products/lime-green-sports-bike.jpg"
                  alt="Kids Sports Bicycles at 7Days"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-5 rounded-3xl bg-gradient-to-tr from-[#FFB703] to-[#FB8500] text-white text-center">
                <p className="text-2xl font-extrabold font-heading">7Days</p>
                <p className="text-xs uppercase tracking-wider font-semibold opacity-90">Payod, Mananthavady</p>
              </div>
            </div>
          </div>
        </div>

        {/* Why 7Days section */}
        <Why7Days />

      </div>
    </div>
  );
}
