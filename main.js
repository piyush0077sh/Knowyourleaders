/**
 * KnowYourLeaders — Main Application Engine
 *
 * Features:
 * - App-ingest v1 dataset adapter
 * - Full i18n (EN / HI / TA) with URL + localStorage persistence
 * - WCAG AA accessibility (focus trap, ARIA, reduced-motion)
 * - Evidence drawer with keyboard-driven focus management
 * - Correction modal
 */

// ── 1. Locale map (loaded from ./data/locales.*.json) ──────────────────────
const LOCALE_MAP = {
  en: { file: './data/locales.en.json', label: 'EN', lang: 'en' },
  hi: { file: './data/locales.hi.json', label: 'हिंदी', lang: 'hi' },
  ta: { file: './data/locales.ta.json', label: 'தமிழ்', lang: 'ta' }
};

const SUPPORTED_LOCALES = Object.keys(LOCALE_MAP);
let localeData = {};
let currentLocale = 'en';

// ── 2. Constants ────────────────────────────────────────────────────────────
const STATUS_META = {
  done:        { icon: '✅', label: 'Done', weight: 1 },
  in_progress: { icon: '🟡', label: 'In Progress', weight: 0.6 },
  not_started: { icon: '⚪', label: 'Not Started', weight: 0 },
  misleading:  { icon: '🔴', label: 'Misleading', weight: 0.2 }
};

const CONFIDENCE_WEIGHTS = { high: 80, medium: 50, low: 20 };
const FRESHNESS_DAYS = { fresh: 7, aging: 30 };  // stale > 30

const DATE_OPTIONS = { day: '2-digit', month: 'short', year: 'numeric' };

// ── 3. App state ────────────────────────────────────────────────────────────
let appData = null;
let enrichedConstituencies = [];

// ── 4. i18n engine ──────────────────────────────────────────────────────────

