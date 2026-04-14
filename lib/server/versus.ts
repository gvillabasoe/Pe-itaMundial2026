import 'server-only';

import type { ComparisonOutcome, ComparisonRelation, ComparisonValue, SessionState, Team, TeamListItem, VersusComparison } from '@/lib/types';
import { getActiveTeam, getAllTeams, getTeamById, getTeamList } from '@/lib/server/repository';
import { teamLabel } from '@/lib/formatting';

function isHit(status: string | null | undefined): boolean {
  return status === 'exact' || status === 'sign' || status === 'hit';
}

function relationForValues(baseValues: string[], referenceValues: string[]): ComparisonRelation {
  return baseValues.some((value) => referenceValues.includes(value)) ? 'same' : 'different';
}

function outcomeForStatuses(baseStatus: string | null | undefined, referenceStatus: string | null | undefined): ComparisonOutcome {
  if (baseStatus === 'pending' || referenceStatus === 'pending' || !baseStatus || !referenceStatus) return 'pending';
  if (isHit(baseStatus) && isHit(referenceStatus)) return 'both-hit';
  if (!isHit(baseStatus) && !isHit(referenceStatus)) return 'both-miss';
  return 'split';
}

function makeValue(input: {
  label: string;
  baseValues: string[];
  referenceValues: string[];
  basePoints: number | null;
  referencePoints: number | null;
  baseStatus: string | null | undefined;
  referenceStatus: string | null | undefined;
  meta?: ComparisonValue['meta'];
}): ComparisonValue {
  return {
    label: input.label,
    relation: relationForValues(input.baseValues, input.referenceValues),
    outcome: outcomeForStatuses(input.baseStatus, input.referenceStatus),
    base: {
      values: input.baseValues,
      points: input.basePoints,
      status: (input.baseStatus ?? 'pending') as ComparisonValue['base']['status'],
    },
    reference: {
      values: input.referenceValues,
      points: input.referencePoints,
      status: (input.referenceStatus ?? 'pending') as ComparisonValue['reference']['status'],
    },
    meta: input.meta,
  };
}

function buildSectionSummary(key: string, label: string, items: ComparisonValue[]) {
  const equalCount = items.filter((item) => item.relation === 'same').length;
  const differentCount = items.filter((item) => item.relation === 'different').length;
  const basePoints = items.reduce((sum, item) => sum + (item.base.points ?? 0), 0);
  const referencePoints = items.reduce((sum, item) => sum + (item.reference.points ?? 0), 0);
  return {
    key,
    label,
    basePoints,
    referencePoints,
    delta: basePoints - referencePoints,
    equalCount,
    differentCount,
  };
}

function modeValues<T extends string | number>(values: T[]): string[] {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  const max = Math.max(...counts.values());
  return [...counts.entries()]
    .filter(([, count]) => count === max)
    .map(([value]) => String(value))
    .sort((left, right) => left.localeCompare(right, 'es'));
}

function signFromScore(score: string): string {
  const [home, away] = score.split('-').map((value) => Number(value));
  if (home > away) return '1';
  if (home < away) return '2';
  return 'X';
}

function consensusMatchReference(teams: Team[], matchId: string): { values: string[]; points: number; status: 'exact' | 'sign' | 'miss' } {
  const picks = teams
    .map((team) => team.picks.matches.find((match) => match.id === matchId))
    .filter((match): match is NonNullable<typeof match> => Boolean(match));

  const values = modeValues(picks.map((pick) => pick.predictedScore));
  const actualScore = picks[0]?.actualScore ?? '0-0';
  const actualSign = picks[0]?.actualSign ?? signFromScore(actualScore);
  const signs = [...new Set(values.map((value) => signFromScore(value)))];

  if (values.includes(actualScore)) return { values, points: 5, status: 'exact' };
  if (signs.includes(actualSign)) return { values, points: 2, status: 'sign' };
  return { values, points: 0, status: 'miss' };
}

