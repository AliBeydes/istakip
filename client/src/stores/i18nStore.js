import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { en } from '../locales/en';
import { tr } from '../locales/tr';

// Translation function
export const t = (key, params = {}) => {
  const { language } = useI18nStore.getState();
  const translations = language === 'tr' ? tr : en;
  
  let translation = translations[key] || key;
  
  // Replace parameters in translation
  Object.keys(params).forEach(param => {
    translation = translation.replace(`{{${param}}}`, params[param]);
  });
  
  return translation;
};

// Hook for using translations
export const useTranslation = () => {
  const { language, setLanguage } = useI18nStore();
  
  return {
    t: (key, params = {}) => t(key, params),
    language,
    setLanguage,
    isRTL: language === 'ar', // For future RTL support
    dir: language === 'ar' ? 'rtl' : 'ltr'
  };
};

// i18n store
export const useI18nStore = create(
  persist(
    (set, get) => ({
      language: 'en', // Default language
      
      setLanguage: (lang) => {
        set({ language: lang });
        
        // Update HTML lang attribute
        if (typeof document !== 'undefined') {
          document.documentElement.lang = lang;
          document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        }
      },
      
      toggleLanguage: () => {
        const currentLang = get().language;
        const newLang = currentLang === 'en' ? 'tr' : 'en';
        get().setLanguage(newLang);
      },
      
      getAvailableLanguages: () => [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }
      ],
      
      getCurrentLanguageInfo: () => {
        const languages = get().getAvailableLanguages();
        return languages.find(lang => lang.code === get().language) || languages[0];
      }
    }),
    {
      name: 'i18n-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ language: state.language })
    }
  )
);

// Initialize language on app start
if (typeof window !== 'undefined') {
  const savedLanguage = localStorage.getItem('i18n-storage');
  if (savedLanguage) {
    try {
      const { language } = JSON.parse(savedLanguage);
      useI18nStore.getState().setLanguage(language);
    } catch (error) {
      console.warn('Failed to parse saved language:', error);
    }
  }
}

// Export for non-component usage
export const i18n = {
  t,
  setLanguage: (lang) => useI18nStore.getState().setLanguage(lang),
  getLanguage: () => useI18nStore.getState().language,
  toggleLanguage: () => useI18nStore.getState().toggleLanguage()
};
