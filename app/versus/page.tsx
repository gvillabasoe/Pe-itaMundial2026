import Link from 'next/link';

import { PageHero } from '@/components/layout/page-hero';
import { EmptyState } from '@/components/ui/empty-state';
import { VersusPage } from '@/components/versus/versus-page';
import { getClubViewModel } from '@/lib/server/repository';
import { readSession } from '@/lib/server/session';
import { buildVersusComparison, getAvailableRivals } from '@/lib/server/versus';

export default async function VersusRoutePage() {
  const session = await readSession();
  const club = getClubViewModel(session);

  if (!session || !club) {
    return (
      <div className="page-stack page-stack--narrow">
        <PageHero title="Versus" subtitle="Acceso restringido" accent="versus" />
        <EmptyState title="Acceso restringido" text="Entra a Mi Club para comparar tu hoja contra el consenso o contra un rival." action={<Link href="/mi-club" className="primary-button">Entrar a Mi Club</Link>} />
      </div>
    );
  }

  const comparison = buildVersusComparison(session, session.versusPreferences.mode, session.versusPreferences.rivalTeamId);
  const baseTeam = club.activeTeam;
  const rivals = getAvailableRivals(session);

  if (!comparison) {
    return (
      <div className="page-stack page-stack--narrow">
        <PageHero title="Versus" subtitle="Cara a cara" accent="versus" />
        <EmptyState title="Selecciona un rival distinto" compact />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHero title="Versus" subtitle="Comparativa privada contra consenso o rival concreto." accent="versus" />
      <VersusPage
        initialComparison={comparison}
        initialPreferences={session.versusPreferences}
        baseTeam={baseTeam}
        ownedTeams={club.teams}
        rivals={rivals}
      />
    </div>
  );
}