/** Load a locale JSON file. Returns the parsed object (or empty). */
async function loadLocale(locale) {
  const info = LOCALE_MAP[locale] || LOCALE_MAP.en;
  try {
    const resp = await fetch(info.file, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } catch {
    console.warn(`Locale "${locale}" failed to load, using empty fallback`);
    return {};
  }
}

/** Resolve a dotted path inside localeData, falling back to English then raw key. */
function t(key, vars = {}) {
  const keys = key.split('.');
  let val = localeData;
  for (const k of keys) {
    val = val?.[k];
    if (val === undefined) break;
  }
  // Fallback to English
  if (val === undefined && currentLocale !== 'en') {
    val = LOCALE_MAP.en._data;
    let fallbackVal = val;
    for (const k of keys) {
      fallbackVal = fallbackVal?.[k];
      if (fallbackVal === undefined) break;
    }
    if (fallbackVal !== undefined) val = fallbackVal;
  }
  if (typeof val !== 'string') return key;
  // Replace {{var}} placeholders
  return val.replace(/\{\{(\w+)\}\}/g, (_, name) => vars[name] ?? `{{${name}}}`);
}

/** Return a status label with icon (uses STATUS_META label, not locale — locale legend.xx has emoji prefix). */
function statusLabel(status) {
  const key = status || 'not_started';
  const info = STATUS_META[key] || { icon: '⚪', label: 'Not Started', weight: 0 };
  return `${info.icon} ${info.label}`;
}

/** Return a localised confidence label with score. */
function confidenceLabel(confidenceStr, score) {
  const key = (confidenceStr || 'low').toLowerCase();
  const tKey = `confidence.${key}`;
  const label = t(tKey);
  return `${t('evidenceDrawer.confidence')}: ${label} (${score ?? 0})`;
}

/** Return a localised freshness label. */
function freshnessLabel(state, sla) {
  const key = (state || 'stale').toLowerCase();
  const icon = key === 'fresh' ? '🟢' : key === 'aging' ? '🟠' : '🔴';
  const tKey = `freshness.${key}`;
  return `${icon} ${t(tKey)} • SLA ${sla ?? '--'}d`;
}

/** Return a localised "Last verified" text. */
function lastVerifiedLabel(dateStr) {
  return `🕒 ${t('evidenceDrawer.lastVerified')}: ${formatDate(dateStr)}`;
}

// ── 5. Data adapter (app-ingest v1 → enriched schema) ───────────────────────

function deriveFreshness(lastVerified) {
  if (!lastVerified) return { state: 'stale', slaDays: 90 };
  const then = new Date(`${lastVerified}T00:00:00`);
  const now = new Date();
  const days = Math.round((now - then) / 86400000);
  if (days <= FRESHNESS_DAYS.fresh)  return { state: 'fresh', slaDays: days };
  if (days <= FRESHNESS_DAYS.aging)  return { state: 'aging', slaDays: days };
  return { state: 'stale', slaDays: days };
}

function deriveConfidenceScore(confidenceStr) {
  return CONFIDENCE_WEIGHTS[confidenceStr?.toLowerCase()] ?? CONFIDENCE_WEIGHTS.low;
}

function deriveSourceTier(promise) {
  if (!promise.evidence?.length) return 'C (no sources)';
  const hasTierA = promise.evidence.some(e =>
    e.source_type?.includes('service_dashboard') || e.publisher?.includes('Government')
  );
  return hasTierA ? 'A (primary govt)' : 'B (secondary)';
}

function adaptPromise(raw) {
  const freshness = deriveFreshness(raw.last_verified);
  return {
    ...raw,
    confidence_label:    raw.confidence || 'low',
    confidence_score:    deriveConfidenceScore(raw.confidence),
    freshness_state:     freshness.state,
    freshness_sla_days:  freshness.slaDays,
    indicator_name:      raw.category || 'General',
    verification_note:   raw.impact_summary || '',
    source_tier:         deriveSourceTier(raw),
    last_verified:       raw.last_verified || null,
    edit_history:        raw.edit_history || [],
    evidence:            raw.evidence || []
  };
}

function deriveMetrics(constituency) {
  const promises = constituency.promises || [];
  if (!promises.length) {
    return {
      promise_vs_execution: { score_pct: 0, total_promises_mapped: 0 },
      work_vs_impact:       { score_pct: 0, total_work_items: 0 }
    };
  }
  const pScore = promises.reduce((s, p) => s + (STATUS_META[p.status]?.weight ?? 0), 0) / promises.length;
  const iScore = promises.reduce((s, p) => {
    const cf = (deriveConfidenceScore(p.confidence)) / 100;
    const sf = STATUS_META[p.status]?.weight ?? 0;
    return s + cf * sf;
  }, 0) / promises.length;
  return {
    promise_vs_execution: { score_pct: Math.round(pScore * 100), total_promises_mapped: promises.length },
    work_vs_impact:       { score_pct: Math.round(iScore * 100), total_work_items: promises.length }
  };
}

function enrichConstituency(raw) {
  const adaptedPromises = (raw.promises || []).map(adaptPromise);
  return {
    ...raw,
    promises: adaptedPromises,
    metrics: raw.metrics || deriveMetrics({ promises: adaptedPromises })
  };
}

// ── 6. Utilities ────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-IN', DATE_OPTIONS);
}

function safe(v, fallback = '--') { return v ?? fallback; }

function setDatasetStatus(text, isError = false) {
  const el = document.getElementById('datasetStatus');
  if (!el) return;
  el.textContent = text;
  el.classList.toggle('error-text', Boolean(isError));
}

function getPartyByName(name) {
  return appData?.parties?.find(p => p.name === name);
}

function getPoliticianByConstituency(id) {
  return appData?.politicians?.find(p => p.constituency_id === id);
}

function calcFreshnessMix(promises = []) {
  const mix = { fresh: 0, aging: 0, stale: 0 };
  promises.forEach(p => { const k = p.freshness_state || 'stale'; mix[k] = (mix[k] || 0) + 1; });
  return mix;
}

function freshnessMixText(promises) {
  const m = calcFreshnessMix(promises);
  return `🟢 ${m.fresh} • 🟠 ${m.aging} • 🔴 ${m.stale}`;
}

function statusHTML(status) {
  const info = STATUS_META[status] || { icon: '⚪', label: 'Not Started', weight: 0 };
  const label = statusLabel(status);
  return `<span class="status-tag status-${status}" role="status" aria-label="${t('constituency.status')}: ${info.label}">${label}</span>`;
}

