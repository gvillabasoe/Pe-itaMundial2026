"use client";

import { useState, useMemo } from "react";
import { BarChart3, Star, X, Clock } from "lucide-react";
import { Flag, GroupBadge, EmptyState } from "@/components/ui";
import { useAuth } from "@/components/auth-provider";
import { PARTICIPANTS } from "@/lib/data";
import type { Team } from "@/lib/data";

export default function ClasificacionPage() {
  const { user, favorites, toggleFavorite } = useAuth();
  const [filter, setFilter] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const filtered = useMemo(() => {
    if (filter === "mine" && user)
      return PARTICIPANTS.filter((p) => p.userId === user.id);
    if (filter === "top10") return PARTICIPANTS.slice(0, 10);
    if (filter === "tied") {
      const counts: Record<number, number> = {};
      PARTICIPANTS.forEach((p) => {
        counts[p.totalPoints] = (counts[p.totalPoints] || 0) + 1;
      });
      return PARTICIPANTS.filter((p) => counts[p.totalPoints] > 1);
    }
    return PARTICIPANTS;
  }, [filter, user]);

  const medalColor = (r: number) =>
    r === 1 ? "#D4AF37" : r === 2 ? "#C0C0C0" : r === 3 ? "#CD7F32" : null;

  return (
    <div className="px-4 pt-4 max-w-[640px] mx-auto">
      <div className="animate-fade-in mb-4">
        <h1 className="font-display text-2xl font-extrabold text-text-warm mb-0.5">
          Clasificación
        </h1>
        <p className="text-xs text-text-muted">Ranking general de la porra</p>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 mb-3.5 overflow-x-auto pb-1">
        {[
          { key: "all", label: "Todos" },
          { key: "mine", label: "Mis equipos" },
          { key: "top10", label: "Top 10" },
          { key: "tied", label: "Empatados" },
        ].map((f) => (
          <button
            key={f.key}
            className={`pill ${filter === f.key ? "active" : ""}`}
            onClick={() => {
              if (f.key === "mine" && !user) return;
              setFilter(f.key);
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          text="La clasificación se actualizará según avance el torneo"
          icon={BarChart3}
        />
      ) : (
        <div className="flex flex-col gap-1">
          {filtered.map((p, idx) => {
            const mc = medalColor(p.currentRank);
            const isMine = user && p.userId === user.id;
            const isFav = favorites.includes(p.id);
            return (
              <div
                key={p.id}
                className="card flex items-center gap-2.5 !py-2.5 !px-3 cursor-pointer animate-fade-in"
                style={{
                  animationDelay: `${idx * 0.02}s`,
                  borderLeft: mc
                    ? `3px solid ${mc}`
                    : isMine
                    ? "3px solid #6BBF78"
                    : "3px solid transparent",
                  background: isMine ? "rgba(107,191,120,0.04)" : undefined,
                }}
                onClick={() => setSelectedTeam(p)}
              >
                <span
                  className="font-display text-base font-extrabold min-w-[28px] text-center"
                  style={{ color: mc || "#98A3B8" }}
                >
                  {p.currentRank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-warm truncate">
                    {p.name}
                  </p>
                  <p className="text-[11px] text-text-muted">@{p.username}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="font-display text-base font-bold"
                    style={{ color: mc || "#F6F7FB" }}
                  >
                    {p.totalPoints}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!user) return;
                      toggleFavorite(p.id);
                    }}
                    className="p-1 bg-transparent border-none cursor-pointer"
                  >
                    {isFav ? (
                      <Star size={14} fill="#D4AF37" color="#D4AF37" />
                    ) : (
                      <Star size={14} color="#98A3B8" className="opacity-30" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedTeam && (
        <div
          className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setSelectedTeam(null)}
        >
          <div
            className="bg-bg-4 rounded-t-[20px] w-full max-w-[640px] max-h-[85vh] overflow-y-auto p-5 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-9 h-1 rounded-full bg-white/20 mx-auto mb-4" />
            <ParticipantDetail
              team={selectedTeam}
              onClose={() => setSelectedTeam(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ParticipantDetail({
  team,
  onClose,
}: {
  team: Team;
  onClose: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-xl font-extrabold text-text-warm">
            {team.name}
          </h3>
          <p className="text-xs text-text-muted">@{team.username}</p>
        </div>
        <button
          onClick={onClose}
          className="bg-bg-2 border-none rounded-lg p-2 cursor-pointer text-text-muted"
        >
          <X size={18} />
        </button>
      </div>

      {/* Total */}
      <div className="card text-center mb-4 bg-gradient-to-br from-bg-2 to-bg-4 !border-gold/15">
        <p className="text-[11px] text-text-muted mb-0.5">Puntos totales</p>
        <p className="font-display text-4xl font-black text-gold-light">
          {team.totalPoints}
        </p>
        <span className="badge badge-gold">#{team.currentRank}</span>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "Fase de grupos", val: team.groupPoints, color: "#27E6AC" },
          { label: "Fase final", val: team.finalPhasePoints, color: "#DFBE38" },
          { label: "Especiales", val: team.specialPoints, color: "#F0417A" },
        ].map((k, i) => (
          <div key={i} className="card text-center !p-3">
            <p className="text-[10px] text-text-muted mb-1">{k.label}</p>
            <p className="font-display text-xl font-extrabold" style={{ color: k.color }}>
              {k.val}
            </p>
          </div>
        ))}
      </div>

      {/* Champion */}
      <div className="card mb-3 flex items-center gap-2.5">
        <Flag country={team.championPick} />
        <div>
          <p className="text-[10px] text-text-muted">Campeón elegido</p>
          <p className="text-sm font-semibold">{team.championPick}</p>
        </div>
        <span className="badge badge-muted ml-auto">Pendiente</span>
      </div>

      {/* Specials */}
      <h4 className="font-display text-sm font-bold mb-2 text-text-warm">
        Picks especiales
      </h4>
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { label: "Mejor Jugador", val: team.specials.mejorJugador },
          { label: "Mejor Joven", val: team.specials.mejorJoven },
          { label: "Máx. Goleador", val: team.specials.maxGoleador },
          { label: "Máx. Asistente", val: team.specials.maxAsistente },
          { label: "Mejor Portero", val: team.specials.mejorPortero },
          { label: "Goleador ESP", val: team.specials.maxGoleadorEsp },
          { label: "Revelación", val: team.specials.revelacion },
          { label: "Decepción", val: team.specials.decepcion },
        ].map((s, i) => (
          <div key={i} className="py-2 px-2.5 bg-bg-2 rounded-lg">
            <p className="text-[9px] text-text-muted uppercase tracking-wide">
              {s.label}
            </p>
            <p className="text-xs font-semibold mt-0.5">{s.val}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 py-2 px-2.5 bg-bg-2 rounded-lg">
        <p className="text-[9px] text-text-muted uppercase tracking-wide">
          Min. primer gol
        </p>
        <p className="text-xs font-semibold mt-0.5">
          {team.specials.minutoPrimerGol}&apos;
        </p>
      </div>
    </div>
  );
}
