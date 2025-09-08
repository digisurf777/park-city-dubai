import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import TawkToChat from "@/components/TawkToChat";
import ChatWidget from "@/components/ChatWidget";
import PerformanceOptimizer from "@/components/PerformanceOptimizer";
import { MobileOptimizations } from "@/components/MobileOptimizations";
// Import Auth directly to fix dynamic import issue
import Auth from "./pages/Auth";
import EmailConfirmed from "./pages/EmailConfirmed";
import ResetPassword from "./pages/ResetPassword";
import OAuthCallback from "./components/OAuthCallback";



// Lazy load other components for better performance
const Index = lazy(() => import("./pages/Index"));
const FindParking = lazy(() => import("./pages/FindParking"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const FAQ = lazy(() => import("./pages/FAQ"));
const News = lazy(() => import("./pages/News"));
const NewsArticle = lazy(() => import("./pages/NewsArticle"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const RentOutYourSpace = lazy(() => import("./pages/RentOutYourSpace"));
const Calculator = lazy(() => import("./pages/Calculator"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MyAccount = lazy(() => import("./pages/MyAccount"));
const ContactAdmin = lazy(() => import("./pages/ContactAdmin"));
const Feedback = lazy(() => import("./pages/Feedback"));
const InsertBlogPosts = lazy(() => import("./pages/InsertBlogPosts"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const DubaiMarina = lazy(() => import("./pages/zones/DubaiMarina"));
const Downtown = lazy(() => import("./pages/zones/Downtown"));
const PalmJumeirah = lazy(() => import("./pages/zones/PalmJumeirah"));
const BusinessBay = lazy(() => import("./pages/zones/BusinessBay"));
const DIFC = lazy(() => import("./pages/zones/DIFC"));
const Deira = lazy(() => import("./pages/zones/Deira"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CookiesNotice = lazy(() => import("./pages/CookiesNotice"));
const LavableHome = lazy(() => import("./pages/LavableHome"));
const LavableFAQ = lazy(() => import("./pages/LavableFAQ"));
const AdminSetup = lazy(() => import("./pages/AdminSetup"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    },
  },
});

// Performance-optimized loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  console.log('App.tsx: App component rendering');
  
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <MobileOptimizations />
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <PerformanceOptimizer />
              <TawkToChat />
              <ChatWidget />
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                {/* Lavable Routes */}
                <Route path="/lavable" element={<LavableHome />} />
                 <Route path="/lavable/faq" element={<LavableFAQ />} />
                 
                 <Route path="/" element={<Index />} />
                 <Route path="/find-parking" element={<FindParking />} />
                 <Route path="/find-a-parking-space" element={<FindParking />} />
                 <Route path="/payment-success" element={<PaymentSuccess />} />
                 <Route path="/about-us" element={<AboutUs />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:slug" element={<NewsArticle />} />
                <Route path="/rent-out-your-space" element={<RentOutYourSpace />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/parking/:id" element={<ProductPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/email-confirmed" element={<EmailConfirmed />} />
                <Route path="/my-account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
                <Route path="/contact-admin" element={<ProtectedRoute><ContactAdmin /></ProtectedRoute>} />
                <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
                <Route path="/insert-blog-posts" element={<InsertBlogPosts />} />
                 <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
                 <Route path="/admin-setup" element={<AdminSetup />} />
            {/* Zone Pages */}
            <Route path="/zones/dubai-marina" element={<DubaiMarina />} />
            <Route path="/zones/downtown" element={<Downtown />} />
            <Route path="/zones/palm-jumeirah" element={<PalmJumeirah />} />
            <Route path="/zones/business-bay" element={<BusinessBay />} />
            <Route path="/zones/difc" element={<DIFC />} />
            <Route path="/zones/deira" element={<Deira />} />
            {/* Legacy zone routes for backward compatibility */}
            <Route path="/dubai-marina" element={<DubaiMarina />} />
            <Route path="/downtown" element={<Downtown />} />
            <Route path="/palm-jumeirah" element={<PalmJumeirah />} />
            <Route path="/business-bay" element={<BusinessBay />} />
            <Route path="/difc" element={<DIFC />} />
            <Route path="/deira" element={<Deira />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cookies-notice" element={<CookiesNotice />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