function confidenceBadgeHTML(confStr, score) {
  const key = (confStr || 'low').toLowerCase();
  return `<span class="meta-badge confidence-${key}">${confidenceLabel(confStr, score)}</span>`;
}

function freshnessBadgeHTML(state, sla) {
  const key = (state || 'stale').toLowerCase();
  return `<span class="meta-badge freshness-${key}">${freshnessLabel(state, sla)}</span>`;
}

function lastVerifiedBadgeHTML(dateStr) {
  return `<span class="meta-badge">🕒 ${t('evidenceDrawer.lastVerified')}: ${formatDate(dateStr)}</span>`;
}

// ── 7. Search & matching ────────────────────────────────────────────────────

function findMatches(query, scope = 'all') {
  const q = query.trim().toLowerCase();
  if (!q) return enrichedConstituencies;
  return enrichedConstituencies.filter(c => {
    const partyObj = getPartyByName(c.party);
    const pol = getPoliticianByConstituency(c.id);
    const cHit = c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.state.toLowerCase().includes(q);
    const pHit = pol?.name?.toLowerCase().includes(q) || c.representative?.toLowerCase().includes(q);
    const partyHit = c.party?.toLowerCase().includes(q) || partyObj?.name?.toLowerCase().includes(q);
    if (scope === 'constituency') return cHit;
    if (scope === 'politician')   return Boolean(pHit);
    if (scope === 'party')        return Boolean(partyHit);
    return cHit || Boolean(pHit) || Boolean(partyHit);
  });
}

function resultCardMarkup(c) {
  return `
    <article class="result-card">
      <h4>${c.name}</h4>
      <p class="footnote">${c.state} • ${c.representative} • ${c.party}</p>
      <div class="result-metrics">
        <span class="meta-badge">${t('metrics.promiseVsExecution')} ${c.metrics.promise_vs_execution.score_pct}%</span>
        <span class="meta-badge">${t('metrics.workVsImpact')} ${c.metrics.work_vs_impact.score_pct}%</span>
      </div>
      <p class="footnote">${t('home.freshnessMix')}: ${freshnessMixText(c.promises)}</p>
      <a class="primary-button" href="./constituency.html?id=${encodeURIComponent(c.id)}&lang=${currentLocale}">${t('constituency.viewEvidence')}</a>
    </article>`;
}

// ── 8. Home page initialiser ────────────────────────────────────────────────

