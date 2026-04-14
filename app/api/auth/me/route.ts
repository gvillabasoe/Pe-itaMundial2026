import { NextResponse } from 'next/server';

import { getClubViewModel } from '@/lib/server/repository';
import { readSession } from '@/lib/server/session';

export async function GET() {
  const session = await readSession();
  const club = getClubViewModel(session);
  if (!session || !club) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({
    user: {
      id: club.user.id,
      handle: club.user.handle,
      teamIds: club.user.teamIds,
      activeTeamId: club.activeTeam.id,
      favorites: club.user.favorites,
    },
  });
}
