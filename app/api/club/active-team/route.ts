import { NextResponse } from 'next/server';

import { isTeamOwnedByUser } from '@/lib/server/repository';
import { readSession, writeSession } from '@/lib/server/session';

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ message: 'Acceso restringido' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { teamId?: string } | null;
  const teamId = body?.teamId?.trim() ?? '';
  if (!teamId || !isTeamOwnedByUser(teamId, session)) {
    return NextResponse.json({ message: 'Equipo no disponible' }, { status: 400 });
  }

  session.activeTeamId = teamId;
  await writeSession(session);
  return NextResponse.json({ ok: true, activeTeamId: teamId });
}
