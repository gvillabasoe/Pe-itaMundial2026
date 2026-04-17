"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertCircle, RefreshCw, TrendingUp, Wifi, WifiOff } from "lucide-react";
import Image from "next/image";
import { Logo } from "@/components/logo";
import { TEAMS } from "@/lib/config/teams";
import type { TeamConfig } from "@/lib/config/teams";
import { getFlagForTeam, getFlagEmoji } from "@/lib/worldcup/normalize-team";

const POLL_INTERVAL = 60_000;
const MAX_HISTORY_POINTS = 60;

interface ProbabilitiesResponse {
  source?: string;
  marketQuestion?: string;
  updatedAt?: string;
  probabilities?: Record<string, number>;
  error?: string;
  stale?: boolean;
}

interface HistoryPoint {
  ts: string;
  label: string;
  [teamKey: string]: number | string;
}

export default function ProbabilidadesPage() {
  const [data, setData] = useState<ProbabilitiesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/probabilities", { cache: "no-store" });
      const json: ProbabilitiesResponse = await res.json();

      setData(json);
      if (json.error || !json.probabilities) {
        setErrMsg(json.error ?? "Datos no disponibles");
      } else {
        setErrMsg(null);
        const now = new Date();
        const point: HistoryPoint = {
          ts: now.toISOString(),
          label: now.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        for (const t of TEAMS) {
          const v = json.probabilities[t.displayName];
          if (typeof v === "number" && !Number.isNaN(v)) {
            point[t.key] = v;
          }
        }
        setHistory((prev) => {
          const next = [...prev, point];
          return next.length > MAX_HISTORY_POINTS
            ? next.slice(-MAX_HISTORY_POINTS)
            : next;
        });
      }
    } catch (err) {
      setErrMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    timerRef.current = setInterval(fetchData, POLL_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchData]);

  const probabilities = data?.probabilities;
  const spain = TEAMS[0];
  const spainValue =
    probabilities && typeof probabilities[spain.displayName] === "number"
      ? probabilities[spain.displayName]
      : null;
  const isStale = data?.stale === true || !!data?.error;

  return (
    <div className="px-4 pt-4 max-w-[640px] mx-auto">
      <div className="animate-fade-in mb-4">
        <div className="flex items-center gap-3 mb-1">
          <Logo size={44} />
          <div className="flex-1">
            <h1 className="font-display text-xl font-extrabold text-text-warm">
              Probabilidades en vivo
            </h1>
            <p className="text-xs text-text-muted">
              ¿Quién ganará el Mundial 2026?
            </p>
          </div>
          <ConnectionIndicator loading={loading} stale={isStale} hasData={!!probabilities} />
        </div>
      </div>

      {loading && !data && (
        <div className="card text-center py-12 animate-fade-in" role="status">
          <RefreshCw size={28} className="mx-auto mb-3 text-gold animate-spin" />
          <p className="text-sm text-text-muted">
            Conectando con mercados de predicción…
          </p>
        </div>
      )}

      {!loading && errMsg && !probabilities && (
        <div
          className="card text-center py-8 animate-fade-in !border-danger/20"
          role="alert"
        >
          <AlertCircle size={28} className="mx-auto mb-2 text-danger" />
          <p className="text-sm text-text-warm mb-1">Datos no disponibles</p>
          <p className="text-[10px] text-text-muted/60">{errMsg}</p>
          <button
            type="button"
            onClick={fetchData}
            className="btn btn-ghost !py-2 !px-4 text-xs mt-3"
          >
            <RefreshCw size={12} aria-hidden="true" /> Reintentar
          </button>
        </div>
      )}

      {probabilities && (
        <div
          className="card card-glow mb-3 bg-gradient-to-br from-bg-4 to-bg-2 animate-fade-in"
          style={{ borderLeft: "4px solid #C1121F" }}
        >
          <div className="flex items-center gap-3">
            <SpainFlag />
            <div className="flex-1">
              <p className="text-xs text-text-muted mb-0.5">
                Probabilidad de que España gane el Mundial
              </p>
              {spainValue !== null ? (
                <p className="font-display text-[48px] font-black text-text-warm leading-none">
                  {spainValue.toFixed(1)}
                  <span className="text-2xl text-text-muted">%</span>
                </p>
              ) : (
                <p className="font-display text-2xl font-bold text-text-muted">
                  Sin dato
                </p>
              )}
            </div>
          </div>
          {data?.updatedAt && (
            <p className="text-[9px] text-text-muted mt-2">
              Actualizado:{" "}
              {new Date(data.updatedAt).toLocaleTimeString("es-ES")}
              {isStale && (
                <span className="ml-1 text-amber-mid">(datos retrasados)</span>
              )}
              {data.source && <span className="ml-1">· {data.source}</span>}
            </p>
          )}
        </div>
      )}

      {probabilities && (
        <div
          className="grid grid-cols-3 gap-1.5 mb-4 animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          {TEAMS.slice(1).map((t) => {
            const raw = probabilities[t.displayName];
            const hasValue = typeof raw === "number" && !Number.isNaN(raw);
            const displayColor = t.color === "#FFFFFF" ? t.stroke || "#111827" : t.color;
            return (
              <div key={t.key} className="card !p-2.5 text-center">
                <div className="flex justify-center mb-1">
                  <TeamFlagSmall name={t.displayName} />
                </div>
                {hasValue ? (
                  <p
                    className="font-display text-xl font-extrabold"
                    style={{ color: displayColor }}
                  >
                    {raw.toFixed(1)}%
                  </p>
                ) : (
                  <p className="font-display text-xl font-extrabold text-text-muted">
                    —
                  </p>
                )}
                <p className="text-[9px] text-text-muted truncate">{t.displayName}</p>
              </div>
            );
          })}
        </div>
      )}

      {history.length > 1 && (
        <div className="animate-fade-in mb-4" style={{ animationDelay: "0.2s" }}>
          <h3 className="font-display text-sm font-bold text-text-warm mb-2 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-gold" aria-hidden="true" /> Evolución en tiempo real
          </h3>
          <div className="card !p-3 bg-bg-2">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={history}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: "rgb(var(--text-muted))" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 50]}
                  tick={{ fontSize: 9, fill: "rgb(var(--text-muted))" }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgb(var(--bg-4))",
                    border: "1px solid rgb(var(--text-muted) / 0.2)",
                    borderRadius: 8,
                    fontSize: 11,
                    color: "rgb(var(--text-primary))",
                  }}
                  labelStyle={{ color: "rgb(var(--text-muted))", fontSize: 10 }}
                  formatter={(value: number, name: string) => {
                    const team = TEAMS.find((t) => t.key === name);
                    return [`${value}%`, team?.displayName || name];
                  }}
                />
                {TEAMS.map((t) => (
                  <Line
                    key={t.key}
                    type="monotone"
                    dataKey={t.key}
                    name={t.key}
                    stroke={t.color === "#FFFFFF" ? "#D1D5DB" : t.color}
                    strokeWidth={t.isPrimaryFocus ? 3 : 1.5}
                    dot={false}
                    isAnimationActive
                    animationDuration={300}
                    style={
                      t.color === "#FFFFFF"
                        ? { filter: "drop-shadow(0 0 1px #111827)" }
                        : undefined
                    }
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
            <Legend teams={TEAMS} />
          </div>
        </div>
      )}
    </div>
  );
}

