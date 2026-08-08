'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import 'chart.js/auto';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useLanguage } from '@/lib/LanguageContext';
import { translate } from '@/lib/i18n';
import IndiaMap from '@/components/IndiaMap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type ColorMode = 'execution' | 'budget' | 'density';

interface ExploreClientProps {
  constituencies: any[];
}

const deriveBudget = (execScore: number) => {
  const total = 25;
  const spent = Math.round(Math.min(0.95, (execScore / 100) * 1.15) * total * 10) / 10;
  return { total, spent, remaining: Math.round((total - spent) * 10) / 10, pct: Math.round((spent / total) * 100) };
};

const modeLabels: Record<ColorMode, { en: string; hi: string; ta: string; icon: string }> = {
  execution: { en: 'Promise delivery', hi: 'वादा पूर्ति', ta: 'வாக்குறுதி நிறைவேற்றம்', icon: 'Delivery' },
  budget: { en: 'Budget utilization', hi: 'बजट उपयोग', ta: 'பட்ஜெட் பயன்பாடு', icon: 'Budget' },
  density: { en: 'Tracked seats', hi: 'ट्रैक की गई सीटें', ta: 'கண்காணிக்கப்பட்ட இடங்கள்', icon: 'Density' },
};

export default function ExploreClient({ constituencies }: ExploreClientProps) {
  const { language } = useLanguage();
  const [colorMode, setColorMode] = useState<ColorMode>('execution');
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const stateGroups = useMemo(() => {
    const map: Record<string, any[]> = {};
    constituencies.forEach((item) => {
      if (!map[item.state]) map[item.state] = [];
      map[item.state].push(item);
    });
    return map;
  }, [constituencies]);

  const stateSummaries = useMemo(() => {
    return Object.entries(stateGroups)
      .map(([state, items]) => {
        const avgExec = Math.round(items.reduce((sum, item) => sum + Number(item.metrics?.promise_vs_execution?.score_pct ?? 0), 0) / items.length);
        const avgImpact = Math.round(items.reduce((sum, item) => sum + Number(item.metrics?.work_vs_impact?.score_pct ?? 0), 0) / items.length);
        const totalPromises = items.reduce((sum, item) => sum + (item.promises?.length ?? 0), 0);
        const avgBudget = Math.round(items.reduce((sum, item) => sum + deriveBudget(Number(item.metrics?.promise_vs_execution?.score_pct ?? 0)).pct, 0) / items.length);

        return { state, items, avgExec, avgImpact, totalPromises, avgBudget };
      })
      .sort((a, b) => b.avgExec - a.avgExec);
  }, [stateGroups]);

  const selectedStateData = useMemo(() => {
    if (!selectedState) return null;
    const items = stateGroups[selectedState] ?? [];
    if (!items.length) return null;

    const avgExec = Math.round(items.reduce((sum, item) => sum + Number(item.metrics?.promise_vs_execution?.score_pct ?? 0), 0) / items.length);
    const avgImpact = Math.round(items.reduce((sum, item) => sum + Number(item.metrics?.work_vs_impact?.score_pct ?? 0), 0) / items.length);
    const totalPromises = items.reduce((sum, item) => sum + (item.promises?.length ?? 0), 0);
    const totalBudgetSpent = items.reduce((sum, item) => sum + deriveBudget(Number(item.metrics?.promise_vs_execution?.score_pct ?? 0)).spent, 0);
    const totalBudget = items.length * 25;
    const statusTotals = items.reduce(
      (acc: Record<string, number>, item) => {
        (item.promises ?? []).forEach((promise: any) => {
          acc[promise.status] = (acc[promise.status] ?? 0) + 1;
        });
        return acc;
      },
      { done: 0, in_progress: 0, not_started: 0, misleading: 0 },
    );

    return { items, avgExec, avgImpact, totalPromises, totalBudgetSpent: Math.round(totalBudgetSpent * 10) / 10, totalBudget, statusTotals };
  }, [selectedState, stateGroups]);

  const aggregateChart = useMemo(() => {
    const topStates = stateSummaries.slice(0, 8);
    const labels = topStates.map((row) => row.state);
    const values = topStates.map((row) => {
      if (colorMode === 'budget') return row.avgBudget;
      if (colorMode === 'density') return row.items.length;
      return row.avgExec;
    });

    return {
      data: {
        labels,
        datasets: [
          {
            label: modeLabels[colorMode].en,
            data: values,
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
          y: { beginAtZero: true, ticks: { color: '#475569' } },
        },
      },
    };
  }, [colorMode, stateSummaries]);

  const selectedStateChart = useMemo(() => {
    if (!selectedStateData) return null;
    const labels = [translate('legend.done', language), translate('legend.inProgress', language), translate('legend.notStarted', language), translate('legend.misleading', language)];
    return {
      data: {
        labels,
        datasets: [
          {
            data: [
              selectedStateData.statusTotals.done,
              selectedStateData.statusTotals.in_progress,
              selectedStateData.statusTotals.not_started,
              selectedStateData.statusTotals.misleading,
            ],
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
    };
  }, [language, selectedStateData]);

  return (
    <div className="container py-8">
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">State atlas</Badge>
          <Badge variant="secondary" className="bg-slate-100 text-slate-700">Last updated: 15 Jul 2026</Badge>
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
          {language === 'hi' ? 'भारत मानचित्र एटलस' : language === 'ta' ? 'இந்தியா வரைபட அட்லஸ்' : 'India map atlas'}
        </h2>
        <p className="max-w-3xl text-sm text-slate-600">
          {language === 'hi'
            ? 'मानचित्र पर राज्यों को चुनें और साथ में सार्वजनिक रिकॉर्ड, निष्पादन दर, और बजट उपयोग को देखें।'
            : language === 'ta'
              ? 'வரைபடத்தில் மாநிலங்களைத் தேர்ந்தெடுத்து பொது பதிவுகள், செயலாக்கம் மற்றும் பட்ஜெட் பயன்பாட்டைப் பார்க்கவும்.'
              : 'Select a state on the map and review public records, delivery rates, and budget utilization alongside it.'}
        </p>
      </div>

      <Tabs value={colorMode} onValueChange={(value) => setColorMode(value as ColorMode)} className="mb-6">
        <TabsList className="h-auto flex-wrap justify-start bg-slate-100 p-1">
          <TabsTrigger value="execution">{modeLabels.execution.en}</TabsTrigger>
          <TabsTrigger value="budget">{modeLabels.budget.en}</TabsTrigger>
          <TabsTrigger value="density">{modeLabels.density.en}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <IndiaMap
              constituencyData={constituencies}
              colorMode={colorMode}
              onStateSelect={(stateName) => setSelectedState((current) => (current === stateName ? null : stateName))}
              selectedState={selectedState}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-slate-950">State reading</CardTitle>
              <CardDescription>
                {colorMode === 'budget'
                  ? 'Top states by MPLAD utilization.'
                  : colorMode === 'density'
                    ? 'Tracked constituency density by state.'
                    : 'Top states by promise delivery rate.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <Bar data={aggregateChart.data as any} options={aggregateChart.options as any} />
              </div>
            </CardContent>
          </Card>

          {selectedStateData ? (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-xl text-slate-950">{selectedState}</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setSelectedState(null)}>
                    Reset selection
                  </Button>
                </div>
                <CardDescription>
                  {selectedStateData.items.length} constituencies · {selectedStateData.totalPromises} promises
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                    <div className="text-2xl font-semibold text-slate-950">{selectedStateData.avgExec}%</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Execution</div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                    <div className="text-2xl font-semibold text-slate-950">{selectedStateData.avgImpact}%</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Impact</div>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="mb-3 text-sm font-semibold text-slate-950">Promise status mix</div>
                  <div className="h-64">
                    {selectedStateChart ? <Doughnut data={selectedStateChart.data as any} options={selectedStateChart.options as any} /> : null}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  MPLAD budget: ₹{selectedStateData.totalBudgetSpent} / ₹{selectedStateData.totalBudget} Cr
                </div>
                <div className="max-h-72 overflow-auto rounded-lg border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Constituency</TableHead>
                        <TableHead>Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedStateData.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium text-slate-950">{item.name}</div>
                            <div className="text-xs text-slate-500">{item.representative} · {item.party}</div>
                          </TableCell>
                          <TableCell>
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/constituency/${item.id}`}>{item.metrics?.promise_vs_execution?.score_pct ?? 0}%</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-950">States in record</CardTitle>
                <CardDescription>Select a state on the map to open an aggregated record.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-80 space-y-3 overflow-auto pr-1">
                  {stateSummaries.map((row) => (
                    <button
                      key={row.state}
                      type="button"
                      onClick={() => setSelectedState(row.state)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-medium text-slate-950">{row.state}</div>
                          <div className="text-xs text-slate-500">{row.items.length} constituencies · {row.totalPromises} promises</div>
                        </div>
                        <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">{row.avgExec}%</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
