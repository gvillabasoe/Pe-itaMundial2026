"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  ChevronRight,
  Zap,
  Activity,
  BookOpen,
  Globe,
  TrendingUp,
  Swords,
} from "lucide-react";
import { Flag, Countdown, SectionTitle, DemoBadge } from "@/components/ui";
import { Logo } from "@/components/logo";
import { PARTICIPANTS, MINI_POLL, ACTIVITY, SCORING } from "@/lib/data";

export default function HomePage() {
  const [pollVote, setPollVote] = useState<string | null>(null);
  const top3 = PARTICIPANTS.slice(0, 3);
  const medalColors = ["#D4AF37", "#C0C0C0", "#CD7F32"];
  const medalBg = [
    "rgba(212,175,55,0.08)",
    "rgba(192,192,192,0.06)",
    "rgba(205,127,50,0.06)",
  ];
  const totalVotes = Object.values(MINI_POLL.votes).reduce((a, b) => a + b, 0);

  return (
    <div className="px-4 pt-2 max-w-[640px] mx-auto">
      <div className="flex flex-col items-center text-center mb-7 pt-2 animate-fade-in">
        <Logo size={72} priority className="mb-3" />
        <h1 className="font-display text-[28px] font-black text-text-warm tracking-tight leading-none">
          Peñita Mundial
        </h1>
        <p className="text-xs text-gold font-semibold tracking-widest uppercase mt-1">
          IV Edición
        </p>
      </div>

      <div className="card card-glow mb-4 text-center animate-fade-in bg-gradient-to-br from-bg-4 to-bg-2 !border-gold/10">
        <p className="font-display text-[10px] font-bold tracking-[0.15em] uppercase text-gold-dark mb-2.5">
          Cuenta atrás para el inicio de la Copa del Mundo
        </p>
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <Flag country="México" size="sm" />
          <span className="text-sm font-semibold text-text-muted">vs</span>
          <Flag country="Sudáfrica" size="sm" />
        </div>
        <p className="text-sm text-text-muted mb-0.5">México vs Sudáfrica</p>
        <p className="text-[11px] text-gold mb-3">11 junio 2026 · 21:00 (Madrid)</p>
        <Countdown target="2026-06-11T19:00:00Z" />
      </div>

      <div
        className="grid grid-cols-3 gap-2 mb-4 animate-fade-in"
        style={{ animationDelay: "0.05s" }}
      >
        <Link
          href="/resultados"
          className="card !p-3 text-center no-underline hover:!border-gold/20 transition-all"
        >
          <Globe size={20} className="mx-auto mb-1.5 text-success" aria-hidden="true" />
          <p className="text-[11px] font-semibold text-text-warm">Resultados</p>
          <p className="text-[9px] text-text-muted">104 partidos</p>
        </Link>
        <Link
          href="/probabilidades"
          className="card !p-3 text-center no-underline hover:!border-gold/20 transition-all"
        >
          <TrendingUp size={20} className="mx-auto mb-1.5 text-danger" aria-hidden="true" />
          <p className="text-[11px] font-semibold text-text-warm">En vivo</p>
          <p className="text-[9px] text-text-muted">Probabilidades</p>
        </Link>
        <Link
          href="/versus"
          className="card !p-3 text-center no-underline hover:!border-gold/20 transition-all"
        >
          <Swords size={20} className="mx-auto mb-1.5 text-accent-versus" aria-hidden="true" />
          <p className="text-[11px] font-semibold text-text-warm">Versus</p>
          <p className="text-[9px] text-text-muted">Cara a cara</p>
        </Link>
      </div>

      <div className="mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <SectionTitle icon={Trophy} accent="#D4AF37" right={<DemoBadge />}>
          Top 3
        </SectionTitle>
        <div className="flex flex-col gap-1.5">
          {top3.map((p, i) => (
            <div
              key={p.id}
              className="card flex items-center gap-3 !py-3 !px-3.5"
              style={{
                background: medalBg[i],
                borderLeft: `3px solid ${medalColors[i]}`,
              }}
            >
              <span
                className="font-display text-[22px] font-black min-w-[28px]"
                style={{ color: medalColors[i] }}
              >
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-warm">{p.name}</p>
                <p className="text-[11px] text-text-muted">@{p.username}</p>
              </div>
              <span
                className="font-display text-lg font-extrabold"
                style={{ color: medalColors[i] }}
              >
                {p.totalPoints}{" "}
                <span className="text-[11px] font-normal">pts</span>
              </span>
            </div>
          ))}
        </div>
        <Link
          href="/clasificacion"
          className="btn btn-ghost w-full mt-2.5 text-sm no-underline"
        >
          Ver clasificación completa <ChevronRight size={16} />
        </Link>
      </div>

      <div className="mb-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <SectionTitle icon={Zap} accent="#DFBE38">
          Encuesta abierta
        </SectionTitle>
        <div className="card !border-amber-mid/15">
          <p className="text-sm font-semibold mb-3 text-text-warm">
            {MINI_POLL.title}
          </p>
          <div className="flex flex-col gap-1.5">
            {MINI_POLL.options.map((opt) => {
              const pct = Math.round(((MINI_POLL.votes[opt] || 0) / totalVotes) * 100);
              const voted = pollVote === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setPollVote(opt)}
                  className="relative flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-left w-full text-sm transition-all bg-bg-2"
                  style={{
                    border: voted
                      ? "1px solid #DFBE38"
                      : "1px solid rgb(var(--text-muted) / 0.12)",
                    background: voted ? "rgba(223,190,56,0.08)" : undefined,
                  }}
                >
                  {pollVote && (
                    <div
                      className="absolute left-0 top-0 bottom-0 transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: voted
                          ? "rgba(223,190,56,0.1)"
                          : "rgb(var(--text-muted) / 0.05)",
                      }}
                    />
                  )}
                  <span
                    className="relative flex-1"
                    style={{ fontWeight: voted ? 600 : 400 }}
                  >
                    {opt}
                  </span>
                  {pollVote && (
                    <span className="relative text-xs text-text-muted font-semibold">
                      {pct}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <SectionTitle icon={Activity} accent="rgb(var(--text-muted))">
          Actividad reciente
        </SectionTitle>
        <div className="flex flex-col">
          {ACTIVITY.map((a, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-text-muted/10"
            >
              <p className="text-xs text-text-muted">{a.text}</p>
              <span className="text-[10px] text-text-muted/50 whitespace-nowrap ml-2">
                {a.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-fade-in mb-6" style={{ animationDelay: "0.4s" }}>
        <SectionTitle icon={BookOpen} accent="#D9B449">
          Sistema de puntuación
        </SectionTitle>

        <div className="card mb-2">
          <h3 className="font-display text-sm font-bold text-text-warm mb-2">Partidos</h3>
          <div className="space-y-1.5">
            <ScoringRow label="Signo acertado (1-X-2)" pts={SCORING.signo} />
            <ScoringRow
              label="Resultado exacto"
              pts={SCORING.resultadoExacto}
              note={`Total: ${SCORING.resultadoExactoTotal} (signo + exacto)`}
            />
          </div>
        </div>

        <div className="card mb-2">
          <h3 className="font-display text-sm font-bold text-text-warm mb-2">
            Partido doble{" "}
            <span className="text-[10px] font-normal text-text-muted">
              (1 por grupo)
            </span>
          </h3>
          <div className="space-y-1.5">
            <ScoringRow label="Solo signo acertado" pts={SCORING.partidoDobleSigno} />
            <ScoringRow
              label="Resultado exacto"
              pts={SCORING.partidoDobleExacto}
              note="Total acumulado"
            />
          </div>
        </div>

        <div className="card mb-2">
          <h3 className="font-display text-sm font-bold text-text-warm mb-2">
            Fase de grupos
          </h3>
          <ScoringRow
            label="Posición final acertada en grupo"
            pts={SCORING.posicionGrupo}
            note="Por cada posición"
          />
        </div>

        <div className="card mb-2">
          <h3 className="font-display text-sm font-bold text-text-warm mb-2">
            Eliminatorias
          </h3>
          <div className="space-y-1.5">
            <ScoringRow label="Equipo en Dieciseisavos" pts={SCORING.eliminatorias.dieciseisavos} />
            <ScoringRow label="Equipo en Octavos" pts={SCORING.eliminatorias.octavos} />
            <ScoringRow label="Equipo en Cuartos" pts={SCORING.eliminatorias.cuartos} />
            <ScoringRow label="Equipo en Semifinales" pts={SCORING.eliminatorias.semis} />
            <ScoringRow label="Equipo en Final" pts={SCORING.eliminatorias.final} />
          </div>
        </div>

        <div className="card mb-2">
          <h3 className="font-display text-sm font-bold text-text-warm mb-2">
            Posiciones finales
          </h3>
          <div className="space-y-1.5">
            <ScoringRow label="Tercer puesto" pts={SCORING.posicionesFinales.tercero} />
            <ScoringRow label="Subcampeón" pts={SCORING.posicionesFinales.subcampeon} />
            <ScoringRow label="Campeón" pts={SCORING.posicionesFinales.campeon} accent />
          </div>
        </div>

        <div className="card mb-2">
          <h3 className="font-display text-sm font-bold text-text-warm mb-2">Especiales</h3>
          <div className="space-y-1.5">
            {[
              { l: "Mejor Jugador", p: SCORING.especiales.mejorJugador },
              { l: "Mejor Jugador Joven", p: SCORING.especiales.mejorJoven },
              { l: "Máximo Goleador", p: SCORING.especiales.maxGoleador },
              { l: "Máximo Asistente", p: SCORING.especiales.maxAsistente },
              { l: "Mejor Portero", p: SCORING.especiales.mejorPortero },
              { l: "Máx. Goleador Español", p: SCORING.especiales.maxGoleadorEsp },
              { l: "Primer Gol Español", p: SCORING.especiales.primerGolEsp },
              { l: "Selección Revelación", p: SCORING.especiales.revelacion },
              { l: "Selección Decepción", p: SCORING.especiales.decepcion },
              { l: "Minuto primer gol del Mundial", p: SCORING.especiales.minutoPrimerGol },
            ].map((s, i) => (
              <ScoringRow key={i} label={s.l} pts={s.p} accent={s.p >= 50} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoringRow({
  label,
  pts,
  note,
  accent,
}: {
  label: string;
  pts: number;
  note?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-muted">{label}</p>
        {note && <p className="text-[10px] text-text-muted/50">{note}</p>}
      </div>
      <span
        className={`font-display text-sm font-bold ml-2 ${
          accent ? "text-gold-light" : "text-text-primary"
        }`}
      >
        {pts}{" "}
        <span className="text-[10px] font-normal text-text-muted">pts</span>
      </span>
    </div>
  );
}