function initializeHome() {
  const featured = enrichedConstituencies[0];
  if (!featured) return;

  const $ = id => document.getElementById(id);

  // Set page title from locale
  document.title = `${t('global.brand')} | ${t('global.tagline')}`;

  // Brand + tagline
  const logo = document.querySelector('.logo');
  const tagline = document.querySelector('.tagline');
  if (logo) logo.textContent = t('global.brand');
  if (tagline) tagline.textContent = t('global.tagline');

  // Search
  const searchInput = $('globalSearch');
  const searchBtn = $('searchButton');
  if (searchInput) {
    searchInput.placeholder = t('search.placeholder');
    searchInput.setAttribute('aria-label', t('search.ariaLabel'));
  }

  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    const scope = tab.dataset.scope;
    if (scope === 'all') tab.textContent = t('search.scope.all');
    else if (scope === 'constituency') tab.textContent = t('search.scope.constituency');
    else if (scope === 'politician') tab.textContent = t('search.scope.politician');
    else if (scope === 'party') tab.textContent = t('search.scope.party');
  });

  // Legend
  document.querySelectorAll('.status-pill').forEach(pill => {
    const text = pill.textContent.trim();
    if (text.includes('Done')) pill.textContent = t('legend.done');
    else if (text.includes('In Progress')) pill.textContent = t('legend.inProgress');
    else if (text.includes('Not Started')) pill.textContent = t('legend.notStarted');
    else if (text.includes('Misleading')) pill.textContent = t('legend.misleading');
  });

  // Hero panel
  const heroTitle = $('heroTitle');
  const heroBody = $('heroBody');
  if (heroTitle) heroTitle.textContent = t('home.datasetBrowserTitle');
  if (heroBody) heroBody.textContent = t('home.datasetBrowserBody');

  // Featured
  const featuredTitle = $('featuredTitle');
  const featuredName = $('featuredName');
  const featuredRep = $('featuredRep');
  const featuredP = $('featuredPromiseScore');
  const featuredI = $('featuredImpactScore');
  const featuredF = $('featuredFreshnessMix');
  const lastUpd = $('lastUpdated');
  const schemaVer = $('schemaVersion');
  const resultsTitle = $('resultsTitle');
  const resultsCount = $('resultsCount');
  const resultsContainer = $('searchResults');

  if (featuredTitle) featuredTitle.textContent = t('home.featuredConstituency');
  if (schemaVer) schemaVer.textContent = safe(appData?.schema_version, '1.0.0');
  if (featuredName) featuredName.textContent = featured.name;
  if (featuredRep) featuredRep.textContent = `${t('constituency.representative')}: ${featured.representative}`;
  if (featuredP) featuredP.textContent = `${featured.metrics.promise_vs_execution.score_pct}%`;
  if (featuredI) featuredI.textContent = `${featured.metrics.work_vs_impact.score_pct}%`;
  if (featuredF) featuredF.textContent = freshnessMixText(featured.promises);
  if (lastUpd) lastUpd.textContent = formatDate(appData?.last_updated);

  // Metric titles
  document.querySelectorAll('.metric-title').forEach(el => {
    if (el.textContent.includes('Promise vs Execution')) el.textContent = t('metrics.promiseVsExecution');
    else if (el.textContent.includes('Work vs Impact')) el.textContent = t('metrics.workVsImpact');
  });

  // Rings
  const rings = document.querySelectorAll('.ring');
  if (rings[0]) rings[0].style.setProperty('--score', featured.metrics.promise_vs_execution.score_pct);
  if (rings[1]) rings[1].style.setProperty('--score', featured.metrics.work_vs_impact.score_pct);

  // Disclaimer
  const disclaimer = $('homeDisclaimer');
  if (disclaimer) disclaimer.textContent = t('disclaimer.neutrality');

  let activeScope = 'all';

  function renderResults(matches, titleText) {
    if (resultsTitle) resultsTitle.textContent = titleText;
    if (resultsCount) resultsCount.textContent = String(matches.length);
    if (!matches.length) {
      if (resultsContainer) resultsContainer.innerHTML = `<p class="footnote">${t('search.noResults')} ${t('search.tryHint')}</p>`;
      return;
    }
    if (resultsContainer) resultsContainer.innerHTML = matches.map(resultCardMarkup).join('');
  }

  function executeSearch() {
    const matches = findMatches(searchInput?.value || '', activeScope);
    const inputVal = (searchInput?.value || '').trim();
    const label = inputVal
      ? t('search.resultsFor', { query: inputVal })
      : t('search.defaultResultsTitle');
    renderResults(matches, label);
  }

  if (searchBtn) searchBtn.addEventListener('click', executeSearch);
  if (searchInput) searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') executeSearch(); });

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeScope = tab.dataset.scope || 'all';
      executeSearch();
    });
  });

  const params = new URLSearchParams(window.location.search);
  const qParam = params.get('q');
  if (qParam && searchInput) {
    searchInput.value = qParam;
    executeSearch();
    return;
  }
  renderResults(enrichedConstituencies, t('search.defaultResultsTitle'));
}

// ── 9. Constituency page initialiser ────────────────────────────────────────

