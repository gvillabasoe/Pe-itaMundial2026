"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TrendingUp, AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";

const POLL_INTERVAL_MS = 60_000; // 60 seconds

// Display order and colors — España always first and highlighted
const TEAM_CONFIG = [
  { key: "espana",     name: "España",     emoji: "🇪🇸", color: "#C1121F", primary: true },
  { key: "argentina",  name: "Argentina",  emoji: "🇦🇷", color: "#6EC6FF" },
  { key: "francia",    name: "Francia",    emoji: "🇫🇷", color: "#1D4ED8" },
  { key: "inglaterra", name: "Inglaterra", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#6B7280" },
  { key: "portugal",   name: "Portugal",   emoji: "🇵🇹", color: "#16A34A" },
  { key: "brasil",     name: "Brasil",     emoji: "🇧🇷", color: "#EAB308" },
  { key: "alemania",   name: "Alemania",   emoji: "🇩🇪", color: "#D1D5DB", outline: true },
];

interface ApiResponse {
  source?: string;
  updatedAt?: string;
  probabilities?: Record<string, number>;
  error?: string;
  stale?: boolean;
}

export default function ProbabilidadesPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/probabilities", { cache: "no-store" });
      const json: ApiResponse = await res.json();
      setData(json);
      setFetchError(json.error ? json.error : null);
    } catch (err) {
      setFetchError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    timerRef.current = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetchData]);

  const probs = data?.probabilities;
  const isStale = !!data?.stale || !!data?.error;
  const hasData = !!(probs && Object.keys(probs).length > 0);

  const spainProb = probs?.["España"];

  return (
    <div className="px-4 pt-4 max-w-[640px] mx-auto">
      {/* Header */}
      <div className="animate-fade-in mb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-text-warm mb-0.5">
              Probabilidades
            </h1>
            <p className="text-xs text-text-muted">
              ¿Quién ganará el Mundial 2026?
            </p>
          </div>
          {/* Connection indicator */}
          {loading && !data && (
            <span className="inline-flex items-center gap-1 text-[10px] text-text-muted/50">
              <Wifi size={12} /> Cargando
            </span>
          )}
          {!loading && hasData && !isStale && (
            <span className="inline-flex items-center gap-1 text-[10px] text-success">
              <Wifi size={12} /> En vivo
            </span>
          )}
          {isStale && (
            <span className="inline-flex items-center gap-1 text-[10px] text-amber-mid">
              <AlertCircle size={12} /> Retrasado
            </span>
          )}
          {!loading && !hasData && !isStale && (
            <span className="inline-flex items-center gap-1 text-[10px] text-text-muted/40">
              <WifiOff size={12} /> Sin datos
            </span>
          )}
        </div>
        {data?.updatedAt && (
          <p className="text-[10px] text-text-muted/50">
            Actualizado: {new Date(data.updatedAt).toLocaleTimeString("es-ES")}
            {data.source && <span className="ml-1">· {data.source}</span>}
          </p>
        )}
      </div>

      {/* Loading */}
      {loading && !data && (
        <div className="card text-center py-12 animate-fade-in">
          <RefreshCw size={28} className="mx-auto mb-3 text-gold animate-spin" />
          <p className="text-sm text-text-muted">Cargando probabilidades…</p>
        </div>
      )}

      {/* Error — NEVER show 0% as fallback */}
      {!loading && !hasData && (
        <div className="card text-center py-8 animate-fade-in !border-danger/20">
          <AlertCircle size={28} className="mx-auto mb-2 text-danger" />
          <p className="text-sm text-text-warm mb-1">Datos no disponibles</p>
          <p className="text-[10px] text-text-muted/60">
            {fetchError ?? data?.error ?? "No se pudieron cargar los datos del mercado"}
          </p>
          <p className="text-[10px] text-text-muted/40 mt-1">
            Fuente: The Odds API · ODDS_API_KEY requerida
          </p>
          <button
            type="button"
            onClick={fetchData}
            className="btn btn-ghost !py-2 !px-4 text-xs mt-3"
          >
            <RefreshCw size={12} /> Reintentar
          </button>
        </div>
      )}

      {/* España — hero card */}
      {hasData && typeof spainProb === "number" && (
        <div
          className="card card-glow mb-3 bg-gradient-to-br from-bg-4 to-bg-2 animate-fade-in"
          style={{ borderLeft: "4px solid #C1121F" }}
        >
          <p className="text-xs text-text-muted mb-1 flex items-center gap-1.5">
            <TrendingUp size={12} className="text-danger" />
            Probabilidad de que España gane el Mundial
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label="España">🇪🇸</span>
            <p className="font-display text-[52px] font-black text-text-warm leading-none">
              {spainProb.toFixed(1)}
              <span className="text-2xl text-text-muted font-normal">%</span>
            </p>
          </div>
          {isStale && (
            <p className="text-[9px] text-amber-mid mt-1">datos retrasados</p>
          )}
        </div>
      )}

      {/* Other 6 teams grid */}
      {hasData && (
        <div
          className="grid grid-cols-3 gap-2 mb-4 animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          {TEAM_CONFIG.filter((t) => !t.primary).map((t) => {
            const prob = probs?.[t.name];
            const hasValue = typeof prob === "number" && !Number.isNaN(prob);
            return (
              <div key={t.key} className="card !p-3 text-center">
                <span className="text-2xl block mb-1" role="img" aria-label={t.name}>
                  {t.name === "Inglaterra" ? "🏴󠁧󠁢󠁥󠁮󠁧󠁿" : t.emoji}
                </span>
                {hasValue ? (
                  <p
                    className="font-display text-xl font-extrabold"
                    style={{ color: t.outline ? "#D1D5DB" : t.color }}
                  >
                    {prob.toFixed(1)}%
                  </p>
                ) : (
                  <p className="font-display text-xl font-extrabold text-text-muted">—</p>
                )}
                <p className="text-[9px] text-text-muted mt-0.5">{t.name}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Full ranking */}
      {hasData && probs && (
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h3 className="font-display text-sm font-bold text-text-warm mb-2">
            Ranking completo
          </h3>
          <div className="flex flex-col gap-1">
            {Object.entries(probs)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 20)
              .map(([team, prob], i) => {
                const config = TEAM_CONFIG.find((t) => t.name === team);
                const isSpain = team === "España";
                return (
                  <div
                    key={team}
                    className="card !py-2 !px-3 flex items-center gap-2.5"
                    style={isSpain ? { borderLeft: "3px solid #C1121F" } : undefined}
                  >
                    <span className="font-display text-xs font-bold text-text-muted w-4 text-center">
                      {i + 1}
                    </span>
                    <span className="text-base" role="img" aria-label={team}>
                      {config?.emoji ?? "🏳️"}
                    </span>
                    <span className="flex-1 text-sm font-medium text-text-warm">{team}</span>
                    <div className="flex items-center gap-2">
                      {/* Probability bar */}
                      <div className="w-16 h-1.5 rounded-full bg-bg-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(prob, 100)}%`,
                            background: config?.color ?? "#98A3B8",
                          }}
                        />
                      </div>
                      <span
                        className="font-display text-sm font-bold min-w-[40px] text-right"
                        style={{ color: config?.color ?? "#98A3B8" }}
                      >
                        {prob.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Source note */}
      {hasData && (
        <p className="text-[9px] text-text-muted/40 text-center mt-4 mb-2">
          Fuente: The Odds API · Se actualiza cada 60 s · Solo porcentaje, sin cuotas directas
        </p>
      )}
    </div>
  );
}
