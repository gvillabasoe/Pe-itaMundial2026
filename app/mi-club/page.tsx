import { ClubDashboard } from '@/components/club/club-dashboard';
import { LoginCard } from '@/components/club/login-card';
import { PageHero } from '@/components/layout/page-hero';
import { getClubViewModel } from '@/lib/server/repository';
import { readSession } from '@/lib/server/session';

export default async function MiClubPage() {
  const session = await readSession();
  const club = getClubViewModel(session);

  if (!session || !club) {
    return (
      <div className="page-stack page-stack--narrow">
        <PageHero title="Mi Club" subtitle="Acceso privado" accent="participant" />
        <LoginCard />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHero title="Mi Club" subtitle="Tus equipos y picks" accent="participant">
        <span className="soft-chip">{club.user.handle}</span>
      </PageHero>
      <ClubDashboard initialClub={club} />
    </div>
  );
}