function initializeConstituency() {
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get('id');
  const constituency = enrichedConstituencies.find(c => c.id === requestedId) || enrichedConstituencies[0];
  if (!constituency) return;

  const $ = id => document.getElementById(id);

  document.title = `${t('global.brand')} | ${constituency.name}`;

  // Brand line
  const logo = document.querySelector('.logo');
  if (logo) logo.textContent = t('global.brand');
  const tagline = document.querySelector('.tagline');
  if (tagline) tagline.textContent = t('constituency.tagline');

  // Legend
  document.querySelectorAll('.status-pill').forEach(pill => {
    const text = pill.textContent.trim();
    if (text.includes('Done')) pill.textContent = t('legend.done');
    else if (text.includes('In Progress')) pill.textContent = t('legend.inProgress');
    else if (text.includes('Not Started')) pill.textContent = t('legend.notStarted');
    else if (text.includes('Misleading')) pill.textContent = t('legend.misleading');
  });

  // Switcher label
  const switcherLabel = document.querySelector('.constituency-switcher label');
  if (switcherLabel) switcherLabel.innerHTML = `<strong>${t('constituency.switchConstituency')}:</strong>`;

  const heading = $('constituencyHeading');
  const repName = $('representativeName');
  const partyName = $('partyName');
  const termLabel = $('termLabel');
  const lastUpd = $('constituencyLastUpdated');
  const fMix = $('freshnessMix');
  const pScore = $('promiseScore');
  const iScore = $('impactScore');
  const pRing = $('promiseRing');
  const iRing = $('impactRing');
  const sel = $('constituencySelect');

  if (heading) heading.textContent = `${t('constituency.headingPrefix')}: ${constituency.name}`;
  if (repName) repName.textContent = constituency.representative;
  if (partyName) partyName.textContent = constituency.party;
  if (termLabel) termLabel.textContent = constituency.term;
  if (lastUpd) lastUpd.textContent = formatDate(appData?.last_updated);
  if (fMix) fMix.textContent = freshnessMixText(constituency.promises);
  if (pScore) pScore.textContent = `${constituency.metrics.promise_vs_execution.score_pct}%`;
  if (iScore) iScore.textContent = `${constituency.metrics.work_vs_impact.score_pct}%`;
  if (pRing) pRing.style.setProperty('--score', constituency.metrics.promise_vs_execution.score_pct);
  if (iRing) iRing.style.setProperty('--score', constituency.metrics.work_vs_impact.score_pct);

  // Localise metric titles
  document.querySelectorAll('.metric-title').forEach(el => {
    if (el.textContent.includes('Promise vs Execution')) el.textContent = t('metrics.promiseVsExecution');
    else if (el.textContent.includes('Work vs Impact')) el.textContent = t('metrics.workVsImpact');
  });

  // Localise meta-list labels
  document.querySelectorAll('.meta-list li').forEach(li => {
    const strong = li.querySelector('strong');
    if (!strong) return;
    const txt = strong.textContent;
    if (txt.includes('Representative')) strong.textContent = `${t('constituency.representative')}:`;
    else if (txt.includes('Party')) strong.textContent = `${t('constituency.party')}:`;
    else if (txt.includes('Term')) strong.textContent = `${t('constituency.term')}:`;
    else if (txt.includes('Last data refresh')) strong.textContent = `${t('constituency.lastDataRefresh')}:`;
    else if (txt.includes('Dataset load')) strong.textContent = `${t('constituency.datasetLoad')}:`;
  });

  if (sel) {
    sel.innerHTML = enrichedConstituencies
      .map(c => `<option value="${c.id}" ${c.id === constituency.id ? 'selected' : ''}>${c.name}</option>`)
      .join('');
    sel.addEventListener('change', e => {
      window.location.href = `./constituency.html?id=${encodeURIComponent(e.target.value)}&lang=${currentLocale}`;
    });
  }

  // Promise ledger title
  document.querySelectorAll('.table-card h2, .hide-on-desktop h2').forEach(el => {
    if (el.textContent === 'Promise Ledger') el.textContent = t('constituency.promiseLedger');
  });

  // Table headers
  const ths = document.querySelectorAll('.promise-table thead th');
  if (ths[0]) ths[0].textContent = t('constituency.promiseAndIndicator');
  if (ths[1]) ths[1].textContent = t('constituency.status');
  if (ths[2]) ths[2].textContent = t('constituency.verification');
  if (ths[3]) ths[3].textContent = t('constituency.evidence');

  const tableBody = $('promiseTableBody');
  const mobileList = $('mobilePromiseList');

  if (tableBody) {
    tableBody.innerHTML = constituency.promises.map(p => `
      <tr>
        <td>
          <strong>${p.promise_text}</strong>
          <div class="footnote">${safe(p.category)} • ${safe(p.indicator_name)}</div>
          <div class="footnote">${t('evidenceDrawer.lastVerified')}: ${formatDate(p.last_verified)}</div>
        </td>
        <td>${statusHTML(p.status)}</td>
        <td>
          <div class="result-metrics">
            ${confidenceBadgeHTML(p.confidence_label, p.confidence_score)}
            ${lastVerifiedBadgeHTML(p.last_verified)}
            ${freshnessBadgeHTML(p.freshness_state, p.freshness_sla_days)}
          </div>
        </td>
        <td>
          <button class="evidence-button" type="button" data-open-evidence="${p.id}" aria-label="${t('constituency.viewEvidence')}: ${p.promise_text}">
            ${t('constituency.view')}
          </button>
        </td>
      </tr>
    `).join('');
  }

  if (mobileList) {
    mobileList.innerHTML = constituency.promises.map(p => `
      <article class="promise-card">
        <div>${statusHTML(p.status)}</div>
        <p><strong>${p.promise_text}</strong></p>
        <p class="footnote">${safe(p.indicator_name)}</p>
        <div class="result-metrics">
          ${confidenceBadgeHTML(p.confidence_label, p.confidence_score)}
          ${lastVerifiedBadgeHTML(p.last_verified)}
          ${freshnessBadgeHTML(p.freshness_state, p.freshness_sla_days)}
        </div>
        <p class="footnote">${safe(p.verification_note)}</p>
        <div class="promise-actions">
          <button class="evidence-button" type="button" data-open-evidence="${p.id}" aria-label="${t('constituency.viewEvidence')}: ${p.promise_text}">
            ${t('constituency.viewEvidence')}
          </button>
        </div>
      </article>
    `).join('');
  }

  // Disclaimer
  const disclaimer = $('constDisclaimer');
  if (disclaimer) disclaimer.textContent = t('disclaimer.neutrality');

  wireDrawer(constituency);
  wireCorrectionModal();
}