function consensusPositionReference(teams: Team[], group: string, teamKey: string, actualPosition: number): { values: string[]; points: number; status: 'hit' | 'miss' } {
  const picks = teams
    .map((team) => team.picks.groups.find((entry) => entry.group === group)?.positions.find((position) => position.team === teamKey))
    .filter((position): position is NonNullable<typeof position> => Boolean(position));

  const values = modeValues(picks.map((pick) => pick.predictedPosition));
  const status = values.includes(String(actualPosition)) ? 'hit' : 'miss';
  return {
    values,
    points: status === 'hit' ? 1 : 0,
    status,
  };
}

function consensusPendingReference(values: string[]): { values: string[]; points: null; status: 'pending' } {
  return {
    values: modeValues(values),
    points: null,
    status: 'pending',
  };
}

function buildGroupMatchComparison(baseTeam: Team, referenceTeam: Team | null, allTeams: Team[], mode: 'general' | 'participant'): ComparisonValue[] {
  return baseTeam.picks.matches.map((pick) => {
    if (mode === 'participant' && referenceTeam) {
      const refPick = referenceTeam.picks.matches.find((entry) => entry.id === pick.id)!;
      return makeValue({
        label: `${teamLabel(pick.homeTeam)} vs ${teamLabel(pick.awayTeam)}`,
        baseValues: [pick.predictedScore],
        referenceValues: [refPick.predictedScore],
        basePoints: pick.points,
        referencePoints: refPick.points,
        baseStatus: pick.status,
        referenceStatus: refPick.status,
        meta: {
          group: pick.group,
          jornada: pick.jornada,
          homeTeam: pick.homeTeam,
          awayTeam: pick.awayTeam,
        },
      });
    }

    const consensus = consensusMatchReference(allTeams, pick.id);
    return makeValue({
      label: `${teamLabel(pick.homeTeam)} vs ${teamLabel(pick.awayTeam)}`,
      baseValues: [pick.predictedScore],
      referenceValues: consensus.values,
      basePoints: pick.points,
      referencePoints: consensus.points,
      baseStatus: pick.status,
      referenceStatus: consensus.status,
      meta: {
        group: pick.group,
        jornada: pick.jornada,
        homeTeam: pick.homeTeam,
        awayTeam: pick.awayTeam,
      },
    });
  });
}

function buildGroupPositionComparison(baseTeam: Team, referenceTeam: Team | null, allTeams: Team[], mode: 'general' | 'participant'): ComparisonValue[] {
  return baseTeam.picks.groups.flatMap((groupEntry) =>
    groupEntry.positions.map((positionPick) => {
      if (mode === 'participant' && referenceTeam) {
        const refPick = referenceTeam.picks.groups
          .find((entry) => entry.group === groupEntry.group)!
          .positions.find((position) => position.team === positionPick.team)!;
        return makeValue({
          label: `${groupEntry.group} · ${teamLabel(positionPick.team)}`,
          baseValues: [String(positionPick.predictedPosition)],
          referenceValues: [String(refPick.predictedPosition)],
          basePoints: positionPick.points,
          referencePoints: refPick.points,
          baseStatus: positionPick.status,
          referenceStatus: refPick.status,
          meta: { group: groupEntry.group },
        });
      }

      const consensus = consensusPositionReference(allTeams, groupEntry.group, positionPick.team, positionPick.actualPosition);
      return makeValue({
        label: `${groupEntry.group} · ${teamLabel(positionPick.team)}`,
        baseValues: [String(positionPick.predictedPosition)],
        referenceValues: consensus.values,
        basePoints: positionPick.points,
        referencePoints: consensus.points,
        baseStatus: positionPick.status,
        referenceStatus: consensus.status,
        meta: { group: groupEntry.group },
      });
    }),
  );
}

