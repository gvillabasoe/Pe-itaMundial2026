'use client';

import { useEffect, useMemo, useState } from 'react';

import { GROUP_COLORS } from '@/lib/constants';
import { fixtureStateLabel, formatDateMadrid, formatTimeMadrid, getScoreLabel } from '@/lib/formatting';
import type { Fixture, FixturesPayload } from '@/lib/types';
import { EmptyState } from '@/components/ui/empty-state';
import { SourceBadge } from '@/components/ui/source-badge';
import { TeamMark } from '@/components/ui/team-mark';

function sortFixtures(fixtures: Fixture[]) {
  const stateWeight = { live: 0, scheduled: 1, finished: 2 } as const;
  return [...fixtures].sort((left, right) => {
    const stateDelta = stateWeight[left.status] - stateWeight[right.status];
    if (stateDelta !== 0) return stateDelta;
    return new Date(left.kickoff).getTime() - new Date(right.kickoff).getTime();
  });
}

function kickoffCountdown(input: string) {
  const diffMs = new Date(input).getTime() - Date.now();
  if (diffMs <= 0) return 'Ahora';
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 60) return `${diffMinutes} min`;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return `${hours} h ${minutes} min`;
}

export function ResultsPage({ initialPayload }: { initialPayload: FixturesPayload }) {
  const [payload, setPayload] = useState(initialPayload);
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'live' | 'finished'>('all');
  const [phaseFilter, setPhaseFilter] = useState<'all' | 'groups' | 'knockout'>('all');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(initialPayload.sections.map((section) => [section.key, true])),
  );

  useEffect(() => {
    let cancelled = false;
    const interval = window.setInterval(async () => {
      try {
        const response = await fetch('/api/results/fixtures', { cache: 'no-store' });
        const nextPayload = (await response.json()) as FixturesPayload;
        if (!cancelled) {
          setPayload(nextPayload);
          setOpenSections((current) => {
            const next = { ...current };
            nextPayload.sections.forEach((section) => {
              if (!(section.key in next)) next[section.key] = true;
            });
            return next;
          });
        }
      } catch {
        // noop
      }
    }, payload.hasLive ? 15000 : 60000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [payload.hasLive]);

  const visibleSections = useMemo(() => {
    return payload.sections
      .filter((section) => (phaseFilter === 'all' ? true : phaseFilter === 'groups' ? section.phase === 'groups' : section.phase === 'knockout'))
      .map((section) => ({
        ...section,
        fixtures: sortFixtures(
          section.fixtures.filter((fixture) => (statusFilter === 'all' ? true : fixture.status === statusFilter)),
        ),
      }))
      .filter((section) => section.fixtures.length > 0);
  }, [payload, phaseFilter, statusFilter]);

  return (
    <div className="stack-lg">
      <div className="toolbar-card toolbar-card--split">
        <div className="toolbar-card__cluster">
          <div className="filter-group">
            <button type="button" className={statusFilter === 'all' ? 'filter-chip is-active' : 'filter-chip'} onClick={() => setStatusFilter('all')}>
              Todos
            </button>
            <button type="button" className={statusFilter === 'scheduled' ? 'filter-chip is-active' : 'filter-chip'} onClick={() => setStatusFilter('scheduled')}>
              No empezados
            </button>
            <button type="button" className={statusFilter === 'live' ? 'filter-chip is-active' : 'filter-chip'} onClick={() => setStatusFilter('live')}>
              En directo
            </button>
            <button type="button" className={statusFilter === 'finished' ? 'filter-chip is-active' : 'filter-chip'} onClick={() => setStatusFilter('finished')}>
              Finalizados
            </button>
          </div>
          <div className="filter-group">
            <button type="button" className={phaseFilter === 'all' ? 'filter-chip is-active' : 'filter-chip'} onClick={() => setPhaseFilter('all')}>
              Todos
            </button>
            <button type="button" className={phaseFilter === 'groups' ? 'filter-chip is-active' : 'filter-chip'} onClick={() => setPhaseFilter('groups')}>
              Grupos
            </button>
            <button type="button" className={phaseFilter === 'knockout' ? 'filter-chip is-active' : 'filter-chip'} onClick={() => setPhaseFilter('knockout')}>
              Eliminatorias
            </button>
          </div>
        </div>
        <SourceBadge label={payload.source === 'api-football' ? 'API-FOOTBALL activa' : 'Mock listo para sustituir'} />
      </div>

      {visibleSections.length === 0 ? (
        <EmptyState title="Pendiente" text="No hay partidos visibles con los filtros actuales." />
      ) : (
        visibleSections.map((section) => (
          <section key={section.key} className="panel">
            <button
              type="button"
              className="section-toggle"
              onClick={() => setOpenSections((current) => ({ ...current, [section.key]: !current[section.key] }))}
            >
              <span>{section.title}</span>
              <span>{openSections[section.key] ? '−' : '+'}</span>
            </button>

            {openSections[section.key] ? (
              <div className="results-grid">
                {section.fixtures.map((fixture) => (
                  <FixtureCard key={fixture.id} fixture={fixture} />
                ))}
              </div>
            ) : null}
          </section>
        ))
      )}
    </div>
  );
}

function FixtureCard({ fixture }: { fixture: Fixture; key?: string }) {
  const groupColor = fixture.group ? GROUP_COLORS[fixture.group as keyof typeof GROUP_COLORS] : undefined;
  const cardClass =
    fixture.status === 'live' ? 'fixture-card is-live' : fixture.status === 'scheduled' ? 'fixture-card is-upcoming' : 'fixture-card';

  return (
    <article className={cardClass}>
      <div className="fixture-card__top">
        <span className={fixture.status === 'live' ? 'status-pill status-pill--live' : fixture.status === 'scheduled' ? 'status-pill status-pill--upcoming' : 'status-pill'}>
          {fixtureStateLabel(fixture.status)}
        </span>
        {fixture.group ? (
          <span className="group-tag" style={{ backgroundColor: groupColor }}>
            Grupo {fixture.group}
          </span>
        ) : (
          <span className="soft-chip">{fixture.roundLabel}</span>
        )}
      </div>

      <div className="fixture-card__teams">
        <TeamMark teamKey={fixture.homeTeam} />
        <strong className="fixture-card__score">{getScoreLabel(fixture.score.home, fixture.score.away)}</strong>
        <TeamMark teamKey={fixture.awayTeam} />
      </div>

      <div className="fixture-card__meta">
        {fixture.status === 'live' ? <span>{fixture.minute ?? 0}'</span> : <span>{formatTimeMadrid(fixture.kickoff)}</span>}
        {fixture.status === 'scheduled' ? <span>{kickoffCountdown(fixture.kickoff)}</span> : <span>{formatDateMadrid(fixture.kickoff)}</span>}
      </div>

      <div className="fixture-card__events">
        {fixture.status === 'scheduled' ? (
          <span>Aún sin eventos</span>
        ) : fixture.goals.length === 0 ? (
          <span>Sin goles todavía</span>
        ) : (
          fixture.goals.map((goal, index) => <span key={`${goal.scorer}-${goal.minute}-${index}`}>{goal.scorer} {goal.minute}’</span>)
        )}
      </div>
    </article>
  );
}
