"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { AlertCircle, ChevronDown, ChevronUp, Clock3, MapPin, Search, Wifi, WifiOff } from "lucide-react";
import { EmptyState, Flag, GroupBadge } from "@/components/ui";
import { FIXTURES, GROUPS } from "@/lib/data";
import { ALL_HOST_CITIES, getCityBgColor, getCityColor, getZoneForCity, REGION_LABELS, REGION_PALETTES, type Zone } from "@/lib/config/regions";
import { getStatusGroup, getStatusLabel, shouldShowScore } from "@/lib/config/match-status";
import { STAGE_LABELS, STAGE_ORDER, WORLD_CUP_MATCHES, type MatchStage, type WorldCupMatch } from "@/lib/worldcup/schedule";

interface ApiFixtureItem {
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

interface ResultsApiPayload {
  source: string;
  connection: "live" | "calendar" | "error";
  updatedAt: string;
  fixtures: ApiFixtureItem[];
  error?: string;
}

interface MatchView {
  id: number;
  stage: MatchStage;
  roundLabel: string;
  competitionLabel: string | null;
  hostCity: string;
  zone: Zone | null;
  homeTeam: string;
  awayTeam: string;
  displayHomeTeam: string;
  displayAwayTeam: string;
  statusShort: string;
  minute: number | null;
  kickoff: string;
  score: { home: number | null; away: number | null };
  group: string | null;
  supplemental: boolean;
}

const fetcher = async (url: string): Promise<ResultsApiPayload> => {
  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok && data?.connection === "error") {
    return data;
  }
  return data;
};

const KNOWN_TEAMS = new Set(Object.values(GROUPS).flat());

