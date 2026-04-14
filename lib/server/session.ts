import 'server-only';

import { cookies } from 'next/headers';

import type { SessionState, User } from '@/lib/types';

export const SESSION_COOKIE = 'penita_mundial_session';

export function createSession(user: User): SessionState {
  return {
    userId: user.id,
    handle: user.handle,
    activeTeamId: user.teamIds[0] ?? '',
    favorites: [],
    versusPreferences: {
      mode: user.versusPreferences.mode,
      rivalTeamId: null,
      filter: 'all',
      tab: 'resumen',
    },
    pollVotes: {},
  };
}

export async function readSession(): Promise<SessionState | null> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  if (!value) return null;

  try {
    const decoded = Buffer.from(value, 'base64url').toString('utf-8');
    const parsed = JSON.parse(decoded) as SessionState;
    if (!parsed.userId || !parsed.handle) return null;
    return {
      ...parsed,
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      pollVotes: parsed.pollVotes ?? {},
      versusPreferences: parsed.versusPreferences ?? {
        mode: 'general',
        rivalTeamId: null,
        filter: 'all',
        tab: 'resumen',
      },
    };
  } catch {
    return null;
  }
}

export async function writeSession(session: SessionState): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, Buffer.from(JSON.stringify(session), 'utf-8').toString('base64url'), {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
