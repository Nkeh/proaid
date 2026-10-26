# ProAid — Post-Pitch Roadmap

This MVP is a fully clickable demo built on seeded, in-browser data (`localStorage` via
Zustand) so it can be built, tested, and polished without a backend before the pitch. This
document maps every simulated piece of the demo to the real system that replaces it, and to the
SRS functional-requirement ID it satisfies. Nothing listed here is a rewrite of the UI — the
data access layer (`lib/data/`) was built specifically so these can land underneath the existing
pages without touching them.

| # | Simulated in this demo | Replaces with | SRS ID |
|---|---|---|---|
| 1 | `/login` role buttons + an email/password form that always logs into the same demo employer account; no password check, no session | Real authentication: email/phone + OTP (Cameroon numbers), hashed passwords, JWT/session cookies, password reset flow | FR-AUTH |
| 2 | Provider "verification" is a static document checklist (ID card, proof of address, reference letter, medical certificate) with Submitted/Missing labels and no actual files | Real KYC: document upload to object storage (S3-compatible), admin review UI against the real uploaded files, audit trail of who approved/rejected and when | FR-KYC |
| 3 | 14 seeded providers, instant client-side filtering over an in-memory array | Server-side search: Postgres full-text + indexed filters (category, neighbourhood, rate, language, rating), pagination, and geo-aware sorting once providers have real addresses | FR-SEARCH |
| 4 | Booking request/accept/decline is a Zustand mutation with an optimistic UI update | Real booking API: `POST /bookings`, server-validated state transitions (the existing `lib/booking.ts` state machine is backend-agnostic and can be lifted into an API route or service almost unchanged), push/SMS notification to the provider | FR-BOOK |
| 5 | Contract is a client-rendered HTML page; "signing" is typing your name + a checkbox, timestamped client-side | Real e-signature: server-timestamped consent record, immutable contract PDF generation and storage, optionally a real e-signature provider (e.g. DocuSign/HelloSign) for legal enforceability | FR-CONTRACT |
| 6 | `components/payment/momo-modal.tsx` — fake MTN/Orange MoMo flow: phone validation, 3s spinner, fake transaction reference, funds move between in-memory wallet balances | Real mobile money integration: MTN MoMo Collections/Disbursements API and Orange Money API, real webhook-based payment confirmation, real escrow held in a ProAid-controlled settlement account, reconciliation job | FR-PAY |
| 7 | Messages tab on a booking is a static/seeded thread with no real-time delivery | Real-time chat: WebSocket or polling-based messaging service, message persistence, delivery/read receipts, push notifications for new messages | FR-MSG |
| 8 | Reviews are seeded (2–4 per provider) and a completed booking lets the *current* employer leave one more, recalculated client-side | Server-side review system: one review per completed booking enforced by the backend, moderation queue for flagged reviews, recalculated rating as a stored aggregate (not computed client-side on every read) | FR-REVIEW |
| 9 | No training content exists in this demo | Training module: short onboarding/safety courses for providers (childcare first aid, elder care basics, household safety), completion tracked per provider, optionally gating certain job categories (e.g. elderly care) behind completion | FR-TRAIN |
| 10 | Admin dashboard reads seeded KPIs (`buildAdminStats`) and a static vetting queue from the store | Real admin analytics: KPIs computed from live Postgres data (placements, GMV, fee revenue, active/pending providers) via scheduled aggregation or a reporting read-replica, real-time vetting queue backed by the KYC pipeline in row 2 | FR-ADMIN |

## What does *not* need to change

- **`lib/fees.ts`** — the fee calculation is already a pure function with no I/O. It should be
  ported as-is (or called from) the backend's payment-processing code so the fee logic is never
  duplicated or allowed to drift between client and server.
- **`lib/booking.ts`** — the state machine is already backend-agnostic (`canTransition`,
  `nextStatus` operate on a plain object, not on React state). It's the right starting point for
  a server-side booking service.
- **The i18n dictionaries and `useT()` pattern** — these work the same regardless of where the
  data comes from.
- **The component tree** — every page already reads through `lib/data/*.ts` hooks rather than
  touching `localStorage`/Zustand directly, so swapping those hooks' internals from
  "read the Zustand store" to "call an API route with SWR/React Query" is a contained change per
  file, not a page rewrite.

## Suggested order of work

1. Stand up Postgres + Prisma (or an equivalent ORM) with a schema mirroring `lib/data/types.ts`.
2. FR-AUTH + FR-KYC first — nothing else is trustworthy without real identity and real documents.
3. FR-BOOK + FR-CONTRACT — port the existing state machine into an API layer.
4. FR-PAY — the highest-risk integration (external MoMo/Orange APIs, real money); build it with a
   sandbox/test-mode account before touching production credentials.
5. FR-SEARCH, FR-MSG, FR-REVIEW, FR-ADMIN, FR-TRAIN — can proceed in parallel once the above are
   stable, since each maps to a self-contained slice of `lib/data/`.
