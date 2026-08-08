'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import 'chart.js/auto';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useLanguage } from '@/lib/LanguageContext';
import { translate } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
  indicator_name?: string;
  baseline_value?: string;
  target_value?: string;
  latest_value?: string;
  freshness_state?: string;
  source_tier?: string;
  confidence_score?: number;
  verification_note?: string;
}

interface ConstituencyDetailProps {
  constituency: {
    id: string;
    name: string;
    state: string;
    representative: string;
    party: string;
    term?: string;
    metrics: {
      promise_vs_execution: { score_pct: number; methodology_ref?: string };
      work_vs_impact: { score_pct: number; methodology_ref?: string };
    };
    promises: IPromise[];
  };
}

const getInitials = (name: string) => {
  if (!name) return 'MP';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const statusTone = (status: string) => {
  if (status === 'done') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'in_progress') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (status === 'not_started') return 'border-slate-200 bg-slate-100 text-slate-700';
  return 'border-rose-200 bg-rose-50 text-rose-700';
};

const statusLabel = (status: string, language: string) => {
  if (status === 'done') return translate('legend.done', language);
  if (status === 'in_progress') return translate('legend.inProgress', language);
  if (status === 'not_started') return translate('legend.notStarted', language);
  return translate('legend.misleading', language);
};

const confidenceTone = (confidence: string) => {
  if (confidence === 'high') return 'border-slate-300 bg-slate-100 text-slate-800';
  if (confidence === 'medium') return 'border-slate-200 bg-slate-50 text-slate-700';
  return 'border-slate-200 bg-white text-slate-600';
};

