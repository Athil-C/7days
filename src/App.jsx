import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import ScrollToTop from './components/ScrollToTop';

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F0] text-[#263238] font-body">
      <ScrollToTop />
      
      {/* Sticky Responsive Header */}
      <Navbar />

      {/* Main Routed Page Content */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          {/* Proper 404 Not Found Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      {/* Floating Bottom-Right WhatsApp Button */}
      <FloatingWhatsApp />

      {/* Premium Footer */}
      <Footer />
    </div>
  );
}
