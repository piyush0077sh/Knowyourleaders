# Digital Satyagraha — Lightweight Website MVP v1.2

Dependency-free, mobile-first static MVP with **multilingual i18n** (EN/हिंदी/தமிழ்),
**app-ingest v1 dataset integration**, and **WCAG AA accessibility refinements**.

## v1.2 scope implemented

### 1. App-ingest v1 dataset integration
- Switched data source to `data/app-ingest.v1.js` (global `window.DIGITAL_SATYAGRAHA_DATA`) with JSON fallback.
- Data adapter automatically enriches the simplified app-ingest schema:
  - Derives `freshness_state` / `freshness_sla_days` from `last_verified`.
  - Derives `confidence_score` from `confidence` string.
  - Derives `source_tier` from evidence metadata.
  - Uses `impact_summary` as verification note.
- Stats reflect final pilot data: 3 constituencies, 36 promises, 100.0% evidence-tier coverage.

### 2. Full multilingual localization
- Language switcher in header (EN / हिंदी / தமிழ்).
- All UI copy sourced from shared locale files in `data/locales.*.json`.
- Locale persisted via URL parameter (`?lang=`) and `localStorage`.
- English fallback for any missing translation keys.
- Placeholder-safe translation engine (`{{query}}` interpolation).

### 3. WCAG AA accessibility (v3 UX refinements)
- Minimum touch targets: **44×44px** for all interactive controls.
- Visible focus ring: **2px solid with 2px offset** (`:focus-visible`).
- Semantic landmarks: `header`, `main`, `nav`, `section`, `footer`.
- Table uses `scope="col"` headers and `caption` for screen readers.
- Evidence drawer uses `role="dialog"`, `aria-modal="true"`, `aria-labelledby`.
- Drawer has **full focus trap** — Tab/Shift+Tab cycles within open drawer.
- **Focus restoration** — closing drawer returns focus to trigger button.
- Drawer dismissible via Escape key and backdrop click.
- `prefers-reduced-motion` respected (drawer transition disabled when set).
- Color is never the sole communication method (icon + text + ARIA labels).
- Minimum body text: **16px**; no text under 14px on desktop.
- Text-expansion-safe spacing for Hindi/Tamil labels.

### 4. Evidence drawer accessibility
- Focus trap inside drawer.
- ARIA attributes: `aria-labelledby` pointing to title, `aria-modal="true"`.
- All labels localised (Confidence, Freshness, Last verified, Source tier, Edit history).
- "Report correction" button localised.

### 5. Correction modal localization
- Modal title, helper text, labels, placeholders, and buttons all use i18n.
- Success/failure messages localised.
- Focus sent to first input on open.
- Dismissible via Escape, backdrop, close, and Cancel buttons.

## File map

- `index.html` — Home search shell + results (i18n-ready)
- `constituency.html` — Scorecards, ledger, evidence drawer, correction modal
- `main.js` — i18n engine, data adapter, search, drawer with focus trap, modal, bootstrap
- `styles.css` — Responsive UI with a11y refinements, focus ring, min-touch targets
- `data/app-ingest.v1.js` — App-ingest dataset as browser global (primary source)
- `data/app-ingest.v1.json` — Same data as JSON for fallback fetch
- `data/locales.en.json` — English UI copy
- `data/locales.hi.json` — Hindi UI copy
- `data/locales.ta.json` — Tamil UI copy

## Local development

```bash
cd /home/team/shared/digital-satyagraha-mvp
python3 -m http.server 4173 --bind 0.0.0.0
```

Open:
- `http://localhost:4173/`
- `http://localhost:4173/?lang=hi`
- `http://localhost:4173/?lang=ta`
- `http://localhost:4173/constituency.html?id=mumbai-south&lang=hi`
- `http://localhost:4173/constituency.html?id=pune-central&lang=ta`
- `http://localhost:4173/constituency.html?id=chennai-central`

## Quick validation checklist

### 1) Syntax check
```bash
node --check main.js
```

### 2) Pages serve correctly
```bash
curl -sI http://localhost:4173/ | head -1
curl -sI "http://localhost:4173/constituency.html?id=chennai-central" | head -1
```
Both should return `200 OK`.

### 3) Data files reachable
```bash
curl -sI http://localhost:4173/data/app-ingest.v1.js | head -1
curl -sI http://localhost:4173/data/locales.en.json | head -1
curl -sI http://localhost:4173/data/locales.hi.json | head -1
```
All should return `200 OK`.

### 4) Language switcher
- Home page shows three language pills in header.
- Clicking `हिंदी` reloads with `?lang=hi` and shows Hindi labels.
- Clicking `தமிழ்` reloads with `?lang=ta` and shows Tamil labels.
- English fallback works for any missing keys.

### 5) Constituency records
- `constituency.html?id=chennai-central` shows score rings, promise table, verification badges.
- Evidence drawer opens when clicking "View" and shows evidence sources.
- Focus is trapped inside drawer; Escape closes it.
- "Report correction" button opens localised modal.

### 6) Responsive
- At 320px width, search bar, tabs, and legend remain fully visible.
- Promise table switches to card layout on mobile.
- No horizontal scroll at 320px.

## Note

Current evidence links in the dataset are illustrative. Replace with verified official URLs before any public launch. The correction modal is intentionally non-persistent (alert-only) in v1.2.