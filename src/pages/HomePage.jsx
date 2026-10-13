import React from 'react';
import { usePageSEO } from '../hooks/usePageSEO';
import Hero from '../components/Hero';
import TrustStrip from '../components/TrustStrip';
import CategoriesSection from '../components/CategoriesSection';
import FeaturedProducts from '../components/FeaturedProducts';
import StoreGallery from '../components/StoreGallery';
import InstagramSection from '../components/InstagramSection';
import LocationSection from '../components/LocationSection';
import ContactCTA from '../components/ContactCTA';

export default function HomePage() {
  usePageSEO({
    title: '7Days Toys & Babyshop | Little Things. Big Smiles.',
    description: "Discover toys, baby essentials, kids' gifts and more at 7Days Toys & Babyshop in Payod, Mananthavady, Wayanad.",
    canonicalPath: '/'
  });

  return (
    <main>
      {/* 1. Hero Showcase (Main Headline, Quick Action & Showcase) */}
      <Hero />

      {/* 2. Trust Strip (Fast local trust & verified quality) */}
      <TrustStrip />

      {/* 3. Shop by Category (Baby, Cycles, Jeeps, Toys) */}
      <CategoriesSection />

      {/* 4. Featured Products (Top bestsellers with prices) */}
      <FeaturedProducts />

      {/* 5. Real 7Days Store Gallery (Showroom photos in Payod) */}
      <StoreGallery />

      {/* 6. Instagram Community Section */}
      <InstagramSection />

      {/* 7. Visit Our Store (Location, Timings, Map, Directions) */}
      <LocationSection />

      {/* 8. Final WhatsApp CTA (Friction-free customer inquiry) */}
      <ContactCTA />
    </main>
  );
}
