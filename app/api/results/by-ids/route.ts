import { NextResponse } from 'next/server';

import { getApiFootballFixturesByIds } from '@/lib/server/api-football';
import { getFixturesPayload } from '@/lib/server/results';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids') ?? '';

  const apiFixtures = await getApiFootballFixturesByIds(ids).catch(() => []);
  if (apiFixtures.length > 0) {
    return NextResponse.json({ source: 'api-football', fixtures: apiFixtures });
  }

  const payload = await getFixturesPayload();
  const requestedIds = ids.split(',').map((value) => value.trim()).filter(Boolean);
  const fixtures = payload.sections
    .flatMap((section) => section.fixtures)
    .filter((fixture) => requestedIds.includes(fixture.id) || requestedIds.includes(fixture.key ?? ''));

  return NextResponse.json({ source: payload.source, fixtures });
}
