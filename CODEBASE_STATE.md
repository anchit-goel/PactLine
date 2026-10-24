# Pactline Codebase State Report

Generated: 2026-10-24 | Target: Frontend Wiring Handoff | Read-Only Audit

---

## 1. GIT
- **Branch:** `main` (tracks `origin/main` at `git@github-anchit:anchit-goel/PactLine.git`).
- **`git log --oneline -10`:**
  - `8d162fb` Add pandas dependency to requirements.txt
  - `68f828f` Intial Commit
- **`git status --short`:** Clean working tree (0 uncommitted files).
- **Commit Check:** `backend/pactline_backend/`, `frontend/agenticflow/app/debug/page.tsx`, and `backend/pactline_backend/sandbox.py` were all committed in `68f828f`.

---

## 2. REPO TREE (Active Code to Depth 3)

```
.
├── backend/
│   ├── dataset_backend/         # Legacy dataset bias audit API & agents
│   └── pactline_backend/        # Pactline contract & settlement state machine
├── data/
│   ├── eval/                    # Benchmark queries & payout test cases
│   └── knowledge/               # Grounded RAG sources (clauses, creators, regulatory)
├── dataset/                     # Target data storage (data.csv, metadata.json)
├── docs/                        # Contract specs & architecture notes
├── fixtures/                    # Shared demo run traces (demo_run.jsonl)
├── frontend/agenticflow/        # Next.js 16 + React 19 web interface
├── mcps/                        # Auditor, sandbox, and auxiliary MCP tools
├── outputs/                     # Generated reports, audit charts & PDFs
├── scripts/                     # Smoke tests & automation runners
└── uploadable test files/       # Test briefs and evaluation CSVs
```

### Purpose & Classification

#### `backend/pactline_backend/`
- `__init__.py`: Package initialization.
- `api.py`: FastAPI app on port 8005 hosting `/deal`, `/ws/deal/{run_id}`, `/health`, `/replay/demo`.
- `audit_generator.py`: Generates mock audit JSON/MD outputs for canvas charts.
- `audit_ws.py`: WebSocket handler for live container audit logging (`/ws/audit`).
- `events.py`: Pydantic V2 event schemas and `make_event` factory.
- `fixtures/`: Offline mock data (`clauses.json`, `creators.json`, `regulatory.json`, `demo_run.jsonl`, `replays/`).
- `graph.py`: LangGraph state machine (7 nodes, 2 human approval gates, self-correction loop).
- `payouts.py`: Deterministic milestone calculator with 10% TDS withholding.
- `pdf_export.py`: Compiles contract markdown into PDF via Typst in sandbox.
- `retrieval.py`: Agentic RAG fixture search, scoring (0.0-1.0), and query re-writer.
- `routes_extra.py`: Extended endpoints (`/runs`, `/runs/{id}/events`, `/export/*`, `/replay/{name}`, `/upload`).
- `sandbox.py`: Low-level Docker client executing Python commands in `sandbox-python:latest`.
- `settlement_calc.py`: Standalone CLI script run inside sandbox container for payouts.
- `state.py`: `DealState` TypedDict definition for LangGraph.
- `tests/`: Pytest suite (`test_sandbox_runner.py`, `test_stub_run.py`, `test_payouts.py`, `test_routes_extra.py`).
- `trace.py`: Event accumulator attaching validated envelopes to graph state.

#### `frontend/agenticflow/`
- **`app/`**:
  - `page.tsx` [PACTLINE]: Landing page with hero banner, live interactive pipeline demo teaser.
  - `layout.tsx` [PACTLINE]: Root layout with font imports, metadata, and smooth scroll.
  - `globals.css` [OLD]: TailwindCSS theme tokens.
  - `favicon.ico` [OLD]: Brand icon.
  - `deal/new/page.tsx` [PACTLINE]: Intake studio for deal briefs, presets, and past runs list.
  - `deal/[runId]/page.tsx` [PACTLINE]: 3-pane real-time Deal Workspace (timeline, draft/ledger, inspector).
  - `replay/page.tsx` [PACTLINE]: Player for pre-recorded scenarios (`normal`, `ambiguous`, `failure`).
  - `debug/page.tsx` [PACTLINE]: Raw event stream monitor with manual approval buttons.
  - `dashboard/page.tsx` [OLD - REFS OLD PRODUCT]: XYFlow node canvas for legacy dataset bias audits.
  - `about/page.tsx` [OLD - REFS OLD PRODUCT]: Legacy forensic framework documentation.
  - `privacy/page.tsx` [OLD - REFS OLD PRODUCT]: Legacy zero-data retention statement.
