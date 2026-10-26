# ProAid Cameroon — Project Context

ProAid is an online marketplace connecting **Employers** (families/professionals/expatriates in
Douala) with vetted **Care Providers** (nannies, house help/cleaners, personal cooks, elderly
caregivers, housemate support). This repository is a **pitch-demo MVP**: fully clickable, fully
bilingual (EN/FR), with realistic simulated data and payments, but **no real backend**.

Real backend work (Postgres, real auth, real MoMo/Orange Money integration, document storage,
etc.) starts after the pitch — see `docs/ROADMAP.md` for exactly what each simulated piece will
be replaced with and which SRS requirement it maps to.

## Critical rule: all money goes through `lib/fees.ts`

**Never compute a fee, a provider payout, or a platform-fee total inline in a component.**
Every screen that displays money derived from a booking amount must call
`calculateFee({ contractType, amount, monthNumber })` from `lib/fees.ts` and use its returned
`feeAmount` / `providerAmount`. This is the single source of truth for the fee model and is
covered by exact-value unit tests in `lib/fees.test.ts` — if the fee model ever changes, change
it there and nowhere else.

### The fee model (exact)

- **Short-term / one-time bookings**: a flat **13%** fee, charged once.
- **Monthly contracts**: **13%** of that month's salary for months 1–5, **10%** from month 6
  onward. The fee rate is a function of `monthNumber`, not of the contract as a whole — a
  12-month contract pays 13% for months 1–5 and 10% for months 6–12.
- The provider always receives `amount - feeAmount`.
- All amounts are rounded to the nearest whole XAF.

```ts
calculateFee({ contractType: "MONTHLY", amount: 150_000, monthNumber: 1 })
// → { feeRate: 0.13, feeAmount: 19_500, providerAmount: 130_500 }

calculateFee({ contractType: "MONTHLY", amount: 150_000, monthNumber: 6 })
// → { feeRate: 0.10, feeAmount: 15_000, providerAmount: 135_000 }

calculateFee({ contractType: "SHORT_TERM", amount: 100_000, monthNumber: 1 })
// → { feeRate: 0.13, feeAmount: 13_000, providerAmount: 87_000 }
```

## Booking lifecycle state machine (`lib/booking.ts`)

```
REQUESTED
  → ACCEPTED        (provider accepts)
  → DECLINED         (provider declines)

ACCEPTED
  → CONTRACT_SIGNED  (both employer and provider have signed)

CONTRACT_SIGNED
  → FUNDED           (employer pays the current month/job into escrow via simulated MoMo)

FUNDED
  → SERVICE_CONFIRMED (employer confirms the work was done; escrow splits and releases:
                        provider payout + platform fee, recorded as wallet transactions)

SERVICE_CONFIRMED
  → next month, status returns to FUNDED-pending (awaiting the next month's funding)
    for MONTHLY contracts until the final month, then → COMPLETED
  → COMPLETED directly for SHORT_TERM contracts

COMPLETED
  → employer can leave a review, which updates the provider's aggregate rating

Any state before FUNDED
  → employer can CANCEL
```

State transitions are validated by `canTransition()` / `nextStatus()` in `lib/booking.ts`, which
operate on a flat `BookingLike` shape. The actual `Booking` domain type nests signatures as
`{ signed, ... }` objects, so every call site converts with `toBookingLike()` before calling into
the state machine — see `store/useAppStore.ts` for the canonical usage. The UI never renders a
transition that `canTransition()` rejects; invalid transitions are structurally impossible, not
just hidden.

## Data layer

There is no backend. All seed data lives in `lib/data/seed.ts` and all runtime state (bookings,
wallet, notifications, provider verification status, language, current role) lives in a single
Zustand store (`store/useAppStore.ts`) persisted to `localStorage` via the `persist` middleware.

Pages and components **never** touch `useAppStore` or `localStorage` directly for reads — they go
through the repository layer in `lib/data/` (`providers.ts`, `bookings.ts`, `wallet.ts`,
`notifications.ts`, `admin.ts`, `session.ts`), which exposes typed hooks (`useProviders`,
`useAllBookings`, `useWallet`, …) and action functions (`createBooking`, `updateBooking`, …).
This indirection is what lets the real backend swap (Postgres + API routes) land in two days
without touching a single page — only `lib/data/*.ts` changes.

