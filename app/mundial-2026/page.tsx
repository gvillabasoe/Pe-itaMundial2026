"use client";

import { useState, useMemo } from "react";
import { Globe, Search, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { SectionTitle } from "@/components/ui";
import { MatchCard } from "@/components/worldcup/match-card";
import { WORLD_CUP_MATCHES, STAGE_ORDER, STAGE_LABELS, getMatchesByStage } from "@/lib/worldcup/schedule";
import type { MatchStage } from "@/lib/worldcup/schedule";
import { ALL_HOST_CITIES, getZoneForCity, REGION_PALETTES, REGION_LABELS, type Zone } from "@/lib/worldcup/zones";
import Image from "next/image";

export default function MundialPage() {
  const [stageFilter, setStageFilter] = useState<MatchStage | "all">("all");
  const [zoneFilter, setZoneFilter] = useState<Zone | "all">("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>("group");

  const filtered = useMemo(() => {
    let matches = [...WORLD_CUP_MATCHES];
    if (stageFilter !== "all") matches = matches.filter(m => m.stage === stageFilter);
    if (zoneFilter !== "all") matches = matches.filter(m => m.zone === zoneFilter);
    if (cityFilter !== "all") matches = matches.filter(m => m.hostCity === cityFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      matches = matches.filter(m =>
        m.homeTeam.toLowerCase().includes(q) ||
        m.awayTeam.toLowerCase().includes(q) ||
        m.hostCity.toLowerCase().includes(q) ||
        String(m.id) === q
      );
    }
    return matches;
  }, [stageFilter, zoneFilter, cityFilter, search]);

  // Group by stage for accordion
  const groupedByStage = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const m of filtered) {
      if (!groups[m.stage]) groups[m.stage] = [];
      groups[m.stage].push(m);
    }
    return groups;
  }, [filtered]);

  const toggleStage = (stage: string) => setExpanded(expanded === stage ? null : stage);

  const zones: { key: Zone | "all"; label: string; color?: string }[] = [
    { key: "all", label: "Todas" },
    { key: "west", label: "Oeste", color: REGION_PALETTES.west.primary },
    { key: "central", label: "Centro", color: REGION_PALETTES.central.primary },
    { key: "east", label: "Este", color: REGION_PALETTES.east.primary },
  ];

  return (
    <div className="px-4 pt-4 max-w-[640px] mx-auto">
      {/* Header with logo */}
      <div className="animate-fade-in mb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-bg-3 flex items-center justify-center">
            <Image src="/flags/Logo_Porra_Peñita_Mundial_2026.webp" alt="Peñita Mundial" width={40} height={40} className="object-contain" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-text-warm">Mundial 2026</h1>
            <p className="text-xs text-text-muted">104 partidos · 16 ciudades · 3 países</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-2.5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input className="input-field !pl-9" placeholder="Buscar equipo, ciudad o nº partido..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Stage filter */}
      <div className="flex gap-1 mb-2.5 overflow-x-auto pb-1">
        <button className={`pill !px-2.5 !py-1 ${stageFilter === "all" ? "active" : ""}`} onClick={() => setStageFilter("all")}>Todos</button>
        {STAGE_ORDER.map(s => (
          <button key={s} className={`pill !px-2.5 !py-1 ${stageFilter === s ? "active" : ""}`} onClick={() => setStageFilter(s)}>
            {STAGE_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Zone filter */}
      <div className="flex gap-1 mb-2.5">
        {zones.map(z => (
          <button key={z.key} className={`pill !px-2.5 !py-1 ${zoneFilter === z.key ? "active" : ""}`}
            onClick={() => { setZoneFilter(z.key); setCityFilter("all"); }}
            style={zoneFilter === z.key && z.color ? { background: `${z.color}22`, color: z.color, borderColor: z.color } : {}}>
            {z.label}
          </button>
        ))}
      </div>

      {/* City filter (if zone selected) */}
      {zoneFilter !== "all" && (
        <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
          <button className={`pill !px-2 !py-0.5 text-[10px] ${cityFilter === "all" ? "active" : ""}`} onClick={() => setCityFilter("all")}>Todas</button>
          {ALL_HOST_CITIES.filter(c => getZoneForCity(c) === zoneFilter).map(c => (
            <button key={c} className={`pill !px-2 !py-0.5 text-[10px] ${cityFilter === c ? "active" : ""}`} onClick={() => setCityFilter(c)}>
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Match count */}
      <p className="text-[11px] text-text-muted mb-3">{filtered.length} partidos</p>

      {/* If searching, show flat list */}
      {search.trim() ? (
        <div className="animate-fade-in">
          {filtered.length === 0 ? (
            <div className="card text-center py-8 text-text-muted">
              <Search size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Sin resultados para &ldquo;{search}&rdquo;</p>
            </div>
          ) : (
            filtered.map(m => <MatchCard key={m.id} match={m} />)
          )}
        </div>
      ) : (
        /* Accordion by stage */
        STAGE_ORDER.map(stage => {
          const matches = groupedByStage[stage];
          if (!matches || matches.length === 0) return null;
          const isOpen = expanded === stage;
          const isFinal = stage === "final";

          return (
            <div key={stage} className="mb-2 animate-fade-in">
              <button onClick={() => toggleStage(stage)}
                className="flex items-center justify-between w-full py-3 px-3.5 rounded-[10px] cursor-pointer"
                style={{
                  background: isFinal ? "rgba(212,175,55,0.06)" : "#0D1014",
                  border: isFinal ? "1px solid rgba(212,175,55,0.2)" : "1px solid rgba(255,255,255,0.06)",
                  color: isFinal ? "#FFD87A" : "#FFFAF0",
                }}>
                <span className="font-display text-[15px] font-bold">
                  {STAGE_LABELS[stage]} <span className="text-[11px] font-normal text-text-muted ml-1">({matches.length})</span>
                </span>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {isOpen && (
                <div className="mt-1.5 flex flex-col gap-0.5">
                  {matches.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
