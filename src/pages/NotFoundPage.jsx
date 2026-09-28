import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowRight, Phone } from 'lucide-react';
import { usePageSEO } from '../hooks/usePageSEO';

export default function NotFoundPage() {
  usePageSEO({
    title: 'Page Not Found | 7Days Toys & Babyshop',
    description: 'The page you requested could not be found. Return to 7Days Toys & Babyshop homepage or explore products in Payod, Mananthavady.',
    canonicalPath: '/',
    robots: 'noindex, follow'
  });

  return (
    <main className="py-16 sm:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-4xl mx-auto mb-6 shadow-xs">
          🧸
        </div>

        <span className="text-xs font-bold tracking-widest text-[#FB8500] uppercase bg-[#FB8500]/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
          Error 404
        </span>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#263238] font-heading tracking-tight mb-4">
          Page Not Found
        </h1>

        <p className="text-[#546E7A] text-base sm:text-lg leading-relaxed mb-8 max-w-lg mx-auto">
          We couldn't find the page you're looking for. It might have been moved, renamed, or doesn't exist.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#FB8500] hover:bg-[#e07500] text-white px-6 py-3 rounded-full font-bold text-sm shadow-md transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-white hover:bg-black/5 text-[#263238] border border-black/10 px-6 py-3 rounded-full font-bold text-sm transition-all"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-4 h-4 text-[#FB8500]" />
          </Link>

          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-white hover:bg-black/5 text-[#263238] border border-black/10 px-6 py-3 rounded-full font-bold text-sm transition-all"
          >
            <Phone className="w-4 h-4 text-[#219EBC]" />
            <span>Contact Us</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
