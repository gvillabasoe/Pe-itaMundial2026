import { NextResponse } from "next/server";

/**
 * GET /api/probabilities
 *
 * Server-side proxy to The Odds API for World Cup 2026 winner probabilities.
 * - API key never exposed to the client.
 * - Decimal odds are converted to normalized probabilities (%).
 * - Updated every 60s on the client; this route itself caches 5 min via ISR.
 *
 * Register at https://the-odds-api.com and set ODDS_API_KEY in Vercel env.
 */

const ODDS_API_BASE = "https://api.the-odds-api.com/v4";

// Sport keys to try in order (The Odds API may use different keys)
const SPORT_KEYS_TO_TRY = [
  "soccer_fifa_world_cup_winner",
  "soccer_world_cup",
  "soccer_international_cup_winner",
];

// Canonical team name map: The Odds API → display name in Spanish
const TEAM_NAME_MAP: Record<string, string> = {
  "Spain": "España",
  "France": "Francia",
  "England": "Inglaterra",
  "Argentina": "Argentina",
  "Brazil": "Brasil",
  "Germany": "Alemania",
  "Portugal": "Portugal",
  "Netherlands": "Países Bajos",
  "Italy": "Italia",
  "Belgium": "Bélgica",
  "Croatia": "Croacia",
  "Uruguay": "Uruguay",
  "Mexico": "México",
  "United States": "Estados Unidos",
  "Morocco": "Marruecos",
  "Japan": "Japón",
  "Senegal": "Senegal",
  "Switzerland": "Suiza",
  "Colombia": "Colombia",
  "Ecuador": "Ecuador",
  "Australia": "Australia",
  "Korea Republic": "Corea del Sur",
  "Canada": "Canadá",
  "Denmark": "Dinamarca",
  "Norway": "Noruega",
};

// The 7 teams we want to display (in order)
const TARGET_TEAMS = [
  "España", "Argentina", "Francia", "Inglaterra",
  "Portugal", "Brasil", "Alemania",
];

interface OddsOutcome {
  name: string;
  price: number; // decimal odds
}

interface OddsBookmaker {
  key: string;
  title: string;
  markets: Array<{
    key: string;
    outcomes: OddsOutcome[];
  }>;
}

interface OddsEvent {
  id: string;
  sport_key: string;
  home_team: string;
  bookmakers: OddsBookmaker[];
}

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "ODDS_API_KEY no configurada", stale: true },
      { status: 503 }
    );
  }

  let events: OddsEvent[] = [];
  let usedSportKey = "";

  // Try each sport key until we get data
  for (const sportKey of SPORT_KEYS_TO_TRY) {
    try {
      const url = `${ODDS_API_BASE}/sports/${sportKey}/odds/?apiKey=${apiKey}&regions=eu,uk,us&markets=h2h,outrights&oddsFormat=decimal`;
      const res = await fetch(url, { next: { revalidate: 300 } });

      if (res.status === 404 || res.status === 422) continue; // try next key
      if (!res.ok) {
        console.error(`[api/probabilities] ${sportKey} → HTTP ${res.status}`);
        continue;
      }

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        events = data;
        usedSportKey = sportKey;
        break;
      }
    } catch (err) {
      console.error(`[api/probabilities] Error fetching ${sportKey}:`, err);
    }
  }

  if (events.length === 0) {
    return NextResponse.json(
      { error: "No se encontraron mercados para el Mundial 2026", stale: true },
      { status: 404 }
    );
  }

  // Collect all outcomes from all bookmakers across all events
  // Use the first available bookmaker's outrights/h2h market
  const rawOdds: Record<string, number[]> = {};

  for (const event of events) {
    for (const bookmaker of event.bookmakers) {
      // Prefer outrights, fall back to h2h
      const market =
        bookmaker.markets.find((m) => m.key === "outrights") ||
        bookmaker.markets.find((m) => m.key === "h2h");

      if (!market) continue;

      for (const outcome of market.outcomes) {
        if (typeof outcome.price !== "number" || outcome.price <= 1) continue;
        const canonical = TEAM_NAME_MAP[outcome.name] ?? outcome.name;
        if (!rawOdds[canonical]) rawOdds[canonical] = [];
        rawOdds[canonical].push(outcome.price);
      }
    }
  }

  if (Object.keys(rawOdds).length === 0) {
    return NextResponse.json(
      { error: "Datos de cuotas vacíos o malformados", stale: true },
      { status: 500 }
    );
  }

  // Average odds per team (across bookmakers), then convert to probability
  const avgOdds: Record<string, number> = {};
  for (const [team, odds] of Object.entries(rawOdds)) {
    const avg = odds.reduce((a, b) => a + b, 0) / odds.length;
    avgOdds[team] = avg;
  }

  // Implicit probability: 1 / decimal_odds
  const rawProbs: Record<string, number> = {};
  for (const [team, odds] of Object.entries(avgOdds)) {
    rawProbs[team] = 1 / odds;
  }

  // Normalize to remove bookmaker margin
  const sumRaw = Object.values(rawProbs).reduce((a, b) => a + b, 0);
  if (sumRaw === 0) {
    return NextResponse.json(
      { error: "Suma de probabilidades brutas es 0", stale: true },
      { status: 500 }
    );
  }

  // Build normalized probabilities as percentages (1 decimal)
  const probabilities: Record<string, number> = {};
  for (const [team, raw] of Object.entries(rawProbs)) {
    probabilities[team] = parseFloat(((raw / sumRaw) * 100).toFixed(1));
  }

  return NextResponse.json(
    {
      source: "the-odds-api",
      sportKey: usedSportKey,
      updatedAt: new Date().toISOString(),
      probabilities, // { "España": 23.4, "Francia": 18.1, ... }
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
