import { useAppStore } from "@/store/useAppStore";
import { en } from "./en";
import { fr } from "./fr";
import type { Dictionary, Locale } from "./dictionary";

export type { Dictionary, Locale };
export { en, fr };

const dictionaries: Record<Locale, Dictionary> = { en, fr };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Reads the current language from the app store and returns its dictionary. */
export function useT(): Dictionary {
  const locale = useAppStore((s) => s.language);
  return dictionaries[locale];
}

export function useLocale(): Locale {
  return useAppStore((s) => s.language);
}
