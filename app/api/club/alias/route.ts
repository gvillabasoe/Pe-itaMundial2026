import { NextResponse } from 'next/server';

import { normalizeHandle } from '@/lib/formatting';
import { getUserById } from '@/lib/server/repository';
import { readSession, writeSession } from '@/lib/server/session';

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ message: 'Acceso restringido' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { handle?: string } | null;
  const handle = normalizeHandle(body?.handle ?? '');
  if (!handle) {
    return NextResponse.json({ message: 'Completa los campos' }, { status: 400 });
  }

  const user = getUserById(session.userId, session);
  if (!user) {
    return NextResponse.json({ message: 'Acceso restringido' }, { status: 401 });
  }

  session.handle = handle;
  await writeSession(session);
  return NextResponse.json({ ok: true, handle });
}