// ── 10. Evidence drawer (with focus trap) ───────────────────────────────────

function wireDrawer(constituency) {
  const drawer = document.getElementById('evidenceDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  const closeBtn = document.getElementById('closeDrawer');
  const evidenceList = document.getElementById('evidenceList');
  const drawerTitle = document.getElementById('drawerTitle');
  const drawerIndicator = document.getElementById('drawerIndicator');
  const drawerNote = document.getElementById('drawerNote');
  const drawerConfBadge = document.getElementById('drawerConfidenceBadge');
  const drawerFreshBadge = document.getElementById('drawerFreshnessBadge');
  const drawerLastVerBadge = document.getElementById('drawerLastVerifiedBadge');
  const sourceTier = document.getElementById('sourceTier');
  const editHistory = document.getElementById('editHistory');
  const correctionBtn = document.getElementById('openCorrectionModal');

  if (!drawer || !backdrop) return;

  /** Focusable elements inside the drawer, for focus trapping */
  let focusableElements = [];

  function updateFocusableList() {
    focusableElements = Array.from(drawer.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )).filter(el => el.offsetParent !== null); // only visible
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
    // Restore focus to the trigger button
    const trigger = document.querySelector(`[data-open-evidence="${drawer.dataset.lastPromiseId}"]`);
    if (trigger) trigger.focus();
  }

  function openDrawer(promise) {
    drawer.dataset.lastPromiseId = promise.id;

    const titlePrefix = t('evidenceDrawer.titlePrefix');
    drawerTitle.textContent = `${titlePrefix}: ${promise.promise_text}`;
    drawerTitle.id = 'drawerTitle';
    drawer.setAttribute('aria-labelledby', 'drawerTitle');

    if (drawerIndicator) drawerIndicator.textContent = safe(promise.indicator_name);
    if (drawerNote) drawerNote.textContent = safe(promise.verification_note);

    if (evidenceList) {
      evidenceList.innerHTML = (promise.evidence || []).map((item, idx) => `
        <li>
          <strong>${t('evidenceDrawer.sources')} ${idx + 1}:</strong>
          <a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a>
          <div class="footnote">${safe(item.publisher)} • ${formatDate(item.published_on)}</div>
          <div class="footnote">${safe(item.summary)}</div>
        </li>
      `).join('');
    }

    if (drawerConfBadge) {
      const key = (promise.confidence_label || 'low').toLowerCase();
      drawerConfBadge.className = `meta-badge confidence-${key}`;
      drawerConfBadge.textContent = confidenceLabel(promise.confidence_label, promise.confidence_score);
    }

    if (drawerFreshBadge) {
      const key = promise.freshness_state || 'stale';
      drawerFreshBadge.className = `meta-badge freshness-${key}`;
      drawerFreshBadge.textContent = freshnessLabel(promise.freshness_state, promise.freshness_sla_days);
    }

    if (drawerLastVerBadge) {
      drawerLastVerBadge.className = 'meta-badge';
      drawerLastVerBadge.textContent = lastVerifiedLabel(promise.last_verified);
    }

    if (sourceTier) {
      const lbl = document.querySelector('[data-label="sourceTier"]');
      if (lbl) lbl.textContent = `${t('evidenceDrawer.sourceTier')}:`;
      sourceTier.textContent = safe(promise.source_tier);
    }

    if (editHistory) {
      const lbl = document.querySelector('[data-label="editHistory"]');
      if (lbl) lbl.textContent = `${t('evidenceDrawer.editHistory')}:`;
      editHistory.textContent = (promise.edit_history || []).map(e => e.version).join(' → ') || '--';
    }

    // Localise drawer labels
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });

    if (correctionBtn) {
      correctionBtn.dataset.promiseId = promise.id;
      correctionBtn.dataset.promiseText = promise.promise_text;
      correctionBtn.textContent = t('evidenceDrawer.reportCorrection');
    }

    if (closeBtn) closeBtn.textContent = t('evidenceDrawer.close');

    drawer.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Focus trap — move focus to first element
    updateFocusableList();
    const first = focusableElements[0];
    if (first) first.focus();
  }

  // Open via data attribute
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-open-evidence]');
    if (!btn) return;
    const pid = btn.getAttribute('data-open-evidence');
    const promise = constituency.promises.find(p => p.id === pid);
    if (promise) openDrawer(promise);
  });

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });

  // Focus trap inside drawer
  drawer.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    updateFocusableList();
    if (!focusableElements.length) return;
    const first = focusableElements[0];
    const last  = focusableElements[focusableElements.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Respect prefers-reduced-motion
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mediaQuery.matches) {
    drawer.style.transition = 'none';
    backdrop.style.transition = 'none';
  }
  mediaQuery.addEventListener('change', mq => {
    drawer.style.transition = mq.matches ? 'none' : '';
    backdrop.style.transition = mq.matches ? 'none' : '';
  });
}

