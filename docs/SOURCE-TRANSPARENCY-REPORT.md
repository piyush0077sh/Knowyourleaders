# Source Transparency Report — KnowYourLeaders

**Version:** v1.0  
**Generated on:** 2026-06-10  
**Prepared by:** Civic Data Research Team

This report documents the evidence collection, verification, and maintenance process behind every claim displayed on KnowYourLeaders. It is designed to allow independent audit of our methodology.

---

## 1) Evidence Collection Process

### 1.1 Intake & Parsing

1. **Source identification:** Promises/work items are extracted from:
   - Election manifestos (party/individual)
   - Public speeches (official transcripts where available)
   - Candidate affidavits (ECI)
   - Government scheme announcements
   - Legislative records (questions, bills, debates)
2. **Normalization:** Each claim is normalized into a measurable statement with the following captured:
   - Verbatim text
   - Date of claim
   - Targeted jurisdiction
   - Any stated deadlines or milestones
3. **Indicator mapping:** Each promise is mapped to one or more measurable indicators (e.g., "24×7 PHC services in 3 zones" → "Number of PHCs operating 24×7").

### 1.2 Evidence Sourcing

Evidence is collected following a strict **hierarchy of reliability**:

| Priority | Source Family | Example Portals | Tier | Default Confidence | Freshness SLA |
|---|---|---|---|---|---|
| 1 | Election Commission | eci.gov.in, affidavit.eci.gov.in, results.eci.gov.in | A | High | 180–365 days |
| 2 | Legislative records | sansad.in/ls, sansad.in/rs | A | High | 30 days |
| 3 | Budget & expenditure | indiabudget.gov.in + state budget portals | A | High | 90 days |
| 4 | CAG/Audit reports | cag.gov.in | A | High | 365 days |
| 5 | Court/legal records | ecourts.gov.in | A/B | Medium-High | 30 days |
| 6 | Government dashboards & MIS | data.gov.in + department dashboards | A/B | Medium-High | 30–60 days |
| 7 | RTI responses | rtionline.gov.in | B | Medium-High | 90 days |
| 8 | Press Information Bureau | pib.gov.in | B | Medium | 30 days |
| 9 | Verified media/fact-check | Credibility-scored publishers | C | Medium | 14 days |
| 10 | Citizen submissions | Platform uploads | D | Low (until verified) | 7 days triage |

### 1.3 Source Admissibility Rules

1. A public status must rely on **Tier A/B** evidence whenever available.
2. **Done (✅)** for budget-impact claims requires **Tier A** evidence.
3. **Misleading (🔴)** requires either:
   - One contradictory **Tier A** source, or
   - Two independent **Tier B/C** sources with documented cross-check.
4. **Tier C** alone cannot mark **Done** for high-stakes claims.
5. **Tier D** is never standalone — it is a lead that triggers verification.

---

## 2) Verification Workflow

### 2.1 Step-by-Step

```
1. Intake & Parsing
   └→ Extract claim, normalize into measurable form
   
2. Indicator Mapping
   └→ Define milestones, outcome indicators, baseline values
   
3. Evidence Collection
   └→ Pull Tier A/B first; capture full citation metadata
   
4. Triangulation
   └→ Cross-check across ≥2 sources for contested claims
   
5. Scoring & Status Assignment
   └→ Compute confidence score; apply PVE/WVI status rules
   
6. Peer Review Gate
   └→ Second reviewer validates source match and status logic
   
7. Publication
   └→ Show status, summary, evidence links, date, confidence

8. Scheduled Re-verification
   └→ Auto-queue by freshness SLA and election proximity
```

### 2.2 Peer Review Gate

- Every published claim is reviewed by at least one additional researcher.
- Contested claims (marked as misleading or disputed) require **two-person sign-off**.
- Reviewer checks:
  - Does the evidence match the indicator definition?
  - Is the status consistent with the evidence tier?
  - Is the confidence score justified?
  - Is the plain-language summary neutral and factual?

### 2.3 Correction & Dispute Process

**Intake channels:**
- "Report correction" button on every evidence drawer
- Required fields: claim ID, correction note, supporting link/document, contact (optional)

**Response SLAs:**
| Stage | Timeframe |
|---|---|
| Acknowledgement | Within 48 hours |
| Initial assessment | Within 5 days |
| Resolution target | Within 14 days |
| Election window priority | Within 7 days |

**Decision outcomes:**
- **Accepted:** Update status/evidence; increment version
- **Partially accepted:** Add context note + pending verification tag
- **Rejected:** Retain old status; publish rationale

---

## 3) Source Tier Definitions

