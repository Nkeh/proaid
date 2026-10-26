import type { Locale } from "./i18n/dictionary";

/** Formats an XAF amount per locale convention: "150,000 XAF" (en) vs "150 000 XAF" (fr). */
export function formatMoney(amount: number, locale: Locale): string {
  const rounded = Math.round(amount);
  const intlLocale = locale === "fr" ? "fr-FR" : "en-US";
  const number = new Intl.NumberFormat(intlLocale, { maximumFractionDigits: 0 }).format(rounded);
  // Normalize fr-FR's narrow no-break space group separator to a regular space for reliable rendering.
  return `${number.replace(/ | /g, " ")} XAF`;
}

export function formatDate(iso: string, locale: Locale): string {
  const date = new Date(iso);
  const intlLocale = locale === "fr" ? "fr-FR" : "en-US";
  return new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(iso: string, locale: Locale): string {
  const date = new Date(iso);
  const intlLocale = locale === "fr" ? "fr-FR" : "en-US";
  return new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Replaces {token} placeholders in a template string, e.g. interpolate("Month {current} of {total}", { current: 1, total: 6 }). */
export function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match
  );
}
