import 'server-only';

import type { Fixture } from '@/lib/types';

const API_BASE = process.env.API_FOOTBALL_BASE_URL ?? 'https://v3.football.api-sports.io';
const API_KEY = process.env.API_FOOTBALL_KEY;
const API_LEAGUE_ID = process.env.API_FOOTBALL_LEAGUE_ID;
const API_SEASON = process.env.API_FOOTBALL_SEASON;

type ApiFootballFixture = {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      elapsed: number | null;
    };
  };
  league?: {
    round?: string;
  };
  teams: {
    home: { name: string };
    away: { name: string };
  };
  goals: { home: number | null; away: number | null };
  events?: Array<{
    type?: string;
    detail?: string;
    time?: { elapsed?: number | null };
    player?: { name?: string | null };
    team?: { name?: string | null };
  }>;
};

type ApiFootballResponse<T> = {
  response?: T[];
};

function mapStatus(shortStatus: string | undefined): Fixture['status'] {
  if (!shortStatus) return 'scheduled';
  if (['1H', '2H', 'ET', 'BT', 'P', 'INT', 'LIVE'].includes(shortStatus)) return 'live';
  if (['FT', 'AET', 'PEN'].includes(shortStatus)) return 'finished';
  return 'scheduled';
}

function normalizeFixture(item: ApiFootballFixture): Fixture {
  const goals = (item.events ?? [])
    .filter((event) => event.type === 'Goal' || event.detail === 'Goal')
    .map((event) => ({
      scorer: event.player?.name || event.team?.name || 'Gol',
      minute: event.time?.elapsed ?? 0,
      team: event.team?.name || '',
    }));

  return {
    id: `api-${item.fixture.id}`,
    stage: 'groups',
    roundLabel: item.league?.round || 'Resultados',
    group: null,
    homeTeam: item.teams.home.name,
    awayTeam: item.teams.away.name,
    status: mapStatus(item.fixture.status.short),
    kickoff: item.fixture.date,
    minute: item.fixture.status.elapsed,
    score: {
      home: item.goals.home,
      away: item.goals.away,
    },
    goals,
    eventsAvailable: goals.length > 0,
  };
}

export function isApiFootballConfigured(): boolean {
  return Boolean(API_KEY && API_LEAGUE_ID && API_SEASON);
}

async function fetchApiFootball(pathname: string, params: Record<string, string | undefined>): Promise<ApiFootballFixture[]> {
  if (!API_KEY) {
    throw new Error('API_FOOTBALL_KEY no configurada');
  }

  const url = new URL(pathname, API_BASE);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      'x-apisports-key': API_KEY,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API-FOOTBALL respondió con ${response.status}`);
  }

  const payload = (await response.json()) as ApiFootballResponse<ApiFootballFixture>;
  return payload.response ?? [];
}

export async function getApiFootballFixtures(): Promise<Fixture[]> {
  if (!isApiFootballConfigured()) return [];
  const fixtures = await fetchApiFootball('/fixtures', {
    league: API_LEAGUE_ID,
    season: API_SEASON,
  });
  return fixtures.map(normalizeFixture);
}

export async function getApiFootballLiveFixtures(): Promise<Fixture[]> {
  if (!API_KEY) return [];
  const fixtures = await fetchApiFootball('/fixtures', { live: 'all' });
  return fixtures.map(normalizeFixture);
}

export async function getApiFootballFixturesByIds(ids: string): Promise<Fixture[]> {
  if (!API_KEY || !ids.trim()) return [];
  const fixtures = await fetchApiFootball('/fixtures', { ids });
  return fixtures.map(normalizeFixture);
}
