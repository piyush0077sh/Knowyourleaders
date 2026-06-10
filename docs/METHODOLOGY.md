# Methodology — Promise vs Execution & Work vs Impact

**Version:** v1.0  
**Generated on:** 2026-06-10  
**Applies to:** Pilot dataset v1.1 and all subsequent releases

This document explains how KnowYourLeaders calculates **Promise vs Execution (PVE)** and **Work vs Impact (WVI)** — the two core metrics displayed on every constituency page.

---

## 1) Promise vs Execution (PVE)

PVE measures **whether a promise was translated into action and completion**. It answers the question: *Did the elected representative follow through on what they promised?*

### 1.1 Promise Structuring

Each promise is captured with:

| Field | Description | Example |
|---|---|---|
| `promise_text` | Verbatim or normalized claim | "24×7 PHC services in 3 zones" |
| `milestones[]` | Measurable checkpoints | (1) PHC identified (2) Staff hired (3) 24×7 operational |
| `target_date` | Stated deadline (if available) | 2025-12-31 |
| `evidence[]` | Source-linked proof for each milestone | Dashboard URLs, department reports |

### 1.2 Status Logic

Each promise receives one of four statuses:

| Status | Label | Condition |
|---|---|---|
| `done` | ✅ Done | Final milestone achieved; operational evidence exists |
| `in_progress` | 🟡 In Progress | At least one milestone achieved; final milestone pending |
| `not_started` | ⚪ Not Started | No verified execution milestone achieved |
| `misleading` | 🔴 Misleading | Public claim contradicted by official records, timelines, or outputs |

### 1.3 PVE Score Formula

**Per-promise score:**
```
promise_score_i = milestone_completion_i × confidence_multiplier_i
```

Where:
- `milestone_completion_i` = weighted fraction of milestones completed (0 to 1)
- `confidence_multiplier_i` depends on evidence quality:
  - Low confidence: 0.6
  - Medium confidence: 0.8
  - High confidence: 1.0

**Constituency-level PVE:**
```
PVE = (sum of all promise_score_i / total promises) × 100
```

**Example:**
If a constituency has 12 promises:
- 8 promises scored perfect (1.0 × 1.0 = 1.0 each)
- 3 promises scored partial (0.5 × 0.8 = 0.4 each)
- 1 promise not started (0.0 × 0.6 = 0.0)

```
PVE = ((8×1.0) + (3×0.4) + (1×0.0)) / 12 × 100
    = (8.0 + 1.2 + 0.0) / 12 × 100
    = 9.2 / 12 × 100
    = 76.7%
```

### 1.4 Data Sources for PVE

| Source Type | What It Provides | Tier |
|---|---|---|
| Manifestos / Election affidavits | Original promise text | A |
| Government scheme dashboards | Milestone completion status | A/B |
| Budget allocation vs utilization | Financial execution status | A |
| CAG audit reports | Independent verification of completion claims | A |
| Municipal works reports | Ground-level implementation data | B |

---

## 2) Work vs Impact (WVI)

WVI measures **whether completed work delivered real outcomes** — not just announcements or spending. It answers: *Did the work actually improve people's lives?*

### 2.1 Work-Impact Structuring

Each work item is captured with:

| Field | Description | Example |
|---|---|---|
| `work_output` | Tangible deliverable | "3 PHCs upgraded to 24×7 status" |
| `outcome_indicator` | Measurable outcome metric | "Average OPD wait time" or "Patients served per day" |
| `baseline_value` | Pre-implementation value | "0 patients served outside business hours" |
| `current_value` | Post-implementation value | "450 patients served during night hours in Q1 2026" |
| `attribution_confidence` | How strongly change links to this work | "Direct" (PHC-specific data) vs "Proxied" (district-level trend) |

### 2.2 WVI Status Logic

| Status | Condition |
|---|---|
| **High impact** | Output complete AND outcome improved above threshold |
| **Partial impact** | Output complete BUT outcome weak or uneven |
| **No verified impact** | Output reported BUT no credible outcome data available |

### 2.3 WVI Score Formula

**Per work item score:**
```
wvi_item_score_j = output_completion_j × outcome_change_j × confidence_multiplier_j
```

Where each factor is normalized to 0–1:

- `output_completion_j` = fraction of output targets met (0 to 1)
- `outcome_change_j` = measured improvement relative to target (capped at 1.0):
  - `min(outcome_delta / target_delta, 1.0)` where `outcome_delta = current_value - baseline_value`
- `confidence_multiplier_j` = same rubric as PVE (0.6 / 0.8 / 1.0)

**Constituency-level WVI:**
```
WVI = (sum of all wvi_item_score_j / total work items) × 100
```

**Example:**
If a constituency has 5 work items:
- 2 items with strong impact (1.0 × 0.9 × 1.0 = 0.9 each)
- 2 items with partial impact (1.0 × 0.5 × 0.8 = 0.4 each)
- 1 item with no verified data (0.0 × 0.0 × 0.6 = 0.0)

