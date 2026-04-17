import { NextResponse } from "next/server";
import { TEAM_SLUG_MAP } from "@/lib/config/teams";

/**
 * Server-side proxy to Polymarket Gamma API.
 * The browser never calls Polymarket directly.
 *
 * Hard rule: NEVER emit 0 as a silent fallback.
 */

const POLYMARKET_GAMMA_URL =
  "https://gamma-api.polymarket.com/markets?tag=soccer&limit=100";

interface GammaMarket {
  question?: string;
  outcomes?: string;
  outcomePrices?: string;
  active?: boolean;
  closed?: boolean;
  slug?: string;
  id?: string | number;
}

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(POLYMARKET_GAMMA_URL, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Polymarket no disponible", stale: true },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    const markets = (await res.json()) as GammaMarket[];

    if (!Array.isArray(markets) || markets.length === 0) {
      return NextResponse.json(
        { error: "Polymarket no devolvió mercados", stale: true },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    const worldCupMarket = markets.find((m) => {
      const q = (m.question ?? "").toLowerCase();
      if (m.closed === true) return false;
      const isWorldCup = q.includes("world cup");
      const is2026 = q.includes("2026");
      const isWinner =
        q.includes("win") || q.includes("winner") || q.includes("champion");
      return isWorldCup && is2026 && isWinner;
    });

    if (!worldCupMarket) {
      return NextResponse.json(
        {
          error: "Mercado del Mundial 2026 no encontrado en Polymarket",
          stale: true,
        },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    let outcomes: string[];
    let prices: string[];
    try {
      outcomes = JSON.parse(worldCupMarket.outcomes ?? "[]");
      prices = JSON.parse(worldCupMarket.outcomePrices ?? "[]");
    } catch (parseErr) {
      console.error(
        "[api/probabilities] No se pudo parsear outcomes/outcomePrices:",
        parseErr
      );
      return NextResponse.json(
        { error: "Datos de outcomes malformados", stale: true },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (
      !Array.isArray(outcomes) ||
      !Array.isArray(prices) ||
      outcomes.length === 0 ||
      prices.length === 0 ||
      outcomes.length !== prices.length
    ) {
      return NextResponse.json(
        { error: "Outcomes y prices con formato incompatible", stale: true },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    const probabilities: Record<string, number> = {};

    outcomes.forEach((outcome, i) => {
      const raw = parseFloat(prices[i]);
      if (Number.isNaN(raw)) return;
      const canonicalName = TEAM_SLUG_MAP[outcome] ?? outcome;
      probabilities[canonicalName] = parseFloat((raw * 100).toFixed(1));
    });

    if (Object.keys(probabilities).length === 0) {
      return NextResponse.json(
        { error: "No se pudieron parsear probabilidades", stale: true },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      {
        source: "polymarket",
        marketQuestion: worldCupMarket.question,
        marketRef: worldCupMarket.slug ?? String(worldCupMarket.id ?? ""),
        updatedAt: new Date().toISOString(),
        probabilities,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err) {
    console.error("[api/probabilities] Error inesperado:", err);
    return NextResponse.json(
      { error: "Error interno del servidor", stale: true },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
