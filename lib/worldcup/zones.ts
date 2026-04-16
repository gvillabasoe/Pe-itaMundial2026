/**
 * World Cup 2026 venue regions and color palette.
 * Single source of truth for venue → region → colors.
 */

export type Zone = "west" | "central" | "east";

export interface RegionPalette {
  primary: string;
  secondary: string;
  tertiary?: string;
}

export const REGION_PALETTES: Record<Zone, RegionPalette> = {
  west: { primary: "#58BBB4", secondary: "#B4DDD0" },
  central: { primary: "#6DBF75", secondary: "#B6D554", tertiary: "#998729" },
  east: { primary: "#F58020", secondary: "#F58472", tertiary: "#F8AA9D" },
};

export const REGION_BY_CITY: Record<string, Zone> = {
  "Vancouver": "west",
  "Seattle": "west",
  "San Francisco": "west",
  "Los Ángeles": "west",
  "Ciudad de México": "central",
  "Monterrey": "central",
  "Guadalajara": "central",
  "Houston": "central",
  "Dallas": "central",
  "Kansas City": "central",
  "Toronto": "east",
  "Boston": "east",
  "Filadelfia": "east",
  "Miami": "east",
  "Nueva York/Nueva Jersey": "east",
  "Atlanta": "east",
};

export const ALL_HOST_CITIES = Object.keys(REGION_BY_CITY);

export function getZoneForCity(city: string): Zone | null {
  return REGION_BY_CITY[city] || null;
}

export function getPaletteForCity(city: string): RegionPalette | null {
  const zone = getZoneForCity(city);
  return zone ? REGION_PALETTES[zone] : null;
}

export function getCityColor(city: string): string {
  const p = getPaletteForCity(city);
  return p?.primary || "#98A3B8";
}

export function getCityBgColor(city: string): string {
  const p = getPaletteForCity(city);
  return p ? `${p.primary}18` : "rgba(152,163,184,0.08)";
}

export const REGION_LABELS: Record<Zone, string> = {
  west: "Oeste",
  central: "Centro",
  east: "Este",
};