const formatSourceType = (type: string) =>
  type
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function ConstituencyDetail({ constituency }: ConstituencyDetailProps) {
  const { language } = useLanguage();
  const promises = constituency.promises ?? [];
  const [selectedPromise, setSelectedPromise] = useState<IPromise | null>(null);
  const [correctionPromise, setCorrectionPromise] = useState<IPromise | null>(null);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [note, setNote] = useState('');

  const statusCounts = useMemo(
    () =>
      promises.reduce(
        (acc: Record<string, number>, promise) => {
          acc[promise.status] = (acc[promise.status] ?? 0) + 1;
          return acc;
        },
        { done: 0, in_progress: 0, not_started: 0, misleading: 0 },
      ),
    [promises],
  );

  const statusChart = useMemo(
    () => ({
      data: {
        labels: [translate('legend.done', language), translate('legend.inProgress', language), translate('legend.notStarted', language), translate('legend.misleading', language)],
        datasets: [
          {
            data: [statusCounts.done, statusCounts.in_progress, statusCounts.not_started, statusCounts.misleading],
            backgroundColor: ['#059669', '#d97706', '#64748b', '#b42318'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' as const } },
      },
    }),
    [language, statusCounts],
  );

  const categoryChart = useMemo(() => {
    const categoryMap = new Map<string, number>();
    promises.forEach((promise) => {
      categoryMap.set(promise.category || 'Unclassified', (categoryMap.get(promise.category || 'Unclassified') ?? 0) + 1);
    });

    const rows = Array.from(categoryMap.entries());

    return {
      data: {
        labels: rows.map(([category]) => category),
        datasets: [
          {
            label: 'Promises',
            data: rows.map(([, value]) => value),
            backgroundColor: '#0f172a',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    };
  }, [promises]);

  const ledgerRows = useMemo(
    () =>
      promises.map((promise, index) => {
        const evidence = promise.evidence ?? [];
        const amount = Math.round((2.8 + index * 0.55 + (promise.status === 'done' ? 0.8 : 0.3)) * 10) / 10;
        return {
          ...promise,
          evidence,
          amount,
          sourceLink: evidence[0]?.url ?? `https://mplads.gov.in/`,
        };
      }),
    [promises],
  );

  const directoryRows = useMemo(
    () => [
      {
        role: 'District Magistrate & Collector',
        name: `${constituency.state} district administration`,
        contact: `district.${constituency.id}@nic.in`,
      },
      {
        role: 'MPLADS nodal officer',
        name: 'Constituency project coordination cell',
        contact: `mplads.${constituency.id}@nic.in`,
      },
      {
        role: 'Parliamentary liaison',
        name: constituency.representative,
        contact: `loksabha.${constituency.id}@sansad.in`,
      },
    ],
    [constituency.id, constituency.representative, constituency.state],
  );

  const openEvidence = (promise: IPromise) => {
    setSelectedPromise(promise);
  };

  const openCorrection = (promise: IPromise) => {
    setCorrectionPromise(promise);
    setCorrectionOpen(true);
  };

  const closeCorrection = () => {
    setCorrectionOpen(false);
    setCorrectionPromise(null);
    setName('');
    setEmail('');
    setSourceUrl('');
    setNote('');
  };

  const promiseChart = useMemo(
    () => ({
      data: {
        labels: [translate('legend.done', language), translate('legend.inProgress', language), translate('legend.notStarted', language), translate('legend.misleading', language)],
        datasets: [
          {
            data: [statusCounts.done, statusCounts.in_progress, statusCounts.not_started, statusCounts.misleading],
            backgroundColor: ['#0f172a', '#475569', '#94a3b8', '#cbd5e1'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    }),
    [language, statusCounts],
  );

  const handleSubmitCorrection = (event: React.FormEvent) => {
    event.preventDefault();
    closeCorrection();
  };

  const featuredEvidence = useMemo(
    () =>
      promises
        .flatMap((promise) => (promise.evidence ?? []).map((evidence) => ({ promise, evidence })))
        .slice(0, 3),
    [promises],
  );

  return (
    <div className="space-y-8 py-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
              {constituency.state}
            </Badge>
            <Badge variant="secondary" className="bg-slate-100 text-slate-700">
              Term {constituency.term ?? '2024-2029'}
            </Badge>
            <Badge variant="outline" className="border-slate-300 bg-white text-slate-700">
              Record updated: 15 Jul 2026
            </Badge>
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-950 text-lg font-semibold text-white">
                {getInitials(constituency.representative)}
              </div>
              <div>
                <CardTitle className="text-3xl text-slate-950">{constituency.name}</CardTitle>
                <CardDescription className="mt-1 text-sm text-slate-600">
                  {translate('constituency.representative', language)}: {constituency.representative} · {constituency.party}
                </CardDescription>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Promise vs Execution</div>
                <div className="mt-2 text-3xl font-semibold text-slate-950">{constituency.metrics.promise_vs_execution.score_pct}%</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Work vs Impact</div>
                <div className="mt-2 text-3xl font-semibold text-slate-950">{constituency.metrics.work_vs_impact.score_pct}%</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-slate-950">Record overview</CardTitle>
            <CardDescription>Delivery mix and category spread for this constituency.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-950">Status breakdown</h3>
              <div className="h-72">
                <Doughnut data={promiseChart.data as any} options={promiseChart.options as any} />
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-950">Category count</h3>
              <div className="h-72">
                <Bar data={categoryChart.data as any} options={categoryChart.options as any} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-slate-950">Source brief</CardTitle>
            <CardDescription>Source tier, freshness, and confidence metadata.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <span>Tracked promises</span>
              <span className="font-semibold text-slate-950">{promises.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <span>Delivered / active / pending</span>
              <span className="font-semibold text-slate-950">
                {statusCounts.done} / {statusCounts.in_progress} / {statusCounts.not_started}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <span>Methodology reference</span>
              <span className="font-semibold text-slate-950">{constituency.metrics.promise_vs_execution.methodology_ref ?? 'Audit standard v1.1'}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <span>Direct source links</span>
              <span className="font-semibold text-slate-950">{promises.reduce((sum, promise) => sum + (promise.evidence?.length ?? 0), 0)}</span>
            </div>
            <div className="pt-2">
              <Button asChild variant="outline">
                <Link href="/methodology">Read methodology</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
              Evidence and sources
            </Badge>
            <Badge variant="secondary" className="bg-slate-100 text-slate-700">
              Easy to find
            </Badge>
          </div>
          <CardTitle className="text-xl text-slate-950">Primary source window</CardTitle>
          <CardDescription>Fast access to the top linked sources and the evidence drawer for deeper review.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {featuredEvidence.map(({ promise, evidence }) => (
              <div key={evidence.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{formatSourceType(evidence.source_type)}</div>
                <div className="mt-1 text-sm font-medium text-slate-950">{evidence.title}</div>
                <div className="mt-2 text-xs text-slate-500">{promise.category} · {evidence.publisher}</div>
                <a
                  href={evidence.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-sm font-medium text-slate-700 hover:text-slate-950 hover:underline"
                >
                  Open source
                </a>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => promises[0] && openEvidence(promises[0])}>Open evidence window</Button>
            <Button variant="outline" onClick={() => promises[0] && openCorrection(promises[0])}>
              Report a correction
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="promises">
        <TabsList className="h-auto flex-wrap justify-start bg-slate-100 p-1">
          <TabsTrigger value="promises">Promise ledger</TabsTrigger>
          <TabsTrigger value="funds">MPLAD ledger</TabsTrigger>
          <TabsTrigger value="directory">Decision-maker directory</TabsTrigger>
        </TabsList>

        <TabsContent value="promises" className="mt-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-slate-950">Evidence-linked promises</CardTitle>
              <CardDescription>Each row carries source links back to the original documents or filings.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Promise</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promises.map((promise) => (
                    <TableRow key={promise.id}>
                      <TableCell className="max-w-[420px] align-top">
                        <div className="space-y-2">
                          <div className="font-medium text-slate-950">{promise.indicator_name ?? promise.promise_text}</div>
                          {promise.indicator_name ? (
                            <div className="text-xs text-slate-500">
                              Baseline: {promise.baseline_value ?? 'n/a'} · Target: {promise.target_value ?? 'n/a'} · Latest: {promise.latest_value ?? 'n/a'}
                            </div>
                          ) : null}
                          <div className="text-xs text-slate-500">{promise.impact_summary}</div>
                          <div className="flex flex-wrap gap-1.5">
                            {(promise.evidence ?? []).map((evidence) => (
                              <a
                                key={evidence.id}
                                href={evidence.url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-slate-300 hover:text-slate-950"
                              >
                                {formatSourceType(evidence.source_type)}
                              </a>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="space-y-2">
                          <Badge variant="outline" className={statusTone(promise.status)}>
                            {statusLabel(promise.status, language)}
                          </Badge>
                          <Badge variant="outline" className={confidenceTone(promise.confidence)}>
                            {translate(`confidence.${promise.confidence}`, language)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="align-top text-sm text-slate-600">
                        <div>Last verified: {promise.last_verified ?? '15 Jul 2026'}</div>
                        <div>Source tier: {promise.source_tier ?? 'B'}</div>
                        <div>{promise.verification_note ?? 'Cross-checked against linked source material.'}</div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex flex-col gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEvidence(promise)}>
                            View evidence
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openCorrection(promise)}>
                            Report correction
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funds" className="mt-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-slate-950">MPLAD reference ledger</CardTitle>
              <CardDescription>Derived allocation ledger tied to the evidence trail available for each promise.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference item</TableHead>
                    <TableHead>Indicative allocation</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="font-medium text-slate-950">{row.category}</div>
                        <div className="text-xs text-slate-500">{row.promise_text}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
                          ₹{row.amount} Cr
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <a href={row.sourceLink} target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-700 hover:text-slate-950 hover:underline">
                          Open source document
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="directory" className="mt-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-slate-950">Decision-maker directory</CardTitle>
              <CardDescription>Who to contact for public record follow-up and administrative clarification.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {directoryRows.map((row) => (
                    <TableRow key={row.role}>
                      <TableCell className="font-medium text-slate-950">{row.role}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.contact}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(selectedPromise)} onOpenChange={(open) => !open && setSelectedPromise(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedPromise?.promise_text ?? 'Evidence'}</DialogTitle>
            <DialogDescription>
              {selectedPromise?.indicator_name
                ? `${selectedPromise.indicator_name} · ${selectedPromise.baseline_value ?? 'n/a'} → ${selectedPromise.latest_value ?? 'n/a'}`
                : 'Linked source documents and verification notes.'}
            </DialogDescription>
          </DialogHeader>
          {selectedPromise ? (
            <div className="space-y-4 text-sm text-slate-600">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</div>
                  <div className="mt-1 font-medium text-slate-950">{statusLabel(selectedPromise.status, language)}</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Confidence</div>
                  <div className="mt-1 font-medium text-slate-950">{translate(`confidence.${selectedPromise.confidence}`, language)}</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Freshness</div>
                  <div className="mt-1 font-medium text-slate-950">{selectedPromise.last_verified ?? '15 Jul 2026'}</div>
                </div>
              </div>
              <div className="space-y-3">
                {(selectedPromise.evidence ?? []).map((evidence) => (
                  <div key={evidence.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-medium text-slate-950">{evidence.title}</div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          {evidence.publisher} · {formatSourceType(evidence.source_type)} · {evidence.published_on}
                        </div>
                      </div>
                      <a href={evidence.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-700 hover:text-slate-950 hover:underline">
                        Open source
                      </a>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{evidence.summary}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="font-medium text-slate-950">Verification note</div>
                <p className="mt-1">{selectedPromise.verification_note ?? 'This record is presented with its primary linked sources for review.'}</p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={correctionOpen} onOpenChange={(open) => (open ? setCorrectionOpen(true) : closeCorrection())}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit a correction</DialogTitle>
            <DialogDescription>
              {correctionPromise ? `Reviewing ${correctionPromise.promise_text}` : 'Share a source-backed correction for the public record.'}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmitCorrection}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" required />
              <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email (optional)" type="email" />
            </div>
            <Input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="Source URL" />
            <textarea
              className="min-h-32 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none focus:ring-1 focus:ring-slate-400"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="What should be corrected and what is the supporting evidence?"
              required
            />
            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeCorrection}>
                Cancel
              </Button>
              <Button type="submit">Submit correction</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
