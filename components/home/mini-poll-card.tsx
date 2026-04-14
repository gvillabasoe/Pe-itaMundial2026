'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import type { MiniPoll } from '@/lib/types';
import { formatDateTimeMadrid } from '@/lib/formatting';
import { EmptyState } from '@/components/ui/empty-state';

export function MiniPollCard({ initialPoll, isLoggedIn }: { initialPoll: MiniPoll | null; isLoggedIn: boolean }) {
  const [poll, setPoll] = useState(initialPoll);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sortedAnswers = useMemo(() => {
    if (!poll) return [];
    return [...poll.answers].sort((left, right) => right.votes - left.votes);
  }, [poll]);

  async function vote(answerId: string) {
    if (!poll || loading) return;
    if (!isLoggedIn) {
      window.location.href = '/mi-club';
      return;
    }

    setError(null);
    setLoading(answerId);
    try {
      const response = await fetch(`/api/mini-polls/${poll.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerId }),
      });
      const payload = (await response.json()) as { poll?: MiniPoll; message?: string };
      if (!response.ok || !payload.poll) {
        throw new Error(payload.message || 'No se pudo enviar la respuesta');
      }
      setPoll(payload.poll);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la respuesta');
    } finally {
      setLoading(null);
    }
  }

  if (!poll) {
    return (
      <section className="panel">
        <h2 className="section-title">Mini porra</h2>
        <EmptyState title="Próximamente habrá nuevas mini porras" compact />
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h2 className="section-title">Mini porra</h2>
          <p className="section-copy">{poll.title}</p>
        </div>
        <span className={poll.status === 'active' ? 'status-pill status-pill--upcoming' : 'status-pill'}>
          {poll.status === 'active' ? 'Encuesta abierta' : 'Cerrada'}
        </span>
      </div>

      <div className="mini-poll">
        <div className="mini-poll__meta">
          <span>Publicada: {formatDateTimeMadrid(poll.publishedAt)}</span>
          <span>Cierra: {formatDateTimeMadrid(poll.closesAt)}</span>
        </div>

        <div className="mini-poll__answers">
          {sortedAnswers.map((answer) => {
            const selected = poll.userVote === answer.id;
            return (
              <button
                key={answer.id}
                type="button"
                className={selected ? 'vote-row is-selected' : 'vote-row'}
                onClick={() => vote(answer.id)}
                disabled={poll.status !== 'active' || Boolean(loading)}
              >
                <span className="vote-row__label">{answer.label}</span>
                <span className="vote-row__bar">
                  <span className="vote-row__fill" style={{ width: `${answer.percentage}%` }} />
                </span>
                <span className="vote-row__value">{answer.percentage}%</span>
              </button>
            );
          })}
        </div>

        <div className="mini-poll__footer">
          {poll.status === 'active' ? (
            <span className="mini-poll__cta">Responder mini porra</span>
          ) : (
            <span className="mini-poll__cta">Ver resultados</span>
          )}
          {!isLoggedIn && poll.status === 'active' ? <Link href="/mi-club">Entrar a Mi Club</Link> : null}
        </div>
        {error ? <p className="form-error">{error}</p> : null}
      </div>
    </section>
  );
}
