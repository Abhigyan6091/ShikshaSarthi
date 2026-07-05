import { useCallback, useEffect, useState } from "react";
import { translate, type Language } from "@/locales";

const STORAGE_KEY = "appLanguage";
const EVENT = "appLanguageChanged";

function readLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "en" ? "en" : "hi"; // default Hindi (matches existing app default)
  } catch (_error) {
    return "hi";
  }
}

/**
 * Global language state. Backed by localStorage["appLanguage"] + the
 * "appLanguageChanged" window event (the same mechanism the adaptive module and
 * the Header toggle already use), so every component that uses this hook stays
 * in sync when the language is switched anywhere.
 */
export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(readLanguage);

  useEffect(() => {
    const handleChange = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      setLanguageState(detail?.language === "en" ? "en" : detail?.language === "hi" ? "hi" : readLanguage());
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setLanguageState(readLanguage());
    };
    window.addEventListener(EVENT, handleChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(EVENT, handleChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setLanguage = useCallback((next: Language) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (_error) {
      // ignore
    }
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { language: next } }));
    setLanguageState(next);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(readLanguage() === "hi" ? "en" : "hi");
  }, [setLanguage]);

  const t = useCallback((key: string) => translate(key, language), [language]);

  return { language, setLanguage, toggleLanguage, t };
}
