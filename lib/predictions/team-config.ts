export interface PredictionTeam {
  teamKey: string;
  teamName: string;
  color: string;
  stroke?: string;
  accent?: string;
  isPrimaryFocus: boolean;
  searchTerms: string[];
}

export const PREDICTION_TEAMS: PredictionTeam[] = [
  { teamKey: "espana", teamName: "España", color: "#C1121F", isPrimaryFocus: true, searchTerms: ["spain", "españa", "espana"] },
  { teamKey: "argentina", teamName: "Argentina", color: "#6EC6FF", isPrimaryFocus: false, searchTerms: ["argentina"] },
  { teamKey: "francia", teamName: "Francia", color: "#1D4ED8", isPrimaryFocus: false, searchTerms: ["france", "francia"] },
  { teamKey: "inglaterra", teamName: "Inglaterra", color: "#6B7280", isPrimaryFocus: false, searchTerms: ["england", "inglaterra"] },
  { teamKey: "portugal", teamName: "Portugal", color: "#C1121F", accent: "#047857", isPrimaryFocus: false, searchTerms: ["portugal"] },
  { teamKey: "brasil", teamName: "Brasil", color: "#EAB308", isPrimaryFocus: false, searchTerms: ["brazil", "brasil"] },
  { teamKey: "alemania", teamName: "Alemania", color: "#FFFFFF", stroke: "#111827", isPrimaryFocus: false, searchTerms: ["germany", "alemania", "deutschland"] },
];

export const TEAM_ORDER = PREDICTION_TEAMS.map(t => t.teamKey);

export function getTeamConfig(key: string): PredictionTeam | undefined {
  return PREDICTION_TEAMS.find(t => t.teamKey === key);
}
