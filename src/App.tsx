
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import EmailConfirmed from "./pages/EmailConfirmed";
import ResetPassword from "./pages/ResetPassword";
import MyAccount from "./pages/MyAccount";
import RentOutYourSpace from "./pages/RentOutYourSpace";
import Calculator from "./pages/Calculator";
import FAQ from "./pages/FAQ";
import FindParking from "./pages/FindParking";
import AboutUs from "./pages/AboutUs";
import ContactAdmin from "./pages/ContactAdmin";
import Feedback from "./pages/Feedback";
import News from "./pages/News";
import NewsArticle from "./pages/NewsArticle";
import AdminPanel from "./pages/AdminPanel";
import ProductPage from "./pages/ProductPage";
import InsertBlogPosts from "./pages/InsertBlogPosts";
import NotFound from "./pages/NotFound";
import LavableHome from "./pages/LavableHome";
import LavableFAQ from "./pages/LavableFAQ";

// Zone pages
import Downtown from "./pages/zones/Downtown";
import BusinessBay from "./pages/zones/BusinessBay";
import DubaiMarina from "./pages/zones/DubaiMarina";
import DIFC from "./pages/zones/DIFC";
import Deira from "./pages/zones/Deira";
import PalmJumeirah from "./pages/zones/PalmJumeirah";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/email-confirmed" element={<EmailConfirmed />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/my-account" element={<MyAccount />} />
            <Route path="/rent-out-your-space" element={<RentOutYourSpace />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/find-parking" element={<FindParking />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact-admin" element={<ContactAdmin />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:slug" element={<NewsArticle />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/insert-blog-posts" element={<InsertBlogPosts />} />
            <Route path="/lavable" element={<LavableHome />} />
            <Route path="/lavable-faq" element={<LavableFAQ />} />
            
            {/* Zone routes */}
            <Route path="/zones/downtown" element={<Downtown />} />
            <Route path="/zones/business-bay" element={<BusinessBay />} />
            <Route path="/zones/dubai-marina" element={<DubaiMarina />} />
            <Route path="/zones/difc" element={<DIFC />} />
            <Route path="/zones/deira" element={<Deira />} />
            <Route path="/zones/palm-jumeirah" element={<PalmJumeirah />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
