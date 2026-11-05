/**
 * Integer-only money primitives for XAF amounts (CLAUDE.md: never use floating point for money).
 * BigInt is used internally for exact round-half-up arithmetic, but every exported function here
 * takes and returns plain `number`s — BigInt must never cross this module's boundary because the
 * demo store persists to localStorage as JSON, and JSON.stringify/parse cannot serialize BigInt.
 *
 * `src/domain` is framework-free and never imports from `lib/` — `Locale` is redeclared locally
 * (structurally identical to `lib/i18n/dictionary`'s `Locale`) so `lib/format.ts` can delegate here.
 */
export type Locale = "en" | "fr";

/** Rounds n/d to the nearest integer, ties rounding up. n and d must be non-negative integers, d > 0. */
export function divideRoundHalfUp(numerator: number, denominator: number): number {
  if (!Number.isInteger(numerator) || numerator < 0) {
    throw new Error("numerator must be a non-negative integer");
  }
  if (!Number.isInteger(denominator) || denominator <= 0) {
    throw new Error("denominator must be a positive integer");
  }
  const n = BigInt(numerator);
  const d = BigInt(denominator);
  const two = BigInt(2);
  const result = (two * n + d) / (two * d);
  return Number(result);
}

/** Applies a basis-point rate to an amount, rounding the result half up (BR-FEE-2). */
export function applyRateRoundHalfUp(amount: number, rateBasisPoints: number): number {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error("amount must be a non-negative integer");
  }
  if (!Number.isInteger(rateBasisPoints) || rateBasisPoints < 0) {
    throw new Error("rateBasisPoints must be a non-negative integer");
  }
  const n = BigInt(amount) * BigInt(rateBasisPoints);
  const d = BigInt(10_000);
  const two = BigInt(2);
  const result = (two * n + d) / (two * d);
  return Number(result);
}

/** Subtracts `subtract` from `amount`, never going below zero (BR-FEE-5). */
export function subtractClampedAtZero(amount: number, subtract: number): number {
  return Math.max(0, amount - subtract);
}

// Unicode space variants Intl.NumberFormat may use as a group separator - non-breaking (0x00A0),
// figure (0x2007), thin (0x2009), narrow-no-break (0x202F) - built from char codes rather than
// literal characters so the source has no invisible/ambiguous bytes. Normalized to a plain ASCII
// space so downstream string matching (e.g. exact-value test assertions) is reliable.
const NON_ASCII_SPACES = [0x00a0, 0x2007, 0x2009, 0x202f]
  .map((code) => String.fromCharCode(code))
  .join("");
const NON_ASCII_SPACE_PATTERN = new RegExp(`[${NON_ASCII_SPACES}]`, "g");

/** Formats an XAF amount per locale convention: "150,000 XAF" (en) vs "150 000 XAF" (fr). */
export function formatXaf(amount: number, locale: Locale): string {
  const rounded = Math.round(amount);
  const intlLocale = locale === "fr" ? "fr-FR" : "en-US";
  const number = new Intl.NumberFormat(intlLocale, { maximumFractionDigits: 0 }).format(rounded);
  return `${number.replace(NON_ASCII_SPACE_PATTERN, " ")} XAF`;
}
