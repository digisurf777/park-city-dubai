import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';

import Home from '@/pages/Home';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import CookiesNotice from '@/pages/CookiesNotice';
import ContactUs from '@/pages/ContactUs';
import AboutUs from '@/pages/AboutUs';
import HowItWorks from '@/pages/HowItWorks';
import FAQs from '@/pages/FAQs';
import NotFound from '@/pages/NotFound';
import TermsAndConditions from '@/pages/TermsAndConditions';

function App() {
  return (
    <QueryClient>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/cookies-notice" element={<CookiesNotice />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            </Routes>
          </Router>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClient>
  );
}

export default App;
