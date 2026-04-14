import { teamFlag, teamLabel, teamShort } from '@/lib/formatting';

export function TeamMark({ teamKey, muted = false }: { teamKey: string | null | undefined; muted?: boolean }) {
  const label = teamLabel(teamKey);
  const flag = teamFlag(teamKey);
  const short = teamShort(teamKey);
  const fallback = !teamKey || short === flag;

  return (
    <span className={muted ? 'team-mark team-mark--muted' : 'team-mark'}>
      <span className="team-mark__flag" aria-hidden="true">
        {fallback ? short : flag}
      </span>
      <span className="team-mark__label">{label}</span>
    </span>
  );
}
