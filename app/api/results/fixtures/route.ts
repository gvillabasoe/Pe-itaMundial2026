import { NextResponse } from "next/server";
import { normalizeName, FIXTURES } from "@/lib/data";
import { normalizeCity } from "@/lib/venues";

const API_BASE = "https://v3.football.api-sports.io";
const WORLD_CUP_LEAGUE_ID = 1;

export async function GET(request: Request) {
  const apiKey = process.env.API_SPORTS_KEY;

  // No API key → return mock fixtures
  if (!apiKey) {
    return NextResponse.json({
      source: "mock",
      message: "API_SPORTS_KEY no configurada. Datos demo.",
      fixtures: FIXTURES,
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
      headers: { "x-apisports-key": apiKey },
      next: { revalidate: isLive ? 0 : 30 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "API request failed", status: res.status }, { status: res.status });
    }

    const data = await res.json();

    const fixtures = (data.response || []).map((item: Record<string, unknown>) => {
      const fixture = item.fixture as Record<string, unknown> | undefined;
      const league = item.league as Record<string, unknown> | undefined;
      const teams = item.teams as Record<string, Record<string, unknown>> | undefined;
      const goals = item.goals as Record<string, unknown> | undefined;
      const events = item.events as Array<Record<string, unknown>> | undefined;
      const venue = (fixture as Record<string, unknown>)?.venue as Record<string, unknown> | undefined;
      const status = (fixture as Record<string, unknown>)?.status as Record<string, unknown> | undefined;

      // Extract and normalize city
      const rawCity = venue?.city as string | undefined;
      const city = normalizeCity(rawCity || null);

      const round = (league?.round as string) || "";

      return {
        id: fixture?.id,
        stage: round.includes("Group") ? "groups" : "knockout",
        round,
        group: round.includes("Group") ? round.replace("Group ", "").charAt(0) : null,
        homeTeam: normalizeName((teams?.home?.name as string) || ""),
        awayTeam: normalizeName((teams?.away?.name as string) || ""),
        status: mapStatus(status?.short as string | undefined),
        kickoff: fixture?.date,
        minute: status?.elapsed as number | null,
        score: {
          home: (goals as Record<string, unknown>)?.home as number | null,
          away: (goals as Record<string, unknown>)?.away as number | null,
        },
        city,
        goals: (events || [])
          .filter((e) => (e.type as string) === "Goal")
          .map((e) => ({
            player: ((e.player as Record<string, unknown>)?.name as string) || "Desconocido",
            minute: ((e.time as Record<string, unknown>)?.elapsed as number) || 0,
            team: (e.team as Record<string, unknown>)?.id === (teams?.home?.id) ? "home" : "away",
          })),
      };
    });

    return NextResponse.json({ source: "live", fixtures });
  } catch (error) {
    console.error("API-Football error:", error);
    // Fallback to mock on error
    return NextResponse.json({
      source: "mock",
      message: "Error al conectar con la API. Datos demo.",
      fixtures: FIXTURES,
    });
  }
}

function mapStatus(short: string | undefined): "NS" | "LIVE" | "FT" {
  if (!short) return "NS";
  if (["1H", "2H", "HT", "ET", "P", "BT", "LIVE"].includes(short)) return "LIVE";
  if (["FT", "AET", "PEN"].includes(short)) return "FT";
  return "NS";
}
