"use client";

import { useState } from "react";
import { Lock, Swords, Clock } from "lucide-react";
import { Flag, GroupBadge, EmptyState } from "@/components/ui";
import { useAuth } from "@/components/auth-provider";
import { PARTICIPANTS, GROUPS } from "@/lib/data";
import Link from "next/link";

export default function VersusPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<"general" | "participante">("general");
  const [rivalId, setRivalId] = useState<string>("");
  const [vsTab, setVsTab] = useState("resumen");
  const [vsFilter, setVsFilter] = useState("all");

  if (!user) {
    return (
      <div className="px-4 flex items-center justify-center min-h-[70vh]">
        <div className="card text-center !p-8 max-w-[320px] animate-fade-in">
          <Lock size={36} className="text-accent-versus mx-auto mb-3" />
          <h2 className="font-display text-xl font-extrabold text-text-warm mb-1">Acceso restringido</h2>
          <p className="text-sm text-text-muted mb-4">Inicia sesión para acceder a Versus</p>
          <Link href="/mi-club" className="btn no-underline" style={{ background: "#F0417A", color: "white" }}>
            Entrar a Mi Club
          </Link>
        </div>
      </div>
    );
  }

  const userTeams = PARTICIPANTS.filter(p => p.userId === user.id);
  const baseTeam = userTeams[0];
  const otherTeams = PARTICIPANTS.filter(p => p.userId !== user.id);
  const rival = mode === "participante" ? otherTeams.find(t => t.id === rivalId) || otherTeams[0] : null;

  const consensus = {
    name: "Consenso",
    username: "General",
    totalPoints: Math.round(PARTICIPANTS.reduce((a, p) => a + p.totalPoints, 0) / PARTICIPANTS.length),
    groupPoints: Math.round(PARTICIPANTS.reduce((a, p) => a + p.groupPoints, 0) / PARTICIPANTS.length),
    finalPhasePoints: Math.round(PARTICIPANTS.reduce((a, p) => a + p.finalPhasePoints, 0) / PARTICIPANTS.length),
    specialPoints: Math.round(PARTICIPANTS.reduce((a, p) => a + p.specialPoints, 0) / PARTICIPANTS.length),
  };

  const ref = mode === "general" ? consensus : rival;
  const equalPct = mode === "general" ? 42 : 34;
  const diffCount = Math.floor((100 - equalPct) * 0.6);
  const pointDelta = baseTeam && ref ? baseTeam.totalPoints - ref.totalPoints : 0;

  const vsTabs = ["Resumen", "Grupos", "Eliminatorias", "Final", "Podio", "Especiales"];
  const vsFilters = [
    { key: "all", label: "Ver todo" },
    { key: "diff", label: "Solo diferencias" },
    { key: "same", label: "Solo coincidencias" },
  ];

  const accentStyle = (active: boolean) => active
    ? { background: "rgba(240,65,122,0.15)", color: "#F0417A", borderColor: "#F0417A" }
    : {};

  return (
    <div className="px-4 pt-4 max-w-[640px] mx-auto">
      <div className="animate-fade-in mb-4">
        <h1 className="font-display text-2xl font-extrabold text-text-warm mb-0.5">Versus</h1>
        <p className="text-xs text-text-muted">Cara a cara</p>
      </div>

      {/* Base team */}
      {baseTeam && (
        <div className="card flex items-center gap-3 mb-3 animate-fade-in" style={{ borderLeft: "3px solid #F0417A" }}>
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-warm">{baseTeam.name}</p>
            <p className="text-[11px] text-text-muted">@{user.username} · #{baseTeam.currentRank}</p>
          </div>
          <span className="font-display text-xl font-extrabold text-accent-versus">{baseTeam.totalPoints}</span>
        </div>
      )}

      {/* Mode selector */}
      <div className="flex gap-1.5 mb-3">
        <button className="pill" style={accentStyle(mode === "general")} onClick={() => setMode("general")}>General</button>
        <button className="pill" style={accentStyle(mode === "participante")} onClick={() => setMode("participante")}>Participante</button>
      </div>

      {/* Rival selector */}
      {mode === "participante" && (
        <div className="mb-3">
          <label className="text-[11px] text-text-muted mb-1 block">Rival</label>
          <select className="input-field cursor-pointer" value={rivalId} onChange={e => setRivalId(e.target.value)}>
            <option value="">Seleccionar rival...</option>
            {otherTeams.map(t => (
              <option key={t.id} value={t.id}>{t.name} (@{t.username})</option>
            ))}
          </select>
        </div>
      )}

      {/* Duel summary */}
      {ref && baseTeam && (
        <div className="card mb-3 animate-fade-in bg-gradient-to-br from-bg-4 to-[rgba(240,65,122,0.03)]" style={{ border: "1px solid rgba(240,65,122,0.12)" }}>
          <p className="font-display text-sm font-bold text-text-warm mb-2.5">Resumen del duelo</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "% iguales", val: `${equalPct}%`, color: "#F0417A" },
              { label: "Picks distintos", val: String(diffCount), color: "#F6F7FB" },
              { label: "Diferencia de puntos", val: `${pointDelta >= 0 ? "+" : ""}${pointDelta}`, color: pointDelta >= 0 ? "#27E6AC" : "#FF7AA5" },
              { label: "Mayor diferencia", val: "Especiales", color: "#F6F7FB" },
            ].map((item, i) => (
              <div key={i} className="p-2.5 bg-bg-2 rounded-lg text-center">
                <p className="text-[10px] text-text-muted">{item.label}</p>
                <p className="font-display text-[22px] font-extrabold" style={{ color: item.color }}>
                  {i === 3 ? "" : item.val}
                </p>
                {i === 3 && <p className="text-xs font-semibold mt-0.5">{item.val}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {[
          { color: "#27E6AC", label: "Acierto" },
          { color: "#FF7AA5", label: "Fallo" },
          { color: "#DFBE38", label: "Pendiente" },
          { color: "#F0417A", label: "Diferencia" },
        ].map((l, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ background: l.color }} />
            <span className="text-[10px] text-text-muted">{l.label}</span>
          </div>
        ))}
      </div>

      {/* VS Tabs */}
      <div className="flex gap-0.5 bg-bg-3 rounded-[10px] p-[3px] overflow-x-auto mb-2.5">
        {vsTabs.map(t => (
          <button key={t} className={`px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all border-none ${
            vsTab === t.toLowerCase() ? "bg-bg-5 text-text-primary" : "text-text-muted bg-transparent"
          }`} onClick={() => setVsTab(t.toLowerCase())}>{t}</button>
        ))}
      </div>

      {/* VS Filters */}
      <div className="flex gap-1.5 mb-3.5">
        {vsFilters.map(f => (
          <button key={f.key} className="pill" style={accentStyle(vsFilter === f.key)} onClick={() => setVsFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* VS Content */}
      {vsTab === "resumen" && ref && baseTeam && (
        <div className="flex flex-col gap-1.5 animate-fade-in">
          {[
            { label: "Fase de grupos", baseVal: baseTeam.groupPoints, refVal: ref.groupPoints },
            { label: "Eliminatorias", baseVal: baseTeam.finalPhasePoints, refVal: ref.finalPhasePoints },
            { label: "Especiales", baseVal: baseTeam.specialPoints, refVal: ref.specialPoints },
          ].map((section, si) => {
            const delta = section.baseVal - section.refVal;
            return (
              <div key={si} className="card !py-3 !px-3.5">
                <p className="text-[11px] text-text-muted mb-1.5">{section.label}</p>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-[10px] text-text-muted">{baseTeam.name}</p>
                    <p className="font-display text-lg font-extrabold">{section.baseVal}</p>
                  </div>
                  <span className="font-display text-sm font-bold px-2.5 py-0.5 rounded-md" style={{
                    background: delta > 0 ? "#042B22" : delta < 0 ? "#2C0714" : "#07090D",
                    color: delta > 0 ? "#27E6AC" : delta < 0 ? "#FF7AA5" : "#98A3B8",
                  }}>
                    {delta > 0 ? "+" : ""}{delta}
                  </span>
                  <div className="text-center">
                    <p className="text-[10px] text-text-muted">{mode === "general" ? "Consenso" : ref.name}</p>
                    <p className="font-display text-lg font-extrabold">{section.refVal}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {vsTab === "grupos" && (
        <div className="flex flex-col gap-1.5 animate-fade-in">
          {Object.entries(GROUPS).slice(0, 4).map(([g, teams]) => (
            <div key={g} className="card !p-3">
              <GroupBadge group={g} />
              <div className="mt-2">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-1 items-center">
                  <p className="text-[10px] font-semibold text-accent-versus text-center">Tu pick</p>
                  <p className="text-[10px] text-text-muted text-center w-5">Pos.</p>
                  <p className="text-[10px] font-semibold text-text-muted text-center">{mode === "general" ? "Consenso" : "Rival"}</p>
                </div>
                {teams.map((t, i) => {
                  const same = i % 2 === 0;
                  const otherTeam = teams[(i + (same ? 0 : 1)) % 4];
                  return (
                    <div key={t} className="grid grid-cols-[1fr_auto_1fr] gap-1 items-center py-1 border-t border-white/[0.04]">
                      <div className="flex items-center gap-1 justify-center">
                        <Flag country={t} size="sm" />
                        <span className="text-[11px] truncate">{t}</span>
                      </div>
                      <span className="text-[11px] font-bold text-text-muted w-5 text-center">{i + 1}</span>
                      <div className="flex items-center gap-1 justify-center">
                        <Flag country={otherTeam} size="sm" />
                        <span className="text-[11px] truncate">{otherTeam}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {["eliminatorias", "final", "podio", "especiales"].includes(vsTab) && (
        <EmptyState text="Pendiente — Se completará según avance el torneo" icon={Clock} />
      )}
    </div>
  );
}
