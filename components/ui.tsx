"use client";

import Image from "next/image";
import { getFlagPath, getFlagEmoji } from "@/lib/flags";
import { GROUP_COLORS } from "@/lib/data";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";

// ─── Flag (image with emoji fallback) ───────────────

interface FlagProps {
  country: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const FLAG_SIZES = { sm: 20, md: 28, lg: 36 };

export function Flag({ country, size = "md", className }: FlagProps) {
  const path = getFlagPath(country);
  const emoji = getFlagEmoji(country);
  const px = FLAG_SIZES[size];
  const [imgError, setImgError] = useState(false);

  // If no image path or image errored, use emoji
  if (!path || imgError) {
    const fs = size === "sm" ? "text-base" : size === "lg" ? "text-[28px]" : "text-xl";
    return <span className={`${fs} leading-none ${className || ""}`} role="img" aria-label={country}>{emoji}</span>;
  }

  return (
    <Image
      src={path}
      alt={country}
      width={px}
      height={Math.round(px * 0.67)}
      className={`rounded-[3px] object-cover ${className || ""}`}
      onError={() => setImgError(true)}
    />
  );
}

// ─── CountryWithFlag (inline name + flag) ───────────

export function CountryWithFlag({ country, size = "sm" }: { country: string; size?: "sm" | "md" }) {
  if (!country) return null;
  return (
    <span className="inline-flex items-center gap-1">
      <Flag country={country} size={size} />
      <span>{country}</span>
    </span>
  );
}

// ─── Colored knockout ref ───────────────────────────

export function ColoredKnockoutRef({ text }: { text: string }) {
  // Multi-group ref like 3ABCDF → neutral
  if (/^\d[A-L]{3,}$/.test(text)) return <span className="text-text-muted">{text}</span>;
  // Single group ref like 1A, 2B → colored
  const m = text.match(/^(\d)([A-L])$/);
  if (m) return <span style={{ color: GROUP_COLORS[m[2]] || "#98A3B8" }}>{text}</span>;
  // Game ref G74, Perdedor → neutral
  return <span className="text-text-muted">{text}</span>;
}

// ─── Group Badge ────────────────────────────────────

export function GroupBadge({ group }: { group: string }) {
  const color = GROUP_COLORS[group] || "#98A3B8";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide"
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      Grupo {group}
    </span>
  );
}

// ─── Section Title ──────────────────────────────────

export function SectionTitle({ children, accent, icon: Icon, right }: {
  children: React.ReactNode; accent?: string; icon?: LucideIcon; right?: React.ReactNode;
}) {
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

export function EmptyState({ text, icon: Icon }: { text: string; icon?: LucideIcon }) {
  return (
    <div className="card text-center py-8 text-text-muted">
      {Icon && <Icon size={32} className="mx-auto mb-2 opacity-40" />}
      <p className="text-sm">{text}</p>
    </div>
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
          <div className={`font-display text-[28px] font-extrabold text-gold-light bg-bg-2 rounded-[10px] px-3.5 py-2 min-w-[56px] border border-gold/15 ${i === 3 ? "animate-count-pulse" : ""}`}>
            {String(u.val).padStart(2, "0")}
          </div>
          <span className="text-[10px] text-text-muted mt-1 block">{u.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Demo badge ─────────────────────────────────────

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-white/[0.04] text-text-muted/60 border border-white/[0.06]">
      Datos demo
    </span>
  );
}
