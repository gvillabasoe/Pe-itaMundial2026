'use client';

import { useMemo, useState } from 'react';

import type { ComparisonValue, Team, TeamListItem, VersusComparison, VersusPreferences } from '@/lib/types';
import { formatPoints } from '@/lib/formatting';
import { EmptyState } from '@/components/ui/empty-state';

const FILTER_LABELS = {
  all: 'Ver todo',
  different: 'Solo diferencias',
  same: 'Solo coincidencias',
} as const;

const TAB_LABELS = {
  resumen: 'Resumen',
  grupos: 'Grupos',
  eliminatorias: 'Eliminatorias',
  final: 'Final',
  podio: 'Podio',
  especiales: 'Especiales',
} as const;

export function VersusPage({
  initialComparison,
  initialPreferences,
  baseTeam,
  ownedTeams,
  rivals,
}: {
  initialComparison: VersusComparison;
  initialPreferences: VersusPreferences;
  baseTeam: Team;
  ownedTeams: Team[];
  rivals: TeamListItem[];
}) {
  const [comparison, setComparison] = useState(initialComparison);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [currentBaseTeam, setCurrentBaseTeam] = useState(baseTeam);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const apply = (items: ComparisonValue[]) => {
      if (preferences.filter === 'different') return items.filter((item) => item.relation === 'different');
      if (preferences.filter === 'same') return items.filter((item) => item.relation === 'same');
      return items;
    };

    return {
      groupMatches: apply(comparison.sections.groupMatches),
      groupPositions: apply(comparison.sections.groupPositions),
      eliminatorias: apply(comparison.sections.eliminatorias),
      final: apply(comparison.sections.final),
      podium: apply(comparison.sections.podium),
      specials: apply(comparison.sections.specials),
    };
  }, [comparison, preferences.filter]);

  async function load(next: Partial<VersusPreferences>) {
    const merged = { ...preferences, ...next };
    setPreferences(merged);
    setMessage(null);
    setLoading(true);
    try {
      const query = new URLSearchParams({
        mode: merged.mode,
        filter: merged.filter,
        tab: merged.tab,
      });
      if (merged.rivalTeamId) query.set('rivalTeamId', merged.rivalTeamId);

      const response = await fetch(`/api/versus/compare?${query.toString()}`, { cache: 'no-store' });
      const payload = (await response.json()) as { comparison?: VersusComparison; message?: string; preferences?: VersusPreferences };
      if (!response.ok || !payload.comparison || !payload.preferences) {
        throw new Error(payload.message || 'No se pudo cargar el duelo');
      }
      setComparison(payload.comparison);
      setPreferences(payload.preferences);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo cargar el duelo');
    } finally {
      setLoading(false);
    }
  }

  async function changeBaseTeam(teamId: string) {
    if (teamId === currentBaseTeam.id) return;
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/club/active-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId }),
      });
      if (!response.ok) throw new Error('No se pudo cambiar el equipo base');
      const nextBase = ownedTeams.find((team) => team.id === teamId);
      if (nextBase) setCurrentBaseTeam(nextBase);
      await load({ rivalTeamId: preferences.mode === 'participant' ? preferences.rivalTeamId : null });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo cambiar el equipo base');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack-lg">
      <section className="panel panel--versus-head">
        <div className="versus-head-grid">
          <div>
            <h2 className="section-title">Cara a cara</h2>
            <p className="section-copy">{currentBaseTeam.name} · {currentBaseTeam.ownerHandle}</p>
          </div>
          <div className="versus-base-meta">
            <span>Posición actual #{currentBaseTeam.currentRank}</span>
            <strong>{formatPoints(currentBaseTeam.totalPoints)}</strong>
          </div>
        </div>

        <div className="toolbar-card toolbar-card--split toolbar-card--plain">
          <div className="toolbar-card__cluster">
            <div className="field-inline">
              <span>Equipo base</span>
              <select value={currentBaseTeam.id} onChange={(event: any) => void changeBaseTeam(event.target.value)}>
                {ownedTeams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <button type="button" className={preferences.mode === 'general' ? 'filter-chip is-active' : 'filter-chip'} onClick={() => void load({ mode: 'general', rivalTeamId: null })}>
                General
              </button>
              <button type="button" className={preferences.mode === 'participant' ? 'filter-chip is-active' : 'filter-chip'} onClick={() => void load({ mode: 'participant', rivalTeamId: preferences.rivalTeamId ?? rivals[0]?.id ?? null })}>
                Participante
              </button>
            </div>
            {preferences.mode === 'participant' ? (
              <div className="field-inline">
                <span>Rival</span>
                <select
                  value={preferences.rivalTeamId ?? ''}
                  onChange={(event: any) => void load({ rivalTeamId: event.target.value || null })}
                >
                  {rivals.length === 0 ? <option value="">No hay rival disponible</option> : null}
                  {rivals.map((rival) => (
                    <option key={rival.id} value={rival.id}>{rival.name} · {rival.ownerHandle}</option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
        </div>

        <div className="summary-grid">
          <article className="summary-card">
            <span>% iguales</span>
            <strong>{comparison.equalPickPercentage}%</strong>
          </article>
          <article className="summary-card">
            <span>Picks distintos</span>
            <strong>{comparison.differentPickCount}</strong>
          </article>
          <article className="summary-card">
            <span>Diferencia de puntos</span>
            <strong>{comparison.pointDelta > 0 ? `+${comparison.pointDelta}` : comparison.pointDelta}</strong>
          </article>
          <article className="summary-card">
            <span>Mayor diferencia</span>
            <strong>{comparison.biggestDifferenceSection}</strong>
          </article>
        </div>

        <div className="legend-row">
          <span className="legend-chip is-hit">Ambos aciertan</span>
          <span className="legend-chip is-split">Uno acierta / otro falla</span>
          <span className="legend-chip is-miss">Ambos fallan</span>
          <span className="legend-chip">Pendiente</span>
        </div>
      </section>

      <section className="panel">
        <div className="tab-row">
          {(Object.keys(TAB_LABELS) as Array<keyof typeof TAB_LABELS>).map((tab) => (
            <button key={tab} type="button" className={preferences.tab === tab ? 'tab-chip is-active' : 'tab-chip'} onClick={() => void load({ tab })}>
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        <div className="filter-group filter-group--wrap">
          {(Object.keys(FILTER_LABELS) as Array<keyof typeof FILTER_LABELS>).map((key) => (
            <button key={key} type="button" className={preferences.filter === key ? 'filter-chip is-active' : 'filter-chip'} onClick={() => void load({ filter: key })}>
              {FILTER_LABELS[key]}
            </button>
          ))}
        </div>

        {message ? <p className="form-error">{message}</p> : null}
        {loading ? <div className="skeleton-block" /> : null}

        {!loading && preferences.tab === 'resumen' ? (
          <div className="summary-grid">
            {comparison.sections.resumen.map((item) => (
              <article key={item.key} className="summary-card">
                <span>{item.label}</span>
                <strong>{item.delta > 0 ? `+${item.delta}` : item.delta}</strong>
                <small>{item.differentCount} picks distintos</small>
              </article>
            ))}
          </div>
        ) : null}

        {!loading && preferences.tab === 'grupos' ? (
          <div className="stack-md">
            <ComparisonSection title="Partidos de grupo" items={filtered.groupMatches} referenceLabel={comparison.referenceLabel} baseLabel={currentBaseTeam.name} />
            <ComparisonSection title="Posiciones de grupo" items={filtered.groupPositions} referenceLabel={comparison.referenceLabel} baseLabel={currentBaseTeam.name} />
          </div>
        ) : null}

        {!loading && preferences.tab === 'eliminatorias' ? (
          <ComparisonSection title="Eliminatorias" items={filtered.eliminatorias} referenceLabel={comparison.referenceLabel} baseLabel={currentBaseTeam.name} />
        ) : null}
        {!loading && preferences.tab === 'final' ? (
          <ComparisonSection title="Final" items={filtered.final} referenceLabel={comparison.referenceLabel} baseLabel={currentBaseTeam.name} />
        ) : null}
        {!loading && preferences.tab === 'podio' ? (
          <ComparisonSection title="Podio" items={filtered.podium} referenceLabel={comparison.referenceLabel} baseLabel={currentBaseTeam.name} />
        ) : null}
        {!loading && preferences.tab === 'especiales' ? (
          <ComparisonSection title="Especiales" items={filtered.specials} referenceLabel={comparison.referenceLabel} baseLabel={currentBaseTeam.name} />
        ) : null}
      </section>
    </div>
  );
}

function ComparisonSection({
  title,
  items,
  baseLabel,
  referenceLabel,
}: {
  title: string;
  items: ComparisonValue[];
  baseLabel: string;
  referenceLabel: string;
}) {
  if (items.length === 0) {
    return <EmptyState title="Pendiente" text="No hay elementos visibles con el filtro actual." compact />;
  }

  return (
    <div className="stack-md">
      <h3 className="subheading">{title}</h3>
      <div className="versus-list">
        {items.map((item) => (
          <article key={`${title}-${item.label}`} className={`versus-card is-${item.outcome}`}>
            <div className="versus-card__head">
              <strong>{item.label}</strong>
              <span className="soft-chip">{stateLabel(item.outcome)}</span>
            </div>
            <div className="versus-card__grid">
              <div className="versus-card__side">
                <span>{baseLabel}</span>
                <strong>{item.base.values.join(' · ')}</strong>
                <small>{item.base.points === null ? 'Pendiente' : `${item.base.points} pts`}</small>
              </div>
              <div className="versus-card__side">
                <span>{referenceLabel}</span>
                <strong>{item.reference.values.join(' · ')}</strong>
                <small>{item.reference.points === null ? 'Pendiente' : `${item.reference.points} pts`}</small>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function stateLabel(outcome: ComparisonValue['outcome']) {
  if (outcome === 'both-hit') return 'Ambos aciertan';
  if (outcome === 'both-miss') return 'Ambos fallan';
  if (outcome === 'split') return 'Uno acierta / otro falla';
  return 'Pendiente';
}
