/**
 * Kalshi fallback for World Cup 2026 winner probabilities.
 * Uses public market data endpoints.
 */

import { PREDICTION_TEAMS } from "./team-config";
import type { TeamProbability } from "./polymarket";

const KALSHI_API = "https://api.elections.kalshi.com/trade-api/v2";

interface KalshiMarket {
  ticker: string;
  title: string;
  status: string;
  yes_ask: number;
  yes_bid: number;
  last_price: number;
  result?: string;
}

export async function fetchKalshiProbabilities(signal?: AbortSignal): Promise<TeamProbability[]> {
  const manualMap = process.env.WORLDCUP_MANUAL_KALSHI_MAP;

  // Search for World Cup winner events
  const searchUrl = `${KALSHI_API}/markets?limit=50&status=open&series_ticker=FIFA`;
  
  let markets: KalshiMarket[] = [];
  
  try {
    // Try series-based search
    const res = await fetch(searchUrl, { signal, next: { revalidate: 0 } });
    if (res.ok) {
      const data = await res.json();
      markets = data.markets || [];
    }
  } catch {
    // Fallback: try cursor-based search
    try {
      const fallbackUrl = `${KALSHI_API}/markets?limit=50&status=open`;
      const res = await fetch(fallbackUrl, { signal, next: { revalidate: 0 } });
      if (res.ok) {
        const data = await res.json();
        const all = data.markets || [];
        markets = all.filter((m: KalshiMarket) => {
          const t = m.title.toLowerCase();
          return (t.includes("world cup") || t.includes("fifa")) && t.includes("2026");
        });
      }
    } catch {
      throw new Error("Kalshi API unavailable");
    }
  }

  // Filter for relevant markets
  const relevant = markets.filter(m => {
    const t = m.title.toLowerCase();
    return (t.includes("world cup") || t.includes("fifa")) && !t.includes("vs");
  });

  const results: TeamProbability[] = [];

  for (const team of PREDICTION_TEAMS) {
    let price = 0;
    let matched = false;
    let marketLabel = "";
    let marketRef = "";

    for (const market of relevant) {
      const titleLower = market.title.toLowerCase();
      if (team.searchTerms.some(t => titleLower.includes(t))) {
        price = market.last_price || market.yes_ask || 0;
        // Kalshi prices are in cents (0-100) or dollars (0-1)
        if (price > 1) price = price / 100;
        matched = true;
        marketLabel = market.title;
        marketRef = market.ticker;
        break;
      }
    }

    results.push({
      teamKey: team.teamKey,
      teamName: team.teamName,
      probability01: price,
      probabilityPct: Math.round(price * 100),
      provider: "polymarket" as const, // will be overridden
      marketLabel: marketLabel || "Kalshi World Cup 2026",
      marketRef: marketRef || "kalshi",
      confidence: matched ? 0.7 : 0,
    });
  }

  return results.map(r => ({ ...r, provider: "polymarket" })); // Type compat
}
