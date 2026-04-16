/**
 * Robust flag resolution.
 * Returns image path if the file exists on disk (tested at build),
 * otherwise returns null so the UI can fall back to emoji.
 */

const FLAG_EMOJI: Record<string, string> = {
  "México":"🇲🇽","Sudáfrica":"🇿🇦","Corea del Sur":"🇰🇷","Chequia":"🇨🇿",
  "Canadá":"🇨🇦","Bosnia y Herzegovina":"🇧🇦","Catar":"🇶🇦","Suiza":"🇨🇭",
  "Brasil":"🇧🇷","Marruecos":"🇲🇦","Haití":"🇭🇹","Escocia":"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Estados Unidos":"🇺🇸","Paraguay":"🇵🇾","Australia":"🇦🇺","Turquía":"🇹🇷",
  "Alemania":"🇩🇪","Curazao":"🇨🇼","Costa de Marfil":"🇨🇮","Ecuador":"🇪🇨",
  "Países Bajos":"🇳🇱","Japón":"🇯🇵","Suecia":"🇸🇪","Túnez":"🇹🇳",
  "Bélgica":"🇧🇪","Egipto":"🇪🇬","Irán":"🇮🇷","Nueva Zelanda":"🇳🇿",
  "España":"🇪🇸","Cabo Verde":"🇨🇻","Arabia Saudí":"🇸🇦","Uruguay":"🇺🇾",
  "Francia":"🇫🇷","Senegal":"🇸🇳","Irak":"🇮🇶","Noruega":"🇳🇴",
  "Argentina":"🇦🇷","Argelia":"🇩🇿","Austria":"🇦🇹","Jordania":"🇯🇴",
  "Portugal":"🇵🇹","RD Congo":"🇨🇩","Uzbekistán":"🇺🇿","Colombia":"🇨🇴",
  "Inglaterra":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croacia":"🇭🇷","Ghana":"🇬🇭","Panamá":"🇵🇦",
};

/**
 * Maps canonical country name → image file in /public/flags/.
 * Only maps files that actually exist with safe ASCII-compatible names.
 * For files with accented chars, Next.js + Vercel may fail to serve them,
 * so we only list paths we're confident about.
 */
const FLAG_IMAGE_MAP: Record<string, string> = {
  "Alemania": "/flags/Alemania.png",
  "Argelia": "/flags/Argelia.png",
  "Argentina": "/flags/Argentina.png",
  "Australia": "/flags/Australia.png",
  "Austria": "/flags/Austria.png",
  "Bosnia y Herzegovina": "/flags/Bosnia_y_Herzegovina.png",
  "Brasil": "/flags/Brasil.png",
  "Colombia": "/flags/Colombia.png",
  "Croacia": "/flags/Croacia.png",
  "Curazao": "/flags/Curazao.png",
  "Ecuador": "/flags/Ecuador.png",
  "Egipto": "/flags/Egipto.png",
  "Escocia": "/flags/Escocia.png",
  "Francia": "/flags/Francia.png",
  "Ghana": "/flags/Ghana.png",
  "Haití": "/flags/Haiti.png",
  "Países Bajos": "/flags/Holanda.png",
  "Inglaterra": "/flags/Inglaterra.png",
  "Irak": "/flags/Iraq.png",
  "Marruecos": "/flags/Marruecos.png",
  "Noruega": "/flags/Noruega.png",
  "Paraguay": "/flags/Paraguay.png",
  "Portugal": "/flags/Portugal.png",
  "Catar": "/flags/Qatar.png",
  "RD Congo": "/flags/RD_Congo.png",
  "Senegal": "/flags/Senegal.png",
  "Suecia": "/flags/Suecia.png",
  "Suiza": "/flags/Suiza.png",
  "Turquía": "/flags/Turquia.png",
  "Estados Unidos": "/flags/USA.png",
  "Uruguay": "/flags/Uruguay.png",
  "Costa de Marfil": "/flags/Costa_Marfil.png",
  "Nueva Zelanda": "/flags/Nueva_Zelanda.png",
  "Corea del Sur": "/flags/Corea.png",
};

/** Get image path for a country. Returns null if unknown/risky filename. */
export function getFlagPath(country: string): string | null {
  return FLAG_IMAGE_MAP[country] || null;
}

/** Get emoji for a country. Always returns something. */
export function getFlagEmoji(country: string): string {
  return FLAG_EMOJI[country] || "🏳️";
}

export default FLAG_IMAGE_MAP;
