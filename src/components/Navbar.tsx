import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isZonesOpen, setIsZonesOpen] = useState(false);
  
  // Add error boundary for auth hook
  let user, signOut;
  try {
    const auth = useAuth();
    user = auth.user;
    signOut = auth.signOut;
  } catch (error) {
    console.log('Auth not ready in Navbar:', error);
    // Fallback values
    user = null;
    signOut = () => {};
  }
  const { t } = useTranslation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-white/20 shadow-lg pt-safe-area-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 min-h-[60px]">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 touch-manipulation min-h-[44px] min-w-[44px]" 
            onClick={() => {
              setIsMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <img 
              src="/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png" 
              alt="Shazam Parking" 
              className="h-10 w-auto"
              loading="eager"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/find-a-parking-space" className="text-gray-700 hover:text-primary transition-colors">
              {t('nav.findParking')}
            </Link>
            
            {/* Simple Zones Dropdown instead of NavigationMenu */}
            <div className="relative">
              <button 
                onClick={() => setIsZonesOpen(!isZonesOpen)}
                className="text-gray-700 hover:text-primary transition-colors flex items-center"
                onBlur={() => setTimeout(() => setIsZonesOpen(false), 200)}
              >
                {t('nav.zones')}
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {isZonesOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="p-2">
                    <Link 
                      to="/dubai-marina" 
                      className="block px-3 py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => setIsZonesOpen(false)}
                    >
                      {t('zones.dubaiMarina')}
                    </Link>
                    <Link 
                      to="/downtown" 
                      className="block px-3 py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => setIsZonesOpen(false)}
                    >
                      {t('zones.downtown')}
                    </Link>
                    <Link 
                      to="/palm-jumeirah" 
                      className="block px-3 py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => setIsZonesOpen(false)}
                    >
                      {t('zones.palmJumeirah')}
                    </Link>
                    <Link 
                      to="/business-bay" 
                      className="block px-3 py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => setIsZonesOpen(false)}
                    >
                      {t('zones.businessBay')}
                    </Link>
                    <Link 
                      to="/difc" 
                      className="block px-3 py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => setIsZonesOpen(false)}
                    >
                      {t('zones.difc')}
                    </Link>
                    <Link 
                      to="/deira" 
                      className="block px-3 py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => setIsZonesOpen(false)}
                    >
                      {t('zones.deira')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            <Link to="/about-us" className="text-gray-700 hover:text-primary transition-colors">
              {t('nav.aboutUs')}
            </Link>
            <Link to="/faq" className="text-gray-700 hover:text-primary transition-colors">
              {t('nav.faq')}
            </Link>
            <Link to="/news" className="text-gray-700 hover:text-primary transition-colors">
              {t('nav.news')}
            </Link>
            <Link to="/calculator" className="text-gray-700 hover:text-primary transition-colors">
              {t('nav.calculator')}
            </Link>
            
            {/* Language Switcher */}
            <LanguageSwitcher variant="desktop" />
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/my-account">
                  <Button variant="ghost" className="text-gray-700 hover:text-primary">
                    <User className="mr-2 h-4 w-4" />
                    {t('nav.myAccount')}
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={signOut}
                  className="text-gray-700 hover:text-primary"
                >
                  {t('nav.logout')}
                </Button>
                <Link to="/rent-out-your-space">
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    {t('nav.listSpace')}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" className="text-gray-700 hover:text-primary">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/rent-out-your-space">
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    {t('nav.listSpace')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="touch-manipulation min-h-[44px] min-w-[44px]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden fixed top-16 left-0 right-0 z-40 backdrop-blur-md bg-white/95 border-b border-white/20 shadow-lg animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto mobile-scroll">
            <div className="px-4 py-6 space-y-2 pb-safe-area-bottom">
              
              {/* Auth Buttons - Top of mobile menu */}
              <div className="pb-4 mb-4 border-b border-gray-200 space-y-3">
                {user ? (
                  <>
                    <Link to="/my-account" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full text-gray-700 hover:text-primary min-h-[48px] touch-manipulation text-left justify-start">
                        <User className="mr-3 h-5 w-5" />
                        {t('nav.myAccount')}
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsMenuOpen(false);
                        signOut();
                      }}
                      className="w-full text-gray-700 hover:text-primary min-h-[48px] touch-manipulation"
                    >
                      {t('nav.logout')}
                    </Button>
                    <Link to="/rent-out-your-space" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white min-h-[48px] touch-manipulation">
                        {t('nav.listSpace')}
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full text-gray-700 hover:text-primary min-h-[48px] touch-manipulation text-left justify-start">
                        {t('nav.login')}
                      </Button>
                    </Link>
                    <Link to="/rent-out-your-space" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white min-h-[48px] touch-manipulation">
                        {t('nav.listSpace')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <Link
                to="/find-a-parking-space"
                className="block text-gray-700 hover:text-primary transition-colors py-4 px-4 rounded-md touch-manipulation min-h-[48px] flex items-center text-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.findParking')}
              </Link>
              
              {/* Mobile Zones Menu */}
              <div className="py-2">
                <p className="text-sm font-semibold text-gray-600 mb-3 px-4 uppercase tracking-wide">{t('nav.popularZones')}</p>
                <div className="space-y-1">
                  <Link
                    to="/dubai-marina"
                    className="block text-gray-700 hover:text-primary transition-colors py-3 px-6 rounded-md touch-manipulation min-h-[44px] flex items-center text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('zones.dubaiMarina')}
                  </Link>
                  <Link
                    to="/downtown"
                    className="block text-gray-700 hover:text-primary transition-colors py-3 px-6 rounded-md touch-manipulation min-h-[44px] flex items-center text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('zones.downtown')}
                  </Link>
                  <Link
                    to="/palm-jumeirah"
                    className="block text-gray-700 hover:text-primary transition-colors py-3 px-6 rounded-md touch-manipulation min-h-[44px] flex items-center text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('zones.palmJumeirah')}
                  </Link>
                  <Link
                    to="/business-bay"
                    className="block text-gray-700 hover:text-primary transition-colors py-3 px-6 rounded-md touch-manipulation min-h-[44px] flex items-center text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('zones.businessBay')}
                  </Link>
                  <Link
                    to="/difc"
                    className="block text-gray-700 hover:text-primary transition-colors py-3 px-6 rounded-md touch-manipulation min-h-[44px] flex items-center text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('zones.difc')}
                  </Link>
                  <Link
                    to="/deira"
                    className="block text-gray-700 hover:text-primary transition-colors py-3 px-6 rounded-md touch-manipulation min-h-[44px] flex items-center text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('zones.deira')}
                  </Link>
                </div>
              </div>
              <Link
                to="/about-us"
                className="block text-gray-700 hover:text-primary transition-colors py-4 px-4 rounded-md touch-manipulation min-h-[48px] flex items-center text-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.aboutUs')}
              </Link>
              <Link
                to="/faq"
                className="block text-gray-700 hover:text-primary transition-colors py-4 px-4 rounded-md touch-manipulation min-h-[48px] flex items-center text-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.faq')}
              </Link>
              <Link
                to="/news"
                className="block text-gray-700 hover:text-primary transition-colors py-4 px-4 rounded-md touch-manipulation min-h-[48px] flex items-center text-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.news')}
              </Link>
              <Link
                to="/calculator"
                className="block text-gray-700 hover:text-primary transition-colors py-4 px-4 rounded-md touch-manipulation min-h-[48px] flex items-center text-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.calculator')}
              </Link>
              
              {/* Mobile Language Switcher */}
              <div className="border-t border-gray-200 mt-4 pt-4">
                <LanguageSwitcher variant="mobile" onLanguageChange={() => setIsMenuOpen(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
