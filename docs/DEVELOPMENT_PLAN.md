# ProAid — Development Plan

This is the sequencing and structure document for building the real ProAid Cameroon platform
described in `docs/SRS_v2.0.md` v2.0. It is the companion to `CLAUDE.md` (the rules) and the SRS
(the requirements): this document says *what order* things get built in and *where the code
goes*. Every iteration's actual work is recorded afterward in its own `docs/ITERATION_X.md`
report.

The pitch demo at `/demo` is frozen sample data for sales purposes (see `docs/ROADMAP.md` for its
history). None of the iterations below modify its storage model; Iteration 1B is the one
exception, and only because the demo's displayed numbers would otherwise contradict the real fee
plan shown everywhere else on the site.

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js App Router + TypeScript | Already in place (Next 16, React 19) |
| Database | PostgreSQL + Prisma | Introduced in Iteration 2. Versioned migrations only (NFR 6.6) |
| Domain logic | Pure, framework-free TypeScript in `src/domain` | No I/O, no Next.js imports, no Date.now() — see Cross-cutting decisions below |
| Validation | Zod | Introduced in Iteration 3 at every API/form boundary |
| Unit tests | Vitest | Already in place; `vitest.config.ts` now also watches `src/**/*.test.ts` |
| End-to-end tests | Playwright | Introduced whichever iteration first needs a full browser journey (expected around Iteration 6–8) — not installed yet |
| Styling | Tailwind v4 (CSS-first config) | Already in place, no `tailwind.config.js` |
| UI primitives | shadcn/ui on Base UI | Already in place — `render={<Element/>}`, not Radix `asChild` |

## Target folder structure

Most of this does not exist yet — it is created incrementally, one iteration at a time. Nothing
here should be scaffolded ahead of the iteration that needs it.

```
app/
  page.tsx, layout.tsx     public landing page (existing, kept)
  demo/                     frozen pitch demo — Iteration 1B swaps its domain engine, nothing else
  (marketing)/              FR-WEB public pages: how it works, fee plan + calculator, vetting,
                            replacement guarantee, FAQ, about, contact, Terms, Privacy
  (auth)/                   FR-AUTH: login, register, OTP verify, password reset
  (app)/                    authenticated employer / provider / staff shell: search, offers,
                            contracts, wallet, messages, disputes, back office
  api/v1/                   versioned REST route handlers, one subtree per SRS module,
                            Zod-validated request/response (Cross-cutting: API shape)
src/
  domain/                   pure, framework-free: fee engine, loyalty counting, payment-period
                            scheduling, cancellation/refund calculation, and the four SRS §7
                            state machines (Provider Verification, Offer/Contract, Payment
                            Period, Dispute). Every file paired with a *.test.ts that cites the
                            SRS requirement IDs it covers. Imported elsewhere via `@/src/domain/...`
  server/                   Prisma client, the server Clock service, per-module services and
                            repositories, auth, the audit log writer, the notification outbox,
                            the payment aggregator / SMS / email adapters (each with a sandbox
                            implementation per FR-PAY-13), and the scheduled job runner
lib/
  i18n/                     kept at its current path — dictionary.ts / en.ts / fr.ts / useT(),
                            grows with every new module's strings
  format.ts, utils.ts       kept as-is
components/                 kept; new feature folders added per module, following the existing
                            one-folder-per-domain convention (providers/, booking/, contract/, …)
prisma/
  schema.prisma             mirrors the SRS §8.1 entity list
  migrations/                versioned, one per schema change, never hand-edited after merge
e2e/                         Playwright specs — created when the first iteration needs one
docs/
  SRS_v2.0.md                requirements (source of truth)
  DEVELOPMENT_PLAN.md         this document (structure/sequencing — source of truth)
  ROADMAP.md                  historical demo-to-real mapping, superseded by this document
  ITERATION_0.md, ITERATION_1.md, …   one report per completed iteration
```

## Cross-cutting decisions

These bind every iteration below, not just the one that introduces them. They exist to prevent
rework later — each is a cheap decision now that is expensive to retrofit.

- **Business clock.** `src/domain` functions never call `Date.now()` or `new Date()` with no
  arguments. Every function that needs "now" receives it as a parameter. Iteration 2 adds one
  server `Clock` service (`src/server/clock.ts` or similar) that every other server-side service
  reads the time through. The payoff: moving the clock forward to test loyalty-tier rollover or
  overdue periods in Iteration 10 (and in staging generally, per SRS §9.1 acceptance test 6) is a
  single implementation swap of the Clock service, not a search-and-replace across the codebase.
- **API shape.** From Iteration 3 onward, every feature exposes its operations as versioned REST
  handlers under `app/api/v1`, with Zod schemas validating both the request and the response
  shape. This exists because the Release 2 mobile app is required to use the same API as the
  website (SRS §2.5). Next.js Server Actions may exist as thin callers of the same underlying
  service functions used by the API handlers, but a Server Action must never contain business
  logic that the API doesn't also expose — there is exactly one implementation of any given
  operation, reachable two ways.
- **Audit log.** A minimal append-only audit writer (`src/server/audit.ts` or similar) is created
  in Iteration 3, logging login and other security events. Iteration 4 extends it to log every
  view of a vetting document (FR-KYC-07's explicit requirement). Iteration 5 adds the staff-facing
  viewer UI (part of FR-ADM-01/08). Iteration 13 is where FR-ADM-08's full requirement — every
  staff action and every change to money, contracts, vetting and configuration — is completed
  across all remaining modules.
- **Notifications.** Iteration 2 adds a notification outbox table (an append-only queue of
  "send this message to this user via this channel" rows). Any feature built before Iteration 12
  exists that needs to notify a user writes a row to this outbox instead of sending anything
  directly. Iteration 10's scheduled jobs (reminders, overdue alerts, release/payout
  notifications) and Iteration 12's notification feature are what actually dispatch outbox rows
  over SMS/email/in-app.
- **Rate limiting.** Login, OTP, and payment endpoints are rate-limited using state stored in
  Postgres, never in server memory — the hosting target is serverless, and separate function
  instances share no memory between requests.
- **Domain imports.** Always via the `@/src/domain/...` path alias, matching the existing `@/*`
  tsconfig path pattern.

## Iteration list

Each entry lists the SRS requirement IDs it is responsible for. An ID can appear in more than one
iteration when a requirement is built incrementally (e.g. FR-ADM-08's audit log is started in
Iteration 3 and completed in Iteration 13) — that is intentional, not duplication.

### 1. Domain core
`src/domain`: the fee engine (BR-FEE-1..6, FR-FEE-01..04, every Appendix B worked example as a
test case), loyalty-month counting (BR-LOY-1..7, including OD-01 — see `CLAUDE.md` for its
resolution), payment-period scheduling for both Monthly and Half-and-Half contracts
(BR-PAY-1..3), cancellation/refund calculation (BR-CAN-1..4), and the four SRS §7 state machines
(Provider Verification, Offer/Contract, Payment Period, Dispute). NFR 6.6 applies in full: 100%
branch coverage on this layer. **Makes no changes to `/demo`.**

### 1B. Demo alignment
`/demo` is updated to call the Iteration 1 `src/domain` engine for its fee/loyalty display
(booking creation, contract summary, wallet screens) instead of the old `lib/fees.ts` /
`lib/booking.ts`, so the pitch demo shows the real SRS v2.0 numbers instead of the superseded
13%/10% model. Still fully simulated and localStorage-backed — only the domain-logic *inputs*
change, not `/demo`'s storage model or any of its screens' layout. No new SRS requirement
coverage beyond what Iteration 1 already tests.

### 2. Database and data layer
Prisma schema mirroring the SRS §8.1 entity list; first migration. The server `Clock` service and
the notification outbox table (Cross-cutting decisions). `ServiceCategory` is modeled flexibly
enough from the start to carry Release 4's home-service categories later without a schema
migration — FR-HOME-01's explicit requirement — even though home services themselves are not
built in this iteration list.

### 3. Authentication and accounts
FR-AUTH-01..09. NFR 6.3 (bcrypt/Argon2 password hashing, Postgres-backed rate limits, mandatory
staff 2FA). First `app/api/v1` Zod-validated REST handlers. The audit log writer (Cross-cutting
decisions).

### 4. Profiles and vetting
FR-PROF-01..05, FR-KYC-01..02, FR-KYC-07. Wires the Provider Verification state machine built in
Iteration 1 to real database-backed data. Audit log extended to cover every vetting document view
(Cross-cutting decisions).

### 5. Staff back office foundation
FR-ADM-01, FR-ADM-02, FR-ADM-03, FR-ADM-08 (roles and permissions, user management, the vetting
queue and interview calendar, the audit log viewer), plus FR-KYC-03..06 (the vetting checklist,
approve/reject/request-more-info decision, document renewal, and suspension flows — grouped here
because they're staff-facing vetting-queue operations, built once the queue itself exists).

### 6. Search, shortlists and job requests
FR-SRCH-01..05. Builds the job-request feature itself in full; its 14-day expiry is a scheduled
job built in Iteration 10.

### 7. Messaging
FR-MSG-01..05, BR-PRIV-1..2 (contact masking until a contract is active).

### 8. Offers, contracts and signing
FR-OFF-01..05 (the 48-hour offer-response expiry is a scheduled job built in Iteration 10),
FR-CON-01..08.

### 9. Payments, escrow and ledger
FR-PAY-01, FR-PAY-02, FR-PAY-05, FR-PAY-07 (the payment-taken-at-signing half of short jobs),
FR-PAY-09, FR-PAY-10, FR-PAY-12, FR-PAY-13, FR-PAY-14; BR-PAY-1..10; the double-entry ledger
(FR-PAY-10) in full.

### 10. Scheduled jobs, release and payouts
FR-ADM-04 (the contracts/payments monitor — placed here because it surfaces exactly what this
iteration's jobs produce: overdue periods, payouts due, failed payouts, reconciliation
differences), FR-PAY-03, FR-PAY-04, FR-PAY-06, FR-PAY-07 (the auto-confirm-after-24h and
payout-within-48h half of short jobs), FR-PAY-08, FR-PAY-11 (daily reconciliation); FR-KYC-05
(document renewal reminders); FR-OFF-03 (offer expiry); FR-SRCH-05 (job-request expiry); NFR
6.1/6.2 (every job runs at least every 15 minutes and is idempotent); OD-03 (grace-day handling).

### 11. Replacements and disputes
FR-REP-01..04, FR-DIS-01..05; BR-REP-1..3, BR-DIS-1..4.

### 12. Reviews, notifications and referrals
FR-REV-01..04, FR-NOT-01..05, FR-REF-01..02. This is where the notification outbox (Cross-cutting
decisions) actually gets dispatched, alongside Iteration 10's jobs.

### 13. Configuration, analytics and audit
FR-ADM-05..09: dispute/replacement/report queues with staff assignment, full configuration
(fee rates, loyalty thresholds, funding window, reminder days, notice period, minimum wage, SMS
caps, referral values, contract templates), analytics matching the financial plan, completing
FR-ADM-08's audit-log coverage across every module built so far, and content management. Every
SRS §11 open-decision default is wired to a configurable value here if it wasn't already.

### 14. Public website and hardening
FR-WEB-01..03. Full NFR 6.1–6.8 pass (performance, availability, security, privacy, usability,
maintainability, observability, scalability). The SRS §9.1 release-acceptance journeys run
end-to-end in both languages on a 3G Android phone. Independent security review of authentication
and payments before public launch.

### Out of scope for this iteration list
Release 2 (mobile app, FR-MOB-01..05), Release 3 (training and certification, FR-TRN-01..06), and
Release 4 (corporate packages FR-CORP-01..03, partner advertising FR-AD-01..03, home services
FR-HOME-01..03) are all out of scope — this plan covers Release 1 (the website) only — except
where a Release 1 requirement forces an early accommodation, as noted under Iteration 2
(FR-HOME-01's data-model note).
