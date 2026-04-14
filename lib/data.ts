// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

export interface User {
  id: string;
  username: string;
  teams: string[];
  favorites: string[];
  versusPreferences?: {
    lastMode?: "general" | "participante";
    lastRivalId?: string;
    lastFilter?: string;
    lastTab?: string;
  };
}

export interface Team {
  id: string;
  name: string;
  userId: string;
  username: string;
  championPick: string;
  totalPoints: number;
  groupPoints: number;
  finalPhasePoints: number;
  specialPoints: number;
  currentRank: number;
  specials: SpecialPicks;
}

export interface SpecialPicks {
  mejorJugador: string;
  mejorJoven: string;
  maxGoleador: string;
  maxAsistente: string;
  mejorPortero: string;
  maxGoleadorEsp: string;
  primerGolEsp: string;
  revelacion: string;
  decepcion: string;
  minutoPrimerGol: number;
}

export interface MiniPoll {
  id: string;
  title: string;
  publishedAt: string;
  closesAt: string;
  status: "active" | "closed";
  options: string[];
  votes: Record<string, number>;
}

export interface Fixture {
  id: string;
  stage: "groups" | "knockout";
  round: string;
  group?: string;
  homeTeam: string;
  awayTeam: string;
  status: "NS" | "LIVE" | "FT";
  kickoff: string;
  minute: number | null;
  score: { home: number | null; away: number | null };
  goals: Goal[];
}

export interface Goal {
  player: string;
  minute: number;
  team: "home" | "away";
}

export interface Favorite {
  id: string;
  teamId: string;
  userId: string;
}

export interface VersusComparison {
  baseTeamId: string;
  mode: "general" | "participante";
  rivalTeamId: string | null;
  consensusData: Record<string, number> | null;
  equalPickPercentage: number;
  differentPickCount: number;
  pointDelta: number;
  biggestDifferenceSection: string;
}

// ═══════════════════════════════════════════════════════
// OFFICIAL GROUPS — FIFA World Cup 2026
// ═══════════════════════════════════════════════════════

export const GROUPS: Record<string, string[]> = {
  A: ["México", "Sudáfrica", "Corea del Sur", "Chequia"],
  B: ["Canadá", "Bosnia y Herzegovina", "Catar", "Suiza"],
  C: ["Brasil", "Marruecos", "Haití", "Escocia"],
  D: ["Estados Unidos", "Paraguay", "Australia", "Turquía"],
  E: ["Alemania", "Curazao", "Costa de Marfil", "Ecuador"],
  F: ["Países Bajos", "Japón", "Suecia", "Túnez"],
  G: ["Bélgica", "Egipto", "Irán", "Nueva Zelanda"],
  H: ["España", "Cabo Verde", "Arabia Saudí", "Uruguay"],
  I: ["Francia", "Senegal", "Irak", "Noruega"],
  J: ["Argentina", "Argelia", "Austria", "Jordania"],
  K: ["Portugal", "RD Congo", "Uzbekistán", "Colombia"],
  L: ["Inglaterra", "Croacia", "Ghana", "Panamá"],
};

export const GROUP_COLORS: Record<string, string> = {
  A: "#6BBF78", B: "#EC1522", C: "#EAEA7E", D: "#0C66B6",
  E: "#F48020", F: "#006858", G: "#B0A8D9", H: "#55BCBB",
  I: "#4E3AA2", J: "#FEA999", K: "#F0417A", L: "#82001C",
};

// ═══════════════════════════════════════════════════════
// KNOCKOUT BRACKET — Official product crosses
// ═══════════════════════════════════════════════════════

export const KNOCKOUT_ROUNDS = [
  {
    name: "Dieciseisavos de Final",
    matches: [
      "2A vs 2B", "1E vs 3ABCDF", "1F vs 2C", "1C vs 2F",
      "1I vs 3CDFGH", "2E vs 2I", "1A vs 3CEFHI", "1L vs 3EHIJK",
      "1D vs 3BEFIJ", "1G vs 3AEHIJ", "2K vs 2L", "1H vs 2J",
      "1B vs 3EFGIJ", "1J vs 2H", "1K vs 3DEIJL", "2D vs 2G",
    ],
  },
  {
    name: "Octavos de Final",
    matches: [
      "G74 vs G77", "G73 vs G75", "G76 vs G78", "G79 vs G80",
      "G83 vs G84", "G81 vs G82", "G86 vs G88", "G85 vs G87",
    ],
  },
  {
    name: "Cuartos de Final",
    matches: ["G89 vs G90", "G93 vs G94", "G91 vs G92", "G95 vs G96"],
  },
  {
    name: "Semifinales",
    matches: ["G97 vs G98", "G99 vs G100"],
  },
  {
    name: "Tercer y Cuarto Puesto",
    matches: ["Perdedor 101 vs Perdedor 102"],
  },
  {
    name: "Final",
    matches: ["G101 vs G102"],
  },
];

// ═══════════════════════════════════════════════════════
// NAME NORMALIZATION (external API → canonical)
// ═══════════════════════════════════════════════════════

