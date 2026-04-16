/**
 * Polymarket integration for FIFA World Cup 2026 winner probabilities.
 * Uses public CLOB API (no auth required for reading).
 */

import { PREDICTION_TEAMS } from "./team-config";

const POLYMARKET_API = "https://clob.polymarket.com";
const GAMMA_API = "https://gamma-api.polymarket.com";

interface PolymarketOutcome {
  outcome: string;
  price: string;
}

interface PolymarketMarket {
  condition_id: string;
  question: string;
  tokens: Array<{ outcome: string; token_id: string; price: number }>;
  active: boolean;
}

interface GammaMarket {
  id: string;
  question: string;
  slug: string;
  active: boolean;
  closed: boolean;
  outcomes: string;
  outcomePrices: string;
  groupItemTitle?: string;
}

export interface TeamProbability {
  teamKey: string;
  teamName: string;
  probability01: number;
  probabilityPct: number;
  provider: "polymarket";
  marketLabel: string;
  marketRef: string;
  confidence: number;
}

/**
 * Fetch World Cup winner probabilities from Polymarket.
 * Strategy: search Gamma API for "World Cup 2026" winner markets,
 * then extract outcomes and prices.
 */
export async function fetchPolymarketProbabilities(signal?: AbortSignal): Promise<TeamProbability[]> {
  // Manual override from env
  const manualMap = process.env.WORLDCUP_MANUAL_MARKET_MAP;
  
  // Search for World Cup winner markets via Gamma API
  const searchTerms = ["world cup 2026 winner", "FIFA World Cup 2026", "win the 2026 world cup"];
  
  let markets: GammaMarket[] = [];
  
  for (const term of searchTerms) {
    try {
      const url = `${GAMMA_API}/markets?_limit=20&active=true&closed=false&_q=${encodeURIComponent(term)}`;
      const res = await fetch(url, { signal, next: { revalidate: 0 } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          markets = data;
          break;
        }
      }
    } catch {
      // Continue to next search term
    }
  }

  if (markets.length === 0) {
    throw new Error("No Polymarket World Cup winner market found");
  }

  // Score markets for relevance
  const scored = markets
    .filter(m => m.active && !m.closed)
    .map(market => {
      let score = 0;
      const q = (market.question || "").toLowerCase();
      const g = (market.groupItemTitle || "").toLowerCase();
      if (q.includes("world cup") || g.includes("world cup")) score += 3;
      if (q.includes("2026") || g.includes("2026")) score += 3;
      if (q.includes("winner") || q.includes("win") || q.includes("champion")) score += 2;
      if (q.includes("fifa")) score += 1;
      // Penalize individual match markets
      if (q.includes("vs") || q.includes("match") || q.includes("game")) score -= 5;
      return { market, score };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    throw new Error("No relevant World Cup winner market found after scoring");
  }

  const bestMarket = scored[0].market;
  const confidence = Math.min(scored[0].score / 9, 1);

  // Parse outcomes and prices
  let outcomes: string[] = [];
  let prices: number[] = [];
  
  try {
    outcomes = JSON.parse(bestMarket.outcomes || "[]");
    prices = JSON.parse(bestMarket.outcomePrices || "[]").map(Number);
  } catch {
    throw new Error("Failed to parse Polymarket market outcomes");
  }

  // Match our teams to outcomes
  const results: TeamProbability[] = [];

  for (const team of PREDICTION_TEAMS) {
    let matchedPrice = 0;
    let matched = false;

    for (let i = 0; i < outcomes.length; i++) {
      const outcomeLower = outcomes[i].toLowerCase();
      if (team.searchTerms.some(t => outcomeLower.includes(t))) {
        matchedPrice = prices[i] || 0;
        matched = true;
        break;
      }
    }

    // For binary markets (single team), check if the question itself matches
    if (!matched && outcomes.length <= 2) {
      const q = bestMarket.question.toLowerCase();
      if (team.searchTerms.some(t => q.includes(t))) {
        // Find "Yes" outcome
        const yesIdx = outcomes.findIndex(o => o.toLowerCase() === "yes");
        if (yesIdx >= 0) {
          matchedPrice = prices[yesIdx] || 0;
          matched = true;
        }
      }
    }

    results.push({
      teamKey: team.teamKey,
      teamName: team.teamName,
      probability01: matchedPrice,
      probabilityPct: Math.round(matchedPrice * 100),
      provider: "polymarket",
      marketLabel: bestMarket.question,
      marketRef: bestMarket.slug || bestMarket.id,
      confidence: matched ? confidence : 0,
    });
  }

  return results;
}
