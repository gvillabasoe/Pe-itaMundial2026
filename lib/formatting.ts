import { EUROPE_MADRID, TEAM_META } from '@/lib/constants';
import type { FixtureStatus } from '@/lib/types';

const TEAM_META_RECORD = TEAM_META as Record<string, { label: string; flag: string; short: string }>;

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

export function teamLabel(teamKey: string | null | undefined): string {
  if (!teamKey) return 'Por definir';
  return TEAM_META_RECORD[teamKey]?.label ?? teamKey;
}

export function teamFlag(teamKey: string | null | undefined): string {
  if (!teamKey) return '··';
  return TEAM_META_RECORD[teamKey]?.flag || TEAM_META_RECORD[teamKey]?.short || teamKey.slice(0, 3).toUpperCase();
}

export function teamShort(teamKey: string | null | undefined): string {
  if (!teamKey) return '---';
  return TEAM_META_RECORD[teamKey]?.short ?? teamKey.slice(0, 3).toUpperCase();
}

export function formatDateTimeMadrid(input: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(input);
  return new Intl.DateTimeFormat('es-ES', {
    timeZone: EUROPE_MADRID,
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(date);
}

export function formatDateMadrid(input: string): string {
  return formatDateTimeMadrid(input, { day: '2-digit', month: 'long', year: 'numeric', hour: undefined, minute: undefined });
}

export function formatTimeMadrid(input: string): string {
  return formatDateTimeMadrid(input, { hour: '2-digit', minute: '2-digit', day: undefined, month: undefined, year: undefined });
}

export function formatPoints(points: number | null | undefined): string {
  if (points === null || points === undefined) return 'Pendiente';
  return `${points} pts`;
}

export function formatRank(rank: number): string {
  return `#${rank}`;
}

export function fixtureStateLabel(status: FixtureStatus): string {
  if (status === 'live') return 'En directo';
  if (status === 'finished') return 'Finalizado';
  return 'Pendiente';
}

export function getScoreLabel(home: number | null, away: number | null): string {
  if (home === null || away === null) return '—';
  return `${home}-${away}`;
}

export function percentage(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function normalizeHandle(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

export function countdownParts(targetIso: string): { totalMs: number; days: number; hours: number; minutes: number; seconds: number } {
  const totalMs = Math.max(0, new Date(targetIso).getTime() - Date.now());
  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { totalMs, days, hours, minutes, seconds };
}
