import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from '@/hooks/useAuth';
import { SafeAuthWrapper } from '@/components/SafeAuthWrapper';
import { ErrorBoundary } from '@/components/ErrorBoundary';
// Safe wrapper components to prevent crashes
const SafePreloadResources = React.lazy(() => import('@/components/PreloadResources').catch(() => ({ default: () => null })));
const SafeCriticalCSS = React.lazy(() => import('@/components/CriticalCSS').catch(() => ({ default: () => null })));
const SafeMobileOptimizations = React.lazy(() => import('@/components/MobileOptimizations').then(m => ({ default: m.MobileOptimizations })).catch(() => ({ default: () => null })));
const SafePerformanceOptimizer = React.lazy(() => import('@/components/PerformanceOptimizer').catch(() => ({ default: () => null })));
const SafeTawkToChat = React.lazy(() => import('@/components/TawkToChat').catch(() => ({ default: () => null })));

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LavableFooter from '@/components/LavableFooter';

import Auth from '@/pages/Auth';
import EmailConfirmed from '@/pages/EmailConfirmed';
import IndexOptimized from '@/pages/IndexOptimized';
import MyAccount from '@/pages/MyAccount';
import ContactAdmin from '@/pages/ContactAdmin';
import Feedback from '@/pages/Feedback';
import FindParking from '@/pages/FindParking';
import RentOutYourSpace from '@/pages/RentOutYourSpace';
import Calculator from '@/pages/Calculator';
import AboutUs from '@/pages/AboutUs';
import FAQ from '@/pages/FAQ';
import News from '@/pages/News';
import NewsArticle from '@/pages/NewsArticle';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsAndConditions from '@/pages/TermsAndConditions';
import CookiesNotice from '@/pages/CookiesNotice';
import LavableHome from '@/pages/LavableHome';
import LavableFAQ from '@/pages/LavableFAQ';
import BusinessBay from '@/pages/zones/BusinessBay';
import Downtown from '@/pages/zones/Downtown';
import DubaiMarina from '@/pages/zones/DubaiMarina';
import PalmJumeirah from '@/pages/zones/PalmJumeirah';
import DIFC from '@/pages/zones/DIFC';
import Deira from '@/pages/zones/Deira';
import NotFound from '@/pages/NotFound';
import InsertBlogPosts from '@/pages/InsertBlogPosts';
import ProductPage from '@/pages/ProductPage';
import AdminBootstrap from '@/pages/AdminBootstrap';
import AdminPanel from '@/pages/AdminPanel';

import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';

function App() {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    // Optional: Prefetch data or perform other initializations here
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SafeAuthWrapper>
            <div className="min-h-screen bg-background">
              <ErrorBoundary>
                <Suspense fallback={null}>
                  <SafePreloadResources />
                  <SafeCriticalCSS />
                  <SafeMobileOptimizations />
                  <SafePerformanceOptimizer />
                </Suspense>
                
                {/* Routes that should not show navbar */}
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/email-confirmed" element={<EmailConfirmed />} />
                  <Route path="/admin-bootstrap" element={<AdminBootstrap />} />
                  {/* Add admin route with protection */}
                  <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
                  
                  {/* Routes with navbar */}
                  <Route path="/*" element={
                    <>
                      <Navbar />
                      <main className="pt-16">
                        <Routes>
                          <Route path="/" element={<IndexOptimized />} />
                          <Route path="/my-account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
                          <Route path="/contact-admin" element={<ProtectedRoute><ContactAdmin /></ProtectedRoute>} />
                          <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
                          <Route path="/find-parking" element={<FindParking />} />
                          <Route path="/rent-out-your-space" element={<RentOutYourSpace />} />
                          <Route path="/calculator" element={<Calculator />} />
                          <Route path="/about" element={<AboutUs />} />
                          <Route path="/faq" element={<FAQ />} />
                          <Route path="/news" element={<News />} />
                          <Route path="/news/:id" element={<NewsArticle />} />
                          <Route path="/payment-success" element={<PaymentSuccess />} />
                          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                          <Route path="/cookies-notice" element={<CookiesNotice />} />
                          <Route path="/lavable-home" element={<LavableHome />} />
                          <Route path="/lavable-faq" element={<LavableFAQ />} />
                          <Route path="/zones/business-bay" element={<BusinessBay />} />
                          <Route path="/zones/downtown" element={<Downtown />} />
                          <Route path="/zones/dubai-marina" element={<DubaiMarina />} />
                          <Route path="/zones/palm-jumeirah" element={<PalmJumeirah />} />
                          <Route path="/zones/difc" element={<DIFC />} />
                          <Route path="/zones/deira" element={<Deira />} />
                          <Route path="/insert-blog-posts" element={<InsertBlogPosts />} />
                          <Route path="/product-page" element={<ProductPage />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                      <Footer />
                      <LavableFooter />
                    </>
                  } />
                </Routes>

                <Suspense fallback={null}>
                  <SafeTawkToChat />
                </Suspense>
                <Toaster />
              </ErrorBoundary>
            </div>
          </SafeAuthWrapper>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
