"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { ChevronDown, ChevronUp, Clock, MapPin, Wifi, WifiOff, AlertCircle } from "lucide-react";
import { Flag, GroupBadge, EmptyState } from "@/components/ui";
import { FIXTURES, KNOCKOUT_ROUNDS } from "@/lib/data";
import type { Fixture } from "@/lib/data";

// ─── Status helpers ──────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  NS: "Programado",
  "1H": "1ª parte",
  HT: "Descanso",
  "2H": "2ª parte",
  ET: "Prórroga",
  P: "Penaltis",
  FT: "Finalizado",
  AET: "Final (prórroga)",
  PEN: "Final (penaltis)",
  PST: "Aplazado",
  CANC: "Cancelado",
  SUSP: "Suspendido",
};

function statusGroup(s: string | undefined): "scheduled" | "live" | "halftime" | "finished" | "other" {
  if (!s || s === "NS" || s === "TBD") return "scheduled";
  if (["1H", "2H", "ET", "P"].includes(s)) return "live";
  if (s === "HT") return "halftime";
  if (["FT", "AET", "PEN", "AWD", "WO"].includes(s)) return "finished";
  return "other";
}

function showScore(status: string | undefined, home: number | null, away: number | null): boolean {
  if (home === null || away === null) return false;
  const g = statusGroup(status);
  return g === "live" || g === "halftime" || g === "finished";
}

// ─── Types ───────────────────────────────────────────

interface LiveFixture {
  id: string | number;
  status: string;
  kickoff?: string;
  minute?: number | null;
  homeTeam: string;
  awayTeam: string;
  group?: string;
  score: { home: number | null; away: number | null };
  city?: string | null;
}