- **`components/`**: All 22 components (`AgentNode.tsx`, `AlgorithmLibrary.tsx`, `AskSidebar.tsx`, `AttributeNode.tsx`, `BackgroundHalo.tsx`, `CanvasControls.tsx`, `CustomCursor.tsx`, `DockerNode.tsx`, `DocsModal.tsx`, `FaultyTerminal.tsx`, `FlowCanvas.tsx`, `InfiniteMarquee.tsx`, `NodeDetailModal.tsx`, `ReasoningSimulator.tsx`, `SideNavBar.tsx`, `SmoothScroll.tsx`, `ToolNode.tsx`, `TopAppBar.tsx`, `TourOverlay.tsx`, `TourWindow.tsx`, `UploadNode.tsx`, `ViewModeContext.tsx`) are [OLD] from the previous algorithmic bias product.
- **`hooks/`**:
  - `useDealSocket.ts` [PACTLINE]: Reducer hook managing `/ws/deal/{run_id}` streaming state and approvals.
  - `useAuditSocket.ts` [OLD]: WebSocket hook for legacy Docker audit streaming (`/ws/audit`).
- **`lib/`**:
  - `events.ts` [PACTLINE]: TypeScript discriminated union matching `backend/pactline_backend/events.py`.
  - `config.ts` [OLD - REFS OLD PRODUCT]: API base URLs referencing port 8005, 8006, and 8007 pipelines.

---

## 3. WHAT IS REAL VS STUB

- **`graph.py` Nodes (`PACTLINE_STUB=0` vs `1`):**
  - `brief_analyst` (`graph.py:31`): `PACTLINE_STUB=0` raises `NotImplementedError` (`graph.py:87`). Stub returns mock creators and milestones.
  - `deal_architect` (`graph.py:95`): `PACTLINE_STUB=0` raises `NotImplementedError` (`graph.py:161`). Stub drafts 2 clauses (rev 1) or 3 clauses (rev 2).
  - `compliance_auditor` (`graph.py:169`): `PACTLINE_STUB=0` raises `NotImplementedError` (`graph.py:227`). Stub fails rev 1, passes rev 2.
  - `contract_gate` (`graph.py:235`): `PACTLINE_STUB=0` raises `NotImplementedError` (`graph.py:279`). Calls `interrupt()` for human sign-off.
  - `settlement_agent` (`graph.py:287`): `PACTLINE_STUB=0` raises `NotImplementedError` (`graph.py:334`). Stub calls `sandbox.py` or `payouts.py`.
  - `payout_gate` (`graph.py:342`): `PACTLINE_STUB=0` raises `NotImplementedError` (`graph.py:378`). Calls `interrupt()` for payout approval.
  - `finalize` (`graph.py:386`): `PACTLINE_STUB=0` raises `NotImplementedError` (`graph.py:408`). Emits `eval_result` and `run_complete`.
- **Hybrid Index in `retrieval.py`:** BM25 and embeddings: **NOT FOUND**. Only serves local JSON fixtures (`retrieval.py:14-41`).
- **`llm.py`:** **NOT FOUND**.
- **Data Repositories & Records:**
  - `data/knowledge/`: Exists (`clauses/clauses.json`: 6; `creators/creators.json`: 3; `regulatory/regulatory.json`: 3).
  - `data/eval/`: Exists (`queries.jsonl`: 5; `payout_cases.json`: 5).
  - `scripts/ingest.py`: **NOT FOUND**.
- **`demo_run.jsonl` in `api.py`:** Reads `backend/pactline_backend/fixtures/demo_run.jsonl` (fallback `fixtures/demo_run.jsonl`, `api.py:60-61`).

---

## 4. RUN IT (Stub Mode Verification)

- **Ports:** Ports 8005 and 3000 verified free.
- **Smoke Test (`scripts/smoke_ws.py`):** **PASS** (32 events received sequentially, 0 errors, auto-approved contract and payout gates).
- **Pytest Suite (`backend/pactline_backend/tests`):** 10 passed in 37.68s (`test_calculate_milestones_math`, `test_zero_budget`, `test_independent_check_match`, `test_runs_list_and_events`, `test_export_ledger_csv`, `test_replay_scenario`, `test_sandbox_docker_execution`, `test_sandbox_timeout`, `test_sandbox_fallback`, `test_full_stub_pipeline`).
- **Docker State:** `docker info` OK; image `sandbox-python:latest` **EXISTS** (558MB).

