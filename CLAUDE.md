# ProAid Cameroon — Rulebook

ProAid is an online marketplace connecting **Employers** with vetted **Service Providers**
(nannies, house help/cleaners, cooks, elderly caregivers, housemate support) in Cameroon. This
file is the permanent rulebook for building the real Release 1 platform. It does not restate the
requirements or the build order — those live in:

- **`docs/SRS_v2.0.md`** — the Software Requirements Specification. Source of truth for *what*
  to build. Requirement IDs (`FR-PAY-06`, `BR-LOY-5`, section numbers like `§7.3`) referenced
  throughout this file and in code come from this document.
- **`docs/DEVELOPMENT_PLAN.md`** — the target folder structure, tech stack, the 14-iteration
  build order with SRS IDs mapped to each, and the cross-cutting decisions (business clock, API
  shape, audit log, notifications, rate limiting) that every iteration must honor.
- **`docs/ITERATION_X.md`** — one report per completed iteration (see "Reporting," below).
- **`docs/ROADMAP.md`** — historical record of what the original pitch demo simulated and what
  replaces it. Superseded by `DEVELOPMENT_PLAN.md` for anything about sequencing; kept for
  history.

Where this file and the SRS disagree about a rule, the SRS wins and this file should be
corrected.

## The demo lives at `/demo` and must never break

Everything under `app/demo/`, `store/useAppStore.ts`, and `lib/data/*.ts` is the original pitch
demo: client-only, seeded, persisted to `localStorage`, no real backend. It exists to be
clickable for sales purposes and is **frozen** — do not extend it with new SRS features, and do
not let real-platform work regress it. The one planned exception is **Iteration 1B**, which
updates the demo's fee/loyalty display to call the real `src/domain` engine once it exists, so
the demo stops showing the superseded 13%/10% fee model; that iteration changes the demo's
*inputs*, never its storage model.

The public landing page (`app/page.tsx`, `app/layout.tsx`) is the real site's home page, not part
of the demo, and is not gated behind demo-store hydration.