function buildPendingStageComparison(baseTeam: Team, referenceTeam: Team | null, allTeams: Team[], mode: 'general' | 'participant'): ComparisonValue[] {
  const sections: ComparisonValue[] = [];
  const stageLabels: Record<string, string> = {
    dieciseisavos: 'Dieciseisavos',
    octavos: 'Octavos',
    cuartos: 'Cuartos',
    semis: 'Semifinales',
    final: 'Final',
  };

  (Object.keys(baseTeam.picks.eliminatorias) as Array<keyof Team['picks']['eliminatorias']>).forEach((stageKey) => {
    baseTeam.picks.eliminatorias[stageKey].forEach((slot) => {
      if (stageKey === 'final') return;
      if (mode === 'participant' && referenceTeam) {
        const refSlot = referenceTeam.picks.eliminatorias[stageKey].find((entry) => entry.slot === slot.slot)!;
        sections.push(
          makeValue({
            label: `${stageLabels[stageKey]} · ${slot.slot}`,
            baseValues: [slot.team ?? 'Por definir'],
            referenceValues: [refSlot.team ?? 'Por definir'],
            basePoints: null,
            referencePoints: null,
            baseStatus: 'pending',
            referenceStatus: 'pending',
            meta: { slot: slot.slot },
          }),
        );
        return;
      }

      const consensus = consensusPendingReference(
        allTeams.map((team) => team.picks.eliminatorias[stageKey].find((entry) => entry.slot === slot.slot)?.team ?? 'Por definir'),
      );
      sections.push(
        makeValue({
          label: `${stageLabels[stageKey]} · ${slot.slot}`,
          baseValues: [slot.team ?? 'Por definir'],
          referenceValues: consensus.values,
          basePoints: null,
          referencePoints: null,
          baseStatus: 'pending',
          referenceStatus: 'pending',
          meta: { slot: slot.slot },
        }),
      );
    });
  });

  return sections;
}

function buildFinalComparison(baseTeam: Team, referenceTeam: Team | null, allTeams: Team[], mode: 'general' | 'participant'): ComparisonValue[] {
  return baseTeam.picks.eliminatorias.final.map((slot) => {
    if (mode === 'participant' && referenceTeam) {
      const refSlot = referenceTeam.picks.eliminatorias.final.find((entry) => entry.slot === slot.slot)!;
      return makeValue({
        label: `Final · ${slot.slot}`,
        baseValues: [slot.team ?? 'Por definir'],
        referenceValues: [refSlot.team ?? 'Por definir'],
        basePoints: null,
        referencePoints: null,
        baseStatus: 'pending',
        referenceStatus: 'pending',
        meta: { slot: slot.slot },
      });
    }

    const consensus = consensusPendingReference(
      allTeams.map((team) => team.picks.eliminatorias.final.find((entry) => entry.slot === slot.slot)?.team ?? 'Por definir'),
    );
    return makeValue({
      label: `Final · ${slot.slot}`,
      baseValues: [slot.team ?? 'Por definir'],
      referenceValues: consensus.values,
      basePoints: null,
      referencePoints: null,
      baseStatus: 'pending',
      referenceStatus: 'pending',
      meta: { slot: slot.slot },
    });
  });
}

function buildPodiumComparison(baseTeam: Team, referenceTeam: Team | null, allTeams: Team[], mode: 'general' | 'participant'): ComparisonValue[] {
  const rows = [
    { key: 'thirdPlace', label: 'Tercer puesto', value: baseTeam.picks.podium.thirdPlace.team ?? 'Por definir' },
    { key: 'subChampion', label: 'Subcampeón', value: baseTeam.picks.podium.subChampion.team ?? 'Por definir' },
    { key: 'champion', label: 'Campeón', value: baseTeam.picks.podium.champion.team ?? 'Por definir' },
  ] as const;

  return rows.map((row) => {
    if (mode === 'participant' && referenceTeam) {
      const referenceValue = referenceTeam.picks.podium[row.key].team ?? 'Por definir';
      return makeValue({
        label: row.label,
        baseValues: [row.value],
        referenceValues: [referenceValue],
        basePoints: null,
        referencePoints: null,
        baseStatus: 'pending',
        referenceStatus: 'pending',
      });
    }

    const consensus = consensusPendingReference(allTeams.map((team) => team.picks.podium[row.key].team ?? 'Por definir'));
    return makeValue({
      label: row.label,
      baseValues: [row.value],
      referenceValues: consensus.values,
      basePoints: null,
      referencePoints: null,
      baseStatus: 'pending',
      referenceStatus: 'pending',
    });
  });
}

