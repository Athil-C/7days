import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, MapPin, Heart, Phone } from 'lucide-react';
import { InstagramIcon } from './Icons';
import { 
  SHOP_NAME, 
  SHOP_SUBTITLE, 
  SHOP_FULL_NAME, 
  SHOP_ADDRESS, 
  SHOP_INSTAGRAM_URL, 
  SHOP_PHONE_DISPLAY,
  SHOP_PHONE_CALL,
  SHOP_PHONE_SECONDARY,
  SHOP_PHONE_SECONDARY_CALL,
  createWhatsAppUrl 
} from '../data/config';

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="bg-[#263238] text-white pt-16 pb-12 border-t border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-3 mb-4 group" aria-label="7Days Toys & Babyshop Home">
              <div className="w-12 h-12 flex-shrink-0 group-hover:scale-105 transition-transform duration-300 drop-shadow-md">
                <img
                  src="/7days-logo.png"
                  alt="7Days Toys & Babyshop Logo"
                  className="w-full h-full object-contain"
                  width="48"
                  height="48"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold tracking-tight font-heading leading-tight text-white group-hover:text-[#FFB703] transition-colors">
                  {SHOP_NAME}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#FFB703] -mt-0.5">
                  {SHOP_SUBTITLE}
                </span>
              </div>
            </Link>

            <p className="text-gray-300 text-sm leading-relaxed max-w-sm mb-5">
              Bringing more smiles to little moments. A local destination for toys, baby essentials, and thoughtful gifts in Wayanad.
            </p>

            {/* Direct Phone Numbers in Brand Column */}
            <div className="space-y-2 mb-6">
              <a
                href={`tel:${SHOP_PHONE_CALL}`}
                className="inline-flex items-center gap-2.5 text-sm font-semibold text-gray-200 hover:text-[#FFB703] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#25D366]">
                  <Phone className="w-4 h-4" />
                </div>
                <span>{SHOP_PHONE_DISPLAY}</span>
              </a>
              <br />
              <a
                href={`tel:${SHOP_PHONE_SECONDARY_CALL}`}
                className="inline-flex items-center gap-2.5 text-sm font-semibold text-gray-200 hover:text-[#FFB703] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#FFB703]">
                  <Phone className="w-4 h-4" />
                </div>
                <span>{SHOP_PHONE_SECONDARY}</span>
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href={SHOP_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#E1306C] flex items-center justify-center text-white transition-colors duration-200"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>

              <a
                href={createWhatsAppUrl(`Hi ${SHOP_FULL_NAME}, I'm reaching out from your website!`)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#25D366] flex items-center justify-center text-white transition-colors duration-200"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer Quick Links" className="lg:col-span-3">
            <p className="text-sm font-bold uppercase tracking-wider text-[#FFB703] mb-4">
              Quick Links
            </p>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">Explore Products</Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition-colors">Toy &amp; Baby Categories</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About 7Days</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact &amp; Location</Link>
              </li>
              <li>
                <a
                  href={SHOP_INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </nav>

          {/* Categories */}
          <nav aria-label="Footer Store Aisles" className="lg:col-span-2">
            <p className="text-sm font-bold uppercase tracking-wider text-[#FFB703] mb-4">
              Store Aisles
            </p>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link to="/products?category=Toys" className="hover:text-white transition-colors">Toys &amp; Games</Link>
              </li>
              <li>
                <Link to="/products?category=Outdoors" className="hover:text-white transition-colors">Outdoors &amp; Cycles</Link>
              </li>
              <li>
                <Link to="/products?category=Baby" className="hover:text-white transition-colors">Baby Care &amp; Trikes</Link>
              </li>
              <li>
                <Link to="/products?category=Education" className="hover:text-white transition-colors">Study &amp; School</Link>
              </li>
              <li>
                <Link to="/products?category=Music" className="hover:text-white transition-colors">Musical Toys</Link>
              </li>
            </ul>
          </nav>

          {/* Location & Contact Info */}
          <div className="lg:col-span-3">
            <p className="text-sm font-bold uppercase tracking-wider text-[#FFB703] mb-4">
              Store &amp; Phone
            </p>
            <div className="space-y-3 text-sm text-gray-300">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FB8500] shrink-0 mt-1" />
                <span>
                  <strong>{SHOP_FULL_NAME}</strong><br />
                  {SHOP_ADDRESS.line1}, {SHOP_ADDRESS.town},<br />
                  {SHOP_ADDRESS.district}, {SHOP_ADDRESS.state}
                </span>
              </p>

              {/* Call Buttons in Location column */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Call & WhatsApp
                </div>
                <a
                  href={`tel:${SHOP_PHONE_CALL}`}
                  className="flex items-center gap-2 text-white hover:text-[#25D366] transition-colors font-medium text-xs sm:text-sm"
                >
                  <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>{SHOP_PHONE_DISPLAY}</span>
                </a>
                <a
                  href={`tel:${SHOP_PHONE_SECONDARY_CALL}`}
                  className="flex items-center gap-2 text-white hover:text-[#FFB703] transition-colors font-medium text-xs sm:text-sm"
                >
                  <Phone className="w-3.5 h-3.5 text-[#FFB703]" />
                  <span>{SHOP_PHONE_SECONDARY}</span>
                </a>
              </div>

              <p className="pt-2 text-xs text-gray-400">
                Warm neighborhood store serving families across Mananthavady and Wayanad.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {currentYear} {SHOP_FULL_NAME}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-[#FB8500] fill-[#FB8500]" /> for families in Wayanad
          </p>
        </div>

      </div>
    </footer>
  );
}
