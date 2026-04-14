import { NextResponse } from 'next/server';

import { getUserByHandle } from '@/lib/server/repository';
import { createSession, writeSession } from '@/lib/server/session';
import { normalizeHandle } from '@/lib/formatting';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { handle?: string; password?: string } | null;
  const handle = normalizeHandle(body?.handle ?? '');
  const password = body?.password?.trim() ?? '';

  if (!handle || !password) {
    return NextResponse.json({ message: 'Completa los campos' }, { status: 400 });
  }

  const user = getUserByHandle(handle);
  if (!user || user.password !== password) {
    return NextResponse.json({ message: 'Credenciales incorrectas' }, { status: 401 });
  }

  await writeSession(createSession(user));

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      handle: user.handle,
      teamIds: user.teamIds,
    },
  });
}
