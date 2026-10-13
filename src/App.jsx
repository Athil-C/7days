import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import ScrollToTop from './components/ScrollToTop';

import HomePage from './pages/HomePage';

// Code-split all secondary routes so homepage bundle remains ultra-lightweight
const UpdatesPage = lazy(() => import('./pages/UpdatesPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Admin Portal (Heavy PDF & Dashboard dependencies isolated from public bundle)
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';

import { syncHomepageSectionsFromSupabase } from './services/homepageSectionsService';

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Gated synchronization: Admin queries only execute when accessing the admin portal
  useEffect(() => {
    if (isAdminRoute) {
      import('./services/dailySalesService').then((m) => m.syncDailySalesFromServer());
      import('./services/attendanceService').then((m) => {
        m.syncStaffFromServer();
        m.syncAttendanceFromServer();
      });
    }
  }, [isAdminRoute]);

  // Public site settings sync runs gently in the background after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      syncHomepageSectionsFromSupabase();
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[#FFF9F0] text-[#263238] font-body">
        <Analytics />
        <ScrollToTop />
        
        {/* Sticky Responsive Header (Storefront only) */}
        {!isAdminRoute && <Navbar />}

        {/* Main Routed Page Content */}
        <div className="flex-1">
          <Suspense
            fallback={
              <div className="min-h-[50vh] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-3 border-[#FF7A00] border-t-transparent animate-spin" />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/updates" element={<UpdatesPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:category/:slug" element={<ProductDetailPage />} />
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
          </Suspense>
        </div>

        {/* Floating Bottom-Right WhatsApp Button (Storefront only) */}
        {!isAdminRoute && <FloatingWhatsApp />}

        {/* Premium Footer (Storefront only) */}
        {!isAdminRoute && <Footer />}
      </div>
    </AuthProvider>
  );
}
