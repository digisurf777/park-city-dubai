import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import FindParking from "./pages/FindParking";
import AboutUs from "./pages/AboutUs";
import FAQ from "./pages/FAQ";
import News from "./pages/News";
import NewsArticle from "./pages/NewsArticle";
import ProductPage from "./pages/ProductPage";
import RentOutYourSpace from "./pages/RentOutYourSpace";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import MyAccount from "./pages/MyAccount";
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
              <Route path="/" element={<Index />} />
              <Route path="/find-parking" element={<FindParking />} />
              <Route path="/find-a-parking-space" element={<FindParking />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:slug" element={<NewsArticle />} />
              <Route path="/rent-out-your-space" element={<RentOutYourSpace />} />
              <Route path="/parking/:id" element={<ProductPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/my-account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
          {/* Zone Pages */}
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
