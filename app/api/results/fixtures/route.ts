import { NextResponse } from "next/server";
import { normalizeName } from "@/lib/data";

/**
 * GET /api/results/fixtures
 *
 * Proxy to API-Football (api-sports.io) for fixture data.
 * Keeps the API key server-side only.
 *
 * Query params:
 *   ?live=true       — fetch live matches only
 *   ?date=2026-06-11 — fetch by date
 *   ?season=2026     — defaults to 2026
 *   ?league=1        — FIFA World Cup league ID
 */

const API_BASE = "https://v3.football.api-sports.io";
const WORLD_CUP_LEAGUE_ID = 1; // FIFA World Cup

export async function GET(request: Request) {
  const apiKey = process.env.API_SPORTS_KEY;

  // If no API key configured, return mock data
  if (!apiKey) {
    return NextResponse.json({
      source: "mock",
      message: "API_SPORTS_KEY not configured. Returning mock data.",
      fixtures: [],
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const isLive = searchParams.get("live") === "true";
    const date = searchParams.get("date");
    const season = searchParams.get("season") || "2026";

    let endpoint = `${API_BASE}/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${season}`;
    if (isLive) endpoint += "&live=all";
    if (date) endpoint += `&date=${date}`;

    const res = await fetch(endpoint, {
      headers: {
        "x-apisports-key": apiKey,
      },
      // Cache for 30 seconds for non-live, no cache for live
      next: { revalidate: isLive ? 0 : 30 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "API request failed", status: res.status },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Normalize team names to canonical Spanish names
    const fixtures = (data.response || []).map((item: any) => ({
      id: item.fixture?.id,
      stage: item.league?.round?.includes("Group") ? "groups" : "knockout",
      round: item.league?.round || "",
      group: item.league?.round?.replace("Group ", "").charAt(0) || null,
      homeTeam: normalizeName(item.teams?.home?.name || ""),
      awayTeam: normalizeName(item.teams?.away?.name || ""),
      status: mapStatus(item.fixture?.status?.short),
      kickoff: item.fixture?.date,
      minute: item.fixture?.status?.elapsed,
      score: {
        home: item.goals?.home,
        away: item.goals?.away,
      },
      goals: (item.events || [])
        .filter((e: any) => e.type === "Goal")
        .map((e: any) => ({
          player: e.player?.name || "Desconocido",
          minute: e.time?.elapsed || 0,
          team: e.team?.id === item.teams?.home?.id ? "home" : "away",
        })),
    }));

    return NextResponse.json({ source: "live", fixtures });
  } catch (error) {
    console.error("API-Football error:", error);
    return NextResponse.json(
      { error: "Failed to fetch fixtures" },
      { status: 500 }
    );
  }
}

function mapStatus(short: string | undefined): "NS" | "LIVE" | "FT" {
  if (!short) return "NS";
  if (["1H", "2H", "HT", "ET", "P", "BT", "LIVE"].includes(short)) return "LIVE";
  if (["FT", "AET", "PEN"].includes(short)) return "FT";
  return "NS";
}
