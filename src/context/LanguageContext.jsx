// src/context/LanguageContext.jsx

import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

// Detect current language from Google Translate cookie
function getCurrentLang() {
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('googtrans='));
  if (!cookie) return 'en';
  const val = cookie.split('=')[1]; // e.g. "/en/hi"
  const parts = val.split('/');
  return parts[parts.length - 1] || 'en';
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getCurrentLang);

  const changeLanguage = (langCode) => {
    setLanguage(langCode);
    window.changeLanguage(langCode); // index.html ka function call hoga
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}