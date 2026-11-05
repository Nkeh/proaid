# Iteration 0 — Repo audit, demo preservation, planning

This is a pre-Iteration-1 pass: no SRS features were built. It audits the existing pitch demo,
moves it to `/demo` so it survives as a sales artifact, rewrites `CLAUDE.md` into the permanent
rulebook, and writes `docs/DEVELOPMENT_PLAN.md`, the 14-iteration build plan for the real
Release 1 platform defined in `docs/SRS_v2.0.md`.

## Summary of changes

1. **Audit** of the demo repo against SRS v2.0 (below).
2. **Moved the demo to `/demo`** — all 10 demo routes relocated under `app/demo/`, a new nested
   `app/demo/layout.tsx` carries the demo-only chrome (store hydration, the demo panel, a new
   "Pitch demo: sample data" banner), the root layout was slimmed to a true public shell, and
   every internal link/redirect that pointed at an old route was updated.
3. **Permanent redirects** added for all 10 pre-move URLs, so nothing shared before this change
   breaks.
4. **`CLAUDE.md` rewritten** as the permanent rulebook (git read-only rules, DB/secrets rules,
   scope discipline, iteration-report format, money/domain rules, OD-01 resolution, cross-cutting
   decisions, demo-preservation rule).
5. **`docs/DEVELOPMENT_PLAN.md` written**: tech stack, target folder structure, cross-cutting
   decisions, and the 14-iteration (plus 1B) build order with SRS requirement IDs.
6. **`docs/ROADMAP.md`** given a one-line "superseded by DEVELOPMENT_PLAN.md" notice; otherwise
   untouched.
