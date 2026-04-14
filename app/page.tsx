import Link from 'next/link';

import { MiniPollCard } from '@/components/home/mini-poll-card';
import { TournamentStatusCard } from '@/components/home/tournament-status';
import { PageHero } from '@/components/layout/page-hero';
import { TeamMark } from '@/components/ui/team-mark';
import { formatDateTimeMadrid, formatPoints } from '@/lib/formatting';
import { getHomeViewModel } from '@/lib/server/repository';
import { readSession } from '@/lib/server/session';

export default async function HomePage() {
  const session = await readSession();
  const home = await getHomeViewModel(session);

  return (
    <div className="page-stack">
      <PageHero title="Peñita Mundial" subtitle="IV Edición · estado actual de la porra, torneo, mini porras y actividad reciente.">
        <span className="soft-chip">Europe/Madrid</span>
        {session ? <span className="soft-chip">{session.handle}</span> : null}
      </PageHero>

      <TournamentStatusCard status={home.tournamentStatus} />

      <section className="panel">
        <div className="panel__header">
          <div>
            <h2 className="section-title">Top 3</h2>
            <p className="section-copy">Podio actual de la porra</p>
          </div>
          <Link href="/clasificacion" className="secondary-button">Ver clasificación completa</Link>
        </div>

        <div className="podium-grid-home">
          {home.podium.map((team, index) => (
            <article key={team.id} className={index === 0 ? 'podium-card-home is-first' : 'podium-card-home'}>
              <span className="podium-card-home__rank">{index + 1}º</span>
              <strong>{team.name}</strong>
              <span>{team.ownerHandle}</span>
              <em>{formatPoints(team.totalPoints)}</em>
            </article>
          ))}
        </div>
      </section>

      <MiniPollCard initialPoll={home.miniPoll} isLoggedIn={Boolean(session)} />

      <section className="panel">
        <div className="panel__header">
          <div>
            <h2 className="section-title">Actividad reciente</h2>
            <p className="section-copy">Bloque breve y secundario para leer el pulso de la porra.</p>
          </div>
        </div>
        <div className="activity-list">
          {home.recentActivity.map((item) => (
            <article key={item.id} className="activity-item">
              <strong>{item.title}</strong>
              <span>{formatDateTimeMadrid(item.timestamp)}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
