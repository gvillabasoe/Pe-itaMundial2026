import type { VersusPreferences } from '@/lib/types';

export const APP_NAME = 'Peñita Mundial';
export const APP_SUBTITLE = 'IV Edición';
export const EUROPE_MADRID = 'Europe/Madrid';
export const TOURNAMENT_START_ISO = '2026-06-11T19:00:00Z';
export const DEMO_SOURCE_LABEL = 'Mock listo para sustituir';

export const NAV_ITEMS = [
  { href: '/', label: 'General' },
  { href: '/clasificacion', label: 'Clasificación' },
  { href: '/resultados', label: 'Resultados' },
  { href: '/mi-club', label: 'Mi Club' },
  { href: '/versus', label: 'Versus' },
] as const;

export const PALETTE = {
  bg: '#050608',
  bgSoft: '#06070A',
  bgPanel: '#0D1014',
  bgPanelAlt: '#12171D',
  text: '#F6F7FB',
  textStrong: '#FFFAF0',
  textMuted: '#98A3B8',
  white: '#FFFFFF',
  gold: '#D4AF37',
  goldBright: '#FFD87A',
  goldSoft: '#FFE5A3',
  goldDark: '#C99625',
  goldDeep: '#4B2F01',
  silver: '#C0C0C0',
  silverLight: '#F7FBFF',
  silverSoft: '#C7D2E0',
  silverDark: '#5E6879',
  bronze: '#CD7F32',
  success: '#27E6AC',
  successDark: '#0E8A67',
  successDeep: '#042B22',
  amber: '#FFF3BA',
  amberDark: '#DFBE38',
  amberDeep: '#665113',
  danger: '#FF7AA5',
  dangerDark: '#AD1F49',
  dangerDeep: '#2C0714',
  accentRanking: '#D9B449',
  accentParticipant: '#6BBF78',
  accentVersus: '#F0417A',
} as const;

export const GROUP_COLORS = {
  A: '#6BBF78',
  B: '#EC1522',
  C: '#EAEA7E',
  D: '#0C66B6',
  E: '#F48020',
  F: '#006858',
  G: '#B0A8D9',
  H: '#55BCBB',
  I: '#4E3AA2',
  J: '#FEA999',
  K: '#F0417A',
  L: '#82001C',
} as const;

export const GROUPS = {
  A: ['Mexico', 'Sudafrica', 'Corea', 'Irlanda'],
  B: ['Canada', 'Italia', 'Qatar', 'Suiza'],
  C: ['Brasil', 'Marruecos', 'Haiti', 'Escocia'],
  D: ['USA', 'Paraguay', 'Australia', 'Turquia'],
  E: ['Alemania', 'Curazao', 'CostaMarfil', 'Ecuador'],
  F: ['Holanda', 'Japon', 'Suecia', 'Tunez'],
  G: ['Belgica', 'Egipto', 'Iran', 'NuevaZelanda'],
  H: ['Espana', 'CaboVerde', 'ArabiaSaudi', 'Uruguay'],
  I: ['Francia', 'Senegal', 'Bolivia', 'Noruega'],
  J: ['Argentina', 'Argelia', 'Austria', 'Jordania'],
  K: ['Portugal', 'Jamaica', 'Uzbekistan', 'Colombia'],
  L: ['Inglaterra', 'Croacia', 'Ghana', 'Panama'],
} as const;