Because the store is only readable client-side, hydration is handled explicitly:
`skipHydration: true` + a manual `rehydrate()` call in a mount-only effect, gated by a
`hasHydrated` flag and `HydrationGate`. Never read `localStorage` during render or in a
Server Component.

## Internationalization

Every user-facing string goes through the dictionary (`lib/i18n/en.ts` / `lib/i18n/fr.ts`,
typed by a shared `Dictionary` interface in `lib/i18n/dictionary.ts`) and the `useT()` hook.
The active language lives in the Zustand store, not in the URL — there is no locale routing.
Longer freeform content (provider bios, skills, reviews, seed chat messages) is stored as
parallel `xFr` fields or `.en`/`.fr` sub-objects directly on the seed data, not routed through
the dictionary.

Money is formatted with `lib/format.ts`'s `formatMoney(amount, locale)`:
`"150,000 XAF"` in English, `"150 000 XAF"` in French. Always use it — never interpolate a raw
number into user-facing text.

## Folder structure

```
app/                      Next.js App Router pages (all 'use client' — see below)
  page.tsx                 Landing page
  login/                    Role-select + demo login
  employer/                 Employer dashboard
  search/                   Provider search + filters
  provider/[id]/             Provider profile
  book/[id]/                 Booking request form
  booking/[id]/               Booking detail (lifecycle, payment, messages)
  booking/[id]/contract/       Generated employment agreement, signing, print view
  wallet/                   Employer wallet + transaction history
  provider-dashboard/      Care provider's own dashboard
  admin/                    Admin KPIs, charts, vetting queue, all bookings

components/
  ui/                       shadcn/ui primitives (Base UI, not Radix — see below)
  providers/, booking/, contract/, payment/, wallet/, admin/, notifications/, layout/, demo/, brand/
                             Feature components, one folder per domain

lib/
  fees.ts, fees.test.ts     THE fee model (see above)
  booking.ts                 Booking lifecycle state machine
  format.ts                  Money/date formatting helpers
  data/                       Repository layer + domain types + seed data
  i18n/                       Dictionaries + useT()
  hooks/                      useRequireRole / useRequireAnyRole route guards

store/useAppStore.ts        The single Zustand store (all mutations live here)
docs/ROADMAP.md             What's simulated vs. what replaces it post-pitch
```

## Stack notes worth knowing before touching this code

- **Next.js 16 / App Router / Turbopack.** `params`/`searchParams` are async in Server
  Component page props in this version — sidestepped entirely because every page is
  `'use client'` (they all read the Zustand store) and uses the `useParams()` hook instead.
- **shadcn/ui is installed on Base UI, not Radix.** Polymorphic composition uses
  `render={<Element />}` (not `asChild`). `Button` needs `nativeButton={false}` when rendered
  as a non-`<button>` element (e.g. a `Link`).
- **Tailwind v4**, CSS-first config in `app/globals.css` (`@theme inline`) — there is no
  `tailwind.config.js`.
- **Zustand selectors must never allocate.** A selector that does `.filter()/.map()/.sort()`
  inline will break `useSyncExternalStore`'s snapshot caching ("getSnapshot should be cached").
  Select the raw array, then `useMemo` the derived result.
- **Route guarding is client-side only** (`useRequireRole`/`useRequireAnyRole`), since there is
  no server session. On a role mismatch they redirect to the *current* role's own home
  (`ROLE_HOME`), not unconditionally to `/login` — this matters because the Demo panel's role
  switch updates the store and navigates in the same tick, and both redirects must agree on a
  destination.
- **Authentication is fully simulated.** `/login` has three role buttons and a normal-looking
  email/password form that always logs into the same demo employer account. There is no
  password check and no server session — do not add one without reading `docs/ROADMAP.md` first.
- **MoMo payments are simulated** (`components/payment/momo-modal.tsx`): provider choice,
  phone-number validation, a 3s fake "approve on your phone" delay, a fake transaction
  reference. Clearly labeled "Simulated payment (demo mode)" everywhere it appears.
