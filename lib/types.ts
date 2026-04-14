export type FixtureStatus = 'scheduled' | 'live' | 'finished';
export type PickStatus = 'exact' | 'sign' | 'miss' | 'hit' | 'pending';
export type ComparisonRelation = 'same' | 'different';
export type ComparisonOutcome = 'both-hit' | 'both-miss' | 'split' | 'pending';

export type Favorite = {
  id: string;
  teamId: string;
  userId: string;
};

export type VersusPreferences = {
  mode: 'general' | 'participant';
  rivalTeamId: string | null;
  filter: 'all' | 'different' | 'same';
  tab: 'resumen' | 'grupos' | 'eliminatorias' | 'final' | 'podio' | 'especiales';
};

export type User = {
  id: string;
  handle: string;
  password?: string;
  favorites: Favorite[];
  teamIds: string[];
  versusPreferences: VersusPreferences;
};

export type MatchPick = {
  id: string;
  key: string;
  group: string;
  jornada: 1 | 2 | 3;
  homeTeam: string;
  awayTeam: string;
  predictedScore: string;
  predictedSign: '1' | 'X' | '2';
  actualScore: string;
  actualSign: '1' | 'X' | '2';
  isDouble: boolean;
  points: number;
  status: 'exact' | 'sign' | 'miss';
};

export type GroupPositionPick = {
  team: string;
  predictedPosition: number;
  predictedPoints: number;
  actualPosition: number;
  points: number;
  status: 'hit' | 'miss';
};

export type GroupPrediction = {
  group: string;
  points: number;
  actualOrder: string[];
  positions: GroupPositionPick[];
};

export type StagePrediction = {
  slot: number;
  team: string | null;
  points: number | null;
  status: 'pending';
};

export type PodiumPrediction = {
  thirdPlace: { team: string | null; points: number | null; status: 'pending' };
  subChampion: { team: string | null; points: number | null; status: 'pending' };
  champion: { team: string | null; points: number | null; status: 'pending' };
};

export type SpecialPick = {
  key: string;
  label: string;
  value: string | null;
  points: number | null;
  status: 'pending';
};

export type TeamPicks = {
  matches: MatchPick[];
  groups: GroupPrediction[];
  eliminatorias: {
    dieciseisavos: StagePrediction[];
    octavos: StagePrediction[];
    cuartos: StagePrediction[];
    semis: StagePrediction[];
    final: StagePrediction[];
  };
  podium: PodiumPrediction;
  specials: SpecialPick[];
};

export type TeamSummary = {
  exactHits: number;
  signHits: number;
  misses: number;
  doubleHits: number;
  doubleSigns: number;
};

export type Team = {
  id: string;
  name: string;
  userId: string;
  ownerHandle: string;
  championPick: string | null;
  totalPoints: number;
  matchPoints: number;
  groupPoints: number;
  finalPhasePoints: number;
  specialPoints: number;
  currentRank: number;
  summary: TeamSummary;
  picks: TeamPicks;
};

export type TeamListItem = Pick<
  Team,
  'id' | 'name' | 'userId' | 'ownerHandle' | 'totalPoints' | 'groupPoints' | 'finalPhasePoints' | 'specialPoints' | 'currentRank' | 'championPick' | 'summary'
> & {
  isFavorite: boolean;
  isCurrentUserTeam: boolean;
  hasSiblingTeams: boolean;
};

export type Scoreline = {
  home: number | null;
  away: number | null;
};

export type GoalEvent = {
  scorer: string;
  minute: number;
  team: string;
};

export type Fixture = {
  id: string;
  key?: string;
  stage: 'groups' | 'dieciseisavos' | 'octavos' | 'cuartos' | 'semis' | 'thirdPlace' | 'final';
  roundLabel: string;
  group: string | null;
  homeTeam: string;
  awayTeam: string;
  status: FixtureStatus;
  kickoff: string;
  minute: number | null;
  score: Scoreline;
  goals: GoalEvent[];
  eventsAvailable: boolean;
};

export type FixturesPayload = {
  source: 'mock' | 'api-football';
  sections: Array<{
    key: string;
    title: string;
    phase: 'groups' | 'knockout';
    fixtures: Fixture[];
  }>;
  hasLive: boolean;
};

export type MiniPollAnswer = {
  id: string;
  label: string;
  votes: number;
  percentage: number;
};

export type MiniPoll = {
  id: string;
  title: string;
  publishedAt: string;
  closesAt: string;
  status: 'active' | 'closed';
  answers: MiniPollAnswer[];
  stats: {
    totalVotes: number;
    winningAnswerIds: string[];
  };
  userVote: string | null;
};

export type HomeActivityItem = {
  id: string;
  title: string;
  timestamp: string;
  tone: 'neutral' | 'up';
};

export type TournamentStatusView =
  | {
      mode: 'countdown';
      kickoff: string;
      homeTeam: string;
      awayTeam: string;
    }
  | {
      mode: 'next-match';
      fixture: Fixture | null;
    };

export type HomeViewModel = {
  tournamentStatus: TournamentStatusView;
  podium: TeamListItem[];
  miniPoll: MiniPoll | null;
  recentActivity: HomeActivityItem[];
};

export type ClubViewModel = {
  user: User;
  teams: Team[];
  activeTeam: Team;
  favorites: TeamListItem[];
  tournamentProgress: {
    groups: 'complete' | 'pending';
    knockout: 'pending' | 'complete';
    specials: 'pending' | 'complete';
  };
};

export type ComparisonValue = {
  label: string;
  relation: ComparisonRelation;
  outcome: ComparisonOutcome;
  base: {
    values: string[];
    points: number | null;
    status: PickStatus;
  };
  reference: {
    values: string[];
    points: number | null;
    status: PickStatus;
  };
  meta?: {
    group?: string;
    jornada?: number;
    homeTeam?: string;
    awayTeam?: string;
    slot?: number;
  };
};

export type VersusComparison = {
  baseTeamId: string;
  mode: 'general' | 'participant';
  rivalTeamId: string | null;
  consensusData: { label: 'Consenso' } | null;
  equalPickPercentage: number;
  differentPickCount: number;
  pointDelta: number;
  biggestDifferenceSection: string;
  referenceLabel: string;
  sections: {
    resumen: Array<{
      key: string;
      label: string;
      basePoints: number;
      referencePoints: number;
      delta: number;
      equalCount: number;
      differentCount: number;
    }>;
    groupMatches: ComparisonValue[];
    groupPositions: ComparisonValue[];
    eliminatorias: ComparisonValue[];
    final: ComparisonValue[];
    podium: ComparisonValue[];
    specials: ComparisonValue[];
  };
};

export type DemoData = {
  meta: {
    source: string;
    generatedAt: string;
    scoredThrough: string;
    tournamentProgress: {
      groups: 'complete';
      knockout: 'pending';
      specials: 'pending';
    };
    credentials: {
      password: string;
      note: string;
    };
  };
  groups: Record<string, string[]>;
  actualGroupOrders: Record<string, string[]>;
  fixtures: {
    groups: Fixture[];
    knockout: Record<string, Fixture[]>;
  };
  ranking: Array<{
    teamId: string;
    teamName: string;
    ownerHandle: string;
    totalPoints: number;
    currentRank: number;
  }>;
  users: Array<{
    id: string;
    handle: string;
    password: string;
    teamIds: string[];
    favorites: string[];
    versusPreferences: VersusPreferences;
  }>;
  teams: Team[];
};

export type SessionState = {
  userId: string;
  handle: string;
  activeTeamId: string;
  favorites: string[];
  versusPreferences: VersusPreferences;
  pollVotes: Record<string, string>;
};
