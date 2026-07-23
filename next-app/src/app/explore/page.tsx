import { getConstituencies } from '@/lib/db';
import ExploreClient from '@/components/ExploreClient';

export const revalidate = 300;

export default async function ExplorePage() {
  const constituencies = await getConstituencies();
  const plainConstituencies = JSON.parse(JSON.stringify(constituencies));

  return <ExploreClient constituencies={plainConstituencies} />;
}