// ── 11. Correction modal ────────────────────────────────────────────────────

function wireCorrectionModal() {
  const modal = document.getElementById('correctionModal');
  const backdrop = document.getElementById('correctionModalBackdrop');
  const trigger = document.getElementById('openCorrectionModal');
  const close = document.getElementById('closeCorrectionModal');
  const cancel = document.getElementById('cancelCorrectionModal');
  const form = document.getElementById('correctionForm');
  const promiseField = document.getElementById('correctionPromiseId');

  if (!modal || !backdrop || !trigger || !form || !promiseField) return;

  function closeModal() {
    modal.classList.remove('open');
    backdrop.classList.remove('open');
    const drawerOpen = document.getElementById('evidenceDrawer')?.classList.contains('open');
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    if (trigger) trigger.focus();
  }

  function openModal() {
    promiseField.value = trigger.dataset.promiseId || '';
    modal.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Localise modal via i18n
    const title = document.getElementById('correctionModalTitle');
    if (title) title.textContent = t('correction.title');
    const helper = document.getElementById('correctionHelper');
    if (helper) helper.textContent = t('correction.helper');
    // Labels
    const labels = modal.querySelectorAll('label.form-field span:first-child');
    if (labels[0]) labels[0].textContent = t('correction.name');
    if (labels[1]) labels[1].textContent = t('correction.emailOptional');
    if (labels[2]) labels[2].textContent = t('correction.note');
    // Placeholders
    const nameInput = document.getElementById('correctionName');
    const emailInput = document.getElementById('correctionEmail');
    const noteInput = document.getElementById('correctionNote');
    if (nameInput) nameInput.placeholder = t('correction.namePlaceholder');
    if (emailInput) emailInput.placeholder = t('correction.emailPlaceholder');
    if (noteInput) noteInput.placeholder = t('correction.notePlaceholder');
    const submitBtn = modal.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = t('correction.submit');
    if (cancel) cancel.textContent = t('correction.cancel');
    if (close) close.textContent = t('correction.cancel');
    // Focus first input
    setTimeout(() => nameInput?.focus(), 100);
  }

  trigger.addEventListener('click', openModal);
  if (close) close.addEventListener('click', closeModal);
  if (cancel) cancel.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      promise_id: fd.get('promise_id'),
      name:       fd.get('name'),
      email:      fd.get('email'),
      note:       fd.get('note')
    };
    // Simulated submission — alert shows localised message
    alert(t('correction.success'));
    form.reset();
    closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

