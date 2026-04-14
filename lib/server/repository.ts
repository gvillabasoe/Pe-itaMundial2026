import 'server-only';

import type {
  ClubViewModel,
  Favorite,
  HomeActivityItem,
  HomeViewModel,
  MiniPoll,
  MiniPollAnswer,
  SessionState,
  Team,
  TeamListItem,
  User,
  VersusPreferences,
} from '@/lib/types';
import { DEMO_SOURCE_LABEL, GROUPS } from '@/lib/constants';
import { normalizeHandle, percentage } from '@/lib/formatting';
import { getDemoData } from '@/lib/server/load-demo-data';
import { getFixturesPayload, getTournamentStatusView } from '@/lib/server/results';

const POLL_ID = 'mini-poll-grupo-a';

type RawUser = (ReturnType<typeof getDemoData>['users'])[number];

function toFavoriteRecords(teamIds: string[], userId: string): Favorite[] {
  return teamIds.map((teamId) => ({ id: `${userId}-${teamId}`, teamId, userId }));
}

function cloneTeam(team: Team, session: SessionState | null): Team {
  const cloned = structuredClone(team);
  if (session && cloned.userId === session.userId) {
    cloned.ownerHandle = session.handle;
  }
  return cloned;
}

export function getAllTeams(session: SessionState | null = null): Team[] {
  return getDemoData().teams.map((team) => cloneTeam(team, session));
}

export function getTeamById(teamId: string, session: SessionState | null = null): Team | null {
  const team = getDemoData().teams.find((item) => item.id === teamId);
  return team ? cloneTeam(team, session) : null;
}

function rawUserToUser(rawUser: RawUser, session: SessionState | null): User {
  const handle = session?.userId === rawUser.id ? session.handle : rawUser.handle;
  const favorites = session?.userId === rawUser.id ? toFavoriteRecords(session.favorites, rawUser.id) : [];
  const versusPreferences: VersusPreferences = session?.userId === rawUser.id
    ? session.versusPreferences
    : {
        mode: rawUser.versusPreferences.mode,
        rivalTeamId: rawUser.versusPreferences.rivalTeamId,
        filter: rawUser.versusPreferences.filter,
        tab: rawUser.versusPreferences.tab,
      };

  return {
    id: rawUser.id,
    handle,
    password: rawUser.password,
    favorites,
    teamIds: [...rawUser.teamIds],
    versusPreferences,
  };
}

export function getUserById(userId: string, session: SessionState | null = null): User | null {
  const rawUser = getDemoData().users.find((item) => item.id === userId);
  return rawUser ? rawUserToUser(rawUser, session) : null;
}

export function getUserByHandle(handle: string): User | null {
  const normalized = normalizeHandle(handle).toLowerCase();
  const rawUser = getDemoData().users.find((item) => item.handle.toLowerCase() === normalized);
  return rawUser ? rawUserToUser(rawUser, null) : null;
}

export function getTeamList(session: SessionState | null = null): TeamListItem[] {
  const teams = getAllTeams(session)
    .slice()
    .sort((left, right) => left.currentRank - right.currentRank || right.totalPoints - left.totalPoints || left.name.localeCompare(right.name, 'es'));
  const ownerCount = new Map<string, number>();
  teams.forEach((team) => ownerCount.set(team.userId, (ownerCount.get(team.userId) ?? 0) + 1));

  return teams.map((team) => ({
    id: team.id,
    name: team.name,
    userId: team.userId,
    ownerHandle: team.ownerHandle,
    totalPoints: team.totalPoints,
    groupPoints: team.groupPoints,
    finalPhasePoints: team.finalPhasePoints,
    specialPoints: team.specialPoints,
    currentRank: team.currentRank,
    championPick: team.championPick,
    summary: team.summary,
    isFavorite: session ? session.favorites.includes(team.id) : false,
    isCurrentUserTeam: session ? session.userId === team.userId : false,
    hasSiblingTeams: (ownerCount.get(team.userId) ?? 0) > 1,
  }));
}

export function getRankingView(session: SessionState | null = null): { teams: TeamListItem[]; sourceLabel: string } {
  return {
    teams: getTeamList(session),
    sourceLabel: DEMO_SOURCE_LABEL,
  };
}