---

## 5. REAL EVENT SAMPLES (Verbatim JSON)

```json
{"type": "run_start", "run_id": "demo_run_pactline_42", "seq": 1, "ts": "2026-10-23T13:16:11.309438+00:00", "agent": null, "brief": "Creator contract with milestone settlement"}
{"type": "agent_start", "run_id": "demo_run_pactline_42", "seq": 2, "ts": "2026-10-23T13:16:11.317953+00:00", "agent": "brief_analyst"}
{"type": "retrieval", "run_id": "demo_run_pactline_42", "seq": 3, "ts": "2026-10-23T13:16:11.318326+00:00", "agent": "brief_analyst", "query": "broad creator requirements", "source": "creators", "hits": [{"id": "crt_alex_tech_001", "score": 0.95, "snippet": "Alex Tech Reviews (SYNTHETIC PLACEHOLDER)"}], "grade": 0.42, "action": "requery", "rewritten_query": "creator rate cards and past tech deliverables"}
{"type": "agent_end", "run_id": "demo_run_pactline_42", "seq": 5, "ts": "2026-10-23T13:16:11.318488+00:00", "agent": "brief_analyst", "summary": "Brief parsed successfully: target creator profile identified with 3 milestone gates."}
{"type": "llm_usage", "run_id": "demo_run_pactline_42", "seq": 6, "ts": "2026-10-23T13:16:11.318496+00:00", "agent": "brief_analyst", "model": "gemini-3.1-pro-preview", "tokens_in": 520, "tokens_out": 190, "latency_ms": 640.0, "cost_usd": 0.0016}
{"type": "draft_update", "run_id": "demo_run_pactline_42", "seq": 8, "ts": "2026-10-23T13:16:11.318938+00:00", "agent": "deal_architect", "revision": 1, "clauses": [{"id": "cls_ip_transfer_001", "text": "Creator hereby assigns all worldwide right, title, and interest in and to Deliverables upon final milestone settlement.", "source_ids": ["cls_ip_transfer_001"]}]}
{"type": "compliance_result", "run_id": "demo_run_pactline_42", "seq": 12, "ts": "2026-10-23T13:16:11.319355+00:00", "agent": "compliance_auditor", "revision": 1, "passed": false, "issues": [{"clause_id": "cls_disclosure_002", "rule_source_id": "reg_ftc_endorsement_001", "severity": "high", "fix_hint": "Mandatory disclosure clause missing per FTC Endorsement Guides 16 CFR Part 255."}]}
{"type": "approval_required", "run_id": "demo_run_pactline_42", "seq": 23, "ts": "2026-10-23T13:16:11.321505+00:00", "agent": null, "gate": "contract", "summary": "Contract draft revision approved by automated compliance check. Sign-off required."}
{"type": "tool_call", "run_id": "demo_run_pactline_42", "seq": 25, "ts": "2026-10-23T13:16:11.321905+00:00", "agent": "settlement_agent", "tool_id": "call_calc_milestones_01", "name": "calculate_milestone_settlement", "args": {"party": "Alex Tech Reviews", "total_gross": 10000.0}}
{"type": "tool_result", "run_id": "demo_run_pactline_42", "seq": 26, "ts": "2026-10-23T13:16:11.322216+00:00", "agent": "settlement_agent", "tool_id": "call_calc_milestones_01", "name": "calculate_milestone_settlement", "output": {"entries": [{"party": "Alex Tech Reviews", "milestone": "Concept Approval", "gross": 3000.0, "tds": 300.0, "net": 2700.0, "due_date": "2026-11-15"}], "totals": {"gross": 10000.0, "tds": 1000.0, "net": 9000.0}}, "ok": true}
{"type": "ledger", "run_id": "demo_run_pactline_42", "seq": 30, "ts": "2026-10-23T13:16:11.323570+00:00", "agent": null, "entries": [{"party": "Alex Tech Reviews", "milestone": "Concept Approval", "gross": 3000.0, "tds": 300.0, "net": 2700.0, "due_date": "2026-11-15"}], "totals": {"gross": 10000.0, "tds": 1000.0, "net": 9000.0}}
{"type": "eval_result", "run_id": "demo_run_pactline_42", "seq": 31, "ts": "2026-10-23T13:16:11.323588+00:00", "agent": null, "metrics": {"retrieval_precision": 0.92, "groundedness": 0.95, "payout_accuracy": 1.0}}
{"type": "run_complete", "run_id": "demo_run_pactline_42", "seq": 32, "ts": "2026-10-23T13:16:11.323596+00:00", "agent": null}
```

