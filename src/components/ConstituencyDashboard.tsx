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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ConstituencyDashboardProps {
  initialData: any[];
}

const statusOrder = ['done', 'in_progress', 'not_started', 'misleading'] as const;

const statusLabel = (status: string, language: string) => {
  if (status === 'done') return translate('legend.done', language);
  if (status === 'in_progress') return translate('legend.inProgress', language);
  if (status === 'not_started') return translate('legend.notStarted', language);
  return translate('legend.misleading', language);
};

const statusBadgeClass = (status: string) => {
  if (status === 'done') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'in_progress') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (status === 'not_started') return 'border-slate-200 bg-slate-100 text-slate-700';
  return 'border-rose-200 bg-rose-50 text-rose-700';
};

const partyBadgeClass = (party: string) => {
  const key = party?.toUpperCase();
  if (key.includes('BJP')) return 'border-orange-200 bg-orange-50 text-orange-700';
  if (key.includes('INC')) return 'border-blue-200 bg-blue-50 text-blue-700';
  if (key.includes('TMC') || key.includes('AITC')) return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (key.includes('DMK')) return 'border-red-200 bg-red-50 text-red-700';
  if (key.includes('SP')) return 'border-cyan-200 bg-cyan-50 text-cyan-700';
  return 'border-slate-200 bg-slate-50 text-slate-700';
};

const formatParty = (party: string) => party || 'Independent';

const deriveExecution = (item: any) => Number(item?.metrics?.promise_vs_execution?.score_pct ?? 0);
const deriveImpact = (item: any) => Number(item?.metrics?.work_vs_impact?.score_pct ?? 0);

const mpladBudgetForSeat = 25;

