import { getConstituencyById } from '@/lib/db';
import ConstituencyDetail from '@/components/ConstituencyDetail';
import { notFound } from 'next/navigation';

export const revalidate = 60; // Cache details for 1 minute

export default async function ConstituencyPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const constituency = await getConstituencyById(params.id);

  if (!constituency) {
    notFound();
  }

  // Convert to plain object
  const plainConstituency = JSON.parse(JSON.stringify(constituency));

  return (
    <div className="container mx-auto py-8">
      <ConstituencyDetail constituency={plainConstituency} />
    </div>
  );
}
