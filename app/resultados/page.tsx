"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Flag, GroupBadge, EmptyState } from "@/components/ui";
import { FIXTURES, KNOCKOUT_ROUNDS, GROUPS } from "@/lib/data";
import { getFlagPath } from "@/lib/flags";
import type { Fixture } from "@/lib/data";

export default function ResultadosPage() {
  const [expanded, setExpanded] = useState<string | null>("j1");
  const [statusFilter, setStatusFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");

  const toggle = (key: string) => setExpanded(expanded === key ? null : key);

  const jornadaFixtures = (j: number) =>
    FIXTURES.filter((f) => f.round === `Jornada ${j}`);

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
      <div className="animate-fade-in mb-4">
        <h1 className="font-display text-2xl font-extrabold text-text-warm mb-0.5">
          Resultados
        </h1>
        <p className="text-xs text-text-muted">Partidos del Mundial 2026</p>
      </div>

      {/* Status Filters */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
        {[
          { key: "all", label: "Todos" },
          { key: "ns", label: "No empezados" },
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
          const grouped = groupedByGroup(fixtures);

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
                        <MatchCard key={m.id} match={m} />
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
    </div>
  );
}

function MatchCard({ match }: { match: Fixture }) {
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

  return (
    <div className="card !py-2.5 !px-3 mb-1">
      <div className="flex items-center justify-between mb-1.5">
        <span className="badge badge-green text-[10px]">
          <Clock size={10} /> {dateStr} · {timeStr}
        </span>
        <span className="text-[10px] text-text-muted">Pendiente</span>
      </div>
      <div className="flex items-center justify-center gap-2">
        <div className="flex-1 text-right flex items-center justify-end gap-1.5">
          <span className="text-xs font-medium">{match.homeTeam}</span>
          <Flag country={match.homeTeam} size="sm" />
        </div>
        <div className="font-display text-sm font-bold text-text-muted bg-bg-2 rounded-md px-2.5 py-1 min-w-[50px] text-center">
          vs
        </div>
        <div className="flex-1 text-left flex items-center gap-1.5">
          <Flag country={match.awayTeam} size="sm" />
          <span className="text-xs font-medium">{match.awayTeam}</span>
        </div>
      </div>
    </div>
  );
}

function KnockoutCard({
  matchStr,
  isFinal,
}: {
  matchStr: string;
  isFinal: boolean;
}) {
  const [home, away] = matchStr.split(" vs ");
  const hasHomeFlag = !!getFlagPath(home);
  const hasAwayFlag = !!getFlagPath(away);

  return (
    <div
      className="card !py-2.5 !px-3"
      style={{
        border: isFinal ? "1px solid rgba(212,175,55,0.15)" : undefined,
        background: isFinal ? "rgba(212,175,55,0.03)" : undefined,
      }}
    >
      <div className="flex items-center justify-center gap-2">
        <div className="flex-1 text-right flex items-center justify-end gap-1.5">
          <span
            className={`text-xs font-medium ${
              !hasHomeFlag ? "text-text-muted" : ""
            }`}
          >
            {home}
          </span>
          {hasHomeFlag && <Flag country={home} size="sm" />}
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
        <div className="flex-1 text-left flex items-center gap-1.5">
          {hasAwayFlag && <Flag country={away} size="sm" />}
          <span
            className={`text-xs font-medium ${
              !hasAwayFlag ? "text-text-muted" : ""
            }`}
          >
            {away}
          </span>
        </div>
      </div>
      {(!hasHomeFlag || !hasAwayFlag) && (
        <p className="text-center text-[10px] text-text-muted mt-1">
          Por definir
        </p>
      )}
    </div>
  );
}
