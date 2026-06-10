# Data Dictionary — KnowYourLeaders

**Version:** v1.0  
**Generated on:** 2026-06-10  
**Applies to:** Pilot dataset v1.1 & app-ingest v1  

This document describes the schema used across the KnowYourLeaders platform datasets.

---

## 1) Core Dataset Schema (pilot-dataset-v1.1)

### Top-Level Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `dataset_name` | string | yes | Dataset identifier |
| `generated_on` | date (YYYY-MM-DD) | yes | Generation date |
| `framework_version` | string | yes | Framework release tag used for validation |
| `derived_from` | string | yes | Parent artifact reference |
| `acceptance_criteria` | object | yes | Acceptance criteria snapshot for this revision |
| `records` | array\<object\> | yes | Claim-level records |

### Record Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `claim_id` | string | yes | Unique claim ID (e.g., `MS-C01`) |
| `constituency_id` | string | yes | Constituency slug key |
| `constituency_name` | string | yes | Constituency display name |
| `state` | string | yes | State name |
| `promise_text` | string | yes | Normalized promise statement |
| `status` | enum | yes | `done`, `in_progress`, `not_started`, `misleading` |
| `confidence_label` | enum | yes | `high`, `medium`, `low` |
| `confidence_score` | integer | yes | Confidence score from 0 to 100 |
| `last_verified` | date | yes | Last verification date (`YYYY-MM-DD`) |
| `freshness_sla_days` | integer | yes | Maximum allowed age before staleness |
| `plain_language_summary` | string | yes | Brief neutral summary shown to citizens |
| `evidence` | array\<object\> | yes | Source-linked evidence metadata objects |

### Evidence Object Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `evidence_id` | string | yes | Unique evidence item key |
| `title` | string | yes | Evidence title for UI display |
| `url` | url | yes | Public source URL (official where possible) |
| `source_tier` | enum | yes | `A`, `B`, `C`, or `D` per framework tiering |
| `publisher` | string | yes | Publishing authority/institution |
| `source_type` | string | yes | Source class (e.g., `budget_documents`, `service_dashboard`) |
| `published_on` | date or null | yes | Publication date if explicit, else null |
| `retrieved_on` | date | yes | Retrieval/verification capture date |

### Status Enum Values

| Status | Label | Meaning |
|---|---|---|
| `done` | ✅ Done | Final milestone achieved and operational evidence exists |
| `in_progress` | 🟡 In Progress | At least one milestone achieved, final milestone pending |
| `not_started` | ⚪ Not Started | No verified execution milestone achieved |
| `misleading` | 🔴 Misleading | Public claim contradicted by official records |

### Confidence Label Mapping

| Label | Score Range |
|---|---|
| `high` | 80–100 |
| `medium` | 55–79 |
| `low` | 0–54 |

### Freshness State (derived)

| State | Definition |
|---|---|
| `fresh` | Verification age <= SLA window |
| `aging` | > SLA and <= 1.5 × SLA |
| `stale` | > 1.5 × SLA |

---

## 2) App-Ingest Schema (constituencies.json)

**Schema version:** `app-ingest-1.0`  
**Derived from:** pilot-dataset-v1.1 records, grouped by constituency

### Top-Level Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `schema_version` | string | yes | Ingest schema version tag |
| `derived_from` | string | yes | Parent dataset reference |
| `generated_on` | date | yes | Generation date |
| `constituencies` | array\<object\> | yes | Grouped constituency records |

### Constituency Object Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Constituency slug key (same as `constituency_id`) |
| `name` | string | yes | Constituency display name |
| `state` | string | yes | State name |
| `promises` | array\<object\> | yes | Promise records for this constituency |

### Promise Object Fields (within constituencies)

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Lowercase alias of `claim_id` for frontend keying |
| `claim_id` | string | yes | Original unique claim ID |
| `promise_text` | string | yes | Normalized promise statement |
| `status` | enum | yes | `done`, `in_progress`, `not_started`, `misleading` |
| `confidence_label` | enum | yes | `high`, `medium`, `low` |
| `confidence_score` | integer | yes | Confidence score from 0 to 100 |
| `last_verified` | date | yes | Last verification date |
| `freshness_sla_days` | integer | yes | Maximum allowed age before staleness |
| `plain_language_summary` | string | yes | Brief neutral summary for citizens |
| `evidence` | array\<object\> | yes | Source-linked evidence (same shape as above) |

### Field Mapping (Research → App Schema)

| Research Schema Path | App Schema Path | Notes |
|---|---|---|
| `records[].claim_id` | `constituencies[].promises[].claim_id` and `.id` | `id` is lowercase alias |
| `records[].constituency_id` | `constituencies[].id` | Grouping key |
| `records[].constituency_name` | `constituencies[].name` | Display name |
| `records[].state` | `constituencies[].state` | State context |
| `records[].promise_text` | `constituencies[].promises[].promise_text` | Promise label |
| All other flat fields | Same field under `promises[]` | Direct mapping |

---

## 3) Locale File Schema (locales.*.json)

Loaded by the frontend for multilingual UI. Structure:

```json
{
  "locale_code": "en",
  "strings": {
    "home_title": "KnowYourLeaders",
    "home_subtitle": "Vote by record, not rhetoric.",
    "search_placeholder": "Search constituency / politician / party",
    "status_done": "✅ Done",
    "status_in_progress": "🟡 In Progress",
    "status_not_started": "⚪ Not Started",
    "status_misleading": "🔴 Misleading",
    "pve_label": "Promise vs Execution",
    "wvi_label": "Work vs Impact",
    "evidence_drawer_title": "Evidence",
    "confidence_label": "Confidence",
    "last_verified": "Last verified",
    "freshness": "Freshness",
    "report_correction": "Report correction",
    "source_url": "Source URL",
    "publisher": "Publisher",
    "source_tier": "Source tier"
  }
}
```

---

## 4) Revision History

| Version | Date | Changes |
|---|---|---|
| v1.0 | 2026-06-10 | Initial data dictionary for pilot dataset v1.1 and app-ingest v1 |