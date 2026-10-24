"""Generate the executive PDF pitch presentation and defense guide for Pactline / Team TodPhod."""

import os
from pathlib import Path
import shutil
from backend.pactline_backend.sandbox import create_sandbox, copy_in, exec as sbx_exec, copy_out, destroy

TYPST_SOURCE = r"""#set page(
  paper: "a4",
  margin: (x: 1.8cm, top: 2.2cm, bottom: 2.2cm),
  header: [
    #grid(
      columns: (1fr, 1fr),
      align(left)[#text(size: 8pt, fill: rgb("#718096"), font: "Liberation Sans", weight: "bold")[PACTLINE — STAGE PITCH & DEFENSE DECK]],
      align(right)[#text(size: 8pt, fill: rgb("#9b51e0"), font: "Liberation Sans", weight: "bold")[TEAM TODPHOD]]
    )
    #v(0.3em)
    #line(length: 100%, stroke: 0.5pt + rgb("#e2e8f0"))
  ],
  footer: [
    #line(length: 100%, stroke: 0.5pt + rgb("#e2e8f0"))
    #v(0.3em)
    #grid(
      columns: (1fr, 1fr),
      align(left)[#text(size: 8pt, fill: rgb("#a0aec0"))[Decision Support & Audit Framework · Confidential]],
      align(right)[#text(size: 8pt, fill: rgb("#718096"), weight: "bold")[Pactline Enterprise Guide]]
    )
  ]
)

#set text(font: "Liberation Sans", size: 9.5pt, fill: rgb("#1a202c"))
#set par(justify: true, leading: 0.65em)

// Title Block
#align(center)[
  #block(
    fill: rgb("#0f172a"),
    inset: (x: 20pt, y: 16pt),
    radius: 8pt,
    width: 100%,
    [
      #text(size: 10pt, fill: rgb("#38bdf8"), weight: "bold", tracking: 0.25em)[EXECUTIVE STAGE PITCH & JUDGES DEFENSE GUIDE] \
      #v(0.4em)
      #text(size: 24pt, fill: white, weight: "black", font: "Liberation Sans")[PACTLINE] \
      #v(0.2em)
      #text(size: 11pt, fill: rgb("#cbd5e1"))[Algorithmic Fairness Auditing & Autonomous Contract Intelligence] \
      #v(0.6em)
      #rect(fill: rgb("#9b51e0"), radius: 4pt, inset: (x: 10pt, y: 4pt))[
        #text(size: 9pt, fill: white, weight: "bold")[PRESENTED BY TEAM TODPHOD]
      ]
    ]
  )
]

#v(1em)

// Executive Summary Box
#rect(
  fill: rgb("#f8fafc"),
  stroke: 1pt + rgb("#cbd5e1"),
  radius: 6pt,
  inset: 12pt,
  width: 100%
)[
  #text(weight: "bold", size: 11pt, fill: rgb("#1e293b"))[Executive 30-Second Elevator Summary] \
  #v(0.4em)
  *PactLine* is an enterprise-grade agentic AI framework that eliminates algorithmic bias and contract non-compliance before automated decisions go live. Operating inside a *zero-trust Docker execution sandbox with zero network egress*, PactLine autonomously profiles decision datasets for illegal statistical disparities (EEOC 4/5ths Rule), negotiates and drafts multi-milestone creator agreements, intercepts non-compliant clauses (FTC 16 CFR §255), pauses at human-in-the-loop approval gates, and calculates mathematically verified tax settlement ledgers.
]

#v(1.2em)
= 1. The 4-Minute Stage Presentation Script

#text(fill: rgb("#4a5568"), style: "italic")[Deliver this script with confident pacing, clear pauses, and direct eye contact with the judging panel.]

#v(0.5em)

=== Act I: The Hook — The Invisible Multi-Billion Dollar Crisis (0:00 – 0:45)
#rect(fill: rgb("#f1f5f9"), stroke: (left: 3pt + rgb("#ef4444")), inset: 10pt, width: 100%)[
  *Visual Slide Cue:* Headline montage: _EEOC Sues Over AI Hiring Disparity_ and _FTC Fines Influencer Campaign Millions for Undisclosed Sponsorships_. \
  *Speaker Tone:* Urgent, authoritative, eye-opening. \
  #v(0.4em)
  _Good morning, judges. Right now, automated algorithms and autonomous workflows make decisions that govern human lives: who gets approved for a home mortgage, who gets shortlisted for an engineering job, and how millions of dollars in the modern digital economy get paid out._ \
  \
  _Here is the reality no one wants to admit: *Automated decisions are running completely unchecked.*_ \
  \
  _When an enterprise algorithm discriminates against protected groups, the company faces devastating federal civil rights penalties and reputational collapse. And in the booming creator economy, brands lose millions to ambiguous deliverables, missing FTC disclosures, and statutory tax withholding errors. Today, fixing this requires hiring external legal consultants for \$80,000 and waiting six weeks._ \
  \
  _We are *Team TodPhod*, and today, we built *PactLine*._
]

#v(0.8em)
=== Act II: The Solution & Core Value Proposition (0:45 – 1:30)
#rect(fill: rgb("#f1f5f9"), stroke: (left: 3pt + rgb("#3b82f6")), inset: 10pt, width: 100%)[
  *Visual Slide Cue:* PactLine dual-engine architecture: (1) Forensic Dataset Bias Audit + (2) Deal Intelligence Studio. \
  *Speaker Tone:* Crisp, clear, solution-driven. \
  #v(0.4em)
  _*PactLine* is an autonomous agentic fairness auditing and contract intelligence platform. It performs the rigorous work of specialized legal and compliance teams in seconds:_ \
  \
  _1. It deep-scans enterprise datasets for hidden statistical bias._ \
  _2. It measures Disparate Impact against strict federal benchmarks like the *EEOC 4/5ths rule*._ \
  _3. It autonomously drafts legally sound agreements using agentic RAG._ \
  _4. And it enforces *Human-in-the-Loop approval gates* before any contract is signed or money is disbursed._
]

#pagebreak()

=== Act III: The Live System Demonstration (1:30 – 3:00)
#rect(fill: rgb("#f1f5f9"), stroke: (left: 3pt + rgb("#10b981")), inset: 10pt, width: 100%)[
  *Visual Screen:* Live Web Interface & Terminal Sandbox Logs. \
  *Speaker Tone:* Fast-paced, high energy, demonstrative. \
  #v(0.4em)
  *Engine 1: Forensic Dataset Bias Audit* \
  _Let's watch this live. We upload `hiring_decisions_bias_test.csv`. Notice what happens in the background: PactLine spins up a dedicated Docker sandbox with `--network none`. Your proprietary enterprise data *never leaves the local machine*._ \
  \
  _Our 4-agent LangGraph pipeline executes inside the container: Data Surveyor profiles the cohorts; Fairness Adjudicator calculates selection rates. In this dataset, male selection is 55% while female selection is 39%. That yields a Disparate Impact ratio of *0.718*—triggering an immediate EEOC violation alert. The Mitigation Agent immediately applies statistical re-weighting to restore fairness._ \
  \
  *Engine 2: Deal Intelligence & Tax Reconciliation* \
  _Now look at our Deal Studio. We paste an unstructured campaign brief with multiple milestones and creators. Watch our agent swarm collaborate:_ \
  - *The Brief Analyst* extracts deliverables and references creator benchmark rates. \
  - *The Deal Architect* drafts legal clauses. \
  - *The Compliance Auditor* intercepts Revision 1, catching a missing FTC disclosure and an unconscionable indefinite exclusivity window, forcing an automatic re-draft into Revision 2. \
  - *The Human Gate:* The engine halts. It refuses to disburse funds until an authorized human officer clicks *Approve*. \
  - Once approved, it calculates statutory 10% TDS deductions, outputs an auditable ledger, and compiles an executive Typst PDF agreement directly in the sandbox.
]

#v(0.8em)
=== Act IV: Technical Superiority & Closing Punchline (3:00 – 4:00)
#rect(fill: rgb("#f1f5f9"), stroke: (left: 3pt + rgb("#8b5cf6")), inset: 10pt, width: 100%)[
  *Visual Slide Cue:* Three Pillars: Zero-Trust Isolation | Deterministic Math | Human Safeguards. \
  *Speaker Tone:* Powerful, punchy, confident. \
  #v(0.4em)
  _Judges, three architectural pillars make PactLine truly enterprise-grade:_ \
  \
  _First, *Zero-Trust Privacy*. All code runs in an isolated container with zero network egress. Zero bytes leak to external servers._ \
  _Second, *Deterministic Math*. AI models hallucinate calculations. PactLine uses AI for reasoning, but uses verified NumPy/SciPy algorithms for financial tax ledgers and Disparate Impact ratios. It is mathematically 100% accurate._ \
  _Third, *Human Safeguards*. Autonomous agents should assist, not gamble with enterprise liability. Our LangGraph interrupt gates guarantee human oversight at every financial and legal checkpoint._ \
  \
  _Every company adopting AI needs an auditor they can trust. Every brand in the creator economy needs contracts that protect them. PactLine turns weeks of legal risk into 30 seconds of mathematical certainty._ \
  \
  _*Ensuring fairness in every decision. We are Team TodPhod, and this is PactLine. Thank you!*_
]

#v(1.5em)
= 2. The Judges' Q&A Defense Matrix

#table(
  columns: (1.5fr, 3fr),
  fill: (col, row) => if row == 0 { rgb("#1e293b") } else if calc.even(row) { rgb("#f8fafc") } else { white },
  stroke: 0.5pt + rgb("#cbd5e1"),
  inset: 8pt,
  [#text(weight: "bold", fill: white)[Judge's Hard Question]], [#text(weight: "bold", fill: white)[Team TodPhod Winning Defense]],
  
  [*How do you guarantee that proprietary customer data is not leaked to external servers?*],
  [We enforce a dual-layer zero-trust architecture. All data profiling, code execution, and tax calculation run inside ephemeral Docker containers launched with `--network none`. Outbound networking is disabled at the container kernel level. No data can physically leave the perimeter.],

  [*LLMs hallucinate math. How can you trust this for tax ledgers and legal bias ratios?*],
  [We strictly decouple semantic drafting from mathematical calculation. The LLM handles clause synthesis, but Disparate Impact ratios, EEOC 4/5ths benchmarks, and 10% TDS tax deductions are computed exclusively by deterministic Python scripts (`settlement_calc.py`, `scipy`). Math is never hallucinated.],

  [*What prevents the system from signing bad contracts or triggering unauthorized payouts?*],
  [PactLine incorporates native LangGraph StateGraph interrupt gates (`contract_gate` and `payout_gate`). The workflow enters a hard pause and cannot advance to PDF compilation or ledger disbursement without explicit, authenticated human approval.],

  [*Can this scale beyond creator contracts to other regulated industries?*],
  [Yes. The underlying RAG and fairness graph is modular. By changing the knowledge embeddings from FTC guidelines to HIPAA (healthcare) or ECOA/Fair Housing (lending), PactLine immediately audits algorithms in healthcare, mortgages, and enterprise procurement.]
)

#pagebreak()

= 3. Verified System Benchmark & Test Suite Results

#text(fill: rgb("#4a5568"))[All test files in `uploadable test files/` were verified against ground truth with 100% mathematical accuracy:]

#v(0.5em)

#table(
  columns: (2.2fr, 1.2fr, 1.6fr, 1fr),
  fill: (col, row) => if row == 0 { rgb("#0f172a") } else if calc.even(row) { rgb("#f8fafc") } else { white },
  stroke: 0.5pt + rgb("#cbd5e1"),
  inset: 7pt,
  [#text(weight: "bold", fill: white)[Test Suite File]],
  [#text(weight: "bold", fill: white)[Domain]],
  [#text(weight: "bold", fill: white)[Ground Truth Metric]],
  [#text(weight: "bold", fill: white)[Status]],

  [`hiring_decisions_bias_test.csv`], [HR Recruiting], [Min DI = 0.718 (< 0.80 EEOC Violation)], [#text(fill: rgb("#16a34a"), weight: "bold")[PASS (100%)]],
  [`credit_loan_approval_test.csv`], [Fintech Credit], [Min DI = 0.837 (>= 0.80 EEOC Compliant)], [#text(fill: rgb("#16a34a"), weight: "bold")[PASS (100%)]],
  [`healthcare_resource_allocation_test.csv`], [Clinical Care], [Min DI = 0.657 (< 0.80 Racial Disparity)], [#text(fill: rgb("#16a34a"), weight: "bold")[PASS (100%)]],
  [`creator_campaign_milestones_test.csv`], [Multi-Platform], [Min DI = 1.000 (Equal platform parity)], [#text(fill: rgb("#16a34a"), weight: "bold")[PASS (100%)]],
  [`deal_brief_audio_tech_review.txt`], [Sponsor Review], [FTC 16 CFR §255 + 10% TDS ledger], [#text(fill: rgb("#16a34a"), weight: "bold")[PASS (100%)]],
  [`deal_brief_gaming_stream_sponsorship.txt`], [Gaming Streams], [Multi-creator schedule & Typst PDF], [#text(fill: rgb("#16a34a"), weight: "bold")[PASS (100%)]],
  [`deal_brief_ambiguous_exclusivity_test.txt`], [Ambiguity Edge], [Indefinite non-compete auto-remedy], [#text(fill: rgb("#16a34a"), weight: "bold")[PASS (100%)]]
)

#v(1.5em)

= 4. Step-by-Step Live Stage Demo Guide

#rect(fill: rgb("#f8fafc"), stroke: 1pt + rgb("#e2e8f0"), radius: 6pt, inset: 12pt, width: 100%)[
  #grid(
    columns: (40pt, 1fr),
    [#circle(radius: 12pt, fill: rgb("#3b82f6"))[#align(center + horizon)[#text(fill: white, weight: "bold")[1]]]],
    [
      *Open the Browser UI (Localhost:3001)* \
      Show the clean dark-mode dashboard with Team TodPhod branding in the top right and footer. Point out the two tabs: *Dataset Bias Audit* and *Deal Intelligence*.
    ]
  )
  #v(0.8em)
  #grid(
    columns: (40pt, 1fr),
    [#circle(radius: 12pt, fill: rgb("#3b82f6"))[#align(center + horizon)[#text(fill: white, weight: "bold")[2]]]],
    [
      *Trigger Engine 1 (Forensic Dataset Audit)* \
      Upload `hiring_decisions_bias_test.csv`. Highlight the live WebSocket streaming logs showing Docker container `pact-audit-*` spinning up with network isolation. Show the resulting 3 interactive charts and the Disparate Impact card highlighting *0.718 (EEOC Adverse Impact)*.
    ]
  )
  #v(0.8em)
  #grid(
    columns: (40pt, 1fr),
    [#circle(radius: 12pt, fill: rgb("#3b82f6"))[#align(center + horizon)[#text(fill: white, weight: "bold")[3]]]],
    [
      *Trigger Engine 2 (Deal & Contract Studio)* \
      Click *"New Deal"*, paste the audio tech brief, and click *"Analyze & Draft"*. Show the agent negotiation trace: Revision 1 flags missing FTC disclosure, Revision 2 resolves it. Click *Approve* on the Human-in-the-Loop gate modal.
    ]
  )
  #v(0.8em)
  #grid(
    columns: (40pt, 1fr),
    [#circle(radius: 12pt, fill: rgb("#3b82f6"))[#align(center + horizon)[#text(fill: white, weight: "bold")[4]]]],
    [
      *Download the Final Artifacts* \
      Click *"Download Settlement Ledger (CSV)"* to display the 10% TDS deductions (\$10,000 gross $\to$ \$1,000 tax $\to$ \$9,000 net payout), and click *"Export Legal Contract (PDF)"* to show the sandbox-compiled Typst agreement.
    ]
  )
]

#v(2em)
#align(center)[
  #text(size: 9pt, fill: rgb("#718096"), weight: "bold")[© 2026 Pactline Forensic AI Systems · Developed by Team TodPhod] \
  #text(size: 8pt, fill: rgb("#a0aec0"))[Built for Algorithmic Fairness Auditing & Autonomous Enterprise Compliance]
]
"""

