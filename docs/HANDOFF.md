# Pactline: Team Handoff and Build Guide

**FOR:** Teammate (B) (Tarun) | **FROM:** Anchit (A) | **DATE:** October 23, 2026 | **TEAM:** TodPhod

This document has everything you need to build, test and demo Pactline without the original chat. Save a copy in the repo as `docs/HANDOFF.md`. Anything marked **VERIFY** must be checked against a primary source. Do not trust this document, or any AI, for law, tax rates or platform rules.

---

## 0. Read this first

- **What we are building:** Pactline turns a plain-English collaboration brief (one brand, several creators, a budget) into a source-cited contract, a compliance check, and a milestone payout ledger. Agents retrieve from several knowledge sources, grade and correct their own retrieval, run all money maths as code in a locked-down Docker sandbox, and wait for a human approval before any payout.
- **Your role:** You own about 60% of the build: the whole frontend, the knowledge content, exports and API extras. Section 8 is your task list. Every task there can start now; none is blocked on A.
- **A's role:** The LLM access, real agent nodes, agentic retrieval, settlement spec server, evaluation, and pitch.
- **Work in this order:** Section 1 checklist, Section 3 verification commands, then your P0 tasks in Section 8.

---

## 1. Handoff checklist (A ticks before leaving)

- [x] Commit and push branch `build/pactline-core`. The last work (sandbox runner, event contract, stub backend, debug page) was uncommitted at the last report. Tell B the exact branch name.
- [ ] Send the `.env` values privately (never in git, never in a screenshot): either a Gemini API key or a Vertex project name.
- [x] Confirm Docker Desktop runs on B's laptop and that `docker build -t sandbox-python:latest mcps/sandbox` succeeds.
- [ ] Write `docs/STATUS.md`: which Claude Code prompts have already run (especially the real retrieval and agents prompt: yes or no), and what failed.
- [x] Send the `_archive/` folder as a zip if B wants old code. It is not needed to build.
- [ ] Agree sync times: 15 minutes every four hours, plus a message whenever you change a shared file (Section 13).

---

## 2. The project in one page

- **Problem:** Brand and creator collaborations run on chats, copied contract templates, spreadsheets and manual transfers. Terms are vague, disclosure and tax rules are missed, multi-creator splits are argued after the fact, and payments are not tied to verified delivery. (This is our working hypothesis from observation, not a measured fact. Never present it as a statistic.)
- **End goal:** A live demo in which a judge watches agents do the following, with every step visible and traced:
  1. Take a brief and route sub-questions to different knowledge sources.
  2. Grade what they retrieved and, when it is weak, rewrite the query or switch source.
  3. Draft a contract in which every clause cites its source.
  4. Have a compliance agent reject the first draft (a missing disclosure clause) and send it back for a redraft that passes.
  5. Compute milestones, splits and tax in the sandbox, with the code and output shown.
  6. Stop at two human approval gates (contract, then payout).
  7. Produce a ledger and a trace and evaluation view: tokens, latency, cost, retrieval precision, groundedness, payout accuracy.
- **What the judges value (AgentOps hackathon, track: Tool-using and RAG agents):** Visible agent behaviour, grounded and cited outputs, self-correction, human control, observability and evaluation. A tight, reliable demo beats a broad one.
- **Already submitted:** The idea form and a 3-page memo (title: Pactline). Claims in those documents are targets, not results. Keep all public claims honest: say 'target' until we have a measured number.
- **Reuse disclosure:** This repo is built on an earlier multi-agent project (LangGraph, MCP, Docker sandbox, FastAPI, Next.js). Check the organisers' rules on prior code and credit the base in the README and references if required.

---

## 3. Where things stand

Working at the last report:
- Branch `build/pactline-core` (or `main`), Python in `.venv`, locked dependencies.
- Slim sandbox image `sandbox-python:latest` (about 558 MB), run with no network, 512 MB memory, 1 CPU, all capabilities dropped, label `pactline=1`.
- A LangGraph graph with the full flow and two approval gates, in a scripted stub mode (`PACTLINE_STUB=1`, the default) that needs no LLM key. A stub run emits about 32 events.
- FastAPI backend, WebSocket streaming, replay endpoint, and a bare debug page in the frontend.
- Tests: sandbox runner tests and a stub-run test pass. TypeScript compiles.