function normalizeKey(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildIsoSeries(startDate: string, hoursUtc: number[], count: number): string[] {
  const start = new Date(`${startDate}T00:00:00Z`);
  const values: string[] = [];
  let hourIndex = 0;
  let dayOffset = 0;

  for (let index = 0; index < count; index += 1) {
    const slot = new Date(start);
    slot.setUTCDate(start.getUTCDate() + dayOffset);
    slot.setUTCHours(hoursUtc[hourIndex], 0, 0, 0);
    values.push(slot.toISOString());

    hourIndex += 1;
    if (hourIndex >= hoursUtc.length) {
      hourIndex = 0;
      dayOffset += 1;
    }
  }

  return values;
}

const GROUP_FALLBACK_KICKOFFS = new Map(
  FIXTURES.map((fixture) => [`${normalizeKey(fixture.homeTeam)}|${normalizeKey(fixture.awayTeam)}`, fixture.kickoff])
);

const KNOCKOUT_FALLBACKS: Record<Exclude<MatchStage, "group">, string[]> = {
  "round-of-32": buildIsoSeries("2026-06-28", [16, 19], 16),
  "round-of-16": buildIsoSeries("2026-07-06", [16, 19], 8),
  "quarter-final": buildIsoSeries("2026-07-11", [16, 19], 4),
  "semi-final": buildIsoSeries("2026-07-15", [19], 2),
  "third-place": buildIsoSeries("2026-07-18", [18], 1),
  final: buildIsoSeries("2026-07-19", [19], 1),
};

const KNOCKOUT_FALLBACK_BY_ID = new Map<number, string>();
(
  Object.keys(KNOCKOUT_FALLBACKS) as Array<Exclude<MatchStage, "group">>
).forEach((stage) => {
  WORLD_CUP_MATCHES.filter((match) => match.stage === stage).forEach((match, index) => {
    KNOCKOUT_FALLBACK_BY_ID.set(match.id, KNOCKOUT_FALLBACKS[stage][index]);
  });
});

function getGroupForMatch(homeTeam: string, awayTeam: string): string | null {
  for (const [group, teams] of Object.entries(GROUPS)) {
    if (teams.includes(homeTeam) && teams.includes(awayTeam)) return group;
  }
  return null;
}

function buildGroupFixtureMap(fixtures: ApiFixtureItem[]) {
  const map = new Map<string, ApiFixtureItem>();
  fixtures
    .filter((fixture) => fixture.stage === "group")
    .forEach((fixture) => {
      const key = `${normalizeKey(fixture.homeTeam)}|${normalizeKey(fixture.awayTeam)}`;
      map.set(key, fixture);
    });
  return map;
}

function getFallbackKickoff(match: WorldCupMatch): string {
  if (match.stage === "group") {
    const key = `${normalizeKey(match.homeTeam)}|${normalizeKey(match.awayTeam)}`;
    return GROUP_FALLBACK_KICKOFFS.get(key) || "2026-06-11T19:00:00Z";
  }

  return KNOCKOUT_FALLBACK_BY_ID.get(match.id) || "2026-07-19T19:00:00Z";
}

function mergeScheduleWithApi(fixtures: ApiFixtureItem[]): MatchView[] {
  const supplementalFixtures = fixtures.filter((fixture) => fixture.supplemental);
  const worldCupFixtures = fixtures.filter((fixture) => !fixture.supplemental);

  const groupMap = buildGroupFixtureMap(worldCupFixtures);
  const stageMap = STAGE_ORDER.reduce<Record<MatchStage, ApiFixtureItem[]>>((acc, stage) => {
    acc[stage] = worldCupFixtures.filter((fixture) => fixture.stage === stage).sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
    return acc;
  }, {
    group: [],
    "round-of-32": [],
    "round-of-16": [],
    "quarter-final": [],
    "semi-final": [],
    "third-place": [],
    final: [],
  });

  const stageOffsets = STAGE_ORDER.reduce<Record<MatchStage, number>>((acc, stage) => {
    acc[stage] = 0;
    return acc;
  }, {
    group: 0,
    "round-of-32": 0,
    "round-of-16": 0,
    "quarter-final": 0,
    "semi-final": 0,
    "third-place": 0,
    final: 0,
  });

  const worldCupViews = WORLD_CUP_MATCHES.map((match) => {
    let liveFixture: ApiFixtureItem | undefined;

    if (match.stage === "group") {
      const key = `${normalizeKey(match.homeTeam)}|${normalizeKey(match.awayTeam)}`;
      liveFixture = groupMap.get(key);
    } else {
      const stageIndex = stageOffsets[match.stage];
      liveFixture = stageMap[match.stage][stageIndex];
      stageOffsets[match.stage] = stageIndex + 1;
    }

    return {
      id: match.id,
      stage: match.stage,
      roundLabel: match.roundLabel,
      competitionLabel: null,
      hostCity: match.hostCity,
      zone: match.zone,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      displayHomeTeam: liveFixture?.homeTeam || match.homeTeam,
      displayAwayTeam: liveFixture?.awayTeam || match.awayTeam,
      statusShort: liveFixture?.statusShort || "NS",
      minute: liveFixture?.minute ?? null,
      kickoff: liveFixture?.kickoff || getFallbackKickoff(match),
      score: liveFixture?.score || { home: null, away: null },
      group: match.stage === "group" ? getGroupForMatch(match.homeTeam, match.awayTeam) : null,
      supplemental: false,
    } as MatchView;
  });

  const supplementalViews = supplementalFixtures.map((fixture, index) => ({
    id: fixture.apiId ?? 9000 + index,
    stage: fixture.stage,
    roundLabel: fixture.roundLabel,
    competitionLabel: fixture.competitionLabel || fixture.roundLabel,
    hostCity: fixture.city || "Sede pendiente",
    zone: getZoneForCity(fixture.city) || null,
    homeTeam: fixture.homeTeam,
    awayTeam: fixture.awayTeam,
    displayHomeTeam: fixture.homeTeam,
    displayAwayTeam: fixture.awayTeam,
    statusShort: fixture.statusShort,
    minute: fixture.minute,
    kickoff: fixture.kickoff,
    score: fixture.score,
    group: null,
    supplemental: true,
  } as MatchView));

  return [...worldCupViews, ...supplementalViews];
}

function formatKickoff(kickoff: string) {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(kickoff));
}

