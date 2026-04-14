import { PageHero } from '@/components/layout/page-hero';
import { ResultsPage } from '@/components/results/results-page';
import { getFixturesPayload } from '@/lib/server/results';

export default async function ResultadosPage() {
  const payload = await getFixturesPayload();

  return (
    <div className="page-stack">
      <PageHero
        title="Resultados"
        subtitle="Referencia oficial de partidos, grupos, cruces pendientes y evolución en directo con hora Madrid."
      />
      <ResultsPage initialPayload={payload} />
    </div>
  );
}