7. **Tooling**: added a `typecheck` script; extended Vitest's `include` to also watch
   `src/**/*.test.ts` (no-op today — `src/` doesn't exist yet).

No SRS features were implemented. Iteration 1 (domain core) and Iteration 1B (wiring the demo to
the new domain engine) are separate, future work.

## OD-01 — owner decision, not a transcription error

An earlier draft of this report treated the §11 Open Decisions table's OD-01 row (*"count both
months, as long as they are different contracts"*) as contradicting BR-LOY-2's prose and assumed
the table was a transcription error, defaulting to count-once-per-calendar-month. That assumption
was wrong. The owner has since decided OD-01 directly: loyalty counts **per contract month** —
concurrent long contracts each add their own months and are never deduplicated onto one calendar
month; only funded months count toward the displayed total (BR-LOY-2, revised accordingly in
`docs/SRS_v2.0.md`). The §11 table row was already correct and needed no edit. See `CLAUDE.md`'s
"Open decisions" section and `src/domain/loyalty.ts` (Iteration 1B) for the implementation.

## Audit findings

**Reusable as-is for the real platform:**
- `components/ui/*` — 18 Base UI–backed shadcn primitives, no route or domain coupling.
- `components/brand/*` — `Logo`, `InitialsAvatar`.
- The i18n pattern — `lib/i18n/dictionary.ts`'s typed `Dictionary` interface, `en.ts`/`fr.ts`,
  `useT()`/`useLocale()`. Zustand-backed but has no route dependency.
- `lib/format.ts` — `formatMoney`/`formatDate`/`formatDateTime`/`interpolate`, locale-aware, no
  business logic.
- `components/layout/header.tsx` / `footer.tsx` as a *pattern* — will need real
  auth/navigation wiring from Iteration 3, but the shell itself is sound.
- The stack choices: Next 16, Tailwind v4, Base UI, and the documented decision in
  `next.config.ts` to stay 100% client-rendered (no Cache Components/PPR).

**Must be replaced, not ported** — this corrects `docs/ROADMAP.md`, which claimed `lib/fees.ts`
and `lib/booking.ts` could be "lifted into an API route almost unchanged." That's no longer true:
- `lib/fees.ts` — a flat 13%/10% model. SRS BR-FEE is a loyalty-tiered 14%/12%/6%/4% plan with
  loyalty-month counting (BR-LOY) and per-contract-month rate freezing (BR-FEE-4). A new engine
  is built from scratch in `src/domain` in Iteration 1, then wired into `/demo` in Iteration 1B.
- `lib/booking.ts` — one flat state machine. SRS §7 defines four separate state models (Provider
  Verification, Offer/Contract, Payment Period, Dispute). Not an extension — a fresh design.
- `store/useAppStore.ts` and all of `lib/data/*.ts` — replaced by Postgres + Prisma + a real
  repository/API layer from Iteration 2 onward. This layer stays `/demo`-only.
- `/login`'s fake role-switch auth — replaced by real phone+OTP auth (FR-AUTH, Iteration 3).
- No Zod anywhere in the repo today — needed from Iteration 3 at API/form boundaries.
- No `.env*` files or `process.env` usage anywhere — expected; Iteration 2 introduces the first
  variable (`DATABASE_URL`). `.env.example` was not created this pass because there's nothing to
  put in it yet.

## Files added / changed

**Added**
- `app/demo/layout.tsx` — demo-only chrome (store hydration, demo panel, banner).
- `components/demo/demo-banner.tsx` — "Pitch demo: sample data" banner, bilingual.
- `docs/DEVELOPMENT_PLAN.md`, `docs/ITERATION_0.md` (this file).

**Moved** (directory rename, `git mv`, history preserved): `app/login`, `app/employer`,
`app/wallet`, `app/provider-dashboard`, `app/admin`, `app/search`, `app/provider/[id]`,
`app/book/[id]`, `app/booking/[id]`, `app/booking/[id]/contract` → the same paths under
`app/demo/`.

**Changed**
- `app/layout.tsx` — dropped `StoreHydration`/`HydrationGate`/`DemoPanel`/`TooltipProvider`
  (moved to `app/demo/layout.tsx`); kept `Header`/`Footer`/`Toaster`. The public home page no
  longer waits on demo-store hydration before rendering.
- `app/page.tsx` — hero and category-card links now point at `/demo/search` and `/demo/login`.
- `components/layout/header.tsx` — all role-based nav links, the login button, and the logout
  redirect now point at `/demo/*`.
- `components/demo/demo-panel.tsx` — `SHARED_PATH_PREFIXES` updated to `/demo/*` paths; removed
  the now-dead `pathname === "/"` guard (the panel only ever mounts inside `/demo` now).
- `components/providers/provider-card.tsx` — provider-profile link now `/demo/provider/:id`.
- `lib/data/session.ts` — `ROLE_HOME` map now points at `/demo/employer`, `/demo/provider-dashboard`,
  `/demo/admin`.
- `lib/hooks/use-require-role.ts` — both redirect-to-login calls now target `/demo/login`.
- `app/demo/login/page.tsx` — the local `dest` ternary replaced with `ROLE_HOME[role]`, removing
  a duplicate literal map.
- `app/demo/employer/page.tsx`, `app/demo/provider-dashboard/page.tsx`,
  `app/demo/provider/[id]/page.tsx`, `app/demo/book/[id]/page.tsx`,
  `app/demo/booking/[id]/page.tsx`, `app/demo/booking/[id]/contract/page.tsx` — every internal
  `Link`/`router.push` target prefixed with `/demo`.
- `lib/i18n/dictionary.ts`, `lib/i18n/en.ts`, `lib/i18n/fr.ts` — added `demo.bannerText`.
- `next.config.ts` — added a `redirects()` export with 10 permanent redirects from the old demo
  URLs to their `/demo` equivalents.
- `package.json` — added the `typecheck` script.
- `vitest.config.ts` — `include` now also matches `src/**/*.test.ts`.
- `docs/ROADMAP.md` — added a one-line superseded-by notice at the top; nothing else changed.
- `CLAUDE.md` — full rewrite (see Summary, above).

No files were deleted; no `AGENTS.md` changes (left byte-for-byte as Next.js's own generated
content).

## New dependencies

None.

## New environment variables

None. No `.env*` file exists in the repo and none was added — there's nothing to configure yet.
`.env.example` will be created in Iteration 2, when `DATABASE_URL` becomes the first variable.

## Database migrations

None.

## How to test manually

1. `npm run build && npm run start`, then in a browser:
2. Visit `/` — it should render immediately (no loading spinner), and the hero's "Find a
   provider" / "Become a provider" buttons and the five category cards should link to
   `/demo/search...` and `/demo/login`.
3. Visit `/demo/login` directly — pick each of the three roles in turn and confirm you land on
   `/demo/employer`, `/demo/provider-dashboard`, or `/demo/admin` respectively.
4. As Employer: search providers (`/demo/search`), open a provider profile
   (`/demo/provider/:id`), book them (`/demo/book/:id`), sign the contract
   (`/demo/booking/:id/contract`), fund it, and check the wallet (`/demo/wallet`) — the whole
   flow should behave exactly as it did before the move.
5. Open the floating demo panel (bottom-right button or Shift+D) on any `/demo/*` page: confirm
   role switching, fast-forward-to-month-6, and reset-demo-data all still work.
6. Confirm the amber "Pitch demo: sample data" banner is visible at the top of every `/demo/*`
   page, in both English and French (use the language toggle in the header).
7. Hit each of these 10 pre-move URLs directly and confirm a permanent redirect (HTTP 308) to
   its `/demo` equivalent — verified already via `curl` during this pass, repeat to confirm in a
   browser if desired:
   - `/login` → `/demo/login`
   - `/employer` → `/demo/employer`
   - `/wallet` → `/demo/wallet`
   - `/provider-dashboard` → `/demo/provider-dashboard`
   - `/admin` → `/demo/admin`
   - `/search?category=NANNY` → `/demo/search?category=NANNY` (query string preserved)
   - `/provider/provider-1` → `/demo/provider/provider-1`
   - `/book/provider-1` → `/demo/book/provider-1`
   - `/booking/abc` → `/demo/booking/abc`
   - `/booking/abc/contract` → `/demo/booking/abc/contract`
8. Run `npm run typecheck && npm run lint && npm test && npm run build` — all four pass as of
   this report (`.next` was deleted and rebuilt clean to confirm; stale generated route types
   from before the move were the only transient failure, resolved by the rebuild).

## Known limitations

- Iteration 1 (domain core) and Iteration 1B (wiring `/demo` to the new domain engine) have not
  started. `/demo` still uses the superseded `lib/fees.ts`/`lib/booking.ts` until 1B lands.
- The root `Header` (used on both `/` and every `/demo/*` page) still links to `/demo/login`,
  `/demo/employer`, etc. This is correct and intentional until Iteration 3 ships real
  authentication and a real authenticated app shell outside `/demo` — at that point `Header`
  needs to branch between the real auth flow and nothing demo-related.
- The `/login` redirect currently targets `/demo/login`, the only login page that exists.
  Iteration 3 will introduce the real `/login` (or an `(auth)` route group) — at that point this
  specific redirect's destination (and its reason for existing at all) changes.
- `.env.example` does not exist yet — deferred to Iteration 2, which introduces the first
  environment variable.
- `docs/ROADMAP.md`'s original "what does not need to change" section (claiming `lib/fees.ts`/
  `lib/booking.ts` reuse) is now stale; it carries a superseded-by notice but was not otherwise
  rewritten, per scope.
- OD-01 (see above) is an owner decision, not an SRS defect — no SRS markdown edit was needed at
  the time of this report; `docs/SRS_v2.0.md`'s BR-LOY-2 prose was later updated in Iteration 1B
  to match.

## Suggested commit message

```
Move pitch demo to /demo, add redirects, write real-platform dev plan and rules
```
