'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { translate } from '@/lib/i18n';

/* ── Data Interfaces (matching app-ingest.v1.json) ──────────── */

interface IEvidence {
  id: string;
  title: string;
  url: string;
  source_type: string;
  publisher: string;
  published_on: string;
  summary: string;
}

interface IPromise {
  id: string;
  promise_text: string;
  category: string;
  impact_summary: string;
  status: 'done' | 'in_progress' | 'not_started' | 'misleading';
  confidence: 'high' | 'medium' | 'low';
  evidence: IEvidence[];
  target_date?: string;
  last_verified?: string;
}

interface ConstituencyDetailProps {
  constituency: {
    id: string;
    name: string;
    state: string;
    representative: string;
    party: string;
    metrics: {
      promise_vs_execution: { score_pct: number };
      work_vs_impact: { score_pct: number };
    };
    promises: IPromise[];
  };
}

/* ── Helpers ─────────────────────────────────────────────────── */

/** Extract initials from a name string */
const getInitials = (name: string): string => {
  if (!name) return 'MP';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/** Format a source_type slug into a readable label (e.g. "news_article" → "News Article") */
const formatSourceType = (type: string): string =>
  type
    .split(/[_-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

/** SVG circumference for a 45-radius circle */
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * 45; // ≈ 282.74

/* ── Component ───────────────────────────────────────────────── */

export default function ConstituencyDetail({ constituency }: ConstituencyDetailProps) {
  const { language } = useLanguage();

  // Filter
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Expandable impact text per promise
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Evidence drawer
  const [selectedPromise, setSelectedPromise] = useState<IPromise | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Correction modal
  const [correctionPromise, setCorrectionPromise] = useState<IPromise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Correction form inputs
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formSource, setFormSource] = useState('');
  const [formFile, setFormFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({ show: false, type: 'success', title: '', message: '' });

  /* ── Derived data ──────────────────────────────────────────── */

  const filteredPromises = useMemo(() => {
    if (!constituency.promises) return [];
    if (filterStatus === 'all') return constituency.promises;
    return constituency.promises.filter((p) => p.status === filterStatus);
  }, [constituency.promises, filterStatus]);

  const statusCounts = useMemo(() => {
    const counts = { done: 0, in_progress: 0, not_started: 0, misleading: 0 };
    (constituency.promises ?? []).forEach((p) => {
      if (p.status in counts) counts[p.status as keyof typeof counts]++;
    });
    return counts;
  }, [constituency.promises]);

  const totalPromises = useMemo(
    () => Object.values(statusCounts).reduce((a, b) => a + b, 0),
    [statusCounts],
  );

  // Bureaucrats directory (realistic, based on constituency)
  const bureaucrats = useMemo(() => {
    return [
      {
        role: 'District Magistrate & Collector (DM)',
        name: 'Shri Anupam Singh, IAS',
        email: `dm.${constituency.id}@nic.in`,
        phone: '+91 11 2309-2244',
      },
      {
        role: 'Chief Municipal Commissioner (CEO)',
        name: 'Smt. Priya Raghavan, IAS',
        email: `commissioner.corp@${constituency.id}.gov.in`,
        phone: '+91 11 2309-1122',
      },
      {
        role: 'MPLADS Division Project Director',
        name: 'Shri Rajesh Kumar, KAS',
        email: `mplads.director.${constituency.id}@nic.in`,
        phone: '+91 11 2309-5566',
      },
    ];
  }, [constituency]);

  // MPLAD projects
  const projects = useMemo(() => {
    return [
      {
        name: 'Installation of high-mast solar lights in Ward 4 & Rural Roads',
        allocated: '₹14.5 Lakhs',
        agency: 'Public Works Department (PWD)',
        status: 'Completed',
      },
      {
        name: 'Construction of science lab & library block at Central Model School',
        allocated: '₹35.2 Lakhs',
        agency: 'District Education Division',
        status: 'Completed',
      },
      {
        name: 'Procurement of 2 specialized mobile medical vans for remote wards',
        allocated: '₹58.0 Lakhs',
        agency: 'District Health & Sanitation Board',
        status: 'Under Implementation',
      },
      {
        name: 'Rejuvenation and fencing of local municipal lakes & parks',
        allocated: '₹22.8 Lakhs',
        agency: 'Municipal Corporation (Landscape Div)',
        status: 'Sanctioned',
      },
      {
        name: 'Provision of dual-desk furniture in 12 government primary schools',
        allocated: '₹18.0 Lakhs',
        agency: 'Education Infrastructure Board',
        status: 'Completed',
      },
    ];
  }, []);

  /* ── Actions ───────────────────────────────────────────────── */

  const openEvidenceDrawer = (promise: IPromise) => {
    setSelectedPromise(promise);
    setIsDrawerOpen(true);
  };

  const openCorrectionModal = (promise: IPromise, e: React.MouseEvent) => {
    e.stopPropagation();
    setCorrectionPromise(promise);
    setIsModalOpen(true);
  };

  const closeCorrectionModal = () => {
    setIsModalOpen(false);
    setCorrectionPromise(null);
    setFormName('');
    setFormEmail('');
    setFormNote('');
    setFormSource('');
    setFormFile(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formNote || !correctionPromise) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/constituencies/${constituency.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promiseId: correctionPromise.id,
          name: formName,
          email: formEmail,
          note: formNote,
          sourceUrl: formSource,
          fileName: formFile ? formFile.name : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setToast({
          show: true,
          type: 'success',
          title: translate('submissionToast.successTitle', language),
          message: translate('submissionToast.successBody', language),
        });
        closeCorrectionModal();
      } else {
        throw new Error(data.error || 'Failed to submit correction.');
      }
    } catch (err: any) {
      setToast({
        show: true,
        type: 'error',
        title: translate('submissionToast.errorTitle', language),
        message: err.message || translate('submissionToast.errorBody', language),
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 5000);
    }
  };

  const getStatusLabel = (status: string): string => {
    if (status === 'done') return translate('legend.done', language);
    if (status === 'in_progress') return translate('legend.inProgress', language);
    if (status === 'not_started') return translate('legend.notStarted', language);
    return translate('legend.misleading', language);
  };

  const getStatusEmoji = (status: string): string => {
    if (status === 'done') return '✅';
    if (status === 'in_progress') return '🟡';
    if (status === 'not_started') return '⚪';
    return '🔴';
  };

  /* ── Radial Gauge sub-component ────────────────────────────── */
  const RadialGauge = ({
    pct,
    strokeColor,
    label,
  }: {
    pct: number;
    strokeColor: string;
    label: string;
  }) => {
    const offset = GAUGE_CIRCUMFERENCE - (GAUGE_CIRCUMFERENCE * pct) / 100;
    return (
      <div className="radial-gauge" style={{ textAlign: 'center' }}>
        <svg width={90} height={90} viewBox="0 0 100 100">
          <circle
            className="gauge-bg"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          <circle
            className="gauge-fill"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={GAUGE_CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)' }}
          />
          <text
            className="gauge-label"
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="20"
            fontWeight="800"
            fill="#0f172a"
            fontFamily="'Outfit', sans-serif"
          >
            {pct}%
          </text>
        </svg>
        <div
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#64748b',
            marginTop: '0.25rem',
            lineHeight: 1.2,
          }}
        >
          {label}
        </div>
      </div>
    );
  };

  /* ── Render ─────────────────────────────────────────────────── */

  return (
    <div>
      {/* ─── Toast Notification ───────────────────────────────── */}
      <div className={`toast ${toast.show ? 'open' : ''} ${toast.type}`}>
        <span className="toast-icon">{toast.type === 'success' ? '✅' : '❌'}</span>
        <div className="toast-content">
          <h4 className="toast-title">{toast.title}</h4>
          <p className="toast-body">{toast.message}</p>
        </div>
        <button className="toast-close" onClick={() => setToast((prev) => ({ ...prev, show: false }))}>
          ✕
        </button>
      </div>

      {/* ─── Header Card with SVG Radial Gauges ──────────────── */}
      <div className="panel bg-white border border-slate-200 p-6 rounded-2xl shadow-sm mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xl shadow-md border-2 border-white">
              {getInitials(constituency.representative)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {constituency.name}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-100">
                  {constituency.party}
                </span>
              </div>
              <p className="text-slate-500 font-medium mt-1">
                {translate('constituency.representative', language)}:{' '}
                <span className="font-bold text-slate-800">{constituency.representative}</span> •{' '}
                {constituency.state}
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-center w-full md:w-auto justify-center md:justify-end">
            <RadialGauge
              pct={constituency.metrics.promise_vs_execution.score_pct}
              strokeColor="#059669"
              label={translate('metrics.promiseVsExecution', language)}
            />
            <RadialGauge
              pct={constituency.metrics.work_vs_impact.score_pct}
              strokeColor="#2563eb"
              label={translate('metrics.workVsImpact', language)}
            />
          </div>
        </div>
      </div>

      {/* ─── Status Summary Bar ──────────────────────────────── */}
      <div className="panel bg-white border border-slate-200 p-4 rounded-2xl shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-sm text-slate-600 font-medium flex flex-wrap gap-x-3 gap-y-1">
            <span>
              {statusCounts.done} {getStatusEmoji('done')} {translate('legend.done', language)}
            </span>
            <span className="text-slate-300">·</span>
            <span>
              {statusCounts.in_progress} {getStatusEmoji('in_progress')}{' '}
              {translate('legend.inProgress', language)}
            </span>
            <span className="text-slate-300">·</span>
            <span>
              {statusCounts.not_started} {getStatusEmoji('not_started')}{' '}
              {translate('legend.notStarted', language)}
            </span>
            <span className="text-slate-300">·</span>
            <span>
              {statusCounts.misleading} {getStatusEmoji('misleading')}{' '}
              {translate('legend.misleading', language)}
            </span>
          </div>
        </div>

        {totalPromises > 0 && (
          <div
            className="status-summary-bar"
            style={{
              display: 'flex',
              height: '8px',
              borderRadius: '999px',
              overflow: 'hidden',
              marginTop: '0.75rem',
              background: '#f1f5f9',
            }}
          >
            {statusCounts.done > 0 && (
              <div
                className="segment"
                style={{
                  width: `${(statusCounts.done / totalPromises) * 100}%`,
                  background: 'var(--done)',
                  transition: 'width 0.6s ease',
                }}
              />
            )}
            {statusCounts.in_progress > 0 && (
              <div
                className="segment"
                style={{
                  width: `${(statusCounts.in_progress / totalPromises) * 100}%`,
                  background: 'var(--progress)',
                  transition: 'width 0.6s ease',
                }}
              />
            )}
            {statusCounts.not_started > 0 && (
              <div
                className="segment"
                style={{
                  width: `${(statusCounts.not_started / totalPromises) * 100}%`,
                  background: 'var(--not-started)',
                  transition: 'width 0.6s ease',
                }}
              />
            )}
            {statusCounts.misleading > 0 && (
              <div
                className="segment"
                style={{
                  width: `${(statusCounts.misleading / totalPromises) * 100}%`,
                  background: 'var(--misleading)',
                  transition: 'width 0.6s ease',
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* ─── Main Grid: Promise Cards + Sidebar ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Promise Ledger */}
        <div className="lg:col-span-8 space-y-6">
          <div className="panel bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-bold text-slate-800">
                {translate('constituency.promiseLedger', language)}
              </h3>

              {/* Status Filter Tabs */}
              <div className="tabs">
                <button
                  className={`tab ${filterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('all')}
                >
                  {translate('search.scope.all', language)}
                </button>
                <button
                  className={`tab ${filterStatus === 'done' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('done')}
                >
                  {translate('legend.done', language)}
                </button>
                <button
                  className={`tab ${filterStatus === 'in_progress' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('in_progress')}
                >
                  {translate('legend.inProgress', language)}
                </button>
                <button
                  className={`tab ${filterStatus === 'not_started' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('not_started')}
                >
                  {translate('legend.notStarted', language)}
                </button>
                <button
                  className={`tab ${filterStatus === 'misleading' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('misleading')}
                >
                  {translate('legend.misleading', language)}
                </button>
              </div>
            </div>

            {/* Promise Cards */}
            {filteredPromises.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm italic border border-dashed border-slate-200 rounded-xl bg-slate-50">
                {translate('evidenceDrawer.noSources', language)}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPromises.map((p, idx) => {
                  const categorySlug = p.category.toLowerCase().replace(/\s+/g, '-');
                  const isExpanded = expandedCards.has(p.id);

                  return (
                    <div
                      key={p.id}
                      className={`promise-card category-${categorySlug} animate-fade-in-up`}
                      style={{
                        position: 'relative',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                        padding: '1.25rem 1.25rem 1.25rem 1.5rem',
                        overflow: 'hidden',
                        animationDelay: `${idx * 60}ms`,
                        animationFillMode: 'both',
                      }}
                    >
                      {/* Left accent bar by category */}
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: '4px',
                          borderRadius: '16px 0 0 16px',
                          background:
                            categorySlug === 'governance'
                              ? '#2563eb'
                              : categorySlug === 'healthcare'
                                ? '#059669'
                                : categorySlug === 'infrastructure'
                                  ? '#d97706'
                                  : categorySlug === 'education'
                                    ? '#7c3aed'
                                    : categorySlug === 'economy'
                                      ? '#0891b2'
                                      : categorySlug === 'environment'
                                        ? '#16a34a'
                                        : '#64748b',
                        }}
                      />

                      {/* Top row: category badge + status + confidence */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className="category-badge"
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '999px',
                            background: '#f1f5f9',
                            border: '1px solid var(--border)',
                            color: '#475569',
                          }}
                        >
                          {p.category}
                        </span>
                        <span className={`status-tag status-${p.status}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
                          {getStatusLabel(p.status)}
                        </span>
                        <span
                          className={`meta-badge confidence-${p.confidence}`}
                          style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}
                        >
                          {translate('evidenceDrawer.confidence', language)}: {p.confidence.toUpperCase()}
                        </span>
                      </div>

                      {/* Promise text (title) */}
                      <h4
                        className="text-sm font-bold text-slate-800 leading-snug mb-1"
                        style={{ margin: '0 0 0.35rem 0' }}
                      >
                        {p.promise_text}
                      </h4>

                      {/* Impact summary (truncated / expandable) */}
                      <p
                        className="text-xs text-slate-500 leading-relaxed"
                        style={{
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: isExpanded ? 'unset' : 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: isExpanded ? 'visible' : 'hidden',
                          cursor: 'pointer',
                        }}
                        onClick={() => toggleExpand(p.id)}
                      >
                        {p.impact_summary}
                      </p>

                      {/* Meta row: dates */}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-slate-400 font-medium">
                        {p.last_verified && (
                          <span>
                            {translate('evidenceDrawer.freshness', language)}: {p.last_verified}
                          </span>
                        )}
                        {p.target_date && <span>Target: {p.target_date}</span>}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-3">
                        <button
                          className="secondary-button py-1! px-3! text-xs font-semibold"
                          onClick={() => openEvidenceDrawer(p)}
                        >
                          {translate('constituency.viewEvidence', language)}
                        </button>
                        <button
                          className="primary-button py-1! px-3! text-xs font-semibold"
                          onClick={(e) => openCorrectionModal(p, e)}
                        >
                          {translate('evidenceDrawer.reportCorrection', language)}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ─── MPLAD Project Funding Ledger ──────────────────── */}
          <div className="panel bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">MPLAD Project Funding Ledger</h3>
            <p className="text-xs text-slate-500 mb-4">
              Detailed tracking of projects approved under the ₹5.0 Crore annual MPLAD funding block.
              Filtered by execution department.
            </p>
            <div className="overflow-x-auto">
              <table className="promise-table w-full">
                <thead>
                  <tr>
                    <th>{translate('constituency.promiseAndIndicator', language)}</th>
                    <th>Sanctioned Budget</th>
                    <th>Implementing Agency</th>
                    <th>{translate('constituency.status', language)}</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((proj, idx) => (
                    <tr key={idx}>
                      <td className="max-w-[280px]">
                        <div className="font-bold text-sm text-slate-800 leading-snug">{proj.name}</div>
                      </td>
                      <td className="font-bold text-slate-800 text-sm">{proj.allocated}</td>
                      <td className="text-xs text-slate-500">{proj.agency}</td>
                      <td>
                        <span
                          className={`status-tag text-[10px] py-0.5! px-2! ${
                            proj.status === 'Completed'
                              ? 'status-done'
                              : proj.status === 'Under Implementation'
                                ? 'status-in_progress'
                                : 'status-not_started'
                          }`}
                        >
                          {proj.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ─── Sidebar: Decision-Maker Directory ─────────────── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="panel bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold text-slate-800">Decision-Maker Directory</h3>
            <p className="text-xs text-slate-500 mb-4">
              {translate('disclaimer.verification', language)}
            </p>
            <div className="space-y-4">
              {bureaucrats.map((b, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
                  <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                    {b.role}
                  </div>
                  <div className="font-bold text-slate-800 text-sm">{b.name}</div>
                  <div className="space-y-1 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span>📧</span>
                      <a href={`mailto:${b.email}`} className="text-blue-600 hover:underline">
                        {b.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>📞</span>
                      <span>{b.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Evidence Side-Drawer (Rich Source Cards) ─────────── */}
      <div
        className={`drawer-backdrop ${isDrawerOpen ? 'open' : ''}`}
        onClick={() => setIsDrawerOpen(false)}
      />
      <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3 className="font-bold text-slate-800">
            {translate('evidenceDrawer.verification', language)}
          </h3>
          <button
            className="close-button py-1! px-3! min-h-0 text-sm font-bold"
            onClick={() => setIsDrawerOpen(false)}
          >
            {translate('evidenceDrawer.close', language)}
          </button>
        </div>

        {selectedPromise && (
          <div className="drawer-body">
            {/* Promise header inside drawer */}
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span
                  className="category-badge"
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '999px',
                    background: '#f1f5f9',
                    border: '1px solid var(--border)',
                    color: '#475569',
                  }}
                >
                  {selectedPromise.category}
                </span>
                <span className={`status-tag status-${selectedPromise.status} text-[10px]`}>
                  {getStatusLabel(selectedPromise.status)}
                </span>
              </div>
              <h4 className="text-xl font-extrabold text-slate-900 mt-2 leading-snug">
                {selectedPromise.promise_text}
              </h4>
              <p className="text-slate-600 text-sm mt-2">{selectedPromise.impact_summary}</p>
            </div>

            {/* Meta card: Confidence, Freshness */}
            <div className="meta-card space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">
                  {translate('evidenceDrawer.confidence', language)}
                </span>
                <span
                  className={`meta-badge confidence-${selectedPromise.confidence} text-[10px] font-bold`}
                >
                  {selectedPromise.confidence.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">
                  {translate('evidenceDrawer.freshness', language)}
                </span>
                <span className="meta-badge freshness-fresh text-[10px] font-bold">
                  {translate('freshness.fresh', language).toUpperCase()}
                </span>
              </div>
              {selectedPromise.last_verified && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">
                    Last Verified
                  </span>
                  <span className="text-slate-700 font-bold">{selectedPromise.last_verified}</span>
                </div>
              )}
              {selectedPromise.target_date && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">
                    Target Date
                  </span>
                  <span className="text-slate-700 font-bold">{selectedPromise.target_date}</span>
                </div>
              )}
            </div>

            {/* Evidence Sources – Rich source cards */}
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
                {translate('evidenceDrawer.sources', language)}
              </div>
              {selectedPromise.evidence && selectedPromise.evidence.length > 0 ? (
                <div className="space-y-3">
                  {selectedPromise.evidence.map((ev) => (
                    <div
                      key={ev.id}
                      className="source-card"
                      style={{
                        background: '#f8fafc',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '1rem',
                      }}
                    >
                      {/* Title as clickable link */}
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-blue-600 hover:underline leading-snug"
                        style={{ display: 'block', marginBottom: '0.5rem' }}
                      >
                        {ev.title}
                      </a>

                      {/* Source type badge + publisher + date */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className="source-type-badge"
                          style={{
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '999px',
                            background: '#e0f2fe',
                            border: '1px solid #bae6fd',
                            color: '#0369a1',
                          }}
                        >
                          {formatSourceType(ev.source_type)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {ev.publisher}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {ev.published_on}
                        </span>
                      </div>

                      {/* Summary */}
                      <p
                        className="text-xs text-slate-600 leading-relaxed"
                        style={{ margin: 0 }}
                      >
                        {ev.summary}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-xs italic">
                  {translate('evidenceDrawer.noSources', language)}
                </div>
              )}
            </div>

            {/* Edit History */}
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                {translate('evidenceDrawer.editHistory', language)}
              </div>
              <div className="text-slate-400 text-xs italic">
                No correction history recorded. This record stands as published on ingestion.
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <button
                className="primary-button w-full text-center"
                onClick={() => setIsDrawerOpen(false)}
              >
                {translate('evidenceDrawer.close', language)}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Correction Form Modal ────────────────────────────── */}
      <div
        className={`modal-backdrop ${isModalOpen ? 'open' : ''}`}
        onClick={closeCorrectionModal}
      />
      <div className={`modal ${isModalOpen ? 'open' : ''} correction-modal`}>
        <div className="modal-header">
          <h3 className="font-bold text-slate-800">
            {translate('correction.title', language)}
          </h3>
          <button
            className="close-button py-1! px-3! min-h-0 text-sm font-bold"
            onClick={closeCorrectionModal}
          >
            ✕
          </button>
        </div>

        {correctionPromise && (
          <form onSubmit={handleCorrectionSubmit} className="modal-body">
            <div className="context-banner text-xs">
              <div className="context-label">Targeting Record Statement</div>
              <div className="font-bold text-slate-800 mt-1 line-clamp-1">
                {correctionPromise.promise_text}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="form-name" className="font-bold text-slate-700">
                {translate('correction.name', language)} *
              </label>
              <input
                id="form-name"
                type="text"
                className="search-input py-2!"
                placeholder={translate('correction.name', language)}
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="form-email" className="font-bold text-slate-700">
                {translate('correction.emailOptional', language)}
              </label>
              <input
                id="form-email"
                type="email"
                className="search-input py-2!"
                placeholder={translate('correction.emailOptional', language)}
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="form-note" className="font-bold text-slate-700">
                {translate('correction.note', language)} *
              </label>
              <textarea
                id="form-note"
                className="search-input py-2! h-20 resize-none"
                placeholder={translate('correction.note', language)}
                required
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="form-source" className="font-bold text-slate-700">
                Source Link / URL
              </label>
              <input
                id="form-source"
                type="url"
                className="search-input py-2!"
                placeholder="https://example.gov.in/notice-pdf"
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
              />
            </div>

            {/* File upload zone */}
            <div className="form-field">
              <span className="font-bold text-slate-700">Supporting Evidence (File / Photo)</span>
              <div
                className="file-upload-zone"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  onChange={(e) => setFormFile(e.target.files?.[0] || null)}
                />
                <div className="file-upload-content text-xs">
                  <span className="file-upload-icon">📁</span>
                  {formFile ? (
                    <span className="font-bold text-blue-600">{formFile.name}</span>
                  ) : (
                    <span>
                      Drag file here or{' '}
                      <button type="button" className="browse-button">
                        browse
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="form-actions mt-4 pt-3 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                className="secondary-button flex-1"
                onClick={closeCorrectionModal}
                disabled={isSubmitting}
              >
                {translate('correction.cancel', language)}
              </button>
              <button type="submit" className="primary-button flex-1" disabled={isSubmitting}>
                {isSubmitting ? '...' : translate('correction.submit', language)}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ─── Inline animation keyframes ──────────────────────── */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
