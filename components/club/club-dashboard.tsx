'use client';

import { useMemo, useState } from 'react';

import { CLUB_TABS } from '@/lib/constants';
import { formatPoints } from '@/lib/formatting';
import type { ClubViewModel } from '@/lib/types';
import { EmptyState } from '@/components/ui/empty-state';
import { TeamMark } from '@/components/ui/team-mark';

export function ClubDashboard({ initialClub }: { initialClub: ClubViewModel }) {
  const [club, setClub] = useState(initialClub);
  const [activeTab, setActiveTab] = useState<(typeof CLUB_TABS)[number]>('Resumen');
  const [alias, setAlias] = useState(initialClub.user.handle);
  const [aliasState, setAliasState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [busyTeamId, setBusyTeamId] = useState<string | null>(null);
  const [busyFavoriteId, setBusyFavoriteId] = useState<string | null>(null);

  const activeTeam = useMemo(
    () => club.teams.find((team) => team.id === club.activeTeam.id) ?? club.activeTeam,
    [club.activeTeam, club.teams],
  );

  async function saveAlias() {
    setAliasState('saving');
    try {
      const response = await fetch('/api/club/alias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: alias }),
      });
      const payload = (await response.json()) as { ok?: boolean; handle?: string };
      if (!response.ok || !payload.ok || !payload.handle) throw new Error();
      setClub((current) => ({
        ...current,
        user: { ...current.user, handle: payload.handle! },
        teams: current.teams.map((team) => ({ ...team, ownerHandle: payload.handle! })),
        activeTeam: { ...current.activeTeam, ownerHandle: payload.handle! },
      }));
      setAlias(payload.handle);
      setAliasState('saved');
      window.setTimeout(() => setAliasState('idle'), 1200);
    } catch {
      setAliasState('error');
    }
  }

  async function switchTeam(teamId: string) {
    if (teamId === club.activeTeam.id) return;
    setBusyTeamId(teamId);
    try {
      const response = await fetch('/api/club/active-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId }),
      });
      if (!response.ok) throw new Error();
      const nextTeam = club.teams.find((team) => team.id === teamId);
      if (nextTeam) {
        setClub((current) => ({ ...current, activeTeam: nextTeam }));
      }
    } finally {
      setBusyTeamId(null);
    }
  }

  async function removeFavorite(teamId: string) {
    setBusyFavoriteId(teamId);
    try {
      const response = await fetch(`/api/favorites?teamId=${teamId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      setClub((current) => ({
        ...current,
        favorites: current.favorites.filter((favorite) => favorite.id !== teamId),
      }));
    } finally {
      setBusyFavoriteId(null);
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/mi-club';
  }

  return (
    <div className="stack-lg">
      <section className="panel panel--club-head">
        <div className="panel__header panel__header--spread">
          <div>
            <h2 className="section-title">Mi Club</h2>
            <p className="section-copy">Tus equipos y picks</p>
          </div>
          <button type="button" className="secondary-button" onClick={() => void logout()}>
            Cerrar sesión
          </button>
        </div>

        <div className="club-identity-grid">
          <div className="identity-card">
            <h3>Identidad Pública</h3>
            <p>Alias visible en la porra</p>
            <div className="identity-card__form">
              <input value={alias} onChange={(event: any) => setAlias(event.target.value)} />
              <button type="button" className="primary-button" onClick={() => void saveAlias()} disabled={aliasState === 'saving'}>
                {aliasState === 'saving' ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
            {aliasState === 'saved' ? <span className="status-text success">Guardado</span> : null}
            {aliasState === 'error' ? <span className="status-text error">Error</span> : null}
          </div>

          <div className="team-switcher-card">
            <h3>Mis Equipos</h3>
            <div className="team-switcher-list">
              {club.teams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  className={team.id === activeTeam.id ? 'team-switcher is-active' : 'team-switcher'}
                  onClick={() => void switchTeam(team.id)}
                  disabled={busyTeamId === team.id}
                >
                  <div>
                    <strong>{team.name}</strong>
                    <span>Campeón elegido: {team.championPick ? <TeamMark teamKey={team.championPick} muted /> : 'Pendiente'}</span>
                  </div>
                  <em>{team.id === activeTeam.id ? 'Activo' : 'Seleccionar'}</em>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="club-kpi-grid">
          <div className="club-kpi club-kpi--hero">
            <span>Posición actual</span>
            <strong>#{activeTeam.currentRank} de {club.teams.length === 1 ? 50 : 50}</strong>
            <small>{formatPoints(activeTeam.totalPoints)}</small>
          </div>
          <div className="club-kpi">
            <span>Puntos totales</span>
            <strong>{formatPoints(activeTeam.totalPoints)}</strong>
          </div>
          <div className="club-kpi">
            <span>Puntos fase de grupos</span>
            <strong>{formatPoints(activeTeam.groupPoints)}</strong>
          </div>
          <div className="club-kpi">
            <span>Puntos fase final</span>
            <strong>{activeTeam.finalPhasePoints > 0 ? formatPoints(activeTeam.finalPhasePoints) : 'Pendiente'}</strong>
          </div>
          <div className="club-kpi">
            <span>Puntos especiales</span>
            <strong>{activeTeam.specialPoints > 0 ? formatPoints(activeTeam.specialPoints) : 'Pendiente'}</strong>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="tab-row">
          {CLUB_TABS.map((tab) => (
            <button key={tab} type="button" className={activeTab === tab ? 'tab-chip is-active' : 'tab-chip'} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Resumen' ? <ResumenTab team={activeTeam} /> : null}
        {activeTab === 'Partidos' ? <PartidosTab team={activeTeam} /> : null}
        {activeTab === 'Grupos' ? <GruposTab team={activeTeam} /> : null}
        {activeTab === 'Eliminatorias' ? <EliminatoriasTab team={activeTeam} /> : null}
        {activeTab === 'Especiales' ? <EspecialesTab team={activeTeam} /> : null}
        {activeTab === 'Favoritos' ? <FavoritosTab favorites={club.favorites} busyId={busyFavoriteId} onRemove={removeFavorite} /> : null}
      </section>
    </div>
  );
}

function ResumenTab({ team }: { team: ClubViewModel['activeTeam'] }) {
  return (
    <div className="stack-md">
      <div className="summary-grid">
        <article className="summary-card">
          <span>Puntos por partidos</span>
          <strong>{formatPoints(team.matchPoints)}</strong>
        </article>
        <article className="summary-card">
          <span>Puntos por grupos</span>
          <strong>{formatPoints(team.groupPoints)}</strong>
        </article>
        <article className="summary-card">
          <span>Puntos por eliminatorias</span>
          <strong>{team.finalPhasePoints > 0 ? formatPoints(team.finalPhasePoints) : 'Pendiente'}</strong>
        </article>
        <article className="summary-card">
          <span>Puntos por especiales</span>
          <strong>{team.specialPoints > 0 ? formatPoints(team.specialPoints) : 'Pendiente'}</strong>
        </article>
      </div>
      <div className="summary-note">
        <strong>Resumen ejecutivo</strong>
        <p>
          {team.name} suma {team.summary.exactHits} resultados exactos, {team.summary.signHits} signos acertados y {team.summary.doubleHits} dobles perfectos.
        </p>
      </div>
    </div>
  );
}

function PartidosTab({ team }: { team: ClubViewModel['activeTeam'] }) {
  return (
    <div className="stack-md">
      {team.picks.matches.map((match) => (
        <article key={match.id} className="match-pick-row">
          <div>
            <strong>{match.group} · Jornada {match.jornada}</strong>
            <div className="match-pick-row__teams">
              <TeamMark teamKey={match.homeTeam} muted />
              <span>vs</span>
              <TeamMark teamKey={match.awayTeam} muted />
            </div>
          </div>
          <div className="match-pick-row__result">
            <span>Pronóstico {match.predictedScore}</span>
            <strong>{formatPoints(match.points)}</strong>
          </div>
        </article>
      ))}
    </div>
  );
}

function GruposTab({ team }: { team: ClubViewModel['activeTeam'] }) {
  return (
    <div className="group-grid-cards">
      {team.picks.groups.map((group) => (
        <article key={group.group} className="group-card-simple">
          <div className="group-card-simple__head">
            <strong>Grupo {group.group}</strong>
            <span>{formatPoints(group.points)}</span>
          </div>
          <div className="group-card-simple__body">
            {group.positions.map((position) => (
              <div key={position.team} className="group-card-simple__row">
                <span>{position.predictedPosition}</span>
                <TeamMark teamKey={position.team} muted />
                <strong>{position.predictedPoints}</strong>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function EliminatoriasTab({ team }: { team: ClubViewModel['activeTeam'] }) {
  const blocks = [
    ['Dieciseisavos', team.picks.eliminatorias.dieciseisavos],
    ['Octavos', team.picks.eliminatorias.octavos],
    ['Cuartos', team.picks.eliminatorias.cuartos],
    ['Semifinales', team.picks.eliminatorias.semis],
  ] as const;

  return (
    <div className="stack-md">
      {blocks.map(([title, rows]) => (
        <section key={title} className="knockout-block">
          <h3>{title}</h3>
          <div className="knockout-block__grid">
            {rows.map((row) => (
              <article key={`${title}-${row.slot}`} className="knockout-pick-card">
                <span>#{row.slot}</span>
                <strong>{row.team ? <TeamMark teamKey={row.team} muted /> : 'Pendiente'}</strong>
                <em>Pendiente</em>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="knockout-block knockout-block--hero">
        <h3>Final pronosticada</h3>
        <div className="final-preview-card">
          <div className="final-preview-card__teams">
            <TeamMark teamKey={team.picks.eliminatorias.final[0]?.team} />
            <span>vs</span>
            <TeamMark teamKey={team.picks.eliminatorias.final[1]?.team} />
          </div>
          <div className="final-preview-card__podium">
            <span>Campeón: {team.picks.podium.champion.team ? <TeamMark teamKey={team.picks.podium.champion.team} muted /> : 'Pendiente'}</span>
            <span>Subcampeón: {team.picks.podium.subChampion.team ? <TeamMark teamKey={team.picks.podium.subChampion.team} muted /> : 'Pendiente'}</span>
            <span>Tercer puesto: {team.picks.podium.thirdPlace.team ? <TeamMark teamKey={team.picks.podium.thirdPlace.team} muted /> : 'Pendiente'}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function EspecialesTab({ team }: { team: ClubViewModel['activeTeam'] }) {
  return (
    <div className="stack-md">
      {team.picks.specials.map((special) => (
        <article key={special.key} className="detail-row detail-row--card">
          <span>{special.label}</span>
          <strong>{special.value ?? 'Pendiente'}</strong>
          <em>{special.points ?? 'Pendiente'}</em>
        </article>
      ))}
    </div>
  );
}

function FavoritosTab({
  favorites,
  busyId,
  onRemove,
}: {
  favorites: ClubViewModel['favorites'];
  busyId: string | null;
  onRemove: (teamId: string) => Promise<void>;
}) {
  if (favorites.length === 0) {
    return <EmptyState title="Aún no tienes favoritos" compact />;
  }

  return (
    <div className="favorites-grid">
      {favorites.map((favorite) => (
        <article key={favorite.id} className="favorite-card">
          <div>
            <strong>{favorite.name}</strong>
            <span>{favorite.ownerHandle}</span>
          </div>
          <div className="favorite-card__meta">
            <span>{formatPoints(favorite.totalPoints)}</span>
            <button type="button" className="secondary-button" onClick={() => void onRemove(favorite.id)} disabled={busyId === favorite.id}>
              Quitar de favoritos
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
