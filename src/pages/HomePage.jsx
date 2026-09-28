import React from 'react';
import { usePageSEO } from '../hooks/usePageSEO';
import Hero from '../components/Hero';
import TrustStrip from '../components/TrustStrip';
import UpdatesSection from '../components/UpdatesSection';
import CategoriesSection from '../components/CategoriesSection';
import FeaturedProducts from '../components/FeaturedProducts';
import Why7Days from '../components/Why7Days';
import AboutSection from '../components/AboutSection';
import InstagramSection from '../components/InstagramSection';
import LocationSection from '../components/LocationSection';
import ContactCTA from '../components/ContactCTA';

export default function HomePage() {
  usePageSEO({
    title: '7Days Toys & Babyshop | Toys & Baby Essentials in Mananthavady',
    description: "7Days Toys & Babyshop in Payod, Mananthavady, Wayanad — toys, baby essentials, gifts and kids' products.",
    canonicalPath: '/'
  });

  return (
    <main>
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Trust Strip */}
      <TrustStrip />

      {/* 3. Latest Store Updates & Announcements */}
      <UpdatesSection />

      {/* 4. Categories Section */}
      <CategoriesSection />

      {/* 4. Featured Products (Little Favorites) */}
      <FeaturedProducts />

      {/* 5. Why 7Days Section */}
      <Why7Days />

      {/* 6. About Section */}
      <AboutSection />

      {/* 7. Instagram Section */}
      <InstagramSection />

      {/* 8. Location Section */}
      <LocationSection />

      {/* 9. Contact CTA */}
      <ContactCTA />
    </main>
  );
}
