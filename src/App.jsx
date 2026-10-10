import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import ScrollToTop from './components/ScrollToTop';
import LoadingScreen from './components/LoadingScreen';

import HomePage from './pages/HomePage';
import UpdatesPage from './pages/UpdatesPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// Server synchronizers
import { syncDailySalesFromServer } from './services/dailySalesService';
import { syncStaffFromServer, syncAttendanceFromServer } from './services/attendanceService';
import { syncHomepageSectionsFromSupabase } from './services/homepageSectionsService';

// Admin Portal
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [isLoading, setIsLoading] = useState(true);

  // Proactively fetch latest authoritative state from Supabase on every reload across all pages
  useEffect(() => {
    syncDailySalesFromServer();
    syncStaffFromServer();
    syncAttendanceFromServer();
    syncHomepageSectionsFromSupabase();
  }, []);

  return (
    <AuthProvider>
      {/* Creative 7Days Brand Loading Screen */}
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      <div className="min-h-screen flex flex-col bg-[#FFF9F0] text-[#263238] font-body">
        <Analytics />
        <ScrollToTop />
        
        {/* Sticky Responsive Header (Storefront only) */}
        {!isAdminRoute && <Navbar />}

        {/* Main Routed Page Content */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/updates" element={<UpdatesPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Admin Portal Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Proper 404 Not Found Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>

        {/* Floating Bottom-Right WhatsApp Button (Storefront only) */}
        {!isAdminRoute && <FloatingWhatsApp />}

        {/* Premium Footer (Storefront only) */}
        {!isAdminRoute && <Footer />}
      </div>
    </AuthProvider>
  );
}