```
WVI = ((2×0.9) + (2×0.4) + (1×0.0)) / 5 × 100
    = (1.8 + 0.8 + 0.0) / 5 × 100
    = 2.6 / 5 × 100
    = 52.0%
```

### 2.4 Data Sources for WVI

| Source Type | What It Provides | Tier |
|---|---|---|
| Government MIS dashboards | Output completion + outcome counters | A/B |
| Administrative data (department reports) | Post-implementation statistics | B |
| District/block-level outcome surveys | Well-being indicators (e.g., NFHS, NSSO) | A |
| CAG performance audits | Independent outcome assessment | A |
| Citizen feedback (verified) | Ground-level outcome perceptions | D (lead only) |

---

## 3) Confidence Scoring (Shared across PVE and WVI)

### 3.1 Formula

```
confidence_score = source_quality(40) + corroboration(20) + recency(15)
                   + methodological_fit(15) + conflict_resolution(10)
```

### 3.2 Component Breakdown

| Component | Max | Description |
|---|---|---|
| **Source quality** | 40 | Based on evidence tier: A → high, B → mid-high, C → moderate, D → low |
| **Corroboration** | 20 | Degree of independent agreement across sources |
| **Recency** | 15 | How current the evidence is relative to freshness SLA |
| **Methodological fit** | 15 | How directly the source measures the relevant indicator |
| **Conflict resolution** | 10 | Whether contradictions are documented and adjudicated |

### 3.3 Public Labels

| Label | Score Range | Usage Rule |
|---|---|---|
| **High** | 80–100 | Required for `done` on high-budget/high-benefit claims |
| **Medium** | 55–79 | Acceptable for `done` on routine/low-impact claims |
| **Low** | 0–54 | Not sufficient for `done`; used for `not_started` or `in_progress` only |

---

## 4) Freshness Policy

### 4.1 Recertification Windows

| Volatility | Examples | SLA | UI Label at > SLA |
|---|---|---|---|
| High | Construction, dashboard counters, active spending | 30 days | Aging (>30d) / Stale (>45d) |
| Medium | Quarterly reports, utilization updates | 90 days | Aging (>90d) / Stale (>135d) |
| Low | Manifestos, affidavits, final audits | 180–365 days | Aging (>180d) / Stale (>270d) |

### 4.2 Pre-Election Mode

During the 90 days before polling:
- All high-impact claims reverified every **14 days**
- Contradictory claims flagged for priority review

---

## 5) Limitations and Caveats

1. **Attribution gap:** WVI cannot always prove causality — outcome changes may have multiple causes. We label `attribution_confidence` transparently.
2. **Data latency:** Government dashboards may update with delays. `last_verified` and `freshness_state` inform users of data age.
3. **Coverage gap:** Not all promises can be precisely measured. Claims without measurable indicators are flagged as `not_started` pending indicator design.
4. **Jurisdiction boundary:** A representative's direct control over execution varies by role (MP vs MLA vs municipal). This is noted in constituency context.
5. **Resource asymmetry:** Better-digitized states/ULBs may have more available data — this does not imply better performance. We track data availability separately.

---

## 6) Calculation Example (Mumbai South — Current Pilot)

Using the pilot dataset v1.1:

### PVE Calculation

| Promise | Milestone Completion | Confidence Multiplier | Score |
|---|---|---|---|
| Improve piped-water access | 0.50 (in_progress) | 0.8 (medium) | 0.40 |
| 24×7 PHC services | 1.00 (done) | 1.0 (high) | 1.00 |
| School infrastructure | 0.40 (in_progress) | 0.8 (medium) | 0.32 |
| Garbage blackspots | 0.50 (in_progress) | 0.8 (medium) | 0.40 |
| Affordable housing | 0.40 (in_progress) | 0.8 (medium) | 0.32 |
| Stormwater desilting | 0.60 (in_progress) | 0.8 (medium) | 0.48 |
| Public transport | 0.50 (in_progress) | 0.8 (medium) | 0.40 |
| Women safety | 0.40 (in_progress) | 0.8 (medium) | 0.32 |
| Youth skilling | 0.00 (not_started) | 0.6 (low) | 0.00 |
| Air quality | 0.50 (in_progress) | 0.8 (medium) | 0.40 |
| Legislative participation | 0.50 (in_progress) | 0.8 (medium) | 0.40 |
| Budget transparency | 1.00 (done) | 1.0 (high) | 1.00 |
| **Total** | | | **5.44** |

**PVE = 5.44 / 12 × 100 = 45.3%**

*Note: As the pilot dataset evolves and indicators are refined, these numbers will be recalculated with more precise milestone weights.*

---

## 7) Version History

| Version | Date | Changes |
|---|---|---|
| v1.0 | 2026-06-10 | Initial methodology documentation for PVE and WVI formulas |