import { fetchPolymarketProbabilities, type TeamProbability } from "./polymarket";
import { fetchKalshiProbabilities } from "./kalshi";
import { PREDICTION_TEAMS } from "./team-config";
import { getFlagForTeam } from "../worldcup/normalize-team";

export interface ProbabilitySnapshot {
  updatedAt: string;
  status: "ok" | "stale" | "error";
  sourceSummary: { primary: string; fallback: string };
  teams: Array<TeamProbability & { color: string; flagSrc: string | null; isPrimaryFocus: boolean }>;
}

const TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms)),
  ]);
}

let lastSnapshot: ProbabilitySnapshot | null = null;

export async function fetchProbabilities(): Promise<ProbabilitySnapshot> {
  const controller = new AbortController();
  const { signal } = controller;

  let probs: TeamProbability[] | null = null;
  let source = "polymarket";

  // Try Polymarket first
  try {
    probs = await withTimeout(fetchPolymarketProbabilities(signal), TIMEOUT_MS);
    source = "polymarket";
  } catch (err) {
    console.warn("[predictions] Polymarket failed, trying Kalshi:", (err as Error).message);
  }

  // Fallback to Kalshi
  if (!probs || probs.every(p => p.confidence === 0)) {
    try {
      probs = await withTimeout(fetchKalshiProbabilities(signal), TIMEOUT_MS);
      source = "kalshi";
    } catch (err) {
      console.warn("[predictions] Kalshi also failed:", (err as Error).message);
    }
  }

  // If both fail, return last known or empty
  if (!probs || probs.length === 0) {
    if (lastSnapshot) {
      return { ...lastSnapshot, status: "stale", updatedAt: new Date().toISOString() };
    }

    // Generate placeholder data
    return {
      updatedAt: new Date().toISOString(),
      status: "error",
      sourceSummary: { primary: "none", fallback: "none" },
      teams: PREDICTION_TEAMS.map(t => ({
        teamKey: t.teamKey,
        teamName: t.teamName,
        probability01: 0,
        probabilityPct: 0,
        provider: "polymarket" as const,
        marketLabel: "",
        marketRef: "",
        confidence: 0,
        color: t.color,
        flagSrc: getFlagForTeam(t.teamName),
        isPrimaryFocus: t.isPrimaryFocus,
      })),
    };
  }

  // Enrich with team config
  const enriched = probs.map(p => {
    const config = PREDICTION_TEAMS.find(t => t.teamKey === p.teamKey);
    return {
      ...p,
      color: config?.color || "#98A3B8",
      flagSrc: getFlagForTeam(config?.teamName || p.teamName),
      isPrimaryFocus: config?.isPrimaryFocus || false,
    };
  });

  const snapshot: ProbabilitySnapshot = {
    updatedAt: new Date().toISOString(),
    status: "ok",
    sourceSummary: { primary: source, fallback: source === "polymarket" ? "kalshi" : "none" },
    teams: enriched,
  };

  lastSnapshot = snapshot;
  return snapshot;
}
