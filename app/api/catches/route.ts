import { NextResponse } from 'next/server';
import { getCatches } from '@lib/mongo/catches'; // Adjust the path based on your file structure

export async function GET() {
  try {
    const result = await getCatches();
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json(result.catches, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch catches!' }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Method POST is not implemented' }, { status: 405 });
}
