# Uploadable Test Files for Pactline

This folder contains pre-configured, realistic test datasets and campaign briefs designed for testing both the **Fairness & Bias Auditing Engine** and the **Autonomous Deal & Contract Settlement Pipeline**.

---

## 1. CSV Datasets for Algorithmic Fairness & Bias Audits
These CSV files can be uploaded directly via the interactive **Upload Data** node on the visual canvas (`http://localhost:3001`) or via the `/upload` API endpoint (`http://localhost:8005/upload`).

### 📁 `hiring_decisions_bias_test.csv` (250 rows)
- **Use Case:** HR recruitment and resume screening algorithm audit.
- **Target Column:** `shortlisted` (Binary: `0` or `1`).
- **Protected Attributes:** `gender` (Male, Female, Non-Binary), `ethnicity` (White, Asian, Hispanic, Black), `age`.
- **Merit Attributes:** `coding_score`, `interview_score`, `years_experience`, `education_level`.
- **Expected Audit Behavior:** Flags Disparate Impact against female and minority candidates with identical merit scores; triggers Equal Opportunity / Reweighing mitigation.

### 📁 `credit_loan_approval_test.csv` (300 rows)
- **Use Case:** Consumer banking & financial credit risk assessment.
- **Target Column:** `loan_approved` (Binary: `0` or `1`).
- **Protected Attributes:** `gender`, `age_group` (`<25`, `25-40`, `41-60`, `>60`).
- **Financial Attributes:** `credit_score`, `annual_income`, `debt_to_income_ratio`, `loan_amount`.
- **Expected Audit Behavior:** Detects demographic disparity on young applicants (`<25`) and female applicants; calibrates threshold to satisfy Equalized Odds.

### 📁 `healthcare_resource_allocation_test.csv` (200 rows)
- **Use Case:** Hospital triage and chronic care priority allocation.
- **Target Column:** `admitted_priority_care` (Binary: `0` or `1`).
- **Protected Attributes:** `race`, `gender`, `age`.
- **Clinical Attributes:** `chronic_conditions`, `systolic_bp`, `prior_er_visits`, `clinical_risk_score`.
- **Expected Audit Behavior:** Identifies racial disparities in priority admission scores; computes before/after fairness curves in the Docker sandbox.

### 📁 `creator_campaign_milestones_test.csv` (24 rows)
- **Use Case:** Multi-creator sponsorship payouts, milestone tracking, and statutory tax calculations.
- **Features:** `creator_handle`, `platform`, `followers_count`, `milestone_name`, `gross_fee_usd`, `tds_withheld_usd`, `net_payout_usd`, `compliance_status`.
- **Expected Audit Behavior:** Verifies 10% statutory TDS withholding consistency across all milestone ledger entries.

---

## 2. Deal Briefs for Autonomous Deal Pipeline (`/deal/new`)
These text and JSON files can be copied and pasted directly into the deal intake form at `http://localhost:3001/deal/new` or sent to `POST /deal/start`.

### 📄 `deal_brief_audio_tech_review.txt`
- **Topic:** Tech hardware review ($12,500 budget, 1 creator, 3 milestones).
- **Features Tested:** Milestone scheduling, mandatory FTC disclosure (#Ad, #Sponsored), California governing law.

### 📄 `deal_brief_gaming_stream_sponsorship.txt`
- **Topic:** Nova Interactive live stream launch ($8,000 budget, 2 creators).
- **Features Tested:** Multi-platform deliverables (Twitch + TikTok), VOD metric verification.

### 📄 `deal_brief_ambiguous_exclusivity_test.txt`
- **Topic:** Fitness ambassador campaign ($15,000 budget).
- **Features Tested:** Flagging of an *indefinite exclusivity clause* by the compliance agent and automatic mitigation down to 30 days.

### 📄 `deal_intake_api_payload.json`
- **Topic:** Structured JSON payload ready for testing `POST http://localhost:8005/deal/start`.

---

## 3. Quick Upload Instructions

### In the Web GUI:
1. Open `http://localhost:3001` in your browser.
2. Drag and drop any `.csv` file from this folder onto the **Upload Data** node.
3. Select the recommended **Target Column** from the dropdown (e.g. `shortlisted` or `loan_approved`).
4. Click **Start Audit** to trigger the 4-agent LangGraph pipeline in the Docker sandbox.

### Via cURL / Terminal:
```bash
curl -X POST "http://localhost:8005/upload" \
  -F "file=@uploadable test files/hiring_decisions_bias_test.csv" \
  -F "description=Tech hiring fairness evaluation" \
  -F "target_column=shortlisted"
```
