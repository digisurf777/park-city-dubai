import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import LavableHome from "./pages/LavableHome";
import LavableFAQ from "./pages/LavableFAQ";
import Index from "./pages/Index";
import FindParking from "./pages/FindParking";
import AboutUs from "./pages/AboutUs";
import FAQ from "./pages/FAQ";
import News from "./pages/News";
import NewsArticle from "./pages/NewsArticle";
import ProductPage from "./pages/ProductPage";
import RentOutYourSpace from "./pages/RentOutYourSpace";
import Calculator from "./pages/Calculator";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import MyAccount from "./pages/MyAccount";
import ContactAdmin from "./pages/ContactAdmin";
import Feedback from "./pages/Feedback";
import InsertBlogPosts from "./pages/InsertBlogPosts";
import AdminPanel from "./pages/AdminPanel";
import DubaiMarina from "./pages/zones/DubaiMarina";
import Downtown from "./pages/zones/Downtown";
import PalmJumeirah from "./pages/zones/PalmJumeirah";
import BusinessBay from "./pages/zones/BusinessBay";
import DIFC from "./pages/zones/DIFC";
import Deira from "./pages/zones/Deira";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Lavable Routes */}
              <Route path="/lavable" element={<LavableHome />} />
              <Route path="/lavable/faq" element={<LavableFAQ />} />
              
              <Route path="/" element={<Index />} />
              <Route path="/find-parking" element={<FindParking />} />
              <Route path="/find-a-parking-space" element={<FindParking />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:slug" element={<NewsArticle />} />
              <Route path="/rent-out-your-space" element={<RentOutYourSpace />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/parking/:id" element={<ProductPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/my-account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
              <Route path="/contact-admin" element={<ProtectedRoute><ContactAdmin /></ProtectedRoute>} />
              <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
              <Route path="/insert-blog-posts" element={<InsertBlogPosts />} />
              <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
