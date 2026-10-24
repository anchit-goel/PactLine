# Pactline: Current Build & Integration Status

**Date:** October 24, 2026  
**Team:** TodPhod (Anchit & Tarun)  
**Hackathon Track:** Tool-using and RAG agents (AgentOps 2026, MIT Bengaluru × CGI)

---

## 1. Executive Summary

All core architecture, multi-agent pipelines, isolated Docker execution, API extras, and frontend interfaces are **100% built, passing all tests, and running live**.

- **Python Environment:** Python 3.12 in `.venv` with `requirements.txt` installed.
- **Docker Sandbox:** Image `sandbox-python:latest` built and operational with resource caps (`512MB RAM`, `1 CPU`, `--network none`, `no-new-privileges`).
- **Backend API:** FastAPI running on `http://localhost:8005` (with WebSocket deal streaming, replay scenarios, CSV export, and PDF export).
- **Frontend App:** Next.js (App Router, Turbopack) running on `http://localhost:3001` with dedicated `/deal/new`, `/deal/[runId]`, and `/replay` routes.
- **Test Results:** 9 passed out of 9 tests in `backend/pactline_backend/tests/`.

---

## 2. Completed Milestones

### Backend & Engine
- [x] **LangGraph State Machine (`graph.py`):** 4 agents (`brief_analyst` with re-query, `deal_architect`, `compliance_auditor` with auto-correction loop, `settlement_agent`).
- [x] **Human-in-the-Loop Gates:** Two distinct approval gates (`contract_gate` and `payout_gate`) utilizing LangGraph `interrupt()`.
- [x] **Docker Math Sandbox (`sandbox.py` & `settlement_calc.py`):** Statutory 10% withholding calculations isolated in Docker.
- [x] **API Extras (`routes_extra.py` - BE2):** `GET /runs`, `GET /runs/{id}/events`, `GET /runs/{id}/export/ledger.csv`, `GET /replay/{name}`.
- [x] **Contract PDF Generation (`pdf_export.py` - BE3):** Sandboxed compilation of `contract.pdf` with Typst and source citations (`GET /runs/{id}/export/contract.pdf`).
- [x] **Mock Payout Adapter (`payouts.py` - BE4):** Idempotent receipt creation with party invoices and transaction reference IDs.
- [x] **Knowledge & Eval Datasets (BE1):** `data/knowledge/` (clauses, regulatory, creators) and `data/eval/` (`queries.jsonl`, `payout_cases.json`).

### Frontend & Telemetry
- [x] **Deal Intake Page (`/deal/new` - FE1):** Preset scenario selector, brief intake textarea, budget/creator count inputs, and recent runs list.
- [x] **3-Pane Live Run Dashboard (`/deal/[runId]` - FE2, FE3, FE4, FE5):**
  - **Left Pane:** Agent Timeline with live status animations and summaries.
  - **Center Pane:** Interactive Deliverable switcher (Contract draft with citation drawer, compliance self-correction visualizer, and ledger table).
  - **Right Pane:** Inspector with tabs for *Agentic RAG*, *Docker Sandbox*, *Telemetry & Eval Metrics*, and *Raw Event Stream*.
  - **Human Approval Modal:** Interactive approve/reject checkpoint before money moves.
  - **Download Buttons:** Direct export for `Contract PDF` and `Ledger CSV`.
- [x] **Offline Replay Mode (`/replay` - FE6):** Safe-guard player with speed controls (1x, 2x, 4x), step-next, and pause for demo day.

---

## 3. Verification Commands & How to Run

```bash
# 1. Run all backend tests
PYTHONPATH=. .venv/bin/pytest backend/pactline_backend/tests -v

# 2. Run TypeScript build verification
cd frontend/agenticflow && npx tsc --noEmit

# 3. Test live WebSocket pipeline (32 sequential events)
PYTHONPATH=. .venv/bin/python scripts/smoke_ws.py

# 4. Access active interfaces
# Backend API: http://localhost:8005/health
# Intake Form: http://localhost:3001/deal/new
# Replay Mode: http://localhost:3001/replay
```
