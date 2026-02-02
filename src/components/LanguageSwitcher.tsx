import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Check } from 'lucide-react';
import { languages, type LanguageCode } from '@/i18n/config';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant?: 'desktop' | 'mobile';
  onLanguageChange?: () => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'desktop',
  onLanguageChange 
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: LanguageCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
    onLanguageChange?.();
  };

  if (variant === 'mobile') {
    return (
      <div className="py-2">
        <p className="text-sm font-semibold text-gray-600 mb-3 px-4 uppercase tracking-wide">Language</p>
        <div className="space-y-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                "w-full flex items-center justify-between py-3 px-6 text-base rounded-md touch-manipulation min-h-[44px] transition-colors",
                currentLanguage.code === lang.code 
                  ? "text-primary bg-primary/5" 
                  : "text-gray-700 hover:text-primary hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <div className="text-left">
                  <span className="font-medium">{lang.nativeName}</span>
                  <span className="text-sm text-gray-500 block">{lang.name}</span>
                </div>
              </div>
              {currentLanguage.code === lang.code && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-50"
        aria-label="Select language"
      >
        <span className="text-xl">{currentLanguage.flag}</span>
        <span className="text-sm font-medium hidden lg:inline">{currentLanguage.code.toUpperCase()}</span>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="py-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors",
                  currentLanguage.code === lang.code && "bg-primary/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left">
                    <span className={cn(
                      "font-medium block",
                      currentLanguage.code === lang.code ? "text-primary" : "text-gray-900"
                    )}>
                      {lang.nativeName}
                    </span>
                    <span className="text-sm text-gray-500">{lang.name}</span>
                  </div>
                </div>
                {currentLanguage.code === lang.code && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
