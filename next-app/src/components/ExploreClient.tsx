'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { translate } from '@/lib/i18n';
import IndiaMap from '@/components/IndiaMap';

/* ── Types ─────────────────────────────────────────────────── */

type ColorMode = 'execution' | 'budget' | 'density';

interface ExploreClientProps {
  constituencies: any[];
}

/* ── Helper: derive MPLAD budget from execution score ──────── */
const deriveBudget = (execScore: number) => {
  const total = 25.0; // ₹25 Crore per 5-year term
  const rate = Math.min(0.95, (execScore / 100) * 1.15);
  const spent = Math.round(total * rate * 10) / 10;
  return { total, spent, remaining: Math.round((total - spent) * 10) / 10, pct: Math.round(rate * 100) };
};

/* ── Component ─────────────────────────────────────────────── */

export default function ExploreClient({ constituencies }: ExploreClientProps) {
  const { language } = useLanguage();
  const [colorMode, setColorMode] = useState<ColorMode>('execution');
  const [selectedState, setSelectedState] = useState<string | null>(null);

  /* ── Derived: group by state ─────────────────────────────── */
  const stateGroups = useMemo(() => {
    const map: Record<string, any[]> = {};
    constituencies.forEach((c) => {
      if (!map[c.state]) map[c.state] = [];
      map[c.state].push(c);
    });
    return map;
  }, [constituencies]);

  /* ── State panel data ────────────────────────────────────── */
  const selectedStateData = useMemo(() => {
    if (!selectedState || !stateGroups[selectedState]) return null;
    const items = stateGroups[selectedState];
    const avgExec = Math.round(items.reduce((a: number, c: any) => a + c.metrics.promise_vs_execution.score_pct, 0) / items.length);
    const avgImpact = Math.round(items.reduce((a: number, c: any) => a + c.metrics.work_vs_impact.score_pct, 0) / items.length);
    const totalPromises = items.reduce((a: number, c: any) => a + (c.promises?.length || 0), 0);
    const totalBudgetSpent = items.reduce((a: number, c: any) => a + deriveBudget(c.metrics.promise_vs_execution.score_pct).spent, 0);
    const totalBudget = items.length * 25.0;
    return { items, avgExec, avgImpact, totalPromises, totalBudgetSpent: Math.round(totalBudgetSpent * 10) / 10, totalBudget };
  }, [selectedState, stateGroups]);

  /* ── Map interaction ─────────────────────────────────────── */
  const handleStateSelect = (stateName: string) => {
    setSelectedState((prev) => (prev === stateName ? null : stateName));
  };

  /* ── Mode label helper ───────────────────────────────────── */
  const modeLabels: Record<ColorMode, { en: string; hi: string; ta: string; icon: string }> = {
    execution: { en: 'Promise Delivery', hi: 'वादा पूर्ति दर', ta: 'வாக்குறுதி நிறைவேற்றம்', icon: '📊' },
    budget: { en: 'Budget Utilization', hi: 'बजट उपयोग', ta: 'பட்ஜெட் பயன்பாடு', icon: '💰' },
    density: { en: 'Tracked Seats', hi: 'ट्रैक की गई सीटें', ta: 'கண்காணிக்கப்பட்ட இடங்கள்', icon: '🗳️' },
  };

  const getLabel = (mode: ColorMode) => {
    const m = modeLabels[mode];
    return language === 'hi' ? m.hi : language === 'ta' ? m.ta : m.en;
  };

  /* ── Legend items based on mode ──────────────────────────── */
  const legendItems = useMemo(() => {
    if (colorMode === 'density') {
      return [
        { color: 'var(--brand)', label: language === 'hi' ? '3+ सीटें' : language === 'ta' ? '3+ இடங்கள்' : '3+ Seats', desc: 'Heavily tracked region' },
        { color: '#60a5fa', label: language === 'hi' ? '2 सीटें' : language === 'ta' ? '2 இடங்கள்' : '2 Seats', desc: 'Moderate coverage' },
        { color: '#93c5fd', label: language === 'hi' ? '1 सीट' : language === 'ta' ? '1 இடம்' : '1 Seat', desc: 'Single constituency tracked' },
        { color: 'var(--map-none)', label: language === 'hi' ? 'कोई डेटा नहीं' : language === 'ta' ? 'தரவு இல்லை' : 'No Data', desc: 'Pending ingestion' },
      ];
    }
    return [
      { color: 'var(--map-high)', label: language === 'hi' ? 'उच्च (≥65%)' : language === 'ta' ? 'உயர் (≥65%)' : 'High (≥ 65%)', desc: colorMode === 'budget' ? 'Strong budget utilization' : 'Majority of promises delivered' },
      { color: 'var(--map-medium)', label: language === 'hi' ? 'मध्यम (50-64%)' : language === 'ta' ? 'நடுத்தர (50-64%)' : 'Medium (50–64%)', desc: colorMode === 'budget' ? 'Moderate spending progress' : 'Active implementation under way' },
      { color: 'var(--map-low)', label: language === 'hi' ? 'निम्न (<50%)' : language === 'ta' ? 'குறைந்த (<50%)' : 'Low (< 50%)', desc: colorMode === 'budget' ? 'Under-utilized allocation' : 'Delays or misleading records' },
      { color: 'var(--map-none)', label: language === 'hi' ? 'कोई डेटा नहीं' : language === 'ta' ? 'தரவு இல்லை' : 'Untracked', desc: 'Pending data ingestion' },
    ];
  }, [colorMode, language]);

  return (
    <div className="container mx-auto py-8">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
          {language === 'hi' ? 'भारत मानचित्र अन्वेषक' : language === 'ta' ? 'இந்தியா வரைபட ஆய்வு' : 'India Map Explorer'}
        </h2>
        <p style={{ color: 'var(--muted)' }} className="mt-2 text-sm leading-relaxed max-w-2xl">
          {language === 'hi'
            ? 'भारत के मानचित्र पर राज्यों पर होवर करें या क्लिक करें। प्रतिनिधि प्रदर्शन, बजट उपयोग और ट्रैक की गई सीटों के बीच टॉगल करें।'
            : language === 'ta'
              ? 'இந்திய வரைபடத்தில் மாநிலங்களை சுட்டிக்காட்டவும் அல்லது கிளிக் செய்யவும். வாக்குறுதி, பட்ஜெட் மற்றும் தொகுதிகளுக்கு இடையே மாறவும்.'
              : 'Hover or click on any state to view detailed analytics. Toggle between promise delivery, budget utilization, and seat coverage modes.'}
        </p>
      </div>

      {/* ── Metric Mode Selector Tabs ────────────────────────── */}
      <div className="tabs mb-6" style={{ display: 'inline-flex', gap: '0.25rem' }}>
        {(['execution', 'budget', 'density'] as ColorMode[]).map((mode) => (
          <button
            key={mode}
            className={`tab ${colorMode === mode ? 'active' : ''}`}
            onClick={() => setColorMode(mode)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <span>{modeLabels[mode].icon}</span>
            {getLabel(mode)}
          </button>
        ))}
      </div>

      {/* ── Main Grid: Map + Sidebar ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Map Panel */}
        <div className="lg:col-span-7">
          <IndiaMap
            constituencyData={constituencies}
            colorMode={colorMode}
            onStateSelect={handleStateSelect}
            selectedState={selectedState}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-5 space-y-5">
          {/* Legend Card */}
          <div className="panel bg-white border rounded-2xl shadow-sm p-5" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)', letterSpacing: '0.06em' }}>
              {getLabel(colorMode)} — {language === 'hi' ? 'मानचित्र कुंजी' : language === 'ta' ? 'வரைபட விளக்கம்' : 'Map Key'}
            </h3>
            <div className="space-y-3">
              {legendItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span
                    className="w-5 h-5 rounded-md border flex-shrink-0"
                    style={{ background: item.color, borderColor: 'var(--border)' }}
                  />
                  <div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{item.label}</div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* State Performance Panel (shown when a state is clicked) */}
          {selectedStateData ? (
            <div className="panel bg-white border rounded-2xl shadow-sm overflow-hidden animate-fade-in-up" style={{ borderColor: 'var(--border)' }}>
              {/* State header */}
              <div className="p-5 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-hover)' }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{selectedState}</h3>
                  <button
                    onClick={() => setSelectedState(null)}
                    className="text-xs font-bold px-2 py-1 rounded-md transition"
                    style={{ color: 'var(--muted)', background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  {selectedStateData.items.length} {language === 'hi' ? 'ट्रैक किए गए निर्वाचन क्षेत्र' : language === 'ta' ? 'கண்காணிக்கப்பட்ட தொகுதிகள்' : 'tracked constituencies'} · {selectedStateData.totalPromises} {language === 'hi' ? 'वादे' : language === 'ta' ? 'வாக்குறுதிகள்' : 'promises'}
                </p>
              </div>

              {/* Aggregate stats */}
              <div className="grid grid-cols-2 gap-3 p-5">
                <div className="rounded-xl p-3 text-center" style={{ background: 'var(--done-bg)', border: '1px solid var(--done-border)' }}>
                  <div className="text-2xl font-extrabold" style={{ color: 'var(--done)' }}>{selectedStateData.avgExec}%</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: 'var(--muted)' }}>
                    {translate('metrics.promiseVsExecution', language)}
                  </div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(53, 81, 219, 0.06)', border: '1px solid rgba(53, 81, 219, 0.15)' }}>
                  <div className="text-2xl font-extrabold" style={{ color: 'var(--brand)' }}>{selectedStateData.avgImpact}%</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: 'var(--muted)' }}>
                    {translate('metrics.workVsImpact', language)}
                  </div>
                </div>
              </div>

              {/* Budget bar */}
              <div className="px-5 pb-3">
                <div className="flex justify-between text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  <span>{language === 'hi' ? 'MPLAD बजट उपयोग' : language === 'ta' ? 'MPLAD பட்ஜெட்' : 'MPLAD Budget Utilization'}</span>
                  <span>₹{selectedStateData.totalBudgetSpent} / ₹{selectedStateData.totalBudget} Cr</span>
                </div>
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill impact"
                    style={{ width: `${Math.round((selectedStateData.totalBudgetSpent / selectedStateData.totalBudget) * 100)}%` }}
                  />
                </div>
              </div>

              {/* MP list */}
              <div className="px-5 pb-5 space-y-2 max-h-[300px] overflow-y-auto">
                {selectedStateData.items.map((c: any) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-xl transition"
                    style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate" style={{ color: 'var(--text)' }}>{c.name}</div>
                      <div className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                        {c.representative} <span className="font-semibold">({c.party})</span>
                      </div>
                      {/* Mini progress bar */}
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="progress-bar-track flex-1" style={{ height: '4px' }}>
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${c.metrics.promise_vs_execution.score_pct}%`, height: '4px' }}
                          />
                        </div>
                        <span className="text-[10px] font-bold" style={{ color: 'var(--done)' }}>
                          {c.metrics.promise_vs_execution.score_pct}%
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/constituency/${c.id}`}
                      className="ml-3 text-xs font-bold px-3 py-1.5 rounded-lg no-underline transition flex-shrink-0"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                    >
                      {translate('constituency.viewEvidence', language)}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Default: Tracked Regions list */
            <div className="panel bg-white border rounded-2xl shadow-sm p-5 max-h-[420px] overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)', letterSpacing: '0.06em' }}>
                {language === 'hi' ? 'ट्रैक किए गए क्षेत्र' : language === 'ta' ? 'கண்காணிக்கப்பட்ட பகுதிகள்' : 'Tracked Regions'} ({constituencies.length})
              </h3>
              <div className="space-y-3">
                {Object.entries(stateGroups).map(([state, items]: [string, any]) => (
                  <div
                    key={state}
                    className="rounded-xl p-3 cursor-pointer transition"
                    style={{ background: selectedState === state ? 'var(--brand-glow)' : 'var(--surface-hover)', border: '1px solid var(--border)' }}
                    onClick={() => handleStateSelect(state)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--brand)' }}>{state}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--brand-glow)', color: 'var(--brand)' }}>
                        {items.length} {items.length === 1 ? 'seat' : 'seats'}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {items.map((c: any) => (
                        <div key={c.id} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {c.name} — <span className="font-semibold">{c.representative}</span> ({c.party})
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
