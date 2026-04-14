import { NextResponse } from 'next/server';

import { getTeamById } from '@/lib/server/repository';
import { readSession } from '@/lib/server/session';

export async function GET(_: Request, context: { params: { teamId: string } }) {
  const session = await readSession();
  const { teamId } = context.params;
  const team = getTeamById(teamId, session);
  if (!team) {
    return NextResponse.json({ message: 'Equipo no disponible' }, { status: 404 });
  }
  return NextResponse.json({ team });
}