export default function ResultadosPage() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<MatchStage | "all">("all");
  const [zoneFilter, setZoneFilter] = useState<Zone | "all">("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>("group");

  const { data, error } = useSWR<ResultsApiPayload>("/api/results/fixtures", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });

  const connection = error ? "error" : data?.connection || "calendar";
  const mergedMatches = useMemo(() => mergeScheduleWithApi(data?.fixtures || []), [data]);

  const filteredMatches = useMemo(() => {
    let matches = [...mergedMatches];

    if (stageFilter !== "all") {
      matches = matches.filter((match) => match.stage === stageFilter);
    }

    if (zoneFilter !== "all") {
      matches = matches.filter((match) => match.zone === zoneFilter);
    }

    if (cityFilter !== "all") {
      matches = matches.filter((match) => match.hostCity === cityFilter);
    }

    if (search.trim()) {
      const query = normalizeKey(search);
      matches = matches.filter((match) => {
        const haystack = [
          String(match.id),
          match.hostCity,
          match.displayHomeTeam,
          match.displayAwayTeam,
          match.homeTeam,
          match.awayTeam,
          match.competitionLabel || "",
        ].map(normalizeKey);
        return haystack.some((value) => value.includes(query));
      });
    }

    return matches;
  }, [cityFilter, mergedMatches, search, stageFilter, zoneFilter]);

  const groupedByStage = useMemo(() => {
    const groups: Partial<Record<MatchStage, MatchView[]>> = {};
    filteredMatches.forEach((match) => {
      if (!groups[match.stage]) groups[match.stage] = [];
      groups[match.stage]!.push(match);
    });

    Object.values(groups).forEach((matches) => {
      matches?.sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
    });

    return groups;
  }, [filteredMatches]);

  const regionOptions: Array<{ key: Zone | "all"; label: string; color?: string }> = [
    { key: "all", label: "Todas" },
    { key: "west", label: REGION_LABELS.west, color: REGION_PALETTES.west.primary },
    { key: "central", label: REGION_LABELS.central, color: REGION_PALETTES.central.primary },
    { key: "east", label: REGION_LABELS.east, color: REGION_PALETTES.east.primary },
  ] as const;

  const connectionNode = connection === "live"
    ? <span className="badge badge-green"><Wifi size={12} /> En vivo</span>
    : connection === "error"
      ? <span className="badge badge-red"><AlertCircle size={12} /> Sin conexión</span>
      : <span className="badge badge-muted"><WifiOff size={12} /> Calendario base</span>;

  return (
    <div className="mx-auto max-w-[640px] px-4 pt-4">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="page-header__title">Resultados</h1>
          <p className="page-header__subtitle">Mundial 2026 · 104 partidos + test fixture premium</p>
        </div>
        {connectionNode}
      </div>

      <div className="relative mb-3">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          className="input-field !pl-9"
          placeholder="Buscar equipo, ciudad, competición o nº partido..."
          value={search}
          onChange={(event: any) => setSearch(event.target.value)}
        />
      </div>

      <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
        <button className={`pill ${stageFilter === "all" ? "active" : ""}`} onClick={() => setStageFilter("all")}>Todos</button>
        {STAGE_ORDER.map((stage) => (
          <button key={stage} className={`pill ${stageFilter === stage ? "active" : ""}`} onClick={() => setStageFilter(stage)}>
            {STAGE_LABELS[stage]}
          </button>
        ))}
      </div>

      <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
        {regionOptions.map((region) => (
          <button
            key={region.key}
            className={`pill ${zoneFilter === region.key ? "active" : ""}`}
            onClick={() => {
              setZoneFilter(region.key as Zone | "all");
              setCityFilter("all");
            }}
            style={zoneFilter === region.key && region.color ? { background: `${region.color}22`, color: region.color, borderColor: region.color } : undefined}
          >
            {region.label}
          </button>
        ))}
      </div>

      {zoneFilter !== "all" ? (
        <div className="mb-3 flex gap-1 overflow-x-auto pb-1">
          <button className={`pill !px-2 !py-1 text-[10px] ${cityFilter === "all" ? "active" : ""}`} onClick={() => setCityFilter("all")}>Todas</button>
          {ALL_HOST_CITIES.filter((city) => getZoneForCity(city) === zoneFilter).map((city) => (
            <button key={city} className={`pill !px-2 !py-1 text-[10px] ${cityFilter === city ? "active" : ""}`} onClick={() => setCityFilter(city)}>
              {city}
            </button>
          ))}
        </div>
      ) : null}

      <p className="mb-3 text-[11px] text-text-muted">{filteredMatches.length} partidos</p>

      {filteredMatches.length === 0 ? (
        <EmptyState title="Sin resultados" text="No hay partidos que coincidan con tus filtros." icon={Search} />
      ) : (
        STAGE_ORDER.map((stage) => {
          const matches = groupedByStage[stage];
          if (!matches || matches.length === 0) return null;
          const isOpen = expanded === stage;
          const isFinal = stage === "final";

          return (
            <section key={stage} className="mb-2.5 animate-fade-in">
              <button
                type="button"
                onClick={() => setExpanded(expanded === stage ? null : stage)}
                className="flex w-full items-center justify-between rounded-[16px] px-4 py-3 text-left"
                style={{
                  background: isFinal ? "rgba(212,175,55,0.08)" : "rgb(var(--bg-4))",
                  border: isFinal ? "1px solid rgba(212,175,55,0.22)" : "1px solid rgba(var(--divider),0.08)",
                  color: "rgb(var(--text-warm))",
                }}
              >
                <span className="font-display text-[15px] font-bold">
                  {STAGE_LABELS[stage]} <span className="ml-1 text-[11px] font-normal text-text-muted">({matches.length})</span>
                </span>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {isOpen ? (
                <div className="mt-2 flex flex-col gap-2">
                  {matches.map((match) => <ScheduleMatchCard key={`${match.stage}-${match.id}-${match.displayHomeTeam}`} match={match} />)}
                </div>
              ) : null}
            </section>
          );
        })
      )}

      {connection !== "live" ? (
        <p className="status-note mb-6 mt-4 text-text-muted">
          {connection === "error"
            ? "Sin conexión con la API en este momento. Se mantiene el calendario base del Mundial y el partido de prueba de Copa del Rey si sigue dentro de la ventana visible."
            : "Datos en vivo disponibles cuando empiece el torneo o cuando configures API_SPORTS_KEY en Vercel. Mientras tanto se muestra el calendario base del proyecto."}
        </p>
      ) : null}
    </div>
  );
}