export const TEAM_META = {
  Mexico: { label: 'México', flag: '🇲🇽', short: 'MEX' },
  Sudafrica: { label: 'Sudáfrica', flag: '🇿🇦', short: 'RSA' },
  Corea: { label: 'Corea', flag: '🇰🇷', short: 'KOR' },
  Irlanda: { label: 'Irlanda', flag: '🇮🇪', short: 'IRL' },
  Canada: { label: 'Canadá', flag: '🇨🇦', short: 'CAN' },
  Italia: { label: 'Italia', flag: '🇮🇹', short: 'ITA' },
  Qatar: { label: 'Qatar', flag: '🇶🇦', short: 'QAT' },
  Suiza: { label: 'Suiza', flag: '🇨🇭', short: 'SUI' },
  Brasil: { label: 'Brasil', flag: '🇧🇷', short: 'BRA' },
  Marruecos: { label: 'Marruecos', flag: '🇲🇦', short: 'MAR' },
  Haiti: { label: 'Haití', flag: '🇭🇹', short: 'HAI' },
  Escocia: { label: 'Escocia', flag: '🏴', short: 'SCO' },
  USA: { label: 'USA', flag: '🇺🇸', short: 'USA' },
  Paraguay: { label: 'Paraguay', flag: '🇵🇾', short: 'PAR' },
  Australia: { label: 'Australia', flag: '🇦🇺', short: 'AUS' },
  Turquia: { label: 'Turquía', flag: '🇹🇷', short: 'TUR' },
  Alemania: { label: 'Alemania', flag: '🇩🇪', short: 'GER' },
  Curazao: { label: 'Curazao', flag: '🇨🇼', short: 'CUW' },
  CostaMarfil: { label: 'Costa de Marfil', flag: '🇨🇮', short: 'CIV' },
  Ecuador: { label: 'Ecuador', flag: '🇪🇨', short: 'ECU' },
  Holanda: { label: 'Holanda', flag: '🇳🇱', short: 'NED' },
  Japon: { label: 'Japón', flag: '🇯🇵', short: 'JPN' },
  Suecia: { label: 'Suecia', flag: '🇸🇪', short: 'SWE' },
  Tunez: { label: 'Túnez', flag: '🇹🇳', short: 'TUN' },
  Belgica: { label: 'Bélgica', flag: '🇧🇪', short: 'BEL' },
  Egipto: { label: 'Egipto', flag: '🇪🇬', short: 'EGY' },
  Iran: { label: 'Irán', flag: '🇮🇷', short: 'IRN' },
  NuevaZelanda: { label: 'Nueva Zelanda', flag: '🇳🇿', short: 'NZL' },
  Espana: { label: 'España', flag: '🇪🇸', short: 'ESP' },
  CaboVerde: { label: 'Cabo Verde', flag: '🇨🇻', short: 'CPV' },
  ArabiaSaudi: { label: 'Arabia Saudí', flag: '🇸🇦', short: 'KSA' },
  Uruguay: { label: 'Uruguay', flag: '🇺🇾', short: 'URU' },
  Francia: { label: 'Francia', flag: '🇫🇷', short: 'FRA' },
  Senegal: { label: 'Senegal', flag: '🇸🇳', short: 'SEN' },
  Bolivia: { label: 'Bolivia', flag: '🇧🇴', short: 'BOL' },
  Noruega: { label: 'Noruega', flag: '🇳🇴', short: 'NOR' },
  Argentina: { label: 'Argentina', flag: '🇦🇷', short: 'ARG' },
  Argelia: { label: 'Argelia', flag: '🇩🇿', short: 'ALG' },
  Austria: { label: 'Austria', flag: '🇦🇹', short: 'AUT' },
  Jordania: { label: 'Jordania', flag: '🇯🇴', short: 'JOR' },
  Portugal: { label: 'Portugal', flag: '🇵🇹', short: 'POR' },
  Jamaica: { label: 'Jamaica', flag: '🇯🇲', short: 'JAM' },
  Uzbekistan: { label: 'Uzbekistán', flag: '🇺🇿', short: 'UZB' },
  Colombia: { label: 'Colombia', flag: '🇨🇴', short: 'COL' },
  Inglaterra: { label: 'Inglaterra', flag: '🏴', short: 'ENG' },
  Croacia: { label: 'Croacia', flag: '🇭🇷', short: 'CRO' },
  Ghana: { label: 'Ghana', flag: '🇬🇭', short: 'GHA' },
  Panama: { label: 'Panamá', flag: '🇵🇦', short: 'PAN' },
} as const;

export const RESULTS_SECTION_ORDER = [
  'Fase de grupos - Jornada 1',
  'Fase de grupos - Jornada 2',
  'Fase de grupos - Jornada 3',
  'Dieciseisavos de Final',
  'Octavos de Final',
  'Cuartos de Final',
  'Semifinales',
  'Tercer y Cuarto Puesto',
  'Final',
] as const;

export const CLUB_TABS = ['Resumen', 'Partidos', 'Grupos', 'Eliminatorias', 'Especiales', 'Favoritos'] as const;
export const VERSUS_TABS = ['Resumen', 'Grupos', 'Eliminatorias', 'Final', 'Podio', 'Especiales'] as const;

export const DEFAULT_VERSUS_PREFERENCES: VersusPreferences = {
  mode: 'general',
  rivalTeamId: null,
  filter: 'all',
  tab: 'resumen',
};

export const SPECIAL_PENDING_LABELS = [
  { key: 'MejorJugador', label: 'Mejor Jugador' },
  { key: 'MejorJugadorJoven', label: 'Mejor jugador joven' },
  { key: 'MaximoGoleador', label: 'Máximo goleador' },
  { key: 'MaximoAsistente', label: 'Máximo asistente' },
  { key: 'MejorPortero', label: 'Mejor portero' },
  { key: 'MaximoGoleadorESP', label: 'Máximo goleador español' },
  { key: 'PrimerGolESP', label: 'Primer goleador español' },
  { key: 'SeleccionRevelacion', label: 'Selección revelación' },
  { key: 'SeleccionDecepcion', label: 'Selección decepción' },
  { key: 'MinutoPrimerGol', label: 'Minuto primer gol del Mundial' },
] as const;
