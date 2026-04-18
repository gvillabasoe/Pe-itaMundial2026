import { NextResponse } from "next/server";
import { normalizeName } from "@/lib/data";
import { normalizeCity } from "@/lib/config/regions";
import type { MatchStage } from "@/lib/worldcup/schedule";

const API_BASE = "https://v3.football.api-sports.io";
const WORLD_CUP_LEAGUE_ID = 1;
const COPA_DEL_REY_FINAL_KICKOFF = "2026-04-18T21:00:00+02:00";
const COPA_DEL_REY_HIDE_AFTER_MS = 2 * 60 * 60 * 1000;

export interface ApiFixtureItem {
  apiId: number | null;
  stage: MatchStage;
  roundLabel: string;
  competitionLabel?: string | null;
  homeTeam: string;
  awayTeam: string;
  kickoff: string;
  minute: number | null;
  statusShort: string;
  city: string | null;
  score: { home: number | null; away: number | null };
  supplemental?: boolean;
}

function mapRoundToStage(roundLabel: string): MatchStage {
  const round = roundLabel.toLowerCase();
  if (round.includes("semi")) return "semi-final";
  if (round.includes("third") || round.includes("3rd")) return "third-place";
  if (round.includes("quarter") || round.includes("1/4")) return "quarter-final";
  if (round.includes("group")) return "group";
  if (round.includes("1/16") || round.includes("round of 32") || round.includes("sixteenth")) return "round-of-32";
  if (round.includes("1/8") || round.includes("round of 16") || round.includes("eighth")) return "round-of-16";
  if (round.includes("final")) return "final";
  return "group";
}

function sortFixtures(fixtures: ApiFixtureItem[]) {
  return [...fixtures].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
}

function buildCopaDelReyTestFixture(now = new Date()): ApiFixtureItem | null {
  const kickoffAt = new Date(COPA_DEL_REY_FINAL_KICKOFF).getTime();
  const hideAt = kickoffAt + COPA_DEL_REY_HIDE_AFTER_MS;
  const nowAt = now.getTime();

  if (nowAt >= hideAt) return null;

  const elapsedMinutes = Math.max(0, Math.floor((nowAt - kickoffAt) / 60000));
  let statusShort = "NS";
  let minute: number | null = null;

  if (nowAt >= kickoffAt) {
    if (elapsedMinutes < 45) {
      statusShort = "1H";
      minute = Math.max(1, elapsedMinutes);
    } else if (elapsedMinutes < 60) {
      statusShort = "HT";
      minute = null;
    } else {
      statusShort = "2H";
      minute = Math.min(90, elapsedMinutes);
    }
  }

  return {
    apiId: null,
    stage: "final",
    roundLabel: "Final",
    competitionLabel: "FINAL · Copa del Rey 2026",
    homeTeam: "Atlético de Madrid",
    awayTeam: "Real Sociedad",
    kickoff: COPA_DEL_REY_FINAL_KICKOFF,
    minute,
    statusShort,
    city: "Sevilla",
    score: { home: null, away: null },
    supplemental: true,
  };
}

function getSupplementalFixtures(now = new Date()): ApiFixtureItem[] {
  const fixture = buildCopaDelReyTestFixture(now);
  return fixture ? [fixture] : [];
}

function buildCalendarPayload(connection: "calendar" | "error", error?: string) {
  const supplementalFixtures = getSupplementalFixtures();
  return {
    source: connection === "calendar" ? "calendar" : "api-football",
    connection,
    updatedAt: new Date().toISOString(),
    fixtures: sortFixtures(supplementalFixtures),
    ...(error ? { error } : {}),
  };
}

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY;

  if (!apiKey) {
    return NextResponse.json(buildCalendarPayload("calendar"));
  }

  try {
    const response = await fetch(`${API_BASE}/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=2026`, {
      headers: { "x-apisports-key": apiKey },
      next: { revalidate: 30 },
    } as any);

    if (!response.ok) {
      return NextResponse.json(buildCalendarPayload("error", `API request failed with ${response.status}`), { status: 502 });
    }

    const payload = await response.json();

    const liveFixtures: ApiFixtureItem[] = (payload.response || [])
      .map((item: any) => {
        const fixture = item?.fixture;
        const league = item?.league;
        const teams = item?.teams;
        const goals = item?.goals;
        const status = fixture?.status;

        const homeTeam = normalizeName((teams?.home?.name as string) || "");
        const awayTeam = normalizeName((teams?.away?.name as string) || "");
        const roundLabel = (league?.round as string) || "";

        return {
          apiId: typeof fixture?.id === "number" ? fixture.id : null,
          stage: mapRoundToStage(roundLabel),
          roundLabel,
          competitionLabel: null,
          homeTeam,
          awayTeam,
          kickoff: (fixture?.date as string) || new Date().toISOString(),
          minute: typeof status?.elapsed === "number" ? status.elapsed : null,
          statusShort: (status?.short as string) || "NS",
          city: normalizeCity((fixture?.venue?.city as string) || null),
          score: {
            home: typeof goals?.home === "number" ? goals.home : null,
            away: typeof goals?.away === "number" ? goals.away : null,
          },
          supplemental: false,
        } as ApiFixtureItem;
      });

    const fixtures = sortFixtures([...liveFixtures, ...getSupplementalFixtures()]);

    return NextResponse.json({
      source: "api-football",
      connection: "live",
      updatedAt: new Date().toISOString(),
      fixtures,
    });
  } catch (error) {
    return NextResponse.json(
      buildCalendarPayload("error", error instanceof Error ? error.message : "Unknown API error"),
      { status: 500 }
    );
  }
}