function ScheduleMatchCard({ match }: { match: MatchView }) {
  const isSpain = match.displayHomeTeam === "España" || match.displayAwayTeam === "España";
  const statusGroup = getStatusGroup(match.statusShort);
  const showScore = shouldShowScore(match.statusShort, match.score.home, match.score.away);
  const cityColor = getCityColor(match.hostCity);
  const showHomeFlag = KNOWN_TEAMS.has(match.displayHomeTeam);
  const showAwayFlag = KNOWN_TEAMS.has(match.displayAwayTeam);
  const roundLabel = match.competitionLabel || match.roundLabel;

  const statusBadgeClass =
    statusGroup === "live"
      ? "badge badge-red"
      : statusGroup === "halftime"
        ? "badge badge-amber"
        : statusGroup === "scheduled"
          ? "badge badge-muted"
          : statusGroup === "finished"
            ? "badge badge-muted"
            : statusGroup === "postponed"
              ? "badge badge-amber"
              : "badge badge-red";

  return (
    <article
      className="card !px-3.5 !py-3"
      style={isSpain ? { borderLeft: "4px solid #C1121F" } : undefined}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono text-text-muted">#{match.id}</span>
          {match.group ? <GroupBadge group={match.group} /> : null}
          <span className={statusBadgeClass}>
            {statusGroup === "live" && typeof match.minute === "number" ? `${getStatusLabel(match.statusShort)} · ${match.minute}'` : getStatusLabel(match.statusShort)}
          </span>
        </div>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold"
          style={{ background: getCityBgColor(match.hostCity), color: cityColor, border: `1px solid ${cityColor}33` }}
        >
          <MapPin size={9} /> {match.hostCity}
        </span>
      </div>

      <div className="flex items-center justify-center gap-2">
        <div className="flex flex-1 items-center justify-end gap-1.5 text-right">
          <span className={`text-xs font-medium ${match.displayHomeTeam === "España" ? "font-semibold text-text-warm" : ""}`}>{match.displayHomeTeam}</span>
          {showHomeFlag ? <Flag country={match.displayHomeTeam} size="sm" /> : null}
        </div>
        <div className="min-w-[58px] rounded-xl border border-[rgb(var(--divider)/0.08)] bg-bg-2 px-2.5 py-1 text-center font-display text-sm font-bold text-text-muted shadow-[inset_0_1px_0_rgba(var(--surface-soft),0.03)]">
          {showScore ? `${match.score.home} - ${match.score.away}` : "vs"}
        </div>
        <div className="flex flex-1 items-center gap-1.5 text-left">
          {showAwayFlag ? <Flag country={match.displayAwayTeam} size="sm" /> : null}
          <span className={`text-xs font-medium ${match.displayAwayTeam === "España" ? "font-semibold text-text-warm" : ""}`}>{match.displayAwayTeam}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[rgb(var(--divider)/0.06)] pt-2.5">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="badge badge-muted text-[10px]">{roundLabel}</span>
          {match.supplemental ? <span className="badge badge-amber text-[10px]">Test API</span> : null}
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-muted">
          <Clock3 size={11} /> Hora Madrid · {formatKickoff(match.kickoff)}
        </span>
      </div>
    </article>
  );
}