| Tier | Name | Description | Weight in Confidence Score |
|---|---|---|---|
| **A** | Constitutional/Statutory Primary | Official institutional records: ECI, Parliament, CAG, Budget, Courts | 35–40 / 40 |
| **B** | Administrative Primary | Department releases, RTI responses, sanctioned project docs, municipal dashboards | 25–34 / 40 |
| **C** | Verified Secondary | Reputed media/fact-check reports with credibility scoring | 15–24 / 40 |
| **D** | Citizen Submissions | User-uploaded evidence, verified against Tier A/B/C | 0–14 / 40 |

---

## 4) Confidence Scoring

### 4.1 Formula

```
confidence_score = source_quality(40) + corroboration(20) + recency(15)
                   + methodological_fit(15) + conflict_resolution(10)
```

### 4.2 Component Rubric

| Component | Max Points | Scoring Guide |
|---|---|---|
| Source quality | 40 | A=35-40, B=25-34, C=15-24, D=0-14 |
| Corroboration | 20 | Independent agreement across sources |
| Recency | 15 | Alignment with freshness SLA window |
| Methodological fit | 15 | How directly source measures the indicator |
| Conflict resolution | 10 | Contradictions documented and adjudicated |

### 4.3 Public Labels

| Label | Score Range | Publication Rule |
|---|---|---|
| High | 80–100 | Required for Done on high-budget/high-benefit claims |
| Medium | 55–79 | Acceptable for Done on low-impact claims |
| Low | 0–54 | Cannot support Done; use for not_started only |

---

## 5) Freshness & Recertification

### 5.1 Claim Recertification Windows

| Volatility | Examples | Re-verification SLA |
|---|---|---|
| High | Ongoing construction, dashboard counters, active spending | **30 days** |
| Medium | Quarterly department reports, utilization updates | **90 days** |
| Low | Affidavits, manifestos, final audit findings | **180–365 days** |

### 5.2 Pre-Election Escalation

During the **90 days before polling**:
- All visible high-impact claims move to **14-day** verification cycles
- Unresolved contradictory claims flagged for priority review

---

## 6) Neutrality Guardrails

1. **Symmetric standards:** Same scoring rules across all parties/candidates.
2. **Evidence hierarchy lock:** Do not override Tier A contradiction with rhetoric.
3. **No sentiment language:** Describe facts and deltas only.
4. **Indicator pre-registration:** Define indicators and thresholds before status assignment.
5. **Two-person review for contested claims:** Especially any 🔴 misleading label.
6. **Conflict logging mandatory:** Preserve contradictory source notes in the record.
7. **Versioned edits:** Every status change includes date, editor role, reason, and source IDs.
8. **Recency transparency:** Show `last_verified` and `freshness_state` publicly.
9. **Source diversity check:** Avoid over-reliance on one publisher family.
10. **Appeal/correction channel:** Public correction submissions with publishable resolution notes.

---

## 7) Evidence Metadata Schema

Every evidence entry stores the following for traceability:

| Field | Description | Example |
|---|---|---|
| `evidence_id` | Unique key | `MS-01-E1` |
| `title` | Display title | "Ward water service dashboard" |
| `url` | Public source link | `https://portal.mcgm.gov.in/` |
| `source_tier` | A/B/C/D | `B` |
| `publisher` | Publishing authority | "Municipal Corporation" |
| `source_type` | Source class | `service_dashboard` |
| `published_on` | Original publication date | `2026-01-15` |
| `retrieved_on` | Verification capture date | `2026-06-07` |

---

## 8) Version History & Audit Trail

Every claim maintains an immutable edit history:

```json
{
  "edit_history": [
    {
      "version": "v1",
      "updated_on": "2026-05-26",
      "updated_by_role": "researcher",
      "change_note": "Initial status assessment based on district health dashboard"
    },
    {
      "version": "v2",
      "updated_on": "2026-06-07",
      "updated_by_role": "reviewer",
      "change_note": "Confidence upgraded to High after corroboration from secondary source"
    }
  ]
}
```

---

## 9) Source Registry

A machine-readable source registry is maintained at:
- `/home/team/shared/source-registry-v1.csv` (research artifact)
- `/home/team/shared/Knowyourleaders-repo/data/source-registry-v1.csv` (repo copy)

This registry catalogs every source family referenced in the dataset, with URL, tier, typical use, and freshness targets.

---

## 10) Future Improvements

- [ ] Build state-wise source appendix (state budgets, assembly data, municipal dashboards)
- [ ] Define per-sector indicator library (health, education, transport, water, sanitation)
- [ ] Add automated staleness alerts for claims nearing SLA breach
- [ ] Calibrate confidence thresholds using expanded pilot data
- [ ] Train reviewers on contradiction-handling playbook
- [ ] Implement public-facing correction audit log
- [ ] Integrate RTI request tracking for missing data gaps