# Pactline frontend guide

Next.js 16 App Router, React 19, Tailwind 4. No chart or icon dependencies: charts are hand-written SVG and icons are inline SVG.
All backend access goes through `frontend/agenticflow/lib/api.ts`; the only place a host appears is `lib/config.ts` (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`).

## Backend routes

| Route | Method | Used by | Status |
|---|---|---|---|
| `/health` | GET | `useHealth` (shell, polled every 10 s) | WIRED-NOW |
| `/mode` (additive, `routes_extra.py`) | GET | `useHealth` → mode badge (stub / live) | WIRED-NOW |
| `/deal` | POST | Overview input, New deal, Replay "start live run", `/debug` | WIRED |
| `/ws/deal/{run_id}` | WS | `useDealSocket` (run workspace, `/debug`) | WIRED |
| `/runs` | GET | `useRuns` (shell, Overview, Runs, New deal); polled every 5 s only while a run is active | WIRED |
| `/runs/{id}/events` | GET | `useDealSocket` (stored-log view, reconnect merge), `useRunSummary(s)` (Overview KPIs) | WIRED-NOW |
| `/runs/{id}/export/ledger.csv` | GET | Run workspace, Runs table, Overview "Download" (fetch + blob) | WIRED |
| `/runs/{id}/export/contract.pdf` | GET | Run workspace, Runs table (fetch + blob) | WIRED |
| `/replay/{name}` (normal, ambiguous, failure) | GET | Replay page | WIRED |
| `/replay/demo` | GET | Replay page ("Demo recording") | WIRED-NOW |
| `/sources/{id}` | GET | Citation drawer | SKIPPED: route does not exist; the drawer uses clause, retrieval-hit and compliance data already in the run |
| `/upload` | POST | none | SKIPPED: accepts `.csv` only, overwrites `dataset/data.csv` and regenerates dataset-audit outputs. It is not a deal-brief intake |
| `/dataset/status` | GET | none | SKIPPED: legacy dataset audit |
| `/outputs/{filename}` | GET | none | SKIPPED: legacy dataset audit outputs |
| `/ws/audit` | WS | none | SKIPPED: legacy Docker audit stream |

There is no route that lists replay scenarios, so scenario cards are static in `app/replay/page.tsx` and `app/deal/new/page.tsx`.

## Connection behaviour (`hooks/useDealSocket.ts`)

The backend starts a **new run on every WebSocket connect**. So the hook first asks `/runs/{id}/events`:
404 means a fresh run (open the socket); events exist means show the stored log without opening a socket (never shows a stale approval prompt).
If the socket drops mid-run, the hook shows "Reconnecting" and follows the stored log every 3 s instead of reopening the socket.
Public API is unchanged; `connection` and `interrupted` were added to the state.

## Design tokens (`app/globals.css`)

Canvas `#F4F4F2` with two radial glows; surface `rgba(255,255,255,.72)` + 12 px blur (solid fallback); ink `#0B0B0C`, ink-2 `#3F3F46`, muted `#71717A`, line `rgba(0,0,0,.07)`, chip `#F1F1EF`.
Semantic only: success `#16A34A`/`#E8F6EC`, danger `#DC2626`/`#FDECEC`, warn `#D97706`/`#FEF3E2`. Chart series: ink, `#A1A1AA`, `#D4D4D8`.
Radii 28 / 24 / 16 / 12 / 999; shadow `0 1px 2px rgba(0,0,0,.04), 0 12px 32px -12px rgba(0,0,0,.12)`; card padding 24, page padding 16, gap 20.
Type: Plus Jakarta Sans via `next/font` with a system fallback. Classes: `.t-greeting`, `.t-kpi`, `.t-title`, `.t-label`, `.t-micro`. Motion 150 ms; `prefers-reduced-motion` disables animation.

## Component map

- `components/ui/`: Card, Pill, Badge, Button / ButtonLink, SegmentedControl, Tabs, ProgressBar, Skeleton, EmptyState, Stat, Modal, Drawer, icons.
- `components/charts/`: TickBars, AreaChart, Sparkline (plain arrays; empty data renders an empty state).
- `components/shell/`: AppShell (sidebar + top bar), ShellData (one health + runs poller via context), ModeBadge.
- `components/run/RunWorkspace.tsx`: the three-pane workspace shared by `/deal/[runId]` (live or stored) and `/replay`.
- `hooks/`: `useHealth`, `useRuns`, `useRunSummary` / `useRunSummaries`, `useDealSocket`.
- `lib/`: `api.ts` (typed client), `derive.ts` (KPIs from events), `format.ts`, `config.ts`, `events.ts` (event contract, do not edit).

## Adding a page

1. Create `app/<name>/page.tsx`; the shell is applied by `app/layout.tsx`.
2. Read health and runs with `useShellData()`; fetch anything else through `lib/api.ts` (add a typed method there).
3. Build with `Card`, `Badge`, `Button` etc. Show zeros or an `EmptyState`, never invented numbers. Label stub or replay data "simulated".
4. Add a nav item in `components/shell/Sidebar.tsx` and a breadcrumb in `components/shell/TopBar.tsx`.
5. Update the route table above if you wire a new endpoint.
