import type { Locale } from "./i18n/dictionary";
import { formatXaf } from "@/src/domain/money";

/** Formats an XAF amount per locale convention: "150,000 XAF" (en) vs "150 000 XAF" (fr). */
export function formatMoney(amount: number, locale: Locale): string {
  return formatXaf(amount, locale);
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

/** FR-SRCH-02/03: providers are shown as "First L." everywhere outside the signed contract itself. */
export function firstNameLastInitial(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName;
  const [first, ...rest] = parts;
  const lastInitial = rest[rest.length - 1][0];
  return `${first} ${lastInitial}.`;
}

/** Replaces {token} placeholders in a template string, e.g. interpolate("Month {current} of {total}", { current: 1, total: 6 }). */
export function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match
  );
}
