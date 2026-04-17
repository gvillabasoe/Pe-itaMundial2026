"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import {
  Clock,
  MapPin,
  Search,
  Wifi,
  WifiOff,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Flag, EmptyState } from "@/components/ui";
import {
  WORLD_CUP_MATCHES,
  STAGE_LABELS,
  STAGE_ORDER,
  type WorldCupMatch,
  type MatchStage,
} from "@/lib/worldcup/schedule";
import {
  ALL_HOST_CITIES,
  REGION_LABELS,
  REGION_PALETTES,
  getCityBgColor,
  getCityColor,
  getZoneForCity,
  type Zone,
} from "@/lib/config/regions";
import {
  getStatusGroup,
  getStatusLabel,
  shouldShowScore,
} from "@/lib/config/match-status";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ApiFixture {
  id: number | string;
  status: string;
  kickoff?: string;
  minute?: number | null;
  homeTeam: string;
  awayTeam: string;
  score: { home: number | null; away: number | null };
  city?: string | null;
}

interface ApiResponse {
  source: "live" | "mock";
  fixtures?: ApiFixture[];
  message?: string;
}

/**
 * Unified Resultados + Mundial screen.
 * Base: full 104-match calendar (source of truth).
 * Enrichment: live state from /api/results/fixtures joined by match id.
 */
