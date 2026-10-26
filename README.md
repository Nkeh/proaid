# ProAid Cameroon

A clickable MVP demo of ProAid — a marketplace connecting employers in Douala with vetted care
providers (nannies, house help, personal cooks, elderly caregivers, housemate support).

This is a **pitch demo**: there is no backend. All data is seeded sample data persisted to the
browser's `localStorage`. See [`CLAUDE.md`](./CLAUDE.md) for the fee model, booking lifecycle,
and architecture, and [`docs/ROADMAP.md`](./docs/ROADMAP.md) for what each simulated piece is
replaced with once real backend work starts.

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The login page offers three role buttons
(Employer / Care Provider / Admin) — no real credentials are required, this is a simulated login.
A floating **Demo** button (bottom-right, or `Shift+D`) opens a control panel to switch roles
instantly, fast-forward a monthly contract to month 6, or reset the seeded demo data.

## Scripts

```bash
npm run dev      # start the dev server (Turbopack)
npm run build    # production build — must pass with zero TypeScript/lint errors
npm run start    # run the production build
npm run lint     # ESLint
npm run test     # Vitest (fee calculation unit tests)
```

## Deploy

This app has no environment variables, no database, and no API keys — it deploys to
[Vercel](https://vercel.com) with zero configuration:

```bash
npx vercel deploy
```

or connect the repository in the Vercel dashboard and deploy directly; the default
`next build` command and Node.js runtime work as-is.
