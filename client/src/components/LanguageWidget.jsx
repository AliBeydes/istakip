'use client';

import { useState } from 'react';
import { useI18nStore } from '@/stores/i18nStore';

export default function LanguageWidget() {
  const { language, setLanguage, getAvailableLanguages, getCurrentLanguageInfo } = useI18nStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLanguage = getCurrentLanguageInfo();
  const availableLanguages = getAvailableLanguages();

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        title="Change Language / Dil Değiştir"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="hidden sm:inline">{currentLanguage.name}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 z-20 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="py-1">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-3 ${
                    language === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                  {language === lang.code && (
                    <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Compact version for mobile/small spaces
export function LanguageToggle() {
  const { language, toggleLanguage, getCurrentLanguageInfo } = useI18nStore();
  const currentLanguage = getCurrentLanguageInfo();
  
  return (
    <button
      onClick={toggleLanguage}
      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
      title="Toggle Language / Dil Değiştir"
    >
      <span className="text-xl">{currentLanguage.flag}</span>
    </button>
  );
}

// Language selector for settings page
export function LanguageSelector() {
  const { language, setLanguage, getAvailableLanguages } = useI18nStore();
  const availableLanguages = getAvailableLanguages();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Language / Dil
      </label>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {availableLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
