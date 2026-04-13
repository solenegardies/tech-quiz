import { en, type Dictionary } from "./dictionaries/en";
import { fr } from "./dictionaries/fr";

const dictionaries: Record<string, Dictionary> = { en, fr };
let currentLang = "fr";

export function setLanguage(lang: string) {
  if (dictionaries[lang]) currentLang = lang;
}

export function getLanguage(): string {
  return currentLang;
}

export function useTranslation() {
  return { t: dictionaries[currentLang] ?? en, lang: currentLang };
}

export type { Dictionary };
