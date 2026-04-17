/**
 * Backward-compat re-export.
 * The canonical team config now lives in `lib/config/teams.ts`.
 */

import { TEAMS, TEAM_ORDER, getTeamByKey } from "@/lib/config/teams";
import type { TeamConfig } from "@/lib/config/teams";

export interface PredictionTeam {
  teamKey: string;
  teamName: string;
  color: string;
  stroke?: string;
  accent?: string;
  isPrimaryFocus: boolean;
  searchTerms: string[];
}

const SEARCH_TERMS: Record<string, string[]> = {
  espana:     ["spain", "españa", "espana"],
  argentina:  ["argentina"],
  francia:    ["france", "francia"],
  inglaterra: ["england", "inglaterra"],
  portugal:   ["portugal"],
  brasil:     ["brazil", "brasil"],
  alemania:   ["germany", "alemania", "deutschland"],
};

export const PREDICTION_TEAMS: PredictionTeam[] = TEAMS.map((t: TeamConfig) => ({
  teamKey: t.key,
  teamName: t.displayName,
  color: t.color,
  stroke: t.stroke,
  accent: t.accent,
  isPrimaryFocus: !!t.isPrimaryFocus,
  searchTerms: SEARCH_TERMS[t.key] ?? [t.key],
}));

export { TEAM_ORDER };

export function getTeamConfig(key: string): PredictionTeam | undefined {
  const t = getTeamByKey(key);
  if (!t) return undefined;
  return {
    teamKey: t.key,
    teamName: t.displayName,
    color: t.color,
    stroke: t.stroke,
    accent: t.accent,
    isPrimaryFocus: !!t.isPrimaryFocus,
    searchTerms: SEARCH_TERMS[t.key] ?? [t.key],
  };
}
