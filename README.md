# Pactline: Autonomous Algorithmic Fairness & Deal Intelligence Platform

<p align="center">
  <strong>Autonomous Multi-Agent RAG System for Commercial Contract Settlement & Algorithmic Fairness Auditing</strong><br>
  Built by <strong>Team TodPhod- Made with love</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.7-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/LangGraph-Multi--Agent-FF6F00?style=for-the-badge" alt="LangGraph" />
  <img src="https://img.shields.io/badge/Docker-Sandbox_Isolation-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

---

## 📑 Table of Contents
1. [Overview & Executive Summary](#-overview--executive-summary)
2. [Why Pactline Was Built](#-why-pactline-was-built)
3. [How It Works (Dual Architecture)](#-how-it-works-dual-architecture)
4. [Key Features](#-key-features)
5. [System Architecture & Multi-Agent Flow](#-system-architecture--multi-agent-flow)
6. [Technology Stack](#-technology-stack)
7. [Repository File Structure](#-repository-file-structure)
8. [Prerequisites & Environment Setup](#-prerequisites--environment-setup)
9. [How to Run the Platform](#-how-to-run-the-platform)
10. [Step-by-Step Demo & Testing Guide](#-step-by-step-demo--testing-guide)
11. [Verification & Test Suites](#-verification--test-suites)
12. [Team & Hackathon Credits](#-team--hackathon-credits)

---

## 🌟 Overview & Executive Summary

**Pactline** is a production-grade, multi-agent AI framework designed to solve two of the most critical vulnerabilities in modern automated enterprise workflows:
1. **Commercial Contract & Deal Settlement Risk:** Automating multi-party creator and brand collaborations—from brief parsing and grounded source-cited drafting to regulatory compliance verification (FTC/IP rules) and mathematical milestone settlement.
2. **Algorithmic Fairness & Credit Risk Auditing:** Automatically auditing black-box machine learning credit risk and loan underwriting models for disparate impact, proxy discrimination, and demographic bias against protected classes (ECOA, CFPB, Fair Housing Act, Basel III).

Pactline enforces a core engineering philosophy: **The LLM never does financial arithmetic or legal guesswork.** All mathematical calculations execute inside an isolated, network-disabled Docker sandbox, while multi-agent workflows use LangGraph state machines and human-in-the-loop approval gates.

---

## 🎯 Why Pactline Was Built

### 1. The Commercial Contract Bottleneck
Creator brand deals and commercial partnerships currently rely on fragmented direct messages, copied contract templates, unverified FTC compliance, and manual spreadsheet calculations. When disputes occur, clauses are ambiguous, multi-creator milestone splits are contested, and withholding tax calculations are flawed. 

### 2. The Algorithmic Bias Crisis in Lending
Banks and fintechs deploy machine learning models for credit scoring and loan origination. However, standard models frequently amplify demographic disparities—penalizing applicants by race, gender, or age via covert proxies (e.g., zip code or income-to-loan ratios). Manual fairness audits take weeks of specialized quantitative labor, and retraining models compromises commercial accuracy.

### 3. The Pactline Solution
Pactline replaces error-prone human workflows with autonomous multi-agent pipelines that:
- **Retrieve with Grounding:** Cite legal clauses from verified knowledge documents.
- **Self-Correct:** Automatically detect missing clauses (such as ambiguous exclusivity or FTC disclosures) and redraft before escalation.
- **Sandbox Execution:** Compute financial payouts, fees, and tax withholdings in locked Docker containers.
- **Audit & Mitigate Fairly:** Run 13 mathematical fairness algorithms to recalibrate credit decision thresholds post-inference without requiring costly model retraining.
- **Enforce Human Oversight:** Pause execution at critical financial gates until approved by human operators.

---

## ⚙️ How It Works (Dual Architecture)

Pactline operates two dedicated, interoperable pipelines:

### Pipeline A: Autonomous Deal & Contract Settlement Flow
```
[Campaign Brief] 
      │
      ▼
1. Brief Analyst ──► Extracts budget, brand parameters, creator roster
      │
      ▼
2. Deal Architect ──► Selects payout structure, drafts clauses with source citations
      │
      ▼
3. Compliance Auditor ──► Validates FTC disclosures, exclusivity, morals clauses
      │   └── [Self-Correction Loop: Triggers redraft if validation fails]
      ▼
4. [Human Gate 1] ──► Contract Approval (Pauses LangGraph execution)
      │
      ▼
5. Settlement Agent ──► Executes financial code in Docker sandbox (tax, splits, milestones)
      │
      ▼
6. [Human Gate 2] ──► Payout Ledger Approval
      │
      ▼
7. Finalizer ──► Produces immutable audit ledger, token metrics & cost report
```

### Pipeline B: Algorithmic Fairness & Credit Risk Audit Flow
```
[Applicant Dataset / ML Model]
      │
      ▼
1. Data Surveyor ──► Profiles sample data, checks feature distributions & missingness
      │
      ▼
2. Auditor MCP ──► Retrieves algorithmic knowledge skills (PURE & FRAMEWORK DAGs)
      │
      ▼
3. Sandbox MCP ──► Runs statistical tests (DIR, SPD, FPR Parity, EOD, SHAP Attribution)
      │
      ▼
4. Bias Mitigator ──► Solves linear programming optimization (Kamiran-Calders / Equalized Odds)
      │
      ▼
5. Report Compiler ──► Emits publication-ready LaTeX compliance PDF for regulators (CFPB/EEOC)
```

---

## 🚀 Key Features

- **Agentic Retrieval-Augmented Generation (RAG):** Evaluates retrieved document quality and self-rewrites queries if grounding confidence is low.
- **Self-Correction & Autonomous Reflection:** When compliance auditors flag ambiguous exclusivity or missing FTC disclosures, the system autonomously reroutes the draft to the drafting agent with structured feedback.
- **Zero-Hallucination Sandboxed Arithmetic:** Tax withholdings (1099/W-8BEN), milestone release percentages, and platform fees are executed in Python code inside a locked Docker container (`sandbox-python`).
- **Two-Stage Human-in-the-Loop Gates:** Leverages LangGraph interrupts (`interrupt()`) so no legally binding agreement or financial disbursement occurs without explicit user sign-off.
- **13 Algorithmic Fairness Algorithms:** Implements state-of-the-art fairness methods including Disparate Impact Ratio (DIR), Statistical Parity Difference (SPD), Equalized Odds Difference (EOD), Average Odds Difference, and iterative reweighing.
- **Full Observability & Traceability:** Real-time token consumption tracking, latency monitoring, cost auditing ($/run), and interactive visual canvas via `@xyflow/react`.
- **Dual-Mode Execution (Stub vs. Real LLM):** Runs out-of-the-box in deterministic high-speed mode (`PACTLINE_STUB=1`) for demonstrations and automated testing without requiring API keys.

---

## 🏗️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend UI** | **Next.js 16.2.7** (App Router, Turbopack), **React 19**, **TypeScript** |
| **Styling & Design System** | **Tailwind CSS 4**, Custom Leadora Light Theme (`#F3F2EF`), Lucide Icons |
| **Animation & Visualization** | **GSAP & ScrollTrigger**, **OGL** (WebGL Shader Terminal), **@xyflow/react** (Node Canvas) |
| **Backend Framework** | **Python 3.12**, **FastAPI**, **Uvicorn**, **WebSockets** |
| **Agent Orchestration** | **LangGraph**, **LangChain Core**, StateGraph, Interrupt Handlers |
| **Code Execution Sandbox** | **Docker** (`sandbox-python:latest`), 512MB RAM cap, 1 vCPU, network-isolated |
| **MCP Integration** | **Model Context Protocol (MCP)**, Dual-Server Architecture (`auditor` + `sandbox`) |
| **Data & Fairness Stack** | **Pandas**, **NumPy**, **Scikit-learn**, **SciPy**, **Statsmodels**, **SHAP**, **CVXPY** |
| **Testing & Quality** | **Pytest**, Playwright/CDP automation, TypeScript typechecking |

---

## 📁 Repository File Structure

```text
PactLine/
├── backend/
│   ├── pactline_backend/             # Active deal & contract settlement engine
│   │   ├── api.py                    # FastAPI server endpoints (HTTP REST & WebSockets)
│   │   ├── graph.py                  # LangGraph multi-agent state graph & gates
│   │   ├── state.py                  # DealState Pydantic models & validation schemas
│   │   ├── events.py                 # Structured event schemas emitted over WebSockets
│   │   ├── retrieval.py              # Agentic RAG retrieval & evaluation logic
│   │   ├── settlement_calc.py        # Deterministic financial arithmetic engine
│   │   ├── sandbox.py                # Docker container execution runner
│   │   ├── trace.py                  # Observability, token counter & cost calculator
│   │   ├── fixtures/                 # Seed briefs, test data, and ground-truth specs
│   │   └── tests/                    # Pytest test suite for backend & sandboxing
│   └── dataset_backend/              # Algorithmic fairness audit agent pipeline
│       ├── backend/api.py            # Fairness API instance (Port 8005)
│       └── agents/graph.py           # Multi-agent LangGraph fairness audit graph
├── frontend/agenticflow/             # Next.js 16 Web Application
│   ├── app/
│   │   ├── page.tsx                  # Public landing page (Banking & Finance fair lending)
│   │   ├── layout.tsx                # Root layout with font imports & global metadata
│   │   ├── dashboard/page.tsx        # Interactive XYFlow multi-agent canvas
│   │   ├── deal/new/page.tsx         # Campaign intake form with 1-click test presets
│   │   ├── overview/page.tsx         # Executive KPI dashboard & audit ledger
│   │   ├── replay/page.tsx           # Step-by-step playback & debugging studio
│   │   ├── about/page.tsx            # Architectural documentation & disclosures
│   │   └── privacy/page.tsx          # Data privacy & platform limitations statement
│   ├── components/                   # UI components (FaultyTerminal, BackgroundHalo, Header)
│   ├── hooks/useDealSocket.ts        # Real-time WebSocket event connection hook
│   └── lib/events.ts                 # TypeScript type definitions for streaming events
├── mcps/                             # Model Context Protocol servers
│   ├── auditor/                      # Fairness algorithm skills & mathematical guides
│   └── sandbox/                      # Dockerfile and execution scaffold for Docker sandbox
├── data/knowledge/                   # RAG knowledge base (contract templates, FTC guidelines)
├── dataset/                          # Audit datasets (data.csv, metadata.json)
├── uploadable test files/            # 1-Click test fixtures for demo presentation
│   ├── deal_brief_ambiguous_exclusivity_test.txt
│   ├── deal_brief_audio_tech_review.txt
│   ├── deal_brief_gaming_stream_sponsorship.txt
│   └── credit_loan_approval_test.csv
├── docs/                             # Architecture guides, handoff notes, and event contracts
│   ├── HANDOFF.md                    # Team handoff and engineering guide
│   ├── EVENTS.md                     # WebSocket event contract specification
│   └── ENV.md                        # Environment configuration reference
├── main.py                           # CLI root launcher for sandbox & MCP processes
├── requirements.txt                  # Python dependencies
└── README.md                         # Project documentation (this file)
```

---

## 💻 Prerequisites & Environment Setup

### 1. System Requirements
- **OS:** macOS (Apple Silicon / Intel) or Linux (Ubuntu 22.04+)
- **Python:** `Python 3.12+`
- **Node.js:** `Node.js 18.x` or `Node.js 20.x` (npm 9+)
- **Docker:** Docker Desktop installed and running

### 2. Clone the Repository
```bash
git clone https://github.com/anchit-goel/PactLine.git
cd PactLine
```

### 3. Backend Setup (Python Virtual Environment)
```bash
# Create and activate Python 3.12 virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install locked dependencies
pip install -r requirements.txt
```

### 4. Build Docker Sandbox Image
Pactline requires the secure execution container for running mathematical settlements and fairness tests:
```bash
docker build -t sandbox-python:latest ./mcps/sandbox
```

### 5. Frontend Setup (Next.js 16)
```bash
cd frontend/agenticflow
npm install
cd ../..
```

---

## 🏃 How to Run the Platform

Pactline runs as two cooperating services: the FastAPI Python backend and the Next.js frontend.

### Terminal 1: Launch the Backend Server
From the project root:
```bash
source .venv/bin/activate
PYTHONPATH=. .venv/bin/uvicorn backend.pactline_backend.api:app --host 0.0.0.0 --port 8005 --reload
```
*Backend will start on `http://localhost:8005` (API docs available at `http://localhost:8005/docs`).*

### Terminal 2: Launch the Frontend Web Interface
From the project root:
```bash
cd frontend/agenticflow
npm run dev
```
*Frontend will compile with Turbopack and serve on `http://localhost:3000`.*

---

## 🎬 Step-by-Step Demo & Testing Guide

You can run a complete 3-minute end-to-end evaluation using our pre-packaged test cases:

### Workflow 1: Content Creator Contract & Settlement Flow
1. Open **[http://localhost:3000](http://localhost:3000)** in your browser.
2. Click **"New Deal"** in the top navigation bar (or navigate to `http://localhost:3000/deal/new`).
3. Click the preset button **"Ambiguous Exclusivity"** (loads `deal_brief_ambiguous_exclusivity_test.txt`).
4. Click **"Start Live Deal Pipeline"**.
5. You are redirected to the **Interactive Workflow Canvas** (`/dashboard`).
6. **Watch the live agentic execution:**
   - **Brief Analyst** parses creator rates and deliverable requirements.
   - **Deal Architect** retrieves RAG knowledge clauses with exact citations.
   - **Compliance Auditor** catches the ambiguous exclusivity clause, rejects the draft, and triggers a self-correction redraft.
   - **Contract Gate (Human-in-the-Loop):** Execution pauses. Review the generated contract and click **"Approve Contract"**.
   - **Settlement Agent:** Docker sandbox executes `settlement_calc.py` to calculate net creator payouts, platform fees, and tax withholdings.
   - **Payout Gate (Human-in-the-Loop):** Review the financial ledger and click **"Authorize Disbursement"**.
7. Navigate to **"Overview Dashboard"** (`/overview`) to view executive KPI cards, token metrics, and recent deal summaries.

### Workflow 2: Financial Credit Risk Fairness Audit Flow
1. Navigate to the **Workflows Canvas** (`/dashboard`).
2. Select the **Dataset Audit Pipeline** tab.
3. Upload `uploadable test files/credit_loan_approval_test.csv` (or use active `dataset/data.csv`).
4. Set target column to `loan_approved` and protected attributes to `Gender` and `Age`.
5. Observe the **Data Surveyor** profile base rates and the **Fairness Adjudicator** identify Disparate Impact (DIR = 0.72).
6. Watch the **Bias Mitigator** solve the linear program to reweigh sample weights to DIR = 0.95 without retraining the underlying model.
7. Download the cryptographic compliance report PDF.

---

## 🧪 Verification & Test Suites

Pactline includes automated tests to guarantee system stability and deterministic behavior:

### Run Backend Unit & Integration Tests
```bash
PYTHONPATH=. .venv/bin/pytest backend/pactline_backend/tests -v
```

### Run WebSocket Streaming Smoke Test
```bash
.venv/bin/python scripts/smoke_ws.py
```

### Verify TypeScript Types
```bash
cd frontend/agenticflow
npx tsc --noEmit
```

### Run Production Build
```bash
cd frontend/agenticflow
npm run build
```

---

## 👥 Team & Hackathon Credits

**Pactline** was architected and developed by **Team TodPhod**:
- **Tarun Kumar** ([@TarunScript](https://github.com/TarunScript)) — Frontend Architecture, SaaS Design System, Visual Observability, WebSockets & Exports.
- **Anchit Goel** ([@anchit-goel](https://github.com/anchit-goel)) — Multi-Agent Orchestration, LangGraph State Engine, MCP Servers & Financial Sandboxing.

*Built for high-assurance AI governance, autonomous agentic operations, and mathematically grounded contract settlements.*