export default function ResultadosPage() {
  const [stageFilter, setStageFilter] = useState<MatchStage | "all">("all");
  const [zoneFilter, setZoneFilter] = useState<Zone | "all">("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<MatchStage | null>("group");

  const { data, error, isLoading } = useSWR<ApiResponse>(
    "/api/results/fixtures",
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  const isLive = data?.source === "live";
  const liveById = useMemo(() => {
    const map = new Map<number, ApiFixture>();
    if (isLive && data?.fixtures) {
      for (const f of data.fixtures) {
        const numId = typeof f.id === "number" ? f.id : parseInt(String(f.id), 10);
        if (!Number.isNaN(numId)) map.set(numId, f);
      }
    }
    return map;
  }, [isLive, data]);

  const filtered = useMemo(() => {
    let matches = [...WORLD_CUP_MATCHES];
    if (stageFilter !== "all") matches = matches.filter((m) => m.stage === stageFilter);
    if (zoneFilter !== "all") matches = matches.filter((m) => m.zone === zoneFilter);
    if (cityFilter !== "all") matches = matches.filter((m) => m.hostCity === cityFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      matches = matches.filter(
        (m) =>
          m.homeTeam.toLowerCase().includes(q) ||
          m.awayTeam.toLowerCase().includes(q) ||
          m.hostCity.toLowerCase().includes(q) ||
          String(m.id) === q
      );
    }
    return matches;
  }, [stageFilter, zoneFilter, cityFilter, search]);

  const groupedByStage = useMemo(() => {
    const groups: Partial<Record<MatchStage, WorldCupMatch[]>> = {};
    for (const m of filtered) {
      if (!groups[m.stage]) groups[m.stage] = [];
      groups[m.stage]!.push(m);
    }
    return groups;
  }, [filtered]);

  const toggleStage = (s: MatchStage) => setExpanded(expanded === s ? null : s);

  const zoneOptions: { key: Zone | "all"; label: string; color?: string }[] = [
    { key: "all", label: "Todas" },
    { key: "west", label: REGION_LABELS.west, color: REGION_PALETTES.west.primary },
    { key: "central", label: REGION_LABELS.central, color: REGION_PALETTES.central.primary },
    { key: "east", label: REGION_LABELS.east, color: REGION_PALETTES.east.primary },
  ];

  return (
    <div className="px-4 pt-4 max-w-[640px] mx-auto">
      <div className="animate-fade-in mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-text-warm mb-0.5">
            Resultados
          </h1>
          <p className="text-xs text-text-muted">Mundial 2026 · 104 partidos</p>
        </div>
        <ConnectionBadge isLive={isLive} isLoading={isLoading} hasError={!!error} />
      </div>

      <div className="relative mb-2.5">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          aria-hidden="true"
        />
        <input
          className="input-field !pl-9"
          placeholder="Buscar equipo, ciudad o nº partido..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar partido"
        />
      </div>

      <div className="flex gap-1 mb-2.5 overflow-x-auto pb-1">
        <button
          className={`pill !px-2.5 !py-1 ${stageFilter === "all" ? "active" : ""}`}
          onClick={() => setStageFilter("all")}
        >
          Todos
        </button>
        {STAGE_ORDER.map((s) => (
          <button
            key={s}
            className={`pill !px-2.5 !py-1 ${stageFilter === s ? "active" : ""}`}
            onClick={() => setStageFilter(s)}
          >
            {STAGE_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="flex gap-1 mb-2.5">
        {zoneOptions.map((z) => (
          <button
            key={z.key}
            className={`pill !px-2.5 !py-1 ${zoneFilter === z.key ? "active" : ""}`}
            onClick={() => {
              setZoneFilter(z.key);
              setCityFilter("all");
            }}
            style={
              zoneFilter === z.key && z.color
                ? {
                    background: `${z.color}22`,
                    color: z.color,
                    borderColor: z.color,
                  }
                : {}
            }
          >
            {z.label}
          </button>
        ))}
      </div>

      {zoneFilter !== "all" && (
        <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
          <button
            className={`pill !px-2 !py-0.5 text-[10px] ${cityFilter === "all" ? "active" : ""}`}
            onClick={() => setCityFilter("all")}
          >
            Todas
          </button>
          {ALL_HOST_CITIES.filter((c) => getZoneForCity(c) === zoneFilter).map((c) => (
            <button
              key={c}
              className={`pill !px-2 !py-0.5 text-[10px] ${cityFilter === c ? "active" : ""}`}
              onClick={() => setCityFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <p className="text-[11px] text-text-muted mb-3">{filtered.length} partidos</p>

      {isLoading && !data && (
        <div className="card text-center py-6 text-text-muted animate-fade-in" role="status">
          <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Conectando con servidor…</p>
        </div>
      )}

      {search.trim() ? (
        <div className="animate-fade-in">
          {filtered.length === 0 ? (
            <EmptyState text={`Sin resultados para "${search}"`} icon={Search} />
          ) : (
            filtered.map((m) => (
              <MatchCard key={m.id} match={m} live={liveById.get(m.id)} />
            ))
          )}
        </div>
      ) : (
        STAGE_ORDER.map((stage) => {
          const matches = groupedByStage[stage];
          if (!matches || matches.length === 0) return null;
          const isOpen = expanded === stage;
          const isFinal = stage === "final";
          return (
            <div key={stage} className="mb-2 animate-fade-in">
              <button
                onClick={() => toggleStage(stage)}
                aria-expanded={isOpen}
                className="flex items-center justify-between w-full py-3 px-3.5 rounded-[10px] cursor-pointer bg-bg-4 border border-text-muted/10"
                style={
                  isFinal
                    ? {
                        background: "rgba(212,175,55,0.06)",
                        border: "1px solid rgba(212,175,55,0.2)",
                        color: "#FFD87A",
                      }
                    : undefined
                }
              >
                <span className="font-display text-[15px] font-bold text-text-warm">
                  {STAGE_LABELS[stage]}{" "}
                  <span className="text-[11px] font-normal text-text-muted ml-1">
                    ({matches.length})
                  </span>
                </span>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {isOpen && (
                <div className="mt-1.5 flex flex-col gap-0.5">
                  {matches.map((m) => (
                    <MatchCard key={m.id} match={m} live={liveById.get(m.id)} />
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      {!isLoading && !isLive && !error && (
        <p className="text-[10px] text-text-muted/60 text-center mt-4">
          Datos en vivo disponibles cuando empiece el torneo. Mostrando calendario oficial.
        </p>
      )}
    </div>
  );
}

function ConnectionBadge({
  isLive,
  isLoading,
  hasError,
}: {
  isLive: boolean;
  isLoading: boolean;
  hasError: boolean;
}) {
  if (hasError) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-danger" role="status">
        <AlertCircle size={12} /> Sin conexión
      </span>
    );
  }
  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-text-muted/50" role="status">
        <Wifi size={12} /> Cargando…
      </span>
    );
  }
  if (isLive) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-success" role="status">
        <Wifi size={12} aria-hidden="true" /> En vivo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-text-muted/50" role="status">
      <WifiOff size={12} aria-hidden="true" /> Calendario
    </span>
  );
}

function MatchCard({
  match,
  live,
}: {
  match: WorldCupMatch;
  live: ApiFixture | undefined;
}) {
  const isSpain = match.homeTeam === "España" || match.awayTeam === "España";
  const cityColor = getCityColor(match.hostCity);
  const cityBg = getCityBgColor(match.hostCity);

  const status = live?.status ?? "NS";
  const statusGroup = getStatusGroup(status);
  const label = getStatusLabel(status);
  const scoreVisible = shouldShowScore(status, live?.score.home, live?.score.away);

  const kickoff = live?.kickoff ? new Date(live.kickoff) : null;
  const kickoffTime = kickoff
    ? kickoff.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Madrid",
      })
    : null;
  const kickoffDate = kickoff
    ? kickoff.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        timeZone: "Europe/Madrid",
      })
    : null;

  const statusBadge = (() => {
    switch (statusGroup) {
      case "live":
        return (
          <span className="badge badge-red !py-0.5" aria-label="En juego">
            <span className="w-1.5 h-1.5 rounded-full bg-danger animate-live-pulse inline-block" />
            {label}
            {typeof live?.minute === "number" && ` · ${live.minute}'`}
          </span>
        );
      case "halftime":
        return <span className="badge badge-amber !py-0.5">Descanso</span>;
      case "finished":
        return <span className="badge badge-muted !py-0.5">{label}</span>;
      case "postponed":
        return <span className="badge badge-amber !py-0.5">Aplazado</span>;
      case "cancelled":
        return <span className="badge badge-red !py-0.5">{label}</span>;
      default:
        return kickoffTime ? (
          <span className="badge badge-green !py-0.5">
            <Clock size={10} aria-hidden="true" /> {kickoffDate} · {kickoffTime}
          </span>
        ) : (
          <span className="badge badge-muted !py-0.5">Programado</span>
        );
    }
  })();

  return (
    <article
      className="card !py-2.5 !px-3 mb-1"
      style={{
        borderLeft: `3px solid ${isSpain ? "#C1121F" : cityColor}`,
      }}
    >
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] text-text-muted font-mono">#{match.id}</span>
          {statusBadge}
        </div>
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold whitespace-nowrap"
          style={{
            background: cityBg,
            color: cityColor,
            border: `1px solid ${cityColor}55`,
          }}
          aria-label={`Sede: ${match.hostCity}`}
        >
          <MapPin size={9} aria-hidden="true" /> {match.hostCity}
        </span>
      </div>

      <div className="flex items-center justify-center gap-2">
        <div className="flex-1 text-right flex items-center justify-end gap-1.5 min-w-0">
          <span
            className={`text-xs font-medium truncate ${
              isSpain && match.homeTeam === "España"
                ? "text-text-warm font-semibold"
                : ""
            }`}
          >
            {match.homeTeam}
          </span>
          <Flag country={match.homeTeam} size="sm" />
        </div>

        <div
          className="font-display text-sm font-bold rounded-md px-2.5 py-1 min-w-[50px] text-center"
          style={{
            background:
              statusGroup === "live" || statusGroup === "halftime"
                ? "rgba(255,122,165,0.15)"
                : "rgb(var(--bg-2))",
            color:
              statusGroup === "live" || statusGroup === "halftime"
                ? "#FF7AA5"
                : scoreVisible
                ? "rgb(var(--text-primary))"
                : "rgb(var(--text-muted))",
          }}
        >
          {scoreVisible ? `${live!.score.home} - ${live!.score.away}` : "vs"}
        </div>

        <div className="flex-1 text-left flex items-center gap-1.5 min-w-0">
          <Flag country={match.awayTeam} size="sm" />
          <span
            className={`text-xs font-medium truncate ${
              isSpain && match.awayTeam === "España"
                ? "text-text-warm font-semibold"
                : ""
            }`}
          >
            {match.awayTeam}
          </span>
        </div>
      </div>
    </article>
  );
}
