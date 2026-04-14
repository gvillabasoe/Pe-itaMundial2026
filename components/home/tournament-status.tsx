'use client';

import { useEffect, useMemo, useState } from 'react';

import { countdownParts, fixtureStateLabel, formatDateMadrid, formatTimeMadrid, getScoreLabel } from '@/lib/formatting';
import type { TournamentStatusView } from '@/lib/types';
import { EmptyState } from '@/components/ui/empty-state';
import { TeamMark } from '@/components/ui/team-mark';

export function TournamentStatusCard({ status }: { status: TournamentStatusView }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (status.mode !== 'countdown') return;
    const timer = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status.mode]);

  const countdown = useMemo(() => {
    if (status.mode !== 'countdown') return null;
    return countdownParts(status.kickoff);
  }, [status, status.mode, tick]);

  if (status.mode === 'countdown') {
    if (!countdown) return null;

    return (
      <section className="panel card-grid card-grid--status">
        <div className="panel__header">
          <div>
            <h2 className="section-title">Estado del torneo</h2>
            <p className="section-copy">Cuenta atrás oficial hasta México vs Sudáfrica · 11 de junio de 2026 · 21:00 · Europe/Madrid.</p>
          </div>
          <span className="status-pill status-pill--upcoming">Pendiente</span>
        </div>

        <div className="match-card match-card--hero">
          <div className="match-card__teams match-card__teams--hero">
            <TeamMark teamKey={status.homeTeam} />
            <span className="match-card__separator">vs</span>
            <TeamMark teamKey={status.awayTeam} />
          </div>
          <div className="countdown-grid" aria-live="polite">
            <CountBox label="Días" value={countdown.days} />
            <CountBox label="Horas" value={countdown.hours} />
            <CountBox label="Min" value={countdown.minutes} />
            <CountBox label="Seg" value={countdown.seconds} />
          </div>
        </div>
      </section>
    );
  }

  const fixture = status.fixture;
  if (!fixture) {
    return (
      <section className="panel">
        <h2 className="section-title">Estado del torneo</h2>
        <EmptyState title="Próximo partido" text="No se ha podido calcular el siguiente encuentro." />
      </section>
    );
  }

  return (
    <section className="panel card-grid card-grid--status">
      <div className="panel__header">
        <div>
          <h2 className="section-title">Estado del torneo</h2>
          <p className="section-copy">{fixture.status === 'live' ? 'En directo' : 'Próximo partido'}</p>
        </div>
        <span className={fixture.status === 'live' ? 'status-pill status-pill--live' : 'status-pill status-pill--upcoming'}>
          {fixtureStateLabel(fixture.status)}
        </span>
      </div>

      <div className="match-card match-card--hero">
        <div className="match-card__teams match-card__teams--hero">
          <TeamMark teamKey={fixture.homeTeam} />
          <strong className="match-card__score">{getScoreLabel(fixture.score.home, fixture.score.away)}</strong>
          <TeamMark teamKey={fixture.awayTeam} />
        </div>
        <div className="match-card__meta">
          <span>{formatDateMadrid(fixture.kickoff)}</span>
          <span>{fixture.status === 'live' ? `${fixture.minute ?? 0}'` : formatTimeMadrid(fixture.kickoff)}</span>
        </div>
      </div>
    </section>
  );
}

function CountBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="count-box">
      <strong>{String(value).padStart(2, '0')}</strong>
      <span>{label}</span>
    </div>
  );
}
