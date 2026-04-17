/**
 * Backward-compat re-export.
 * The canonical region/palette config now lives in `lib/config/regions.ts`.
 */

export {
  REGION_PALETTES,
  REGION_BY_CITY,
  ALL_HOST_CITIES,
  REGION_LABELS,
  getZoneForCity,
  getPaletteForCity,
  getCityColor,
  getCityBgColor,
  assertKnownCity,
} from "@/lib/config/regions";

export type { Zone, RegionPalette } from "@/lib/config/regions";
