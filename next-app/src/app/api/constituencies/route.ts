import { NextResponse } from 'next/server';
import { getConstituencies } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase() || '';
    const type = searchParams.get('type') || 'all';

    const constituencies = await getConstituencies();

    let filtered = constituencies;

    if (q) {
      filtered = constituencies.filter((c) => {
        const nameMatch = c.name.toLowerCase().includes(q);
        const repMatch = c.representative.toLowerCase().includes(q);
        const partyMatch = c.party.toLowerCase().includes(q);

        if (type === 'constituency') {
          return nameMatch;
        } else if (type === 'politician') {
          return repMatch;
        } else if (type === 'party') {
          return partyMatch;
        } else {
          return nameMatch || repMatch || partyMatch;
        }
      });
    } else if (type !== 'all') {
      // If type filter is set but no query, return all
      // (This mirrors the behavior in main.js)
      filtered = constituencies;
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
