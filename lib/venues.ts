// ═══════════════════════════════════════════════════════
// VENUES — Normalization & Regional Color Palette
// ═══════════════════════════════════════════════════════

export interface VenueRegion {
  name: string;
  colors: string[];
  cities: string[];
}

export const VENUE_REGIONS: VenueRegion[] = [
  {
    name: "Oeste",
    colors: ["#58BBB4", "#B4DDD0"],
    cities: ["Vancouver", "Seattle", "San Francisco", "Los Ángeles"],
  },
  {
    name: "Central",
    colors: ["#6DBF75", "#B6D554", "#998729"],
    cities: ["Ciudad de México", "Monterrey", "Guadalajara", "Houston", "Dallas", "Kansas City"],
  },
  {
    name: "Este",
    colors: ["#F58020", "#F58472", "#F8AA9D"],
    cities: ["Toronto", "Boston", "Filadelfia", "Miami", "Nueva York/Nueva Jersey", "Atlanta"],
  },
];

/** Map English / variant city names from API → canonical display name */
const CITY_NORMALIZATION: Record<string, string> = {
  // West
  "Vancouver": "Vancouver",
  "Seattle": "Seattle",
  "San Francisco": "San Francisco",
  "Santa Clara": "San Francisco",
  "Los Angeles": "Los Ángeles",
  "Los Ángeles": "Los Ángeles",
  "Inglewood": "Los Ángeles",
  // Central
  "Mexico City": "Ciudad de México",
  "Ciudad de México": "Ciudad de México",
  "Monterrey": "Monterrey",
  "Guadalajara": "Guadalajara",
  "Houston": "Houston",
  "Dallas": "Dallas",
  "Arlington": "Dallas",
  "Kansas City": "Kansas City",
  // East
  "Toronto": "Toronto",
  "Boston": "Boston",
  "Foxborough": "Boston",
  "Philadelphia": "Filadelfia",
  "Filadelfia": "Filadelfia",
  "Miami": "Miami",
  "Miami Gardens": "Miami",
  "New York": "Nueva York/Nueva Jersey",
  "New Jersey": "Nueva York/Nueva Jersey",
  "East Rutherford": "Nueva York/Nueva Jersey",
  "Nueva York/Nueva Jersey": "Nueva York/Nueva Jersey",
  "Atlanta": "Atlanta",
};

/**
 * Normalize a city name from API to canonical display name.
 * Returns null if city is unknown.
 */
export function normalizeCity(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  return CITY_NORMALIZATION[trimmed] || null;
}

/**
 * Get the regional color for a canonical city name.
 * Returns first color of the region, or a neutral fallback.
 */
export function getCityColor(city: string | null): string {
  if (!city) return "#98A3B8";
  for (const region of VENUE_REGIONS) {
    if (region.cities.includes(city)) {
      return region.colors[0];
    }
  }
  return "#98A3B8";
}

/**
 * Get the regional background tint for a canonical city name.
 */
export function getCityBgColor(city: string | null): string {
  if (!city) return "rgba(152,163,184,0.08)";
  for (const region of VENUE_REGIONS) {
    if (region.cities.includes(city)) {
      return `${region.colors[0]}18`;
    }
  }
  return "rgba(152,163,184,0.08)";
}