// ── 12. Language switcher ───────────────────────────────────────────────────

function wireLanguageSwitcher() {
  document.querySelectorAll('[data-lang]').forEach(el => {
    el.addEventListener('click', async e => {
      e.preventDefault();
      const lang = el.dataset.lang;
      if (lang === currentLocale || !SUPPORTED_LOCALES.includes(lang)) return;
      // Persist
      localStorage.setItem('ds-locale', lang);
      // Update URL
      const url = new URL(window.location);
      url.searchParams.set('lang', lang);
      window.location.href = url.toString();
    });
  });
}

async function detectLocale() {
  // Priority: URL param > localStorage > browser language > English
  const params = new URLSearchParams(window.location.search);
  const urlLang = params.get('lang');
  if (urlLang && SUPPORTED_LOCALES.includes(urlLang)) return urlLang;
  const stored = localStorage.getItem('ds-locale');
  if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;
  const browserLang = navigator.language?.slice(0, 2);
  if (browserLang && SUPPORTED_LOCALES.includes(browserLang)) return browserLang;
  return 'en';
}

// ── 13. Dataset loading ─────────────────────────────────────────────────────

async function loadDataset() {
  // Primary: use the .js global (synchronous, always available after script load)
  if (window.DIGITAL_SATYAGRAHA_DATA) {
    const data = window.DIGITAL_SATYAGRAHA_DATA;
    setDatasetStatus(`Loaded ${data.constituencies?.length || 0} constituencies (app-ingest v1 global)`);
    return data;
  }
  // Fallback: fetch JSON
  try {
    const resp = await fetch('./data/app-ingest.v1.json', { cache: 'no-store' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    setDatasetStatus(`Loaded ${data.constituencies?.length || 0} constituencies from app-ingest.v1.json`);
    return data;
  } catch (err) {
    console.error('Dataset load failed', err);
    setDatasetStatus('Failed to load dataset', true);
    return { schema_version: '0.0.0', last_updated: null, constituencies: [], parties: [], politicians: [] };
  }
}

// ── 14. Bootstrap ───────────────────────────────────────────────────────────

async function bootstrap() {
  // 1. Detect locale
  currentLocale = await detectLocale();
  document.documentElement.lang = LOCALE_MAP[currentLocale]?.lang || 'en';

  // 2. Load locale data
  const enData = await loadLocale('en');
  const targetData = await loadLocale(currentLocale);
  // Store English data for fallback resolution
  LOCALE_MAP.en._data = enData;
  LOCALE_MAP[currentLocale]._data = targetData;
  localeData = targetData;

  // 3. Wire language switcher pills
  wireLanguageSwitcher();

  // 4. Load dataset
  appData = await loadDataset();

  // 5. Enrich with adapted promises + metrics
  enrichedConstituencies = (appData.constituencies || []).map(enrichConstituency);

  // 6. Initialise page
  if (window.location.pathname.includes('constituency')) {
    initializeConstituency();
  } else {
    initializeHome();
  }
}

bootstrap();