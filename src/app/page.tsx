import { getConstituencies } from '@/lib/db';
import ConstituencyDashboard from '@/components/ConstituencyDashboard';

export const revalidate = 300; // Cache for 5 minutes

export default async function Home() {
  const constituencies = await getConstituencies();

  // Convert Mongoose documents (if any) to plain objects to avoid serialization issues
  const plainConstituencies = JSON.parse(JSON.stringify(constituencies));

  return (
    <div className="container mx-auto">
      <ConstituencyDashboard initialData={plainConstituencies} />
    </div>
  );
}