### Event Sequence (Compact)
`1:run_start -> 2:agent_start -> 3:retrieval -> 4:retrieval -> 5:agent_end -> 6:llm_usage -> 7:agent_start -> 8:draft_update -> 9:agent_end -> 10:llm_usage -> 11:agent_start -> 12:compliance_result -> 13:agent_end -> 14:llm_usage -> 15:agent_start -> 16:draft_update -> 17:agent_end -> 18:llm_usage -> 19:agent_start -> 20:compliance_result -> 21:agent_end -> 22:llm_usage -> 23:approval_required -> 24:agent_start -> 25:tool_call -> 26:tool_result -> 27:agent_end -> 28:llm_usage -> 29:approval_required -> 30:ledger -> 31:eval_result -> 32:run_complete`

### Schema Discrepancy Flags
- `ComplianceIssue.severity`: In `docs/EVENTS.md:45` documented as `str`; in `events.py:23` and `events.ts:20` enforced as `Literal["low", "medium", "high", "critical"]`.
- `Clause.source_ids`: In `events.py:17` typed with default factory `List[str]`; in `events.ts:14` typed as optional `source_ids?: string[]`.
- `ApprovalResponseEvent`: In `docs/EVENTS.md:48` documented as client payload; in `events.py:130` and `events.ts:125` defined with full envelope headers (`run_id`, `seq`, `ts`).

---

## 6. API SURFACE

### Routes (`api.py` & `routes_extra.py`)
- `GET /health` (`api.py:45`): Body: None | Response: `{"status": "ok"}`
- `POST /deal` (`api.py:50`): Body: `{"brief": str}` | Response: `{"run_id": str}`
- `GET /replay/demo` (`api.py:57`): Body: None | Response: `List[PactlineEvent]` (from `demo_run.jsonl`)
- `WS /ws/deal/{run_id}` (`api.py:74`): Bidirectional WebSocket stream & approval receptor
- `WS /ws/audit` (`api.py:178`): WebSocket stream for Docker container execution logs
- `GET /runs` (`routes_extra.py:22`): Body: None | Response: `List[{"id", "brief", "status", "event_count", "created_at"}]`
- `GET /runs/{run_id}/events` (`routes_extra.py:68`): Body: None | Response: `List[PactlineEvent]`
- `GET /runs/{run_id}/export/ledger.csv` (`routes_extra.py:83`): Body: None | Response: CSV file attachment
- `GET /runs/{run_id}/export/contract.pdf` (`routes_extra.py:138`): Body: None | Response: PDF file attachment
- `GET /replay/{name}` (`routes_extra.py:156`): Body: None | Response: `List[PactlineEvent]`
- `POST /upload` (`routes_extra.py:181`): Multipart Form | Response: `{"status": "success", ...}`
- `GET /dataset/status` (`routes_extra.py:217`): Body: None | Response: `{"exists": bool, ...}`
- `GET /outputs/{filename}` (`routes_extra.py:227`): Body: None | Response: File response (PDF/JSON/MD)

### Approval Message Contract
- Sent via WebSocket `/ws/deal/{run_id}` (`api.py:151-157`).
- Expected JSON: `{"type": "approval_response", "gate": "contract" | "payout", "approved": true | false, "note": "optional text"}`.

### `POST /deal` Contract
- Accepts: JSON Object `{"brief": "string"}` (`DealRequest` model, `api.py:41-43`).
- Returns: `{"run_id": "pact_<10-char-uuid>"}` (`api.py:54`).

### CORS Configuration (`api.py:22-28`)
- Allowed Origins: `["*"]` | Credentials: `True` | Methods: `["*"]` | Headers: `["*"]`

### Endpoints Implemented
- Run-list: YES (`GET /runs`, `routes_extra.py:22`)
- Run-events: YES (`GET /runs/{run_id}/events`, `routes_extra.py:68`)
- Replay-by-name: YES (`GET /replay/{name}`, `routes_extra.py:156`)
- Export: YES (`GET /runs/{run_id}/export/ledger.csv` and `/contract.pdf`, `routes_extra.py:83, 138`)

---

## 7. FRONTEND STATE

