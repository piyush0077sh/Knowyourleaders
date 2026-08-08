import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const metadata: Metadata = {
  title: 'Methodology | Know Your Leaders',
  description: 'Audit standards, source policy, verification SLA, and scoring formulas for Know Your Leaders.',
};

const sourceRows = [
  {
    source: 'MPLADS portal',
    purpose: 'Project sanctions, allocation totals, and fund utilization references.',
    cadence: 'Monthly / as published',
    evidence: 'Official scheme portal',
    href: 'https://mplads.gov.in/',
  },
  {
    source: 'Election Commission of India',
    purpose: 'Candidate, constituency, and election filing verification.',
    cadence: 'Election-cycle updates',
    evidence: 'Statutory filings and notifications',
    href: 'https://eci.gov.in/',
  },
  {
    source: 'Parliamentary Hansards and questions',
    purpose: 'Speech, promise, and question cross-checking.',
    cadence: 'Sitting-by-sitting',
    evidence: 'Lok Sabha / Rajya Sabha records',
    href: 'https://sansad.in/',
  },
  {
    source: 'Press Information Bureau',
    purpose: 'Official project launches, approvals, and milestones.',
    cadence: 'When released',
    evidence: 'Government press releases',
    href: 'https://pib.gov.in/',
  },
];

const tierRows = [
  {
    tier: 'Tier A',
    criteria: 'Primary official record with direct document link and timestamped confirmation.',
    confidence: 'High confidence, preferred for scoring.',
    refresh: 'Verified within 30 days.',
  },
  {
    tier: 'Tier B',
    criteria: 'Official record plus corroborating public reporting or secondary record.',
    confidence: 'Used when primary portal data is partial but traceable.',
    refresh: 'Verified within 45 days.',
  },
  {
    tier: 'Tier C',
    criteria: 'Public reporting only, pending official confirmation.',
    confidence: 'Displayed transparently, not used as a sole source for hard claims.',
    refresh: 'Verified within 60 days.',
  },
];

const scoringRows = [
  {
    metric: 'Promise vs Execution',
    formula: '(Delivered + 0.5 x In progress - 0.25 x Misleading) / total mapped promises',
    output: 'Normalized to a 0-100 score.',
  },
  {
    metric: 'Work vs Impact',
    formula: 'Execution score blended with evidence tier and outcome visibility',
    output: 'Weighted toward direct public impact.',
  },
  {
    metric: 'Audited MPLAD utilization',
    formula: 'Derived from constituency-level plan totals and verified spending references',
    output: 'Shown as a crore value with linked evidence.',
  },
];

export default function MethodologyPage() {
  return (
    <div className="container py-10 space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
                Smart India Movement
              </Badge>
              <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
                Methodology
              </Badge>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                Last updated: 15 Jul 2026
              </Badge>
            </div>
            <CardTitle className="text-3xl tracking-tight text-slate-950">Data audit standards</CardTitle>
            <CardDescription className="max-w-3xl text-base text-slate-600">
              Know Your Leaders uses source-linked public records, a documented verification SLA, and transparent scoring rules.
              Every public claim is expected to resolve back to an official portal, filing, or archived record.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="/">Return home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/compare">Compare MPs</Link>
            </Button>
            <Button asChild variant="ghost">
              <a href="https://smart-india-movement.vercel.app/" target="_blank" rel="noreferrer">
                Smart India Movement
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-slate-950">Verification SLA</CardTitle>
            <CardDescription>How long source-backed records may remain live before re-checking.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Signal</TableHead>
                  <TableHead>Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Published record</TableCell>
                  <TableCell>Within 30 days</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Factual correction</TableCell>
                  <TableCell>Reviewed within 48 hours</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Source conflict</TableCell>
                  <TableCell>Escalated for manual review</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-slate-950">Source register</CardTitle>
            <CardDescription>Primary portals used to verify constituency records.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Cadence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sourceRows.map((row) => (
                  <TableRow key={row.source}>
                    <TableCell className="font-medium text-slate-950">
                      <a href={row.href} target="_blank" rel="noreferrer" className="hover:underline">
                        {row.source}
                      </a>
                    </TableCell>
                    <TableCell>{row.purpose}</TableCell>
                    <TableCell>{row.cadence}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-slate-950">Confidence tiers</CardTitle>
            <CardDescription>How each claim is classified before it appears on the site.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tier</TableHead>
                  <TableHead>Criteria</TableHead>
                  <TableHead>Meaning</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tierRows.map((row) => (
                  <TableRow key={row.tier}>
                    <TableCell className="font-medium text-slate-950">{row.tier}</TableCell>
                    <TableCell>{row.criteria}</TableCell>
                    <TableCell>{row.confidence}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-slate-950">Scoring formulas</CardTitle>
          <CardDescription>Transparent aggregation rules used across dashboard and comparison views.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Formula</TableHead>
                <TableHead>Output</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scoringRows.map((row) => (
                <TableRow key={row.metric}>
                  <TableCell className="font-medium text-slate-950">{row.metric}</TableCell>
                  <TableCell>{row.formula}</TableCell>
                  <TableCell>{row.output}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}