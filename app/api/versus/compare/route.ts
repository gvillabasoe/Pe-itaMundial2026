import { NextResponse } from 'next/server';

import { buildVersusComparison, getAvailableRivals } from '@/lib/server/versus';
import { readSession, writeSession } from '@/lib/server/session';

export async function GET(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ message: 'Acceso restringido' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') === 'participant' ? 'participant' : 'general';
  const rivalTeamId = searchParams.get('rivalTeamId');
  const filter = searchParams.get('filter') === 'different' ? 'different' : searchParams.get('filter') === 'same' ? 'same' : 'all';
  const tab = (searchParams.get('tab') as typeof session.versusPreferences.tab | null) ?? 'resumen';

  session.versusPreferences = {
    mode,
    rivalTeamId,
    filter,
    tab,
  };
  await writeSession(session);

  const comparison = buildVersusComparison(session, mode, rivalTeamId);
  if (!comparison) {
    return NextResponse.json({ message: 'Selecciona un rival distinto' }, { status: 400 });
  }

  return NextResponse.json({ comparison, availableRivals: getAvailableRivals(session), preferences: session.versusPreferences });
}
