import { getConstituencies } from '@/lib/db';
import ConstituencyCompare from '@/components/ConstituencyCompare';

export const revalidate = 300;

export default async function ComparePage() {
  const constituencies = await getConstituencies();
  const plainConstituencies = JSON.parse(JSON.stringify(constituencies));

  return (
    <div className="container mx-auto py-8">
      <ConstituencyCompare constituencies={plainConstituencies} />
    </div>
  );
}
