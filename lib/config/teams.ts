/**
 * Centralized team configuration.
 * Single source of truth for:
 *  - team display colors (used in /probabilidades and elsewhere)
 *  - Polymarket outcome → canonical Spanish name mapping
 *
 * Portugal is GREEN (#16A34A) to avoid clashing with España (red).
 */

export interface TeamConfig {
  key: string;
  displayName: string;
  color: string;
  stroke?: string;
  accent?: string;
  isPrimaryFocus?: boolean;
}

export const TEAMS: TeamConfig[] = [
  { key: "espana",     displayName: "España",     color: "#C1121F", isPrimaryFocus: true },
  { key: "argentina",  displayName: "Argentina",  color: "#6EC6FF" },
  { key: "francia",    displayName: "Francia",    color: "#1D4ED8" },
  { key: "inglaterra", displayName: "Inglaterra", color: "#6B7280" },
  { key: "portugal",   displayName: "Portugal",   color: "#16A34A", accent: "#047857" },
  { key: "brasil",     displayName: "Brasil",     color: "#EAB308" },
  { key: "alemania",   displayName: "Alemania",   color: "#FFFFFF", stroke: "#111827" },
];

export const TEAM_ORDER: string[] = TEAMS.map((t) => t.key);

export function getTeamByKey(key: string): TeamConfig | undefined {
  return TEAMS.find((t) => t.key === key);
}

export function getTeamByDisplayName(name: string): TeamConfig | undefined {
  return TEAMS.find((t) => t.displayName === name);
}

export function getTeamColor(displayName: string): string {
  return getTeamByDisplayName(displayName)?.color ?? "#98A3B8";
}

/**
 * Polymarket outcome name (English) → canonical Spanish display name.
 * Used by /api/probabilities to normalize outcomes.
 */
export const TEAM_SLUG_MAP: Record<string, string> = {
  "Spain": "España",
  "France": "Francia",
  "England": "Inglaterra",
  "Argentina": "Argentina",
  "Brazil": "Brasil",
  "Germany": "Alemania",
  "Portugal": "Portugal",
  "Netherlands": "Países Bajos",
  "Holland": "Países Bajos",
  "Italy": "Italia",
  "Belgium": "Bélgica",
  "Croatia": "Croacia",
  "Uruguay": "Uruguay",
  "Mexico": "México",
  "United States": "Estados Unidos",
  "USA": "Estados Unidos",
  "Morocco": "Marruecos",
  "Japan": "Japón",
  "Senegal": "Senegal",
  "Switzerland": "Suiza",
  "Colombia": "Colombia",
  "Ecuador": "Ecuador",
  "Australia": "Australia",
  "Korea Republic": "Corea del Sur",
  "South Korea": "Corea del Sur",
  "Canada": "Canadá",
  "Denmark": "Dinamarca",
  "Norway": "Noruega",
  "Poland": "Polonia",
  "Wales": "Gales",
  "Turkey": "Turquía",
  "Saudi Arabia": "Arabia Saudí",
  "Iran": "Irán",
  "Egypt": "Egipto",
  "Nigeria": "Nigeria",
  "Ghana": "Ghana",
  "Cameroon": "Camerún",
  "Algeria": "Argelia",
  "Tunisia": "Túnez",
  "Ivory Coast": "Costa de Marfil",
  "Côte d'Ivoire": "Costa de Marfil",
  "South Africa": "Sudáfrica",
  "Cape Verde": "Cabo Verde",
  "DR Congo": "RD del Congo",
  "Congo DR": "RD del Congo",
  "Iraq": "Irak",
  "Jordan": "Jordania",
  "Qatar": "Catar",
  "Uzbekistan": "Uzbekistán",
  "Bosnia and Herzegovina": "Bosnia y Herzegovina",
  "Bosnia & Herzegovina": "Bosnia y Herzegovina",
  "Czechia": "Chequia",
  "Czech Republic": "Chequia",
  "New Zealand": "Nueva Zelanda",
  "Scotland": "Escocia",
  "Sweden": "Suecia",
  "Paraguay": "Paraguay",
  "Haiti": "Haití",
  "Curacao": "Curazao",
  "Curaçao": "Curazao",
  "Panama": "Panamá",
  "Austria": "Austria",
};
