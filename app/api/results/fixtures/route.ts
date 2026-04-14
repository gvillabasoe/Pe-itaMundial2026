import { NextResponse } from 'next/server';

import { getFixturesPayload } from '@/lib/server/results';

export async function GET() {
  const payload = await getFixturesPayload();
  return NextResponse.json(payload);
}