**Verification commands:**
```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
PYTHONPATH=. .venv/bin/pytest backend/pactline_backend/tests -v
PYTHONPATH=. .venv/bin/uvicorn backend.pactline_backend.api:app --port 8005
# in another terminal:
.venv/bin/python scripts/smoke_ws.py
# frontend:
cd frontend/agenticflow && npm install && npm run dev
# open /debug
```

---

## 4. Repo map

| Path | What it is | Who edits |
| :--- | :--- | :--- |
| `backend/pactline_backend/` | The new backend: `graph.py`, `state.py`, `events.py`, `retrieval.py`, `llm.py`, `trace.py`, `settlement_calc.py`, `sandbox.py`, `api.py`, `fixtures/`, `tests/` | A (core engine); B (new files: exports, extra routes) |
| `frontend/agenticflow/` | Next.js 16 (App Router), React 19, Tailwind 4, `@xyflow/react`. Key files: `hooks/useDealSocket.ts`, `lib/events.ts`, `app/debug/page.tsx` | B |
| `data/knowledge/` | Knowledge content as JSON | B |
| `docs/EVENTS.md`, `docs/ENV.md` | Event contract and environment notes | Shared |
| `scripts/` | `smoke_ws.py` and evaluation scripts | Shared |
| `mcps/sandbox` | Sandbox Docker image and sandbox server | Read-only |
| `backend/dataset_backend/`, `_archive/` | Historical code | Nobody |

---

## 5. Architecture

```
Brief --> brief_analyst --> deal_architect --> compliance_auditor --+--> contract_gate (human) --> settlement_agent --> payout_gate (human) --> finalize
           ^                                                      |
           +----------------- failed and revisions < 3 -----------+
```

- **Agents:**
  - `brief_analyst`: parses brief, shortlists creators.
  - `deal_architect`: selects payment model, drafts clauses from retrieved text.
  - `compliance_auditor`: checks required clause categories, validates against regulatory text.
  - `settlement_agent`: computes milestones, splits and tax in sandbox.
  - `finalize`: emits ledger, evaluation and completion.
- **Gates:** LangGraph `interrupt()`. Pauses until client sends `approval_response`.
- **Stub vs Real:** With `PACTLINE_STUB=1`, nodes replay a deterministic scripted run with self-correction.
- **Principle:** The LLM never does arithmetic. Money is computed by `settlement_calc.py` inside the sandbox.
- **API:** `GET /health`, `POST /deal`, `WS /ws/deal/{run_id}`, `GET /replay/{name}`.

---

## 6. Event contract

Every event has an envelope: `type`, `run_id`, `seq`, `ts` (ISO 8601), and `agent`.
- `run_start` (brief)
- `agent_start`, `agent_end` (agent, summary)
- `retrieval` (query, source, hits, grade, action, rewritten_query)
- `tool_call`, `tool_result` (tool_id, name, args, output, ok)
- `llm_usage` (model, tokens_in, tokens_out, latency_ms, cost_usd)
- `draft_update` (revision, clauses)
- `compliance_result` (revision, passed, issues)
- `approval_required` (gate, summary)
- `approval_response` (gate, approved, note)
- `ledger` (entries, totals)
- `eval_result` (retrieval_precision, groundedness, payout_accuracy)
- `run_complete`, `error` (message, recoverable)

---

## 7. Work Split & Priorities

- **BE1 (P0, 4h):** Knowledge content and evaluation data (`data/knowledge/`).
- **BE2 (P0, 1.5h):** API extras (`routes_extra.py`: `/runs`, `/runs/{id}/events`, `/export/ledger.csv`, `/replay/{name}`).
- **BE3 (P1, 2.5h):** Contract PDF generated in sandbox via Typst.
- **BE4 (P1, 1h):** Mock payout adapter and invoices.
- **FE1 (P0, 2.5h):** App shell & brief intake (`/deal/new`).
- **FE2 (P0, 3h):** Live run view: 3-pane layout (timeline, deliverable, inspector).
- **FE3 (P0, 3h):** Contract view with citations drawer and compliance loop panel.
- **FE4 (P0, 2.5h):** Approval gates modal, ledger table, calculation panel.
- **FE5 (P1, 2h):** Trace, cost and evaluation dashboard.
- **FE6 (P0, 2h):** Replay mode and projector polish.
