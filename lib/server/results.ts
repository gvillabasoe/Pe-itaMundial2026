import 'server-only';

import { RESULTS_SECTION_ORDER, TOURNAMENT_START_ISO } from '@/lib/constants';
import type { Fixture, FixturesPayload, TournamentStatusView } from '@/lib/types';
import { getApiFootballFixtures, isApiFootballConfigured } from '@/lib/server/api-football';
import { getDemoData } from '@/lib/server/load-demo-data';

function buildDemoSections(): FixturesPayload {
  const data = getDemoData();
  const sectionsMap = new Map<string, { key: string; title: string; phase: 'groups' | 'knockout'; fixtures: Fixture[] }>();

  data.fixtures.groups.forEach((fixture) => {
    const sectionKey = fixture.roundLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const section = sectionsMap.get(sectionKey) ?? {
      key: sectionKey,
      title: fixture.roundLabel,
      phase: 'groups' as const,
      fixtures: [],
    };
    section.fixtures.push(fixture);
    sectionsMap.set(sectionKey, section);
  });

  Object.entries(data.fixtures.knockout).forEach(([key, fixtures]) => {
    fixtures.forEach((fixture) => {
      const sectionKey = `${key}-${fixture.roundLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      sectionsMap.set(sectionKey, {
        key: sectionKey,
        title: fixture.roundLabel,
        phase: 'knockout',
        fixtures,
      });
    });
  });

  const sections = [...sectionsMap.values()].sort((left, right) => {
    const leftIndex = RESULTS_SECTION_ORDER.indexOf(left.title as (typeof RESULTS_SECTION_ORDER)[number]);
    const rightIndex = RESULTS_SECTION_ORDER.indexOf(right.title as (typeof RESULTS_SECTION_ORDER)[number]);
    return (leftIndex === -1 ? 99 : leftIndex) - (rightIndex === -1 ? 99 : rightIndex);
  });

  return {
    source: 'mock',
    sections,
    hasLive: false,
  };
}

function buildApiSections(fixtures: Fixture[]): FixturesPayload {
  const grouped = new Map<string, { key: string; title: string; phase: 'groups' | 'knockout'; fixtures: Fixture[] }>();

  fixtures.forEach((fixture) => {
    const title = fixture.roundLabel || 'Resultados';
    const sectionKey = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const section = grouped.get(sectionKey) ?? {
      key: sectionKey,
      title,
      phase: title.toLowerCase().includes('group') ? 'groups' : 'knockout',
      fixtures: [],
    };
    section.fixtures.push(fixture);
    grouped.set(sectionKey, section);
  });

  const sections = [...grouped.values()].sort((left, right) => left.title.localeCompare(right.title, 'es'));
  return {
    source: 'api-football',
    sections,
    hasLive: fixtures.some((fixture) => fixture.status === 'live'),
  };
}

export async function getFixturesPayload(): Promise<FixturesPayload> {
  if (isApiFootballConfigured()) {
    try {
      const fixtures = await getApiFootballFixtures();
      if (fixtures.length > 0) return buildApiSections(fixtures);
    } catch {
      // Fallback controlado al mock local.
    }
  }
  return buildDemoSections();
}

export function flattenFixtures(payload: FixturesPayload): Fixture[] {
  return payload.sections.flatMap((section) => section.fixtures);
}

export function getTournamentStatusView(payload: FixturesPayload): TournamentStatusView {
  const start = new Date(TOURNAMENT_START_ISO).getTime();
  const now = Date.now();

  if (now < start) {
    return {
      mode: 'countdown',
      kickoff: TOURNAMENT_START_ISO,
      homeTeam: 'Mexico',
      awayTeam: 'Sudafrica',
    };
  }

  const fixtures = flattenFixtures(payload);
  const live = fixtures.find((fixture) => fixture.status === 'live');
  if (live) {
    return {
      mode: 'next-match',
      fixture: live,
    };
  }

  const upcoming = fixtures
    .filter((fixture) => fixture.status === 'scheduled')
    .sort((left, right) => new Date(left.kickoff).getTime() - new Date(right.kickoff).getTime())[0] ?? null;

  return {
    mode: 'next-match',
    fixture: upcoming,
  };
}
