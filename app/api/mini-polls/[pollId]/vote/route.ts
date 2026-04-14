import { NextResponse } from 'next/server';

import { getMiniPoll } from '@/lib/server/repository';
import { readSession, writeSession } from '@/lib/server/session';

export async function POST(request: Request, context: { params: { pollId: string } }) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ message: 'Acceso restringido' }, { status: 401 });
  }

  const { pollId } = context.params;
  const body = (await request.json().catch(() => null)) as { answerId?: string } | null;
  const answerId = body?.answerId?.trim() ?? '';
  const poll = getMiniPoll(session);
  if (!poll || poll.id !== pollId) {
    return NextResponse.json({ message: 'Mini porra no disponible' }, { status: 404 });
  }

  if (poll.status !== 'active') {
    return NextResponse.json({ message: 'Mini porra cerrada' }, { status: 400 });
  }

  const valid = poll.answers.some((answer) => answer.id === answerId);
  if (!valid) {
    return NextResponse.json({ message: 'Respuesta no válida' }, { status: 400 });
  }

  session.pollVotes = {
    ...session.pollVotes,
    [pollId]: answerId,
  };
  await writeSession(session);

  return NextResponse.json({ ok: true, poll: getMiniPoll(session) });
}