export const NAME_NORMALIZATION: Record<string, string> = {
  "Korea Republic": "Corea del Sur",
  "República de Corea": "Corea del Sur",
  "Curacao": "Curazao",
  "Curaçao": "Curazao",
  "Saudi Arabia": "Arabia Saudí",
  "IR Iran": "Irán",
  "Iran": "Irán",
  "Congo DR": "RD Congo",
  "DR Congo": "RD Congo",
  "Côte d'Ivoire": "Costa de Marfil",
  "Ivory Coast": "Costa de Marfil",
  "United States": "Estados Unidos",
  "USA": "Estados Unidos",
  "Netherlands": "Países Bajos",
  "Holland": "Países Bajos",
  "Panama": "Panamá",
  "Czechia": "Chequia",
  "Czech Republic": "Chequia",
  "Bosnia-Herzegovina": "Bosnia y Herzegovina",
  "Bosnia and Herzegovina": "Bosnia y Herzegovina",
  "Cape Verde": "Cabo Verde",
  "South Africa": "Sudáfrica",
  "South Korea": "Corea del Sur",
  "New Zealand": "Nueva Zelanda",
  "Scotland": "Escocia",
  "England": "Inglaterra",
  "Japan": "Japón",
  "Sweden": "Suecia",
  "Tunisia": "Túnez",
  "Belgium": "Bélgica",
  "Egypt": "Egipto",
  "Germany": "Alemania",
  "France": "Francia",
  "Morocco": "Marruecos",
  "Algeria": "Argelia",
  "Portugal": "Portugal",
  "Colombia": "Colombia",
  "Croatia": "Croacia",
  "Qatar": "Catar",
  "Switzerland": "Suiza",
  "Turkey": "Turquía",
  "Norway": "Noruega",
  "Iraq": "Irak",
  "Jordan": "Jordania",
  "Uzbekistan": "Uzbekistán",
  "Senegal": "Senegal",
  "Ghana": "Ghana",
  "Canada": "Canadá",
  "Mexico": "México",
  "Brazil": "Brasil",
  "Spain": "España",
  "Argentina": "Argentina",
  "Uruguay": "Uruguay",
  "Ecuador": "Ecuador",
  "Paraguay": "Paraguay",
  "Australia": "Australia",
  "Austria": "Austria",
};

export function normalizeName(name: string): string {
  return NAME_NORMALIZATION[name] || name;
}

// ═══════════════════════════════════════════════════════
// MOCK DATA — Participants
// ═══════════════════════════════════════════════════════

const MOCK_USERS_SEED: { id: string; username: string; teamNames: string[] }[] = [
  { id: "u1", username: "Carlos_M", teamNames: ["Los Toreros", "Furia Roja", "La Peña"] },
  { id: "u2", username: "Laura_G", teamNames: ["Las Campeonas"] },
  { id: "u3", username: "Pepe_92", teamNames: ["Dream Team", "Los Galácticos"] },
  { id: "u4", username: "Ana_F", teamNames: ["Las Águilas"] },
  { id: "u5", username: "Miki_R", teamNames: ["Vikingos FC"] },
  { id: "u6", username: "Sara_L", teamNames: ["Tiki-Taka"] },
  { id: "u7", username: "Dani_V", teamNames: ["Los Cracks"] },
  { id: "u8", username: "Lucía_P", teamNames: ["Estrellas"] },
  { id: "u9", username: "Marcos_T", teamNames: ["Titanes"] },
  { id: "u10", username: "Elena_S", teamNames: ["Fenix FC"] },
];

// Seeded random for deterministic mock data
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateMockParticipants(): Team[] {
  const rand = seededRandom(42);
  const champions = ["España", "Brasil", "Argentina", "Francia", "Alemania", "Inglaterra", "Portugal", "Países Bajos"];
  const players = ["Mbappé", "Vinicius Jr", "Bellingham", "Messi", "Haaland"];
  const young = ["Lamine Yamal", "Endrick", "Garnacho", "Mainoo", "Güler"];
  const goalers = ["Mbappé", "Haaland", "Kane", "Vinicius Jr", "Lewandowski"];
  const assists = ["De Bruyne", "Messi", "Pedri", "Bellingham", "Müller"];
  const gks = ["Courtois", "Donnarumma", "Alisson", "Ter Stegen", "Oblak"];
  const espGoalers = ["Morata", "Lamine Yamal", "Oyarzabal", "Joselu", "Ferran Torres"];
  const espFirst = ["Morata", "Lamine Yamal", "Dani Olmo", "Pedri", "Nico Williams"];
  const revelaciones = ["Haití", "Cabo Verde", "Curazao", "Jordania", "Uzbekistán"];
  const decepciones = ["Brasil", "Francia", "Argentina", "Alemania", "Inglaterra"];

  const pick = (arr: string[]) => arr[Math.floor(rand() * arr.length)];

  const teams: Team[] = [];
  let id = 1;

  for (const u of MOCK_USERS_SEED) {
    for (const teamName of u.teamNames) {
      const gp = Math.floor(rand() * 25);
      const fp = Math.floor(rand() * 40);
      const sp = Math.floor(rand() * 30);
      teams.push({
        id: `t${id}`,
        name: teamName,
        userId: u.id,
        username: u.username,
        championPick: pick(champions),
        totalPoints: gp + fp + sp,
        groupPoints: gp,
        finalPhasePoints: fp,
        specialPoints: sp,
        currentRank: 0,
        specials: {
          mejorJugador: pick(players),
          mejorJoven: pick(young),
          maxGoleador: pick(goalers),
          maxAsistente: pick(assists),
          mejorPortero: pick(gks),
          maxGoleadorEsp: pick(espGoalers),
          primerGolEsp: pick(espFirst),
          revelacion: pick(revelaciones),
          decepcion: pick(decepciones),
          minutoPrimerGol: Math.floor(rand() * 45) + 1,
        },
      });
      id++;
    }
  }

  // Sort and assign ranks
  teams.sort((a, b) => b.totalPoints - a.totalPoints);
  let rank = 1;
  for (let i = 0; i < teams.length; i++) {
    if (i > 0 && teams[i].totalPoints < teams[i - 1].totalPoints) rank = i + 1;
    teams[i].currentRank = rank;
  }

  return teams;
}

