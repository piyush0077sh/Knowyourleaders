'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { translate } from '@/lib/i18n';

interface ConstituencyDashboardProps {
  initialData: any[];
}

export default function ConstituencyDashboard({ initialData }: ConstituencyDashboardProps) {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'constituency' | 'politician' | 'party'>('all');

  // Filtered constituencies
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return initialData;

    return initialData.filter((c) => {
      const nameMatch = c.name?.toLowerCase().includes(q);
      const repMatch = c.representative?.toLowerCase().includes(q);
      const partyMatch = c.party?.toLowerCase().includes(q);

      if (activeTab === 'constituency') return nameMatch;
      if (activeTab === 'politician') return repMatch;
      if (activeTab === 'party') return partyMatch;
      return nameMatch || repMatch || partyMatch;
    });
  }, [initialData, searchQuery, activeTab]);

  // Featured constituency (Varanasi/Modi if available, otherwise first item)
  const featured = useMemo(() => {
    if (!initialData || initialData.length === 0) return null;
    const varanasi = initialData.find((c) => c.id === 'varanasi');
    return varanasi || initialData[0];
  }, [initialData]);

  // Helper to get initials
  const getInitials = (name: string) => {
    if (!name) return 'MP';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getPartyColorClass = (party: string) => {
    const p = party?.toUpperCase();
    if (p === 'BJP') return 'border-orange-200 bg-orange-50 text-orange-700';
    if (p === 'INC') return 'border-blue-200 bg-blue-50 text-blue-700';
    if (p === 'AITC' || p === 'TMC') return 'border-green-200 bg-green-50 text-green-700';
    if (p === 'DMK') return 'border-red-200 bg-red-50 text-red-700';
    if (p === 'SP') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    return 'border-slate-200 bg-slate-50 text-slate-700';
  };

  return (
    <div>
      {/* Search Header Wrapper */}
      <div className="search-card-wrapper">
        <div className="search-card">
          <div className="search-row">
            <div className="search-input-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder={translate('search.placeholder', language)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="search-meta-row">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                {translate('search.scope.all', language)}
              </button>
              <button
                className={`tab ${activeTab === 'constituency' ? 'active' : ''}`}
                onClick={() => setActiveTab('constituency')}
              >
                {translate('search.scope.constituency', language)}
              </button>
              <button
                className={`tab ${activeTab === 'politician' ? 'active' : ''}`}
                onClick={() => setActiveTab('politician')}
              >
                {translate('search.scope.politician', language)}
              </button>
              <button
                className={`tab ${activeTab === 'party' ? 'active' : ''}`}
                onClick={() => setActiveTab('party')}
              >
                {translate('search.scope.party', language)}
              </button>
            </div>

            <div className="status-legend">
              <div className="status-pill">
                <span className="status-dot status-done"></span>
                <span>{translate('legend.done', language)}</span>
              </div>
              <div className="status-pill">
                <span className="status-dot status-progress"></span>
                <span>{translate('legend.inProgress', language)}</span>
              </div>
              <div className="status-pill">
                <span className="status-dot status-not-started"></span>
                <span>{translate('legend.notStarted', language)}</span>
              </div>
              <div className="status-pill">
                <span className="status-dot status-misleading"></span>
                <span>{translate('legend.misleading', language)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero-grid">
        {/* Intro Panel */}
        <div className="panel hero-intro-panel">
          <div className="hero-intro-header">
            <div className="hero-badge">
              {language === 'hi' ? 'सत्यापित सार्वजनिक रिकॉर्ड' : language === 'ta' ? 'சரிபார்க்கப்பட்ட பொது பதிவுகள்' : 'Verified Public Records'}
            </div>
            <h2>{translate('home.datasetBrowserTitle', language)}</h2>
            <p className="text-slate-600 mt-3">
              {translate('home.datasetBrowserBody', language)}
            </p>
          </div>

          {/* Features Checklist */}
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">🛡️</span>
              <div className="feature-content">
                <h4>{translate('metrics.workVsImpact', language)}</h4>
                <p>
                  {language === 'hi' ? 'गुणवत्ता, निष्पादन और प्रत्यक्ष परिणामों का विश्लेषण करना।' : language === 'ta' ? 'வெளியீட்டு தரம், செயலாக்கம் மற்றும் நேரடி முடிவுகளை பகுப்பாய்வு செய்தல்.' : 'Analyzing output quality, execution, and direct outcomes.'}
                </p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <div className="feature-content">
                <h4>{translate('metrics.promiseVsExecution', language)}</h4>
                <p>
                  {language === 'hi' ? 'चुनावी प्रतिबद्धताओं के खिलाफ वितरण की ट्रैकिंग।' : language === 'ta' ? 'தேர்தல் கடமைகளுக்கு எதிரான விநியோகத்தை கண்காணித்தல்.' : 'Tracking delivery against electoral commitments.'}
                </p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚖️</span>
              <div className="feature-content">
                <h4>
                  {language === 'hi' ? 'तुलना और अन्वेषण मानचित्र' : language === 'ta' ? 'ஒப்பீடு மற்றும் வரைபட ஆய்வு' : 'Comparison & Exploration Map'}
                </h4>
                <p>
                  {language === 'hi' ? 'कार्यों को देखने के लिए भारत के मानचित्र को टॉगल करें या सांसदों की तुलना करने के लिए एक साथ चुनें।' : language === 'ta' ? 'வரைபடம் மூலம் தொகுதிகளை ஆராயுங்கள் மற்றும் எம்.பி.க்களை ஒப்பிடுங்கள்.' : 'Toggle our interactive map of India to filter work or select multiple constituencies side-by-side to review budget utilization and execution.'}
                </p>
              </div>
            </div>
          </div>

          <div className="hero-footer">
            <div className="dataset-meta-pills">
              <span className="meta-pill">{language === 'hi' ? '📊 12 लोक सभा निर्वाचन क्षेत्र' : language === 'ta' ? '📊 12 மக்களவை தொகுதிகள்' : '📊 12 Lok Sabha Constituencies'}</span>
              <span className="meta-pill">⚡ Dynamic Data Store</span>
            </div>
            <span className="text-xs text-slate-400">Version 2.0 (Next.js)</span>
          </div>
        </div>

        {/* Featured MP Profile Card */}
        {featured && (
          <div className="panel featured-widget">
            <div className="widget-header">
              <span className="widget-tag">
                {language === 'hi' ? 'विशेष' : language === 'ta' ? 'சிறப்பு' : 'Highlight'}
              </span>
              <span className="text-xs font-semibold text-amber-500 bg-amber-50 px-2 py-1 rounded">Lok Sabha 2024</span>
            </div>

            <div>
              <div className="featured-profile">
                <div className="avatar-container">
                  <div className="avatar-initials">{getInitials(featured.representative)}</div>
                  <div className="avatar-ring"></div>
                </div>
                <div className="profile-info">
                  <h3 className="constituency-title">{featured.name}</h3>
                  <p className="representative-subtitle">
                    {translate('constituency.representative', language)}: {featured.representative} ({featured.party})
                  </p>
                </div>
              </div>

              <div className="metrics-grid">
                <div className="metric-card">
                  <span className="metric-title">{translate('metrics.promiseVsExecution', language)}</span>
                  <div
                    className="ring"
                    style={{
                      background: `conic-gradient(var(--done) ${featured.metrics.promise_vs_execution.score_pct}%, var(--border) 0deg)`,
                    }}
                  >
                    <div className="avatar-initials bg-white! text-slate-800! border border-slate-100 flex items-center justify-center font-bold">
                      {featured.metrics.promise_vs_execution.score_pct}%
                    </div>
                  </div>
                </div>

                <div className="metric-card">
                  <span className="metric-title">{translate('metrics.workVsImpact', language)}</span>
                  <div
                    className="ring"
                    style={{
                      background: `conic-gradient(var(--brand) ${featured.metrics.work_vs_impact.score_pct}%, var(--border) 0deg)`,
                    }}
                  >
                    <div className="avatar-initials bg-white! text-slate-800! border border-slate-100 flex items-center justify-center font-bold">
                      {featured.metrics.work_vs_impact.score_pct}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="widget-footer text-xs">
              <span className="freshness-label">{translate('home.freshnessMix', language)}</span>
              <span className="freshness-mix-value text-slate-800">
                {featured.promises?.[0]?.last_verified || 'July 2026'}
              </span>
            </div>
            
            <div className="mt-4">
              <Link href={`/constituency/${featured.id}`} className="primary-button w-full text-center">
                {translate('constituency.viewEvidence', language)} →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Dataset Grid Results */}
      <div className="results-panel">
        <div className="results-header">
          <h3>
            {searchQuery
              ? translate('search.resultsFor', language, { query: searchQuery })
              : translate('search.defaultResultsTitle', language)}
          </h3>
          <span className="count-chip">{filteredData.length} {language === 'hi' ? 'रिकॉर्ड' : language === 'ta' ? 'பதிவுகள்' : 'records'}</span>
        </div>

        {filteredData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h2>{language === 'hi' ? 'कोई निर्वाचन क्षेत्र नहीं मिला' : language === 'ta' ? 'தொகுதிகள் கிடைக்கவில்லை' : 'No Constituencies Found'}</h2>
            <p>We couldn't find any records matching "{searchQuery}". Check the spelling or clear search filters to start over.</p>
            <button className="primary-button" onClick={() => { setSearchQuery(''); setActiveTab('all'); }}>
              {language === 'hi' ? 'फ़िल्टर रीसेट करें' : language === 'ta' ? 'வடிகட்டிகளை மீட்டமைக்கவும்' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="results-grid">
            {filteredData.map((c) => (
              <div key={c.id} className="result-card animate-fade-in-up">
                <div className={`party-accent ${c.party?.toLowerCase() || 'default'}`}></div>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getPartyColorClass(c.party)}`}>
                      {c.party}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{c.state}</span>
                  </div>
                  <h4>{c.name}</h4>
                  <p className="representative-subtitle mb-4">{c.representative}</p>

                  <div className="space-y-3 mt-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                        <span>{translate('metrics.promiseVsExecution', language)}</span>
                        <span>{c.metrics.promise_vs_execution.score_pct}%</span>
                      </div>
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${c.metrics.promise_vs_execution.score_pct}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                        <span>{translate('metrics.workVsImpact', language)}</span>
                        <span>{c.metrics.work_vs_impact.score_pct}%</span>
                      </div>
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill impact"
                          style={{ width: `${c.metrics.work_vs_impact.score_pct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Link href={`/constituency/${c.id}`} className="primary-button w-full text-center">
                    {translate('constituency.viewEvidence', language)}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
