import { NextResponse } from "next/server";
import { fetchProbabilities } from "@/lib/predictions/market-selection";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await fetchProbabilities();
    return NextResponse.json(snapshot, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error("[worldcup-probabilities] Error:", error);
    return NextResponse.json(
      {
        updatedAt: new Date().toISOString(),
        status: "error",
        sourceSummary: { primary: "none", fallback: "none" },
        teams: [],
        error: "Failed to fetch probabilities",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
