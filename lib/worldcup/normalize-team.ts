/**
 * Normalize team names to filesystem-safe keys for flag lookup.
 * UI always shows human-readable names with accents.
 * Normalization is ONLY for internal asset resolution.
 */

const ALIASES: Record<string, string[]> = {
  paises_bajos: ["paises_bajos", "holanda"],
  estados_unidos: ["estados_unidos", "usa", "eeuu", "us"],
  arabia_saudi: ["arabia_saudi", "arabia_saudita"],
  rd_del_congo: ["rd_del_congo", "rd_congo", "republica_democratica_del_congo"],
  bosnia_y_herzegovina: ["bosnia_y_herzegovina", "bosnia_herzegovina"],
  corea_del_sur: ["corea_del_sur", "corea_sur", "corea"],
  republica_checa: ["republica_checa", "chequia"],
};

// Build reverse alias map
const REVERSE_ALIASES: Record<string, string> = {};
for (const [canonical, aliases] of Object.entries(ALIASES)) {
  for (const alias of aliases) {
    REVERSE_ALIASES[alias] = canonical;
  }
}

/**
 * Normalize a human team name to a filesystem-safe key.
 * - lowercase
 * - remove diacritics/accents
 * - ñ → n
 * - replace separators/symbols with _
 * - collapse multiple underscores
 * - trim leading/trailing underscores
 */
export function normalizeTeamKey(name: string): string {
  let key = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/ñ/g, "n")
    .replace(/[''´`".,:;!?()[\]{}]/g, "")
    .replace(/[\s\-\/\\]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  // Check aliases
  if (REVERSE_ALIASES[key]) {
    key = REVERSE_ALIASES[key];
  }

  return key;
}

// Special filename overrides where the actual file doesn't match the normalized key
const FILENAME_OVERRIDES: Record<string, string> = {
  paises_bajos: "Holanda",
  estados_unidos: "USA",
  corea_del_sur: "Corea",
  republica_checa: "Republica_Checa", // actual file is República_Checa but may not resolve
  chequia: "Republica_Checa",
  catar: "Qatar",
  irak: "Iraq",
  haiti: "Haiti",
  turquia: "Turquia",
};

// Map from normalized key to the actual PNG filename (without extension)
// Built from scanning the actual /public/flags/ directory
const KNOWN_FLAGS: Record<string, string> = {
  alemania: "Alemania",
  arabia_saudi: "Arabia_Saudí",
  argelia: "Argelia",
  argentina: "Argentina",
  australia: "Australia",
  austria: "Austria",
  belgica: "Bélgica",
  bolivia: "Bolivia",
  bosnia_y_herzegovina: "Bosnia_y_Herzegovina",
  brasil: "Brasil",
  cabo_verde: "Cabo_Verde",
  canada: "Canadá",
  colombia: "Colombia",
  corea_del_sur: "Corea",
  costa_de_marfil: "Costa_Marfil",
  croacia: "Croacia",
  curazao: "Curazao",
  ecuador: "Ecuador",
  egipto: "Egipto",
  escocia: "Escocia",
  espana: "España",
  estados_unidos: "USA",
  francia: "Francia",
  ghana: "Ghana",
  haiti: "Haiti",
  holanda: "Holanda",
  paises_bajos: "Holanda",
  inglaterra: "Inglaterra",
  irak: "Iraq",
  iran: "Irán",
  japon: "Japón",
  jordania: "Jordania",
  marruecos: "Marruecos",
  mexico: "México",
  noruega: "Noruega",
  nueva_zelanda: "Nueva_Zelanda",
  panama: "Panamá",
  paraguay: "Paraguay",
  portugal: "Portugal",
  catar: "Qatar",
  rd_del_congo: "RD_Congo",
  rd_congo: "RD_Congo",
  senegal: "Senegal",
  sudafrica: "Sudáfrica",
  suecia: "Suecia",
  suiza: "Suiza",
  tunez: "Túnez",
  turquia: "Turquia",
  uruguay: "Uruguay",
  uzbekistan: "Uzbekistán",
  chequia: "República_Checa",
  republica_checa: "República_Checa",
};

/**
 * Get the flag image path for a team name.
 * Returns null if no flag found (UI should show placeholder).
 */
export function getFlagForTeam(name: string): string | null {
  const key = normalizeTeamKey(name);

  // Check overrides first
  if (FILENAME_OVERRIDES[key]) {
    return `/flags/${FILENAME_OVERRIDES[key]}.png`;
  }

  // Check known flags
  if (KNOWN_FLAGS[key]) {
    return `/flags/${KNOWN_FLAGS[key]}.png`;
  }

  // Try direct capitalized match
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
  // This is a last resort — may not work for accented filenames on all systems

  if (process.env.NODE_ENV === "development") {
    console.warn(`[flags] No flag found for team: "${name}" (key: "${key}")`);
  }

  return null;
}

/** Emoji fallback map */
const FLAG_EMOJI: Record<string, string> = {
  mexico: "🇲🇽", sudafrica: "🇿🇦", corea_del_sur: "🇰🇷", chequia: "🇨🇿",
  canada: "🇨🇦", bosnia_y_herzegovina: "🇧🇦", catar: "🇶🇦", suiza: "🇨🇭",
  brasil: "🇧🇷", marruecos: "🇲🇦", haiti: "🇭🇹", escocia: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  estados_unidos: "🇺🇸", paraguay: "🇵🇾", australia: "🇦🇺", turquia: "🇹🇷",
  alemania: "🇩🇪", curazao: "🇨🇼", costa_de_marfil: "🇨🇮", ecuador: "🇪🇨",
  paises_bajos: "🇳🇱", japon: "🇯🇵", suecia: "🇸🇪", tunez: "🇹🇳",
  belgica: "🇧🇪", egipto: "🇪🇬", iran: "🇮🇷", nueva_zelanda: "🇳🇿",
  espana: "🇪🇸", cabo_verde: "🇨🇻", arabia_saudi: "🇸🇦", uruguay: "🇺🇾",
  francia: "🇫🇷", senegal: "🇸🇳", irak: "🇮🇶", noruega: "🇳🇴",
  argentina: "🇦🇷", argelia: "🇩🇿", austria: "🇦🇹", jordania: "🇯🇴",
  portugal: "🇵🇹", rd_del_congo: "🇨🇩", uzbekistan: "🇺🇿", colombia: "🇨🇴",
  inglaterra: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", croacia: "🇭🇷", ghana: "🇬🇭", panama: "🇵🇦",
};

export function getFlagEmoji(name: string): string {
  const key = normalizeTeamKey(name);
  return FLAG_EMOJI[key] || "🏳️";
}
