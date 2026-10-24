# Pactline frontend

Next.js 16 (App Router) + React 19 + Tailwind 4. A soft-glass, black-and-white workspace for drafting creator
contracts, checking compliance and settling milestone payouts, with human approval gates.

```bash
npm install
NEXT_PUBLIC_API_URL=http://localhost:8005 npm run dev   # backend: PACTLINE_STUB=1 uvicorn backend.pactline_backend.api:app --port 8005
```

Pages: `/` Overview, `/deal/new`, `/deal/[runId]`, `/runs`, `/replay` (and `/debug` in development).
See `docs/FRONTEND.md` in the repo root for the route table, design tokens and component map.