export const PARTICIPANTS = generateMockParticipants();

export const MOCK_USERS: User[] = MOCK_USERS_SEED.map((u) => ({
  id: u.id,
  username: u.username,
  teams: u.teamNames,
  favorites: [],
}));

// ═══════════════════════════════════════════════════════
// MOCK DATA — Fixtures (group stage)
// ═══════════════════════════════════════════════════════

function generateGroupFixtures(): Fixture[] {
  const fixtures: Fixture[] = [];
  let fid = 1;
  const matchups: [number, number][] = [
    [0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2],
  ];

  const baseDate = new Date("2026-06-11T19:00:00Z");

  Object.entries(GROUPS).forEach(([g, teams], gi) => {
    matchups.forEach((m, mi) => {
      const jornada = mi < 2 ? 1 : mi < 4 ? 2 : 3;
      const d = new Date(baseDate);
      d.setDate(d.getDate() + (jornada - 1) * 4 + gi);
      const hour = mi % 2 === 0 ? 19 : 21;
      d.setHours(hour, 0, 0, 0);

      fixtures.push({
        id: `f${fid++}`,
        stage: "groups",
        round: `Jornada ${jornada}`,
        group: g,
        homeTeam: teams[m[0]],
        awayTeam: teams[m[1]],
        status: "NS",
        kickoff: d.toISOString(),
        minute: null,
        score: { home: null, away: null },
        goals: [],
      });
    });
  });

  return fixtures;
}

export const FIXTURES = generateGroupFixtures();

// ═══════════════════════════════════════════════════════
// MOCK DATA — Mini Poll
// ═══════════════════════════════════════════════════════

export const MINI_POLL: MiniPoll = {
  id: "mp1",
  title: "¿Quién será el máximo goleador del Mundial?",
  publishedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  closesAt: new Date(Date.now() + 3600000 * 18).toISOString(),
  status: "active",
  options: ["Mbappé", "Haaland", "Vinicius Jr", "Kane", "Lamine Yamal"],
  votes: { Mbappé: 12, Haaland: 8, "Vinicius Jr": 15, Kane: 5, "Lamine Yamal": 10 },
};

// ═══════════════════════════════════════════════════════
// MOCK DATA — Activity feed
// ═══════════════════════════════════════════════════════

export const ACTIVITY = [
  { text: "@Laura_G ha subido al 2º puesto", time: "Hace 2h" },
  { text: "Nueva mini porra disponible", time: "Hace 6h" },
  { text: "Se han actualizado los resultados de la Jornada 1", time: "Hace 1d" },
  { text: "Ya está disponible la clasificación actualizada", time: "Hace 2d" },
];

// ═══════════════════════════════════════════════════════
// SCORING RULES REFERENCE (for display / validation)
// ═══════════════════════════════════════════════════════

export const SCORING = {
  resultadoExacto: 3,
  signo: 2,
  resultadoExactoTotal: 5, // 3 + 2
  partidoDobleSigno: 4,
  partidoDobleExacto: 10,
  posicionGrupo: 1,
  eliminatorias: {
    dieciseisavos: 6,
    octavos: 10,
    cuartos: 15,
    semis: 20,
    final: 25,
  },
  posicionesFinales: {
    tercero: 20,
    subcampeon: 30,
    campeon: 50,
  },
  especiales: {
    mejorJugador: 20,
    mejorJoven: 20,
    maxGoleador: 20,
    maxAsistente: 20,
    mejorPortero: 20,
    maxGoleadorEsp: 10,
    primerGolEsp: 10,
    revelacion: 10,
    decepcion: 10,
    minutoPrimerGol: 50,
  },
} as const;