function buildSpecialsComparison(baseTeam: Team, referenceTeam: Team | null, allTeams: Team[], mode: 'general' | 'participant'): ComparisonValue[] {
  return baseTeam.picks.specials.map((special) => {
    if (mode === 'participant' && referenceTeam) {
      const referenceValue = referenceTeam.picks.specials.find((item) => item.key === special.key)?.value ?? 'Pendiente';
      return makeValue({
        label: special.label,
        baseValues: [special.value ?? 'Pendiente'],
        referenceValues: [referenceValue],
        basePoints: null,
        referencePoints: null,
        baseStatus: 'pending',
        referenceStatus: 'pending',
      });
    }

    const consensus = consensusPendingReference(
      allTeams.map((team) => team.picks.specials.find((item) => item.key === special.key)?.value ?? 'Pendiente'),
    );
    return makeValue({
      label: special.label,
      baseValues: [special.value ?? 'Pendiente'],
      referenceValues: consensus.values,
      basePoints: null,
      referencePoints: null,
      baseStatus: 'pending',
      referenceStatus: 'pending',
    });
  });
}

export function getAvailableRivals(session: SessionState | null): TeamListItem[] {
  const activeTeam = getActiveTeam(session);
  if (!activeTeam) return [];
  return getTeamList(session).filter((team) => team.id !== activeTeam.id);
}

export function buildVersusComparison(session: SessionState | null, mode: 'general' | 'participant', rivalTeamId: string | null): VersusComparison | null {
  const baseTeam = getActiveTeam(session);
  if (!baseTeam) return null;

  const allTeams = getAllTeams(session);
  const referenceTeam = mode === 'participant' && rivalTeamId ? getTeamById(rivalTeamId, session) : null;
  if (mode === 'participant' && (!referenceTeam || referenceTeam.id === baseTeam.id)) {
    return null;
  }

  const groupMatches = buildGroupMatchComparison(baseTeam, referenceTeam, allTeams, mode);
  const groupPositions = buildGroupPositionComparison(baseTeam, referenceTeam, allTeams, mode);
  const eliminatorias = buildPendingStageComparison(baseTeam, referenceTeam, allTeams, mode);
  const final = buildFinalComparison(baseTeam, referenceTeam, allTeams, mode);
  const podium = buildPodiumComparison(baseTeam, referenceTeam, allTeams, mode);
  const specials = buildSpecialsComparison(baseTeam, referenceTeam, allTeams, mode);

  const resumen = [
    buildSectionSummary('group-matches', 'Partidos de grupo', groupMatches),
    buildSectionSummary('group-positions', 'Posiciones de grupo', groupPositions),
    buildSectionSummary('eliminatorias', 'Eliminatorias', eliminatorias),
    buildSectionSummary('final', 'Final', final),
    buildSectionSummary('podio', 'Podio', podium),
    buildSectionSummary('especiales', 'Especiales', specials),
  ];

  const allItems = [...groupMatches, ...groupPositions, ...eliminatorias, ...final, ...podium, ...specials];
  const equalCount = allItems.filter((item) => item.relation === 'same').length;
  const differentCount = allItems.length - equalCount;
  const biggestDifference = [...resumen].sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta))[0];
  const referenceLabel = mode === 'participant' && referenceTeam ? `${referenceTeam.name} · ${referenceTeam.ownerHandle}` : 'Consenso';
  const pointDelta = resumen.reduce((sum, item) => sum + item.delta, 0);

  return {
    baseTeamId: baseTeam.id,
    mode,
    rivalTeamId: referenceTeam?.id ?? null,
    consensusData: mode === 'general' ? { label: 'Consenso' } : null,
    equalPickPercentage: allItems.length ? Math.round((equalCount / allItems.length) * 100) : 0,
    differentPickCount: differentCount,
    pointDelta,
    biggestDifferenceSection: biggestDifference?.label ?? 'Resumen',
    referenceLabel,
    sections: {
      resumen,
      groupMatches,
      groupPositions,
      eliminatorias,
      final,
      podium,
      specials,
    },
  };
}
