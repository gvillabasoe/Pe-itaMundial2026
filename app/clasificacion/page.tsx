import { PageHero } from '@/components/layout/page-hero';
import { RankingPage } from '@/components/ranking/ranking-page';
import { getRankingView } from '@/lib/server/repository';
import { readSession } from '@/lib/server/session';

export default async function ClasificacionPage() {
  const session = await readSession();
  const ranking = getRankingView(session);

  return (
    <div className="page-stack">
      <PageHero
        title="Clasificación"
        subtitle="Vista competitiva principal con ranking, favoritos y detalle contextual sin perder scroll."
        accent="ranking"
      />
      <RankingPage initialTeams={ranking.teams} sourceLabel={ranking.sourceLabel} loggedIn={Boolean(session)} />
    </div>
  );
}
