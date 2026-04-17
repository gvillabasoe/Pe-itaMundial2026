/**
 * API-Football status code → human Spanish label normalization.
 * Plus a "status group" abstraction for filtering/UI logic.
 */

export const STATUS_LABELS: Record<string, string> = {
  TBD: "Por definir",
  NS: "Programado",
  "1H": "1ª parte",
  HT: "Descanso",
  "2H": "2ª parte",
  ET: "Prórroga",
  BT: "Descanso prórroga",
  P: "Penaltis",
  LIVE: "En juego",
  FT: "Finalizado",
  AET: "Final tras prórroga",
  PEN: "Final tras penaltis",
  AWD: "Adjudicado",
  WO: "Walkover",
  PST: "Aplazado",
  CANC: "Cancelado",
  ABD: "Suspendido",
  SUSP: "Suspendido",
  INT: "Interrumpido",
};

export type MatchStatusGroup =
  | "scheduled"
  | "live"
  | "halftime"
  | "finished"
  | "postponed"
  | "cancelled";

export function getStatusLabel(status: string | null | undefined): string {
  if (!status) return "Pendiente";
  return STATUS_LABELS[status] ?? "Pendiente";
}

export function getStatusGroup(status: string | null | undefined): MatchStatusGroup {
  if (!status) return "scheduled";
  if (["LIVE", "1H", "2H", "ET", "BT", "P"].includes(status)) return "live";
  if (status === "HT") return "halftime";
  if (["FT", "AET", "PEN", "AWD", "WO"].includes(status)) return "finished";
  if (status === "PST") return "postponed";
  if (["CANC", "ABD", "SUSP", "INT"].includes(status)) return "cancelled";
  return "scheduled";
}

/** True only when API explicitly confirms a real score should be shown. */
export function shouldShowScore(
  status: string | null | undefined,
  homeScore: number | null | undefined,
  awayScore: number | null | undefined
): boolean {
  if (homeScore === null || homeScore === undefined) return false;
  if (awayScore === null || awayScore === undefined) return false;
  const group = getStatusGroup(status);
  return group === "live" || group === "halftime" || group === "finished";
}
