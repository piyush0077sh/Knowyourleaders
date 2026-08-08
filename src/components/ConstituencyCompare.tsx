'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import 'chart.js/auto';
import { Bar } from 'react-chartjs-2';
import { useLanguage } from '@/lib/LanguageContext';
import { translate } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PromiseData {
  status: 'done' | 'in_progress' | 'not_started' | 'misleading';
}

interface Constituency {
  id: string;
  name: string;
  representative: string;
  party: string;
  state: string;
  metrics: {
    promise_vs_execution: { score_pct: number };
    work_vs_impact: { score_pct: number };
  };
  promises: PromiseData[];
}

interface ConstituencyCompareProps {
  constituencies: Constituency[];
}

const deriveBudget = (execScore: number) => {
  const total = 25;
  const spent = Math.round(Math.min(0.95, (execScore / 100) * 1.15) * total * 10) / 10;
  return { total, spent, remaining: Math.round((total - spent) * 10) / 10, pct: Math.round((spent / total) * 100) };
};

const partyTone = (party: string) => {
  const key = party?.toUpperCase();
  if (key.includes('BJP')) return 'border-orange-200 bg-orange-50 text-orange-700';
  if (key.includes('INC')) return 'border-blue-200 bg-blue-50 text-blue-700';
  if (key.includes('TMC') || key.includes('AITC')) return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (key.includes('DMK')) return 'border-red-200 bg-red-50 text-red-700';
  return 'border-slate-200 bg-slate-50 text-slate-700';
};

export default function ConstituencyCompare({ constituencies }: ConstituencyCompareProps) {
  const { language } = useLanguage();
  const [selectedIds, setSelectedIds] = useState<string[]>(
    constituencies.length >= 2 ? [constituencies[0].id, constituencies[1].id] : [],
  );

  const selectedItems = useMemo(
    () => selectedIds.map((id) => constituencies.find((item) => item.id === id)).filter(Boolean) as Constituency[],
    [selectedIds, constituencies],
  );

  const availableItems = useMemo(
    () => constituencies.filter((item) => !selectedIds.includes(item.id)),
    [constituencies, selectedIds],
  );

  const addConstituency = (value: string) => {
    if (!value) return;
    if (selectedIds.includes(value)) return;
    if (selectedIds.length >= 3) return;
    setSelectedIds((current) => [...current, value]);
  };

  const removeConstituency = (id: string) => {
    setSelectedIds((current) => current.filter((itemId) => itemId !== id));
  };

  const comparisonRows = selectedItems.map((item) => {
    const budget = deriveBudget(item.metrics.promise_vs_execution.score_pct);
    const counts = item.promises.reduce(
      (acc: Record<string, number>, promise) => {
        acc[promise.status] = (acc[promise.status] ?? 0) + 1;
        return acc;
      },
      { done: 0, in_progress: 0, not_started: 0, misleading: 0 },
    );

    return {
      ...item,
      budget,
      counts,
      promiseCount: item.promises.length,
    };
  });

  const executionChart = {
    data: {
      labels: comparisonRows.map((item) => item.name),
      datasets: [
        {
          label: 'Promise vs Execution',
          data: comparisonRows.map((item) => item.metrics.promise_vs_execution.score_pct),
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

  const impactChart = {
    data: {
      labels: comparisonRows.map((item) => item.name),
      datasets: [
        {
          label: 'Work vs Impact',
          data: comparisonRows.map((item) => item.metrics.work_vs_impact.score_pct),
          backgroundColor: '#475569',
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

  const budgetChart = {
    data: {
      labels: comparisonRows.map((item) => item.name),
      datasets: [
        {
          label: 'MPLAD utilization %',
          data: comparisonRows.map((item) => item.budget.pct),
          backgroundColor: '#94a3b8',
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

  return (
    <div className="space-y-8 py-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
              Comparison room
            </Badge>
            <Badge variant="secondary" className="bg-slate-100 text-slate-700">
              Last updated: 15 Jul 2026
            </Badge>
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-3xl text-slate-950">Representative comparison sheet</CardTitle>
              <CardDescription className="mt-2 max-w-3xl text-base text-slate-600">
                Compare promise execution, impact, and MPLAD utilization side by side using the same audit frame.
              </CardDescription>
            </div>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <Select value="" onValueChange={addConstituency}>
                <SelectTrigger className="min-w-72">
                  <SelectValue placeholder="Add a constituency" />
                </SelectTrigger>
                <SelectContent>
                  {availableItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.representative})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button asChild variant="outline">
                <Link href="/methodology">Methodology</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {selectedItems.length === 0 ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-8 text-sm text-slate-500">
            No constituencies selected. Use the dropdown to add one or more seats for comparison.
          </CardContent>
        </Card>
      ) : (
        <>
          <section className={`grid gap-4 ${selectedItems.length === 1 ? 'grid-cols-1 max-w-3xl' : selectedItems.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
            {comparisonRows.map((item) => (
              <Card key={item.id} className="border-slate-200 shadow-sm relative">
                {selectedItems.length > 1 ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-3 h-8 w-8"
                    onClick={() => removeConstituency(item.id)}
                  >
                    ×
                  </Button>
                ) : null}
                <CardHeader>
                  <div className="space-y-2">
                    <div className="text-lg font-semibold text-slate-950">{item.name}</div>
                    <div className="text-sm text-slate-500">{item.representative}</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={partyTone(item.party)}>
                        {item.party}
                      </Badge>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                        {item.state}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Execution</span>
                    <span className="font-semibold text-slate-950">{item.metrics.promise_vs_execution.score_pct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Impact</span>
                    <span className="font-semibold text-slate-950">{item.metrics.work_vs_impact.score_pct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Promises</span>
                    <span className="font-semibold text-slate-950">{item.promiseCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>MPLAD utilization</span>
                    <span className="font-semibold text-slate-950">₹{item.budget.spent} / ₹{item.budget.total} Cr</span>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/constituency/${item.id}`}>{translate('constituency.viewEvidence', language)}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-950">Execution score</CardTitle>
                <CardDescription>Promise delivery percentages by constituency.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <Bar data={executionChart.data as any} options={executionChart.options as any} />
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-950">Work vs impact</CardTitle>
                <CardDescription>Comparative impact signal across selected seats.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <Bar data={impactChart.data as any} options={impactChart.options as any} />
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-950">MPLAD budget utilization</CardTitle>
                <CardDescription>Derived spend level on the audited ₹25 crore per seat frame.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <Bar data={budgetChart.data as any} options={budgetChart.options as any} />
                </div>
              </CardContent>
            </Card>
          </section>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-slate-950">Comparison table</CardTitle>
              <CardDescription>Structured metric view for the selected constituencies.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Constituency</TableHead>
                    <TableHead>Representative</TableHead>
                    <TableHead>Execution</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Promised / delivered mix</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonRows.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-slate-950">{item.name}</TableCell>
                      <TableCell>{item.representative}</TableCell>
                      <TableCell>{item.metrics.promise_vs_execution.score_pct}%</TableCell>
                      <TableCell>{item.metrics.work_vs_impact.score_pct}%</TableCell>
                      <TableCell>₹{item.budget.spent} Cr</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Done: {item.counts.done}</Badge>
                          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">In progress: {item.counts.in_progress}</Badge>
                          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">Pending: {item.counts.not_started}</Badge>
                          <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">Flagged: {item.counts.misleading}</Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