Every iteration's manual test plan must include clicking through `/demo` end to end
(login → dashboard → search → provider profile → book → contract → wallet; the floating demo
panel's role switch, fast-forward, and reset) to confirm nothing broke.

## Git — read-only, always

Only read-only git commands are allowed: `git status`, `git diff`, `git log` (and similarly
inspect-only commands). **Never** run `git commit`, `git push`, `git reset`, `git rebase`,
`git checkout` of another branch, `git stash`, or any other command that changes history or the
remote. The owner commits manually after reviewing each iteration's diff. If a change feels like
it needs a commit to be "finished," it doesn't — stop there and let the report stand in for it.

## Database and secrets

- Never run a migration or a seed script against any database other than the one named by
  `DATABASE_URL` in `.env.local`. Never point a migration at staging or production from this
  environment.
- Never print or commit a secret. Never commit `.env.local` or any file containing a real
  credential.
- Keep `.env.example` current: every environment variable the app reads must have an entry there
  with a one-line comment explaining what it's for. Add the entry in the same change that
  introduces the variable.

## Scope discipline

Stay strictly inside the current iteration's scope, as defined by `docs/DEVELOPMENT_PLAN.md`. If
finishing the iteration properly seems to need something outside that scope — a dependency
bump, a schema change for a later iteration's entity, a fix to unrelated code — **do not do it**.
List it in the iteration's report instead, with enough detail that it can be picked up
deliberately later.

## Every iteration ends green

Before an iteration is considered done, all four of these must pass:

```
npm run typecheck
npm run lint
npm test
npm run build
```

## Reporting — `docs/ITERATION_X.md`

Every iteration, including this restructuring pass (`docs/ITERATION_0.md`), ends with a report
at `docs/ITERATION_X.md` containing:

- Summary of changes
- Files added / changed
- New dependencies, and why each was added
- New environment variables (cross-reference `.env.example`)
- Database migrations added
- How to test manually, step by step
- Known limitations
- A suggested one-line commit message (the owner commits it themselves — see Git, above)

## Money, domain logic, and state

- **All money is integer XAF.** Never use floating point for money, anywhere, for any reason.
  Round to the nearest whole XAF, half rounding up, exactly where the SRS specifies (BR-FEE-2).
- **All fee, loyalty, payment-schedule, and state-machine logic lives in `src/domain`** as pure,
  framework-free TypeScript — no Next.js imports, no I/O, no reading the system clock directly
  (see Cross-cutting decisions). `src/domain` is the *only* place these rules are implemented;
  every screen, API handler, and background job calls into it rather than recomputing anything.
  Every file in `src/domain` has a paired `*.test.ts`, and per NFR 6.6 this layer has 100% branch
  coverage, including every worked example in SRS Appendix B.
- Import domain code via the `@/src/domain/...` path alias.

## Open decisions (SRS §11)

Use the SRS's stated default for every open decision until the founders record a different
choice, and keep each one configurable or isolated so a later change doesn't require a rework.

- **OD-01** (loyalty counting when an employer has two or more long contracts active in the same
  calendar month): **decided — count per contract month.** Concurrent long contracts each add
  their own loyalty months; they are never deduplicated onto one calendar month. Only funded
  months count toward the displayed total (BR-LOY-2). Implemented in `src/domain/loyalty.ts` and
  kept behind that module's pure functions so a future change stays isolated to one place.
  (`docs/ITERATION_0.md` has a short note that this was an owner decision, not a markdown
  transcription bug.)
- All other OD-02 through OD-13 defaults: implement exactly as stated in SRS §11, each behind a
  configuration value or an isolated code path, not hardcoded inline.

## Cross-cutting decisions (full version in `docs/DEVELOPMENT_PLAN.md`)

- **Business clock.** `src/domain` never calls `Date.now()` or `new Date()` with no arguments —
  every function takes the dates it needs as parameters. From Iteration 2, a single server
  `Clock` service is the one place anything server-side reads "now" from.
- **API shape.** From Iteration 3, every feature's operations are exposed as versioned REST
  handlers under `app/api/v1` with Zod request/response schemas (the Release 2 mobile app
  depends on this — SRS §2.5). Server Actions may call the same underlying service functions but
  must never contain business logic the API doesn't also expose.
- **Audit log.** An append-only audit writer exists from Iteration 3; by Iteration 13 it covers
  every staff action and every change to money, contracts, vetting, and configuration
  (FR-ADM-08). It cannot be edited or deleted, ever — corrections are new entries, never
  mutations.
- **Notifications.** A notification outbox table exists from Iteration 2. Anything that needs to
  notify a user before the notifications feature (Iteration 12) exists writes to the outbox
  instead of sending anything directly.
- **Rate limiting.** State lives in Postgres, never in server memory — hosting is serverless and
  instances share nothing.

## Internationalization

Every user-facing string, on every page added for the real platform, exists in English and
French from the moment it ships — not as a follow-up. Follow the existing pattern: a typed
`Dictionary` interface (`lib/i18n/dictionary.ts`) implemented by `en.ts` and `fr.ts`, read through
`useT()`. Money is formatted with `lib/format.ts`'s `formatMoney()` — never interpolate a raw
number into user-facing text.

## Carried-over stack notes (still true, still apply to `/demo` and to new code)

- **Next.js 16 / App Router.** `params`/`searchParams` are async in Server Component page props
  in this version.
- **shadcn/ui is on Base UI, not Radix.** Polymorphic composition uses `render={<Element />}`
  (not `asChild`). `Button` needs `nativeButton={false}` when rendered as a non-`<button>`
  element (e.g. a `Link`).
- **Tailwind v4**, CSS-first config in `app/globals.css` (`@theme inline`) — there is no
  `tailwind.config.js`.
- **Zustand selectors must never allocate.** A selector that does `.filter()/.map()/.sort()`
  inline breaks `useSyncExternalStore`'s snapshot caching. Select the raw array, then `useMemo`
  the derived result. (Applies to `/demo`'s store; the real platform does not use Zustand for
  server data — see `docs/DEVELOPMENT_PLAN.md`.)
