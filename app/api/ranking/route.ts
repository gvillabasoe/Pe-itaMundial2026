import { NextResponse } from 'next/server';

import { getRankingView } from '@/lib/server/repository';
import { readSession } from '@/lib/server/session';

export async function GET() {
  const session = await readSession();
  return NextResponse.json(getRankingView(session));
}
