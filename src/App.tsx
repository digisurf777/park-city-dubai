import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';

import Index from '@/pages/Index';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import CookiesNotice from '@/pages/CookiesNotice';
import ContactAdmin from '@/pages/ContactAdmin';
import AboutUs from '@/pages/AboutUs';
import FAQ from '@/pages/FAQ';
import NotFound from '@/pages/NotFound';
import TermsAndConditions from '@/pages/TermsAndConditions';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/cookies-notice" element={<CookiesNotice />} />
              <Route path="/contact-us" element={<ContactAdmin />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/faqs" element={<FAQ />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            </Routes>
          </Router>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