export function getActiveTeam(session: SessionState | null): Team | null {
  if (!session) return null;
  const ownedTeams = getAllTeams(session).filter((team) => team.userId === session.userId);
  if (ownedTeams.length === 0) return null;
  return ownedTeams.find((team) => team.id === session.activeTeamId) ?? ownedTeams[0];
}

function buildRecentActivity(session: SessionState | null, podium: TeamListItem[]): HomeActivityItem[] {
  const now = Date.now();
  const second = podium[1];
  const top = podium[0];

  return [
    {
      id: 'activity-1',
      title: second ? `${second.ownerHandle} ha subido al ${second.currentRank}º puesto` : 'La clasificación se actualizará según avance el torneo',
      timestamp: new Date(now - 60 * 60 * 1000).toISOString(),
      tone: 'up',
    },
    {
      id: 'activity-2',
      title: 'Nueva mini porra disponible',
      timestamp: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      tone: 'neutral',
    },
    {
      id: 'activity-3',
      title: top ? `Ya está disponible la clasificación actualizada de ${top.name}` : 'Ya está disponible la clasificación actualizada',
      timestamp: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
      tone: 'neutral',
    },
    {
      id: 'activity-4',
      title: 'Se han cerrado las votaciones de la Jornada 1',
      timestamp: new Date(now - 20 * 60 * 60 * 1000).toISOString(),
      tone: 'neutral',
    },
  ];
}

function buildPollAnswers(session: SessionState | null): MiniPollAnswer[] {
  const baseAnswers = [
    { id: 'mexico', label: 'México', votes: 18 },
    { id: 'sudafrica', label: 'Sudáfrica', votes: 14 },
    { id: 'corea', label: 'Corea', votes: 9 },
    { id: 'irlanda', label: 'Irlanda', votes: 7 },
  ];

  const userVote = session?.pollVotes[POLL_ID] ?? null;
  const answers = baseAnswers.map((answer) => ({ ...answer }));
  if (userVote) {
    const selected = answers.find((answer) => answer.id === userVote);
    if (selected) selected.votes += 1;
  }

  const totalVotes = answers.reduce((sum, answer) => sum + answer.votes, 0);
  return answers.map((answer) => ({
    id: answer.id,
    label: answer.label,
    votes: answer.votes,
    percentage: percentage(answer.votes, totalVotes),
  }));
}

export function getMiniPoll(session: SessionState | null = null): MiniPoll {
  const publishedAt = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const closesAt = new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString();
  const answers = buildPollAnswers(session);
  const totalVotes = answers.reduce((sum, answer) => sum + answer.votes, 0);
  const maxVotes = Math.max(...answers.map((answer) => answer.votes));

  return {
    id: POLL_ID,
    title: 'Mini porra: ¿quién gana el Grupo A?',
    publishedAt,
    closesAt,
    status: new Date(closesAt).getTime() > Date.now() ? 'active' : 'closed',
    answers,
    stats: {
      totalVotes,
      winningAnswerIds: answers.filter((answer) => answer.votes === maxVotes).map((answer) => answer.id),
    },
    userVote: session?.pollVotes[POLL_ID] ?? null,
  };
}

export async function getHomeViewModel(session: SessionState | null = null): Promise<HomeViewModel> {
  const ranking = getTeamList(session);
  const podium = ranking.slice(0, 3);
  const fixturesPayload = await getFixturesPayload();
  return {
    tournamentStatus: getTournamentStatusView(fixturesPayload),
    podium,
    miniPoll: getMiniPoll(session),
    recentActivity: buildRecentActivity(session, podium),
  };
}

export function getClubViewModel(session: SessionState | null = null): ClubViewModel | null {
  if (!session) return null;
  const user = getUserById(session.userId, session);
  if (!user) return null;

  const teams = getAllTeams(session).filter((team) => team.userId === user.id);
  const activeTeam = teams.find((team) => team.id === session.activeTeamId) ?? teams[0];
  const favoriteTeams = getTeamList(session).filter((team) => session.favorites.includes(team.id));

  return {
    user,
    teams,
    activeTeam,
    favorites: favoriteTeams,
    tournamentProgress: {
      groups: 'complete',
      knockout: 'pending',
      specials: 'pending',
    },
  };
}

export function isTeamOwnedByUser(teamId: string, session: SessionState | null): boolean {
  if (!session) return false;
  return getDemoData().teams.some((team) => team.id === teamId && team.userId === session.userId);
}

export function getGroupLabels(): string[] {
  return Object.keys(GROUPS);
}
