'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import type { Team, TeamListItem } from '@/lib/types';
import { formatPoints } from '@/lib/formatting';
import { EmptyState } from '@/components/ui/empty-state';
import { SourceBadge } from '@/components/ui/source-badge';
import { TeamDetailSheet } from '@/components/ranking/team-detail-sheet';

export function RankingPage({
  initialTeams,
  sourceLabel,
  loggedIn,
}: {
  initialTeams: TeamListItem[];
  sourceLabel: string;
  loggedIn: boolean;
}) {
  const [filter, setFilter] = useState<'all' | 'mine' | 'top10' | 'ties'>('all');
  const [teams, setTeams] = useState(initialTeams);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [favoriteHint, setFavoriteHint] = useState<string | null>(null);

  const visibleTeams = useMemo(() => {
    const pointsCount = new Map<number, number>();
    teams.forEach((team) => pointsCount.set(team.totalPoints, (pointsCount.get(team.totalPoints) ?? 0) + 1));

    if (filter === 'mine') return teams.filter((team) => team.isCurrentUserTeam);
    if (filter === 'top10') return teams.slice(0, 10);
    if (filter === 'ties') return teams.filter((team) => (pointsCount.get(team.totalPoints) ?? 0) > 1);
    return teams;
  }, [filter, teams]);

  async function openTeam(teamId: string) {
    setSelectedId(teamId);
    setLoading(true);
    setDetailError(null);
    try {
      const response = await fetch(`/api/team/${teamId}`);
      const payload = (await response.json()) as { team?: Team; message?: string };
      if (!response.ok || !payload.team) throw new Error(payload.message || 'No se pudo cargar el detalle');
      setSelectedTeam(payload.team);
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : 'No se pudo cargar el detalle');
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite(team: TeamListItem, event: any) {
    event.stopPropagation();
    setFavoriteHint(null);

    if (!loggedIn) {
      setFavoriteHint('Acceso restringido');
      return;
    }

    const method = team.isFavorite ? 'DELETE' : 'POST';
    const response = await fetch(`/api/favorites${method === 'DELETE' ? `?teamId=${team.id}` : ''}`, {
      method,
      headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
      body: method === 'POST' ? JSON.stringify({ teamId: team.id }) : undefined,
    });

    if (!response.ok) return;

    setTeams((current) =>
      current.map((item) => (item.id === team.id ? { ...item, isFavorite: !item.isFavorite } : item)),
    );
  }

  return (
    <div className="stack-lg">
      <div className="toolbar-card">
        <div className="filter-group">
          <button type="button" className={filter === 'all' ? 'filter-chip is-active' : 'filter-chip'} onClick={() => setFilter('all')}>
            Todos
          </button>
          <button type="button" className={filter === 'mine' ? 'filter-chip is-active' : 'filter-chip'} onClick={() => setFilter('mine')}>
            Mis equipos
          </button>
          <button type="button" className={filter === 'top10' ? 'filter-chip is-active' : 'filter-chip'} onClick={() => setFilter('top10')}>
            Top 10
          </button>
          <button type="button" className={filter === 'ties' ? 'filter-chip is-active' : 'filter-chip'} onClick={() => setFilter('ties')}>
            Empatados
          </button>
        </div>
        <SourceBadge label={sourceLabel} />
      </div>

      {favoriteHint === 'Acceso restringido' ? (
        <div className="inline-gate">
          <span>Acceso restringido</span>
          <Link href="/mi-club">Entrar a Mi Club</Link>
        </div>
      ) : null}

      {visibleTeams.length === 0 ? (
        <EmptyState title="La clasificación se actualizará según avance el torneo" />
      ) : (
        <div className="ranking-list">
          {visibleTeams.map((team) => (
            <article
              key={team.id}
              className={team.isCurrentUserTeam ? 'ranking-item is-own' : 'ranking-item'}
              role="button"
              tabIndex={0}
              onClick={() => openTeam(team.id)}
              onKeyDown={(event: any) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  void openTeam(team.id);
                }
              }}
            >
              <div className="ranking-item__rank">#{team.currentRank}</div>
              <div className="ranking-item__main">
                <div className="ranking-item__title-row">
                  <strong>{team.name}</strong>
                  {team.hasSiblingTeams ? <span className="soft-chip">Mismo @usuario</span> : null}
                </div>
                <span className="ranking-item__owner">{team.ownerHandle}</span>
              </div>
              <div className="ranking-item__points">{formatPoints(team.totalPoints)}</div>
              <button type="button" className={team.isFavorite ? 'star-button is-active' : 'star-button'} onClick={(event: any) => void toggleFavorite(team, event)} aria-label="Guardar favorito">
                ★
              </button>
            </article>
          ))}
        </div>
      )}

      <TeamDetailSheet
        open={Boolean(selectedId)}
        team={selectedTeam}
        loading={loading}
        error={detailError}
        onClose={() => {
          setSelectedId(null);
          setSelectedTeam(null);
          setDetailError(null);
        }}
      />
    </div>
  );
}