interface ApiResponse {
  source: "live" | "mock";
  fixtures?: LiveFixture[];
  message?: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ─── Page ────────────────────────────────────────────

export default function ResultadosPage() {
  const [expanded, setExpanded] = useState<string | null>("j1");
  const [statusFilter, setStatusFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");

  const { data, error, isLoading } = useSWR<ApiResponse>(
    "/api/results/fixtures",
    fetcher,
    { refreshInterval: 30_000, revalidateOnFocus: true }
  );

  const isLive = data?.source === "live";

  // Build a map id → live fixture for easy lookup
  const liveById = useMemo(() => {
    const map = new Map<string, LiveFixture>();
    if (isLive && data?.fixtures) {
      for (const f of data.fixtures) {
        map.set(String(f.id), f);
      }
    }
    return map;
  }, [isLive, data]);

  // For "live" source, use API fixtures; otherwise fall back to static FIXTURES
  const allFixtures: Fixture[] = useMemo(() => {
    if (isLive && data?.fixtures && data.fixtures.length > 0) {
      return data.fixtures.map((f) => ({
        id: String(f.id),
        stage: "groups" as const,
        round: f.group ? `Jornada 1` : "Jornada 1",
        group: f.group,
        homeTeam: f.homeTeam,
        awayTeam: f.awayTeam,
        status: (f.status as "NS" | "LIVE" | "FT") || "NS",
        kickoff: f.kickoff || new Date().toISOString(),
        minute: f.minute ?? null,
        score: f.score,
        goals: [],
      }));
    }
    return FIXTURES;
  }, [isLive, data]);

  const toggle = (key: string) => setExpanded(expanded === key ? null : key);

  const jornadaFixtures = (j: number) =>
    allFixtures.filter((f) => f.round === `Jornada ${j}`);

  const groupedByGroup = (fixtures: Fixture[]) => {
    const groups: Record<string, Fixture[]> = {};
    fixtures.forEach((f) => {
      const g = f.group || "?";
      if (!groups[g]) groups[g] = [];
      groups[g].push(f);
    });
    return groups;
  };

  const showGroups = phaseFilter === "all" || phaseFilter === "groups";
  const showKO = phaseFilter === "all" || phaseFilter === "ko";

  return (
    <div className="px-4 pt-4 max-w-[640px] mx-auto">
      {/* Header */}
      <div className="animate-fade-in mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-text-warm mb-0.5">
            Resultados
          </h1>
          <p className="text-xs text-text-muted">Partidos del Mundial 2026</p>
        </div>
        {/* Connection status indicator */}
        {isLoading && (
          <span className="inline-flex items-center gap-1 text-[10px] text-text-muted/50">
            <Wifi size={12} /> Cargando…
          </span>
        )}
        {!isLoading && isLive && (
          <span className="inline-flex items-center gap-1 text-[10px] text-success">
            <Wifi size={12} /> En vivo
          </span>
        )}
        {!isLoading && !isLive && !error && (
          <span className="inline-flex items-center gap-1 text-[10px] text-text-muted/50">
            <WifiOff size={12} /> Calendario
          </span>
        )}
        {error && (
          <span className="inline-flex items-center gap-1 text-[10px] text-danger">
            <AlertCircle size={12} /> Sin conexión
          </span>
        )}
      </div>

      {/* Status Filters */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
        {[
          { key: "all", label: "Todos" },
          { key: "ns", label: "Programados" },
          { key: "live", label: "En directo" },
          { key: "ft", label: "Finalizados" },
        ].map((f) => (
          <button
            key={f.key}
            className={`pill ${statusFilter === f.key ? "active" : ""}`}
            onClick={() => setStatusFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Phase Filters */}
      <div className="flex gap-1.5 mb-4">
        {[
          { key: "all", label: "Todos" },
          { key: "groups", label: "Grupos" },
          { key: "ko", label: "Eliminatorias" },
        ].map((f) => (
          <button
            key={f.key}
            className={`pill ${phaseFilter === f.key ? "active" : ""}`}
            onClick={() => setPhaseFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Group Jornadas */}
      {showGroups &&
        [1, 2, 3].map((j) => {
          const key = `j${j}`;
          const open = expanded === key;
          const fixtures = jornadaFixtures(j);

          // Apply status filter
          const filteredFixtures = statusFilter === "all" ? fixtures : fixtures.filter((f) => {
            const g = statusGroup(f.status);
            if (statusFilter === "ns") return g === "scheduled";
            if (statusFilter === "live") return g === "live" || g === "halftime";
            if (statusFilter === "ft") return g === "finished";
            return true;
          });

          if (filteredFixtures.length === 0) return null;
          const grouped = groupedByGroup(filteredFixtures);

          return (
            <div key={key} className="mb-2 animate-fade-in">
              <button
                onClick={() => toggle(key)}
                className="flex items-center justify-between w-full py-3 px-3.5 rounded-[10px] bg-bg-4 border border-white/[0.06] cursor-pointer text-text-warm"
              >
                <span className="font-display text-[15px] font-bold">
                  Fase de Grupos — Jornada {j}
                </span>
                {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {open && (
                <div className="mt-1.5 flex flex-col gap-1.5">
                  {Object.entries(grouped).map(([g, matches]) => (
                    <div key={g}>
                      <div className="mb-1 mt-1">
                        <GroupBadge group={g} />
                      </div>
                      {matches.map((m) => (
                        <MatchCard
                          key={m.id}
                          match={m}
                          liveData={liveById.get(String(m.id))}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

      {/* Knockout Rounds */}
      {showKO &&
        KNOCKOUT_ROUNDS.map((round, ri) => {
          const key = `ko${ri}`;
          const open = expanded === key;
          const isFinal = round.name === "Final";

          return (
            <div key={key} className="mb-2 animate-fade-in">
              <button
                onClick={() => toggle(key)}
                className="flex items-center justify-between w-full py-3 px-3.5 rounded-[10px] cursor-pointer"
                style={{
                  background: isFinal ? "rgba(212,175,55,0.06)" : "#0D1014",
                  border: isFinal
                    ? "1px solid rgba(212,175,55,0.2)"
                    : "1px solid rgba(255,255,255,0.06)",
                  color: isFinal ? "#FFD87A" : "#FFFAF0",
                }}
              >
                <span className="font-display text-[15px] font-bold">
                  {round.name}
                </span>
                {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {open && (
                <div className="mt-1.5 flex flex-col gap-1">
                  {round.matches.map((m, mi) => (
                    <KnockoutCard key={mi} matchStr={m} isFinal={isFinal} />
                  ))}
                </div>
              )}
            </div>
          );
        })}

      {!isLoading && !isLive && !error && (
        <p className="text-[10px] text-text-muted/50 text-center mt-4">
          Mostrando calendario oficial. Los resultados en vivo aparecerán cuando empiece el torneo.
        </p>
      )}
    </div>
  );
}

// ─── Match Card ──────────────────────────────────────

function MatchCard({
  match,
  liveData,
}: {
  match: Fixture;
  liveData?: LiveFixture;
}) {
  const status = liveData?.status ?? match.status ?? "NS";
  const sg = statusGroup(status);
  const scoreVisible = showScore(status, match.score.home, match.score.away);

  const kickoff = new Date(match.kickoff);
  const timeStr = kickoff.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  });
  const dateStr = kickoff.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Madrid",
  });

  const isSpain = match.homeTeam === "España" || match.awayTeam === "España";

  const statusBadge = (() => {
    if (sg === "live") return (
      <span className="badge badge-red text-[10px]">
        <span className="w-1.5 h-1.5 rounded-full bg-danger animate-live-pulse inline-block mr-1" />
        En juego{liveData?.minute ? ` · ${liveData.minute}'` : ""}
      </span>
    );
    if (sg === "halftime") return <span className="badge badge-amber text-[10px]">Descanso</span>;
    if (sg === "finished") return <span className="badge badge-muted text-[10px]">{STATUS_LABELS[status] ?? "Finalizado"}</span>;
    if (sg === "other") return <span className="badge badge-amber text-[10px]">{STATUS_LABELS[status] ?? status}</span>;
    return (
      <span className="badge badge-green text-[10px]">
        <Clock size={10} /> {dateStr} · {timeStr}
      </span>
    );
  })();

  return (
    <div
      className="card !py-2.5 !px-3 mb-1"
      style={isSpain ? { borderLeft: "3px solid #C1121F" } : undefined}
    >
      {/* Top row: group badge + status */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {match.group && <GroupBadge group={match.group} />}
        </div>
        {statusBadge}
      </div>

      {/* Match row */}
      <div className="flex items-center justify-center gap-2">
        {/* Home: País → Bandera */}
        <div className="flex-1 text-right flex items-center justify-end gap-1.5">
          <span className="text-xs font-medium">{match.homeTeam}</span>
          <Flag country={match.homeTeam} size="sm" />
        </div>

        {/* Score / vs */}
        <div
          className="font-display text-sm font-bold rounded-md px-2.5 py-1 min-w-[50px] text-center"
          style={{
            background: sg === "live" || sg === "halftime"
              ? "rgba(255,122,165,0.15)"
              : "#07090D",
            color: sg === "live" || sg === "halftime"
              ? "#FF7AA5"
              : scoreVisible
              ? "#F6F7FB"
              : "#98A3B8",
          }}
        >
          {scoreVisible
            ? `${match.score.home} - ${match.score.away}`
            : "vs"}
        </div>

        {/* Away: Bandera → País */}
        <div className="flex-1 text-left flex items-center gap-1.5">
          <Flag country={match.awayTeam} size="sm" />
          <span className="text-xs font-medium">{match.awayTeam}</span>
        </div>
      </div>

      {/* City (if available from live data) */}
      {liveData?.city && (
        <div className="flex justify-center mt-1">
          <span className="inline-flex items-center gap-1 text-[9px] text-text-muted">
            <MapPin size={8} /> {liveData.city}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Knockout Card ───────────────────────────────────

function KnockoutCard({
  matchStr,
  isFinal,
}: {
  matchStr: string;
  isFinal: boolean;
}) {
  const [home, away] = matchStr.split(" vs ");
  const isKnownCountry = (name: string) =>
    !name.startsWith("G") && !name.startsWith("Ganador") && !name.startsWith("Perdedor") && !/^\d/.test(name);

  const homeIsCountry = isKnownCountry(home);
  const awayIsCountry = isKnownCountry(away);

  return (
    <div
      className="card !py-2.5 !px-3"
      style={{
        border: isFinal ? "1px solid rgba(212,175,55,0.15)" : undefined,
        background: isFinal ? "rgba(212,175,55,0.03)" : undefined,
      }}
    >
      <div className="flex items-center justify-center gap-2">
        {/* Home: País → Bandera */}
        <div className="flex-1 text-right flex items-center justify-end gap-1.5">
          <span className={`text-xs font-medium ${!homeIsCountry ? "text-text-muted" : ""}`}>
            {home}
          </span>
          {homeIsCountry && <Flag country={home} size="sm" />}
        </div>

        <div
          className="font-display text-sm font-bold rounded-md px-2.5 py-1 min-w-[50px] text-center"
          style={{
            background: isFinal ? "rgba(212,175,55,0.1)" : "#07090D",
            color: isFinal ? "#D4AF37" : "#98A3B8",
          }}
        >
          vs
        </div>

        {/* Away: Bandera → País */}
        <div className="flex-1 text-left flex items-center gap-1.5">
          {awayIsCountry && <Flag country={away} size="sm" />}
          <span className={`text-xs font-medium ${!awayIsCountry ? "text-text-muted" : ""}`}>
            {away}
          </span>
        </div>
      </div>
      {(!homeIsCountry || !awayIsCountry) && (
        <p className="text-center text-[10px] text-text-muted mt-1">Por definir</p>
      )}
    </div>
  );
}
