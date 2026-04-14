import { NextResponse } from 'next/server';

import { getApiFootballLiveFixtures } from '@/lib/server/api-football';
import { getFixturesPayload } from '@/lib/server/results';

export async function GET() {
  const liveFixtures = await getApiFootballLiveFixtures().catch(() => []);
  if (liveFixtures.length > 0) {
    return NextResponse.json({ source: 'api-football', fixtures: liveFixtures });
  }

  const fallback = await getFixturesPayload();
  const fixtures = fallback.sections.flatMap((section) => section.fixtures).filter((fixture) => fixture.status === 'live');
  return NextResponse.json({ source: fallback.source, fixtures });
}
