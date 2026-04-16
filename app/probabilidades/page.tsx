"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, RefreshCw, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { PREDICTION_TEAMS } from "@/lib/predictions/team-config";
import { getFlagForTeam, getFlagEmoji } from "@/lib/worldcup/normalize-team";
import Image from "next/image";

const POLL_INTERVAL = 5000;
const MAX_HISTORY_POINTS = 60;

interface TeamProb {
  teamKey: string;
  teamName: string;
  probability01: number;
  probabilityPct: number;
  color: string;
  flagSrc: string | null;
  isPrimaryFocus: boolean;
  provider: string;
  confidence: number;
}

interface Snapshot {
  updatedAt: string;
  status: "ok" | "stale" | "error";
  teams: TeamProb[];
}

interface HistoryPoint {
  ts: string;
  label: string;
  [key: string]: number | string;
}

export default function ProbabilidadesPage() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/worldcup-probabilities");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Snapshot = await res.json();

      setSnapshot(data);
      setError(null);

      // Add to history
      const now = new Date();
      const point: HistoryPoint = {
        ts: now.toISOString(),
        label: now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      };
      for (const t of data.teams) {
        point[t.teamKey] = t.probabilityPct;
      }

      setHistory(prev => {
        const next = [...prev, point];
        return next.length > MAX_HISTORY_POINTS ? next.slice(-MAX_HISTORY_POINTS) : next;
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, POLL_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchData]);

  const spain = snapshot?.teams.find(t => t.teamKey === "espana");
  const others = snapshot?.teams.filter(t => t.teamKey !== "espana") || [];
  const isOk = snapshot?.status === "ok";
  const isStale = snapshot?.status === "stale";

  return (
    <div className="px-4 pt-4 max-w-[640px] mx-auto">
      {/* Header */}
      <div className="animate-fade-in mb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-bg-3 flex items-center justify-center">
            <Image src="/flags/Logo_Porra_Peñita_Mundial_2026.webp" alt="Peñita Mundial" width={40} height={40} className="object-contain" />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-xl font-extrabold text-text-warm">Probabilidades en vivo</h1>
            <p className="text-xs text-text-muted">¿Quién ganará el Mundial 2026?</p>
          </div>
          <div className="flex items-center gap-1">
            {isOk ? <Wifi size={14} className="text-success" /> : isStale ? <AlertCircle size={14} className="text-amber-mid" /> : <WifiOff size={14} className="text-text-muted/40" />}
            <span className="text-[9px] text-text-muted">{isOk ? "En vivo" : isStale ? "Retrasado" : "Sin datos"}</span>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && !snapshot && (
        <div className="card text-center py-12 animate-fade-in">
          <RefreshCw size={28} className="mx-auto mb-3 text-gold animate-spin" />
          <p className="text-sm text-text-muted">Conectando con mercados de predicción...</p>
        </div>
      )}

      {/* Spain main card */}
      {spain && (
        <div className="card card-glow mb-3 bg-gradient-to-br from-bg-4 to-bg-2 animate-fade-in" style={{ borderLeft: "4px solid #C1121F" }}>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <SpainFlag />
            </div>
            <div className="flex-1">
              <p className="text-xs text-text-muted mb-0.5">Probabilidad de que España gane el Mundial</p>
              <p className="font-display text-[48px] font-black text-text-warm leading-none">
                {spain.probabilityPct}<span className="text-2xl text-text-muted">%</span>
              </p>
            </div>
          </div>
          {snapshot && (
            <p className="text-[9px] text-text-muted mt-2">
              Actualizado: {new Date(snapshot.updatedAt).toLocaleTimeString("es-ES")}
              {isStale && <span className="ml-1 text-amber-mid">(datos retrasados)</span>}
            </p>
          )}
        </div>
      )}

      {/* Other teams grid */}
      {others.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {others.map(t => (
            <div key={t.teamKey} className="card !p-2.5 text-center">
              <div className="flex justify-center mb-1">
                <TeamFlagSmall name={t.teamName} />
              </div>
              <p className="font-display text-xl font-extrabold" style={{ color: t.color === "#FFFFFF" ? "#D1D5DB" : t.color }}>
                {t.probabilityPct}%
              </p>
              <p className="text-[9px] text-text-muted truncate">{t.teamName}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {history.length > 1 && (
        <div className="animate-fade-in mb-4" style={{ animationDelay: "0.2s" }}>
          <h3 className="font-display text-sm font-bold text-text-warm mb-2 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-gold" /> Evolución en tiempo real
          </h3>
          <div className="card !p-3" style={{ background: "#07090D" }}>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={history}>
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#98A3B8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis domain={[0, 50]} tick={{ fontSize: 9, fill: "#98A3B8" }} tickLine={false} axisLine={false} width={30}
                  tickFormatter={(v: number) => `${v}%`} />
                <Tooltip
                  contentStyle={{ background: "#0D1014", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: "#98A3B8", fontSize: 10 }}
                  formatter={(value: number, name: string) => {
                    const team = PREDICTION_TEAMS.find(t => t.teamKey === name);
                    return [`${value}%`, team?.teamName || name];
                  }}
                />
                {PREDICTION_TEAMS.map(t => (
                  <Line key={t.teamKey} type="monotone" dataKey={t.teamKey} name={t.teamKey}
                    stroke={t.color === "#FFFFFF" ? "#D1D5DB" : t.color}
                    strokeWidth={t.isPrimaryFocus ? 3 : 1.5}
                    dot={false} animationDuration={300}
                    style={t.color === "#FFFFFF" ? { filter: "drop-shadow(0 0 1px #111827)" } : undefined}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {PREDICTION_TEAMS.map(t => (
                <div key={t.teamKey} className="flex items-center gap-1">
                  <div className="w-3 h-0.5 rounded-full" style={{
                    background: t.color === "#FFFFFF" ? "#D1D5DB" : t.color,
                    height: t.isPrimaryFocus ? 3 : 2,
                  }} />
                  <span className="text-[9px] text-text-muted">{t.teamName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !snapshot && (
        <div className="card text-center py-8 text-text-muted animate-fade-in">
          <AlertCircle size={28} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm mb-1">No se pudieron obtener datos de mercados</p>
          <p className="text-[10px] text-text-muted/50">{error}</p>
        </div>
      )}
    </div>
  );
}

function SpainFlag() {
  const src = getFlagForTeam("España");
  const [err, setErr] = useState(false);
  if (!src || err) return <span className="text-3xl">🇪🇸</span>;
  return <Image src={src} alt="España" width={48} height={32} className="rounded object-cover" onError={() => setErr(true)} />;
}

function TeamFlagSmall({ name }: { name: string }) {
  const src = getFlagForTeam(name);
  const emoji = getFlagEmoji(name);
  const [err, setErr] = useState(false);
  if (!src || err) return <span className="text-lg">{emoji}</span>;
  return <Image src={src} alt={name} width={24} height={16} className="rounded-[2px] object-cover" onError={() => setErr(true)} />;
}