export default function ConstituencyDashboard({ initialData }: ConstituencyDashboardProps) {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | (typeof statusOrder)[number]>('all');

  const constituencies = initialData ?? [];
  const states = useMemo(
    () => Array.from(new Set(constituencies.map((item) => item.state).filter(Boolean))).sort(),
    [constituencies],
  );

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return constituencies.filter((item) => {
      const matchesQuery =
        !query ||
        [item.name, item.representative, item.party, item.state]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesState = stateFilter === 'all' || item.state === stateFilter;

      const counts = (item.promises ?? []).reduce(
        (acc: Record<string, number>, promise: any) => {
          acc[promise.status] = (acc[promise.status] ?? 0) + 1;
          return acc;
        },
        {},
      );

      const matchesStatus = statusFilter === 'all' || (counts[statusFilter] ?? 0) > 0;

      return matchesQuery && matchesState && matchesStatus;
    });
  }, [constituencies, searchQuery, stateFilter, statusFilter]);

  const stats = useMemo(() => {
    const promiseCount = constituencies.reduce((sum, item) => sum + (item.promises?.length ?? 0), 0);
    const avgExecution = constituencies.length
      ? Math.round(constituencies.reduce((sum, item) => sum + deriveExecution(item), 0) / constituencies.length)
      : 0;
    const auditedFunds = Math.round(constituencies.length * mpladBudgetForSeat * 10) / 10;

    return { promiseCount, avgExecution, auditedFunds };
  }, [constituencies]);

  const categoryChart = useMemo(() => {
    const categoryMap = new Map<string, { done: number; total: number }>();

    constituencies.forEach((item) => {
      (item.promises ?? []).forEach((promise: any) => {
        const category = promise.category || 'Unclassified';
        const existing = categoryMap.get(category) ?? { done: 0, total: 0 };
        existing.total += 1;
        if (promise.status === 'done') existing.done += 1;
        categoryMap.set(category, existing);
      });
    });

    const rows = Array.from(categoryMap.entries())
      .map(([label, data]) => ({ label, value: data.total ? Math.round((data.done / data.total) * 100) : 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    return {
      data: {
        labels: rows.map((row) => row.label),
        datasets: [
          {
            label: 'Delivery rate %',
            data: rows.map((row) => row.value),
            backgroundColor: '#0f172a',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#475569' }, grid: { display: false } },
          y: { beginAtZero: true, max: 100, ticks: { color: '#475569' } },
        },
      },
    };
  }, [constituencies]);

  const partyChart = useMemo(() => {
    const partyMap = new Map<string, number[]>();

    constituencies.forEach((item) => {
      const party = formatParty(item.party);
      const values = partyMap.get(party) ?? [];
      values.push(deriveExecution(item));
      partyMap.set(party, values);
    });

    const rows = Array.from(partyMap.entries())
      .map(([label, values]) => ({ label, value: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) }))
      .sort((a, b) => b.value - a.value);

    return {
      data: {
        labels: rows.map((row) => row.label),
        datasets: [
          {
            label: 'Average execution %',
            data: rows.map((row) => row.value),
            backgroundColor: ['#0f172a', '#475569', '#94a3b8', '#cbd5e1', '#1e293b'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' as const },
        },
      },
    };
  }, [constituencies]);

  const promiseStatusTotals = useMemo(() => {
    return statusOrder.map((status) => ({
      label: statusLabel(status, language),
      value: constituencies.reduce(
        (sum, item) => sum + (item.promises ?? []).filter((promise: any) => promise.status === status).length,
        0,
      ),
      status,
    }));
  }, [constituencies, language]);

  const tableRows = filteredData.map((item) => {
    const promises = item.promises ?? [];
    const counts = promises.reduce(
      (acc: Record<string, number>, promise: any) => {
        acc[promise.status] = (acc[promise.status] ?? 0) + 1;
        return acc;
      },
      {},
    );

    const latestVerified = promises[0]?.last_verified ?? item.metrics?.promise_vs_execution?.methodology_ref ?? '15 Jul 2026';

    return {
      ...item,
      counts,
      latestVerified,
      promiseCount: promises.length,
    };
  });

  const resetFilters = () => {
    setSearchQuery('');
    setStateFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-8 py-6">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
                Read the record
              </Badge>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                Source-linked constituency views
              </Badge>
            </div>
            <CardTitle className="text-2xl text-slate-950">What the current record shows</CardTitle>
            <CardDescription className="max-w-2xl text-sm text-slate-600">
              Use the search panel, filters, charts, and register together. The goal is to make the evidence easy to read before opening any individual constituency.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Coverage</CardDescription>
            <CardTitle className="text-3xl text-slate-950">{constituencies.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Claims mapped</CardDescription>
            <CardTitle className="text-3xl text-slate-950">{stats.promiseCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Average delivery rate</CardDescription>
            <CardTitle className="text-3xl text-slate-950">{stats.avgExecution}%</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Funds under review</CardDescription>
            <CardTitle className="text-3xl text-slate-950">₹{stats.auditedFunds} Cr</CardTitle>
          </CardHeader>
        </Card>
        </div>
      </section>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
              Search and filter
            </Badge>
            <Badge variant="secondary" className="bg-slate-100 text-slate-700">
              Search panel
            </Badge>
          </div>
          <CardTitle className="text-xl text-slate-950">Find a constituency</CardTitle>
          <CardDescription>Use search, state, and status filters before opening the source-linked register.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr_auto]">
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={translate('search.placeholder', language)}
          />

          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All states" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All states</SelectItem>
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statusOrder.map((status) => (
                <SelectItem key={status} value={status}>
                  {statusLabel(status, language)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={resetFilters}>
            Reset filters
          </Button>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-2xl text-slate-950">Constituency reading room</CardTitle>
                <CardDescription>Search, filter, and open the source-linked constituency record.</CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href="/methodology">Methodology</Link>
              </Button>
            </div>

            <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <TabsList className="h-auto flex-wrap justify-start bg-slate-100 p-1">
                <TabsTrigger value="all">All</TabsTrigger>
                {statusOrder.map((status) => (
                  <TabsTrigger key={status} value={status}>
                    {statusLabel(status, language)}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value={statusFilter} className="mt-4" />
            </Tabs>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-950">Category delivery rates</h3>
                  <p className="text-xs text-slate-500">Share of promises delivered within each category.</p>
                </div>
                <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
                  Top 8 categories
                </Badge>
              </div>
              <div className="h-72">
                <Bar data={categoryChart.data as any} options={categoryChart.options as any} />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-950">Party execution summary</h3>
                <div className="h-72">
                  <Doughnut data={partyChart.data as any} options={partyChart.options as any} />
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-950">Overall promise status</h3>
                <div className="space-y-3">
                  {promiseStatusTotals.map((item) => (
                    <div key={item.status}>
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                        <span>{item.label}</span>
                        <span className="font-medium text-slate-950">{item.value}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full bg-slate-900"
                          style={{ width: `${constituencies.length ? Math.min(100, Math.round((item.value / stats.promiseCount) * 100)) : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-slate-950">Source-linked register</CardTitle>
            <CardDescription>Quick view of the filtered constituencies.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Constituency</TableHead>
                  <TableHead>Execution</TableHead>
                  <TableHead>Status mix</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-slate-950">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.representative}</div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Badge variant="outline" className={partyBadgeClass(item.party)}>
                            {formatParty(item.party)}
                          </Badge>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                            {item.state}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2 text-xs text-slate-600">
                        <div>
                          <span className="font-medium text-slate-950">Promise vs Execution:</span> {deriveExecution(item)}%
                        </div>
                        <div>
                          <span className="font-medium text-slate-950">Work vs Impact:</span> {deriveImpact(item)}%
                        </div>
                        <div className="text-slate-500">Last verified: {item.latestVerified}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {statusOrder.map((status) => (
                          <Badge key={status} variant="outline" className={statusBadgeClass(status)}>
                            {statusLabel(status, language)}: {item.counts[status] ?? 0}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-3">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/constituency/${item.id}`}>Open record</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {tableRows.length === 0 ? (
              <div className="border-t border-slate-200 pt-6 text-sm text-slate-500">
                No rows match the current search and filter combination.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
