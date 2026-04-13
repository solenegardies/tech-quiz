"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { setLanguage as setI18nLanguage, getLanguage } from "@/lib/i18n";

type LanguageContextType = {
  lang: string;
  setLang: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "fr",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState(getLanguage());

  const setLang = useCallback((newLang: string) => {
    setI18nLanguage(newLang);
    setLangState(newLang);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
