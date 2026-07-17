import { getConstituencies } from '@/lib/db';
import IndiaMap from '@/components/IndiaMap';
import Link from 'next/link';

export const revalidate = 300;

export default async function ExplorePage() {
  const constituencies = await getConstituencies();
  const plainConstituencies = JSON.parse(JSON.stringify(constituencies));

  // Group constituencies by state
  const stateGroups: Record<string, typeof plainConstituencies> = {};
  plainConstituencies.forEach((c: any) => {
    if (!stateGroups[c.state]) {
      stateGroups[c.state] = [];
    }
    stateGroups[c.state].push(c);
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Constituency Map Explorer
        </h2>
        <p className="text-slate-600 mt-2">
          Interactive geographic breakdown of representative performance across India. Hover over highlighted states to preview scores, and click to explore active ledgers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Map Panel */}
        <div className="lg:col-span-7">
          <IndiaMap constituencyData={plainConstituencies} />
        </div>

        {/* Sidebar Legend and State Groups */}
        <div className="lg:col-span-5 space-y-6">
          <div className="panel bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold mb-4">Map Legend & Status</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded border border-emerald-200 bg-emerald-50 block flex-shrink-0"></span>
                <div>
                  <div className="font-semibold text-sm text-slate-800">High Execution (≥ 65%)</div>
                  <div className="text-xs text-slate-500">Representative has delivered on the majority of verified promises.</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded border border-amber-200 bg-amber-50 block flex-shrink-0"></span>
                <div>
                  <div className="font-semibold text-sm text-slate-800">Medium Execution (50% - 64%)</div>
                  <div className="text-xs text-slate-500">Active implementation under way; mixed rates of promise delivery.</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded border border-red-200 bg-red-50 block flex-shrink-0"></span>
                <div>
                  <div className="font-semibold text-sm text-slate-800">Low Execution (&lt; 50%)</div>
                  <div className="text-xs text-slate-500">Delays or misleading statements observed on critical promises.</div>
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-slate-100 pt-3 mt-3">
                <span className="w-6 h-6 rounded border border-slate-200 bg-slate-50 block flex-shrink-0"></span>
                <div>
                  <div className="font-semibold text-sm text-slate-800">Untracked Territory</div>
                  <div className="text-xs text-slate-500">Data for these regions is currently pending ingestion or ECI verification.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="panel bg-white border border-slate-200 p-6 rounded-2xl shadow-sm max-h-[400px] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Tracked Regions ({plainConstituencies.length})</h3>
            <div className="space-y-4">
              {Object.entries(stateGroups).map(([state, items]: [string, any]) => (
                <div key={state} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                    {state}
                  </div>
                  <div className="space-y-2">
                    {items.map((c: any) => (
                      <div key={c.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 transition">
                        <div>
                          <div className="font-bold text-sm text-slate-800">{c.name}</div>
                          <div className="text-xs text-slate-500">
                            {c.representative} <span className="font-semibold">({c.party})</span>
                          </div>
                        </div>
                        <Link
                          href={`/constituency/${c.id}`}
                          className="text-xs bg-white hover:bg-slate-100 border border-slate-200 font-bold px-3 py-1.5 rounded transition no-underline text-slate-700"
                        >
                          View Ledger
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
