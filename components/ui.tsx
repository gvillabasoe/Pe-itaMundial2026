"use client";

import Image from "next/image";
import { GROUP_COLORS } from "@/lib/data";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";

// ─── Flag emoji map (all countries except Inglaterra) ─

const FLAG_EMOJI: Record<string, string> = {
  "México": "🇲🇽",
  "Sudáfrica": "🇿🇦",
  "Corea del Sur": "🇰🇷",
  "Chequia": "🇨🇿",
  "Canadá": "🇨🇦",
  "Bosnia y Herzegovina": "🇧🇦",
  "Catar": "🇶🇦",
  "Suiza": "🇨🇭",
  "Brasil": "🇧🇷",
  "Marruecos": "🇲🇦",
  "Haití": "🇭🇹",
  "Escocia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Estados Unidos": "🇺🇸",
  "Paraguay": "🇵🇾",
  "Australia": "🇦🇺",
  "Turquía": "🇹🇷",
  "Alemania": "🇩🇪",
  "Curazao": "🇨🇼",
  "Costa de Marfil": "🇨🇮",
  "Ecuador": "🇪🇨",
  "Países Bajos": "🇳🇱",
  "Japón": "🇯🇵",
  "Suecia": "🇸🇪",
  "Túnez": "🇹🇳",
  "Bélgica": "🇧🇪",
  "Egipto": "🇪🇬",
  "Irán": "🇮🇷",
  "Nueva Zelanda": "🇳🇿",
  "España": "🇪🇸",
  "Cabo Verde": "🇨🇻",
  "Arabia Saudí": "🇸🇦",
  "Uruguay": "🇺🇾",
  "Francia": "🇫🇷",
  "Senegal": "🇸🇳",
  "Irak": "🇮🇶",
  "Noruega": "🇳🇴",
  "Argentina": "🇦🇷",
  "Argelia": "🇩🇿",
  "Austria": "🇦🇹",
  "Jordania": "🇯🇴",
  "Portugal": "🇵🇹",
  "RD Congo": "🇨🇩",
  "RD del Congo": "🇨🇩",
  "Uzbekistán": "🇺🇿",
  "Colombia": "🇨🇴",
  "Croacia": "🇭🇷",
  "Ghana": "🇬🇭",
  "Panamá": "🇵🇦",
};

// Inglaterra keeps its image file (no emoji substitution)
const INGLATERRA_FLAG = "/flags/Inglaterra.png";

// ─── Flag ────────────────────────────────────────────

interface FlagProps {
  country: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const FLAG_SIZES = { sm: 20, md: 28, lg: 36 };
const EMOJI_SIZES = { sm: "text-base", md: "text-xl", lg: "text-[28px]" };

export function Flag({ country, size = "md", className }: FlagProps) {
  const px = FLAG_SIZES[size];

  // Exception: Inglaterra keeps its PNG image
  if (country === "Inglaterra") {
    return (
      <Image
        src={INGLATERRA_FLAG}
        alt="Inglaterra"
        width={px}
        height={Math.round(px * 0.67)}
        className={`rounded-[3px] object-cover ${className || ""}`}
      />
    );
  }

  const emoji = FLAG_EMOJI[country];

  if (emoji) {
    return (
      <span
        className={`${EMOJI_SIZES[size]} leading-none ${className || ""}`}
        role="img"
        aria-label={country}
      >
        {emoji}
      </span>
    );
  }

  // Fallback for unknown countries
  return (
    <span
      className={`inline-flex items-center justify-center rounded bg-bg-5 text-[10px] text-text-muted ${className || ""}`}
      style={{ width: px, height: Math.round(px * 0.67) }}
    >
      ?
    </span>
  );
}

// ─── Group Badge ────────────────────────────────────

export function GroupBadge({ group }: { group: string }) {
  const color = GROUP_COLORS[group] || "#98A3B8";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide"
      style={{
        background: `${color}22`,
        color,
        border: `1px solid ${color}44`,
      }}
    >
      Grupo {group}
    </span>
  );
}

// ─── Section Title ──────────────────────────────────

interface SectionTitleProps {
  children: React.ReactNode;
  accent?: string;
  icon?: LucideIcon;
  right?: React.ReactNode;
}

export function SectionTitle({ children, accent, icon: Icon, right }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={18} style={{ color: accent || "#D4AF37" }} />}
        <h2 className="font-display text-lg font-bold text-text-warm">{children}</h2>
      </div>
      {right}
    </div>
  );
}

// ─── Empty State ────────────────────────────────────

interface EmptyStateProps {
  text: string;
  icon?: LucideIcon;
}

export function EmptyState({ text, icon: Icon }: EmptyStateProps) {
  return (
    <div className="card text-center py-8 text-text-muted">
      {Icon && <Icon size={32} className="mx-auto mb-2 opacity-40" />}
      <p className="text-sm">{text}</p>
    </div>
  );
}

// ─── DemoBadge ──────────────────────────────────────

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-white/[0.04] text-text-muted/60 border border-white/[0.06]">
      Datos demo
    </span>
  );
}

// ─── Countdown ──────────────────────────────────────

export function Countdown({ target }: { target: string }) {
  const [diff, setDiff] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const t = new Date(target).getTime();
    const tick = () => {
      const rem = Math.max(0, t - Date.now());
      setDiff({
        d: Math.floor(rem / 86400000),
        h: Math.floor((rem % 86400000) / 3600000),
        m: Math.floor((rem % 3600000) / 60000),
        s: Math.floor((rem % 60000) / 1000),
      });
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [target]);

  const units = [
    { val: diff.d, label: "días" },
    { val: diff.h, label: "horas" },
    { val: diff.m, label: "min" },
    { val: diff.s, label: "seg" },
  ];

  return (
    <div className="flex gap-2.5 justify-center">
      {units.map((u, i) => (
        <div key={i} className="text-center">
          <div
            className={`font-display text-[28px] font-extrabold text-gold-light bg-bg-2 rounded-[10px] px-3.5 py-2 min-w-[56px] border border-gold/15 ${
              i === 3 ? "animate-count-pulse" : ""
            }`}
          >
            {String(u.val).padStart(2, "0")}
          </div>
          <span className="text-[10px] text-text-muted mt-1 block">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
