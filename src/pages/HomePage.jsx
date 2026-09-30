import React from 'react';
import { usePageSEO } from '../hooks/usePageSEO';
import Hero from '../components/Hero';
import TrustStrip from '../components/TrustStrip';
import SmartShopping from '../components/SmartShopping';
import AgeShop from '../components/AgeShop';
import CategoriesSection from '../components/CategoriesSection';
import GiftFinder from '../components/GiftFinder';
import FeaturedProducts from '../components/FeaturedProducts';
import StoreGallery from '../components/StoreGallery';
import CareServices from '../components/CareServices';
import UpdatesSection from '../components/UpdatesSection';
import Why7Days from '../components/Why7Days';
import ParentsFAQ from '../components/ParentsFAQ';
import InstagramSection from '../components/InstagramSection';
import LocationSection from '../components/LocationSection';
import ContactCTA from '../components/ContactCTA';

export default function HomePage() {
  usePageSEO({
    title: '7Days Toys & Babyshop | Toys & Baby Products in Mananthavady, Wayanad',
    description: "Discover toys, baby products, essentials, and kids' gifts at 7Days Toys & Babyshop in Payod, Mananthavady, Wayanad. Visit our store or chat with us on WhatsApp!",
    canonicalPath: '/'
  });

  return (
    <main>
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Trust Strip */}
      <TrustStrip />

      {/* 3. 7Days Smart Shopping Hub */}
      <SmartShopping />

      {/* 4. Shop by Age */}
      <AgeShop />

      {/* 5. Shop by Category (Preserved existing categories structure) */}
      <CategoriesSection />

      {/* 6. Birthday & Gift Finder */}
      <GiftFinder />

      {/* 7. Featured Products */}
      <FeaturedProducts />

      {/* 8. Real 7Days Store Gallery */}
      <StoreGallery />

      {/* 9. 7Days Care & Service (Verified repairs, spares & diagnostics) */}
      <CareServices />

      {/* 10. Store Updates & Announcements */}
      <UpdatesSection />

      {/* 11. Why 7Days */}
      <Why7Days />

      {/* 12. Parents Ask Us (FAQ) */}
      <ParentsFAQ />

      {/* 13. Instagram Community Section */}
      <InstagramSection />

      {/* 14. Visit Our Store (Location, Map, Directions) */}
      <LocationSection />

      {/* 15. Final WhatsApp CTA */}
      <ContactCTA />
    </main>
  );
}
