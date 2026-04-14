'use client';

import type { Team } from '@/lib/types';
import { formatPoints } from '@/lib/formatting';
import { EmptyState } from '@/components/ui/empty-state';
import { TeamMark } from '@/components/ui/team-mark';

export function TeamDetailSheet({
  open,
  team,
  loading,
  error,
  onClose,
}: {
  open: boolean;
  team: Team | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}) {
  return (
    <>
      <div className={open ? 'sheet-backdrop is-open' : 'sheet-backdrop'} onClick={onClose} />
      <aside className={open ? 'sheet is-open' : 'sheet'} aria-hidden={!open}>
        <div className="sheet__header">
          <div>
            <span className="sheet__eyebrow">Detalle contextual</span>
            <h3 className="sheet__title">{team ? team.name : 'Participante'}</h3>
            {team ? <p className="sheet__subtitle">{team.ownerHandle}</p> : null}
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        {loading ? <div className="skeleton-block" /> : null}
        {error ? <p className="form-error">{error}</p> : null}
        {!loading && !error && !team ? <EmptyState title="Aún no disponible" compact /> : null}

        {team ? (
          <div className="sheet__body">
            <div className="kpi-strip">
              <div className="kpi-strip__item is-accent">
                <span>Total</span>
                <strong>{formatPoints(team.totalPoints)}</strong>
              </div>
              <div className="kpi-strip__item">
                <span>Puntos fase de grupos</span>
                <strong>{formatPoints(team.groupPoints)}</strong>
              </div>
              <div className="kpi-strip__item">
                <span>Puntos fase eliminatoria</span>
                <strong>{team.finalPhasePoints > 0 ? formatPoints(team.finalPhasePoints) : 'Pendiente'}</strong>
              </div>
              <div className="kpi-strip__item">
                <span>Puntos especiales</span>
                <strong>{team.specialPoints > 0 ? formatPoints(team.specialPoints) : 'Pendiente'}</strong>
              </div>
            </div>

            <section className="detail-block">
              <h4>Especiales</h4>
              <div className="detail-list">
                {team.picks.specials.map((special) => (
                  <div key={special.key} className="detail-row">
                    <span>{special.label}</span>
                    <strong>{special.value ?? 'Pendiente'}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="detail-block">
              <h4>Grupos</h4>
              <div className="detail-list">
                {team.picks.groups.map((group) => (
                  <div key={group.group} className="group-summary-card">
                    <div className="group-summary-card__head">
                      <strong>Grupo {group.group}</strong>
                      <span>{formatPoints(group.points)}</span>
                    </div>
                    <div className="group-summary-card__teams">
                      {group.positions.map((position) => (
                        <div key={position.team} className="group-summary-card__team">
                          <span>{position.predictedPosition}º</span>
                          <TeamMark teamKey={position.team} muted />
                          <strong>{position.points ? 'Acierto' : 'Fallo'}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="detail-block">
              <h4>Fase eliminatoria</h4>
              <EmptyState title="Pendiente" text="Aún no disponible" compact />
            </section>
          </div>
        ) : null}
      </aside>
    </>
  );
}