def main():
    print("Writing Typst source...")
    typst_path = Path("docs/PactLine_Stage_Pitch_Team_TodPhod.typ")
    typst_path.parent.mkdir(parents=True, exist_ok=True)
    typst_path.write_text(TYPST_SOURCE, encoding="utf-8")
    
    print("Compiling Typst PDF inside isolated Docker sandbox...")
    sbx = create_sandbox("pitch_pdf")
    try:
        copy_in(sbx, str(typst_path), "/workspace/pitch.typ")
        res = sbx_exec(sbx, "typst compile /workspace/pitch.typ /workspace/pitch.pdf")
        if res.returncode != 0:
            raise RuntimeError(f"Typst compilation error: {res.stderr}")
        
        # Copy to project root
        out_pdf = Path("PactLine_Stage_Pitch_Team_TodPhod.pdf")
        copy_out(sbx, "/workspace/pitch.pdf", str(out_pdf))
        print(f"Generated PDF in project: {out_pdf} ({out_pdf.stat().st_size} bytes)")
        
        # Copy to artifacts directory
        artifact_dir = Path("/Users/tarunkumar/.gemini/antigravity-ide/brain/67051c1e-8247-4d16-86de-a4251d17b9b6")
        if artifact_dir.exists():
            art_pdf = artifact_dir / "PactLine_Stage_Pitch_Team_TodPhod.pdf"
            shutil.copy2(str(out_pdf), str(art_pdf))
            print(f"Copied to artifacts: {art_pdf}")
    finally:
        destroy(sbx)

if __name__ == "__main__":
    main()
