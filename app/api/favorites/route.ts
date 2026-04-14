import { NextResponse } from 'next/server';

import { getTeamById } from '@/lib/server/repository';
import { readSession, writeSession } from '@/lib/server/session';

export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ favorites: [] });
  }

  const favorites = session.favorites
    .map((teamId) => getTeamById(teamId, session))
    .filter((team): team is NonNullable<typeof team> => Boolean(team));

  return NextResponse.json({ favorites });
}

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ message: 'Acceso restringido' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { teamId?: string } | null;
  const teamId = body?.teamId?.trim() ?? '';
  if (!teamId || !getTeamById(teamId, session)) {
    return NextResponse.json({ message: 'Equipo no disponible' }, { status: 400 });
  }

  if (!session.favorites.includes(teamId)) {
    session.favorites = [...session.favorites, teamId];
    await writeSession(session);
  }

  return NextResponse.json({ ok: true, favorites: session.favorites });
}

export async function DELETE(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ message: 'Acceso restringido' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId') ?? '';
  session.favorites = session.favorites.filter((favoriteId) => favoriteId !== teamId);
  await writeSession(session);
  return NextResponse.json({ ok: true, favorites: session.favorites });
}