- **Versions (`package.json:20-23`):** Next.js `^16.2.7`, React `19.2.4`, React DOM `19.2.4`. Router: App Router (`app/`).
- **Pages & Current Rendering:**
  - `app/page.tsx`: Pactline landing page (hero, live demo teaser, metric cards).
  - `app/layout.tsx`: Root HTML layout, font setup, smooth scroll.
  - `app/deal/new/page.tsx`: Intake form for deal briefs, sample presets, past runs list.
  - `app/deal/[runId]/page.tsx`: 3-pane Deal Workspace (Agent Timeline, Contract Draft/Ledger, Inspector tabs).
  - `app/replay/page.tsx`: Scenario player with step, play/pause, and speed controls.
  - `app/debug/page.tsx`: Raw event JSON stream inspector with manual approval buttons.
  - `app/dashboard/page.tsx`: Legacy dataset audit canvas.
  - `app/about/page.tsx`: Legacy fairness framework page.
  - `app/privacy/page.tsx`: Legacy zero-retention page.
- **`hooks/useDealSocket.ts` API:**
  - State: `DealSocketState` (`events`, `timeline`, `retrievals`, `draft`, `compliance`, `pendingApproval`, `ledger`, `usageTotals`, `evalMetrics`, `tools`, `connected`, `runComplete`, `error`).
  - Signatures:
    - `sendApproval: (approved: boolean, note?: string) => void`
    - `injectEvent: (event: PactlineEvent) => void`
    - `resetEvents: () => void`
  - WS URL Selection: Hardcoded to `ws://${window.location.hostname}:8005/ws/deal/${runId}` (`useDealSocket.ts:180-183`).
- **Config & Libraries:**
  - Env vars: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`, `NEXT_PUBLIC_MODEL_API_URL`, `NEXT_PUBLIC_MODEL_WS_URL`, `NEXT_PUBLIC_BIASPROBE_API_URL`, `NEXT_PUBLIC_BIASPROBE_WS_URL`.
  - Chart Library: **NOT FOUND** in `package.json`.
  - PDF Renderer: **NOT FOUND** in `package.json` (server exports pre-compiled PDF via Typst).
  - Markdown: `react-markdown: ^10.1.0` with `remark-gfm` and `remark-breaks`.
  - Typecheck: `npx tsc --noEmit` passed with 0 errors.
  - Missing/Archived Imports: None.

---

## 8. WIRING GAPS (Top 12 Items)

1. **Hardcoded WebSocket URL in Hook:** `hooks/useDealSocket.ts:182` hardcodes port `8005` instead of using `WS_BASE_URL` from `lib/config.ts`. [Size: S]
2. **WebSocket Auto-Reconnect & Polling Fallback:** `hooks/useDealSocket.ts` lacks reconnection handling on drop and does not poll `GET /runs/{run_id}/events` if WebSocket fails. [Size: M]
3. **Legacy Config Branding:** `lib/config.ts:1-24` retains old multi-pipeline ports (8006, 8007) and misleading labels. [Size: S]
4. **Missing Brief File Dropzone in Intake:** `app/deal/new/page.tsx:70-96` only takes raw text; no drag-and-drop file upload for sample brief files. [Size: M]
5. **Static Citation Drawer Content:** `app/deal/[runId]/page.tsx:684-698` hardcodes citations for FTC and IP; does not query dynamic sources. [Size: M]
6. **No Visual Charting Dependency:** `package.json` has no charting package (`recharts`/`chart.js`) for payout distributions or timeline Gantt view. [Size: M]
7. **Stub Mode UI Indicator:** `app/deal/[runId]/page.tsx` does not display whether backend is operating in stub mode (`PACTLINE_STUB=1`) vs live LLM mode. [Size: S]
8. **Export Error Toasting:** `app/deal/[runId]/page.tsx:122-139` uses direct `<a>` tags for PDF/CSV; browser errors if Docker Typst export fails on the server. [Size: S]
9. **Replay-to-Live Fork Action:** `app/replay/page.tsx` does not provide a "Fork to Workspace" button to instantiate a live run from a replay scenario. [Size: S]
10. **Legacy Navigation Links:** `components/TopAppBar.tsx` links to old `/dashboard` and `/about` pages instead of `/deal/new` and `/replay`. [Size: S]
11. **Draft Clause Diff Visualizer:** When `draft_update` increments `revision: 2`, `app/deal/[runId]/page.tsx` replaces clauses without highlighting self-corrected edits. [Size: M]
12. **Backend Stub Flag Guard:** `backend/pactline_backend/graph.py` raises `NotImplementedError` for non-stub runs; backend needs a clear startup error if `PACTLINE_STUB=0` without credentials. [Size: S]
