import { NextRequest, NextResponse } from 'next/server';
import { getConstituencyById, addCorrection } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const constituency = await getConstituencyById(id);

    if (!constituency) {
      return NextResponse.json({ error: 'Constituency not found' }, { status: 404 });
    }

    return NextResponse.json(constituency);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { name, email, note, sourceUrl, fileName, promiseId } = body;

    // Validate request body
    if (!name || !email || !note || !promiseId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await addCorrection(id, {
      promiseId,
      name,
      email,
      note,
      sourceUrl,
      fileName,
    });

    if (result.success) {
      return NextResponse.json({ message: 'Correction submitted successfully' });
    } else {
      return NextResponse.json({ error: result.error || 'Failed to submit correction' }, { status: 500 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
