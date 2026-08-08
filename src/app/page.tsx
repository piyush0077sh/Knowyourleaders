import { getConstituencies } from '@/lib/db';
import ConstituencyDashboard from '@/components/ConstituencyDashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export const revalidate = 300; // Cache for 5 minutes

export default async function Home() {
  const constituencies = await getConstituencies();

  // Convert Mongoose documents (if any) to plain objects to avoid serialization issues
  const plainConstituencies = JSON.parse(JSON.stringify(constituencies));

  return (
    <div className="container mx-auto space-y-6 py-6">
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
                Smart India Movement
              </Badge>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                Parent initiative
              </Badge>
            </div>
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Editorial evidence desk</p>
              <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Public records, source by source, without the dashboard clutter.
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                Know Your Leaders is a civic transparency product under Smart India Movement for source-linked constituency records, evidence, and public accountability.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="/methodology">Read methodology</Link>
              </Button>
              <Button asChild variant="outline">
                <a href="https://smart-india-movement.vercel.app/" target="_blank" rel="noreferrer">
                  Visit Smart India Movement
                </a>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">What you can audit</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">Evidence-first views</h2>
              </div>
              <Badge variant="outline" className="border-slate-300 bg-white text-slate-700">
                Live
              </Badge>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Search</div>
                <div className="mt-1 font-medium text-slate-950">Find a constituency fast</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Evidence</div>
                <div className="mt-1 font-medium text-slate-950">Open source-backed records</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Compare</div>
                <div className="mt-1 font-medium text-slate-950">Track delivery side by side</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Method</div>
                <div className="mt-1 font-medium text-slate-950">See how claims are verified</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConstituencyDashboard initialData={plainConstituencies} />
    </div>
  );
}
