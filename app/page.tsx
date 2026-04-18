"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, ChevronRight, Zap, Activity, Swords, TrendingUp } from "lucide-react";
import { Flag, Countdown, SectionTitle } from "@/components/ui";
import { PARTICIPANTS, MINI_POLL, ACTIVITY } from "@/lib/data";

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
      {/* Header */}
      <div className="text-center mb-6 pt-2 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-1">
          {/* Logo */}
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-bg-4 flex items-center justify-center border border-gold/20 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logo_Porra_Mundial_2026.webp"
              alt="Peñita Mundial"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to trophy icon via CSS hide
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div>
            <h1 className="font-display text-[28px] font-black text-text-warm tracking-tight">
              Peñita Mundial
            </h1>
            <p className="text-xs text-gold font-semibold tracking-widest uppercase">
              IV Edición
            </p>
          </div>
        </div>
      </div>

      {/* Countdown */}
      <div className="card card-glow mb-4 text-center animate-fade-in bg-gradient-to-br from-bg-4 to-bg-2 !border-gold/10">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <Flag country="México" size="sm" />
          <span className="text-sm font-semibold text-text-muted">vs</span>
          <Flag country="Sudáfrica" size="sm" />
        </div>
        <p className="text-sm text-text-muted mb-0.5">México vs Sudáfrica</p>
        <p className="text-[11px] text-gold mb-3">11 junio 2026 · 21:00 (Madrid)</p>
        <Countdown target="2026-06-11T19:00:00Z" />
      </div>

      {/* Quick access — Versus + Probabilidades */}
      <div className="grid grid-cols-2 gap-2 mb-4 animate-fade-in" style={{ animationDelay: "0.05s" }}>
        <Link href="/versus" className="card !p-3 text-center no-underline hover:!border-gold/20 transition-all">
          <Swords size={20} className="mx-auto mb-1.5 text-accent-versus" />
          <p className="text-[11px] font-semibold text-text-warm">Versus</p>
          <p className="text-[9px] text-text-muted">Compara con rivales</p>
        </Link>
        <Link href="/probabilidades" className="card !p-3 text-center no-underline hover:!border-gold/20 transition-all">
          <TrendingUp size={20} className="mx-auto mb-1.5 text-danger" />
          <p className="text-[11px] font-semibold text-text-warm">Probabilidades</p>
          <p className="text-[9px] text-text-muted">¿Quién ganará?</p>
        </Link>
      </div>

      {/* Podium */}
      <div className="mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <SectionTitle icon={Trophy} accent="#D4AF37">
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

      {/* Mini Porra */}
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
              const pct = Math.round(
                ((MINI_POLL.votes[opt] || 0) / totalVotes) * 100
              );
              const voted = pollVote === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setPollVote(opt)}
                  className="relative flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-left w-full text-sm transition-all"
                  style={{
                    border: voted
                      ? "1px solid #DFBE38"
                      : "1px solid rgba(255,255,255,0.06)",
                    background: voted ? "rgba(223,190,56,0.08)" : "#07090D",
                  }}
                >
                  {pollVote && (
                    <div
                      className="absolute left-0 top-0 bottom-0 transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: voted
                          ? "rgba(223,190,56,0.1)"
                          : "rgba(255,255,255,0.03)",
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

      {/* Activity */}
      <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <SectionTitle icon={Activity} accent="#98A3B8">
          Actividad reciente
        </SectionTitle>
        <div className="flex flex-col">
          {ACTIVITY.map((a, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-white/[0.04]"
            >
              <p className="text-xs text-text-muted">{a.text}</p>
              <span className="text-[10px] text-text-muted/50 whitespace-nowrap ml-2">
                {a.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
