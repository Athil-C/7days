import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Menu, X, Sparkles, MapPin } from 'lucide-react';
import { InstagramIcon, WhatsAppIcon } from './Icons';
import { SHOP_NAME, SHOP_SUBTITLE, SHOP_INSTAGRAM_URL, createWhatsAppUrl, SHOP_ADDRESS } from '../data/config';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Categories', path: '/#categories' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    if (path.startsWith('/#')) return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? 'glass-nav shadow-sm border-b border-[#263238]/5 py-2.5'
        : 'bg-[#FFF9F0]/95 backdrop-blur-md py-4'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Brand Logo */}
          <Link
            to="/"
            className="group flex items-center gap-2.5 sm:gap-3 text-left focus:outline-none"
            aria-label="7Days Toys and Babyshop Home"
          >
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 group-hover:scale-105 transition-transform duration-300 flex-shrink-0 drop-shadow-sm">
              <img
                src="/7days-logo.png"
                alt="7Days Mananthavady Official Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#263238] font-heading leading-tight group-hover:text-[#FB8500] transition-colors">
                {SHOP_NAME}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#FB8500] -mt-0.5">
                {SHOP_SUBTITLE}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${active
                    ? 'bg-[#FFB703]/20 text-[#263238] font-bold shadow-xs'
                    : 'text-[#263238]/80 hover:text-[#263238] hover:bg-black/5'
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={SHOP_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow 7Days on Instagram"
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#263238]/70 hover:text-[#E1306C] hover:bg-[#E1306C]/10 transition-colors duration-200"
              title="Follow on Instagram"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>

            <a
              href={createWhatsAppUrl("Hi 7Days Toys & Babyshop, I'd like to ask about your shop products!")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2.5 rounded-full text-sm font-bold shadow-sm hover:shadow transition-all duration-200 hover:-translate-y-0.5"
            >
              <MessageCircle className="w-4 h-4 fill-white text-white" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <a
              href={createWhatsAppUrl("Hi 7Days Toys & Babyshop, I'd like to ask about your products!")}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#25D366] text-white shadow-xs"
              aria-label="Chat on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-xl text-[#263238] hover:bg-black/5 transition-colors focus:outline-none"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#263238]/10 bg-[#FFF9F0] px-4 pt-3 pb-6 animate-fadeIn shadow-lg">
          <div className="flex flex-col gap-1.5 mb-4">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-base font-semibold transition-colors flex items-center justify-between ${active
                    ? 'bg-[#FFB703]/25 text-[#263238] font-bold'
                    : 'text-[#263238]/80 hover:bg-black/5'
                    }`}
                >
                  <span>{link.name}</span>
                  {active && <span className="w-2 h-2 rounded-full bg-[#FB8500]"></span>}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#263238]/10 flex flex-col gap-2.5">
            <a
              href={createWhatsAppUrl("Hi 7Days Toys & Babyshop, I'm visiting your website and have a question!")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-full font-bold shadow-sm"
            >
              <MessageCircle className="w-5 h-5 fill-white text-white" />
              <span>Chat on WhatsApp</span>
            </a>

            <div className="flex items-center justify-between px-2 pt-1 text-xs text-[#546E7A]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#FB8500]" />
                {SHOP_ADDRESS.short}
              </span>
              <a
                href={SHOP_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-semibold text-[#E1306C] hover:underline"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                @7days_toys
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