function Legend({ teams }: { teams: TeamConfig[] }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2 justify-center">
      {teams.map((t) => (
        <div key={t.key} className="flex items-center gap-1">
          <div
            className="w-3 rounded-full"
            style={{
              background: t.color === "#FFFFFF" ? "#D1D5DB" : t.color,
              height: t.isPrimaryFocus ? 3 : 2,
            }}
          />
          <span className="text-[9px] text-text-muted">{t.displayName}</span>
        </div>
      ))}
    </div>
  );
}

function ConnectionIndicator({
  loading,
  stale,
  hasData,
}: {
  loading: boolean;
  stale: boolean;
  hasData: boolean;
}) {
  if (loading && !hasData) {
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] text-text-muted/60"
        role="status"
      >
        <Wifi size={12} aria-hidden="true" /> Cargando
      </span>
    );
  }
  if (stale) {
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] text-amber-mid"
        role="status"
      >
        <AlertCircle size={12} aria-hidden="true" /> Retrasado
      </span>
    );
  }
  if (hasData) {
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] text-success"
        role="status"
      >
        <Wifi size={12} aria-hidden="true" /> En vivo
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] text-text-muted/40"
      role="status"
    >
      <WifiOff size={12} aria-hidden="true" /> Sin datos
    </span>
  );
}

function SpainFlag() {
  const src = getFlagForTeam("España");
  const [err, setErr] = useState(false);
  if (!src || err) return <span className="text-3xl">🇪🇸</span>;
  return (
    <Image
      src={src}
      alt="España"
      width={48}
      height={32}
      className="rounded object-cover"
      onError={() => setErr(true)}
    />
  );
}

function TeamFlagSmall({ name }: { name: string }) {
  const src = getFlagForTeam(name);
  const emoji = getFlagEmoji(name);
  const [err, setErr] = useState(false);
  if (!src || err) return <span className="text-lg">{emoji}</span>;
  return (
    <Image
      src={src}
      alt={name}
      width={24}
      height={16}
      className="rounded-[2px] object-cover"
      onError={() => setErr(true)}
    />
  );
}
