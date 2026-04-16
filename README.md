# Peñita Mundial · IV Edición

Porra del Mundial 2026. Dashboard premium, mobile-first, desplegable en Vercel.

## Estado actual

La app funciona **out-of-the-box con datos demo deterministas**. No necesita CSV, Excel ni base de datos externa para arrancar.

Incluye:
- Calendario completo del Mundial 2026 (104 partidos) con ciudad sede
- Módulo de probabilidades en vivo (Polymarket → Kalshi fallback)
- Clasificación de la porra con búsqueda y favoritos
- Sistema Versus con comparativas reales
- Mi Club con picks deterministas por equipo

## Desarrollo local

```bash
npm install
npm run dev
# → http://localhost:3000
```

**Login de prueba:** `Carlos_M` (o cualquier usuario demo) con cualquier contraseña.

## Despliegue en Vercel

```bash
# Opción 1: Git
git init && git add . && git commit -m "deploy"
git remote add origin <tu-repo>
git push -u origin main
# → vercel.com/new → Importar → Deploy

# Opción 2: CLI
npx vercel --prod
```

## Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `API_SPORTS_KEY` | No | Clave de api-sports.io para resultados en vivo |
| `WORLDCUP_MANUAL_MARKET_MAP` | No | Override manual de mercado Polymarket (JSON) |
| `WORLDCUP_MANUAL_KALSHI_MAP` | No | Override manual de mercado Kalshi (JSON) |

Sin variables configuradas, la app funciona con datos demo y el módulo de probabilidades intenta conectar con APIs públicas de Polymarket/Kalshi.

## Estructura del proyecto

```
app/
  page.tsx                    → Home (countdown, podio, scoring completo)
  clasificacion/              → Ranking + búsqueda + favoritos + modal detalle
  resultados/                 → Partidos con SWR + API + sedes por ciudad
  mi-club/                    → Login demo + zona privada con picks reales
  versus/                     → Comparativa con cálculos reales
  mundial-2026/               → Calendario completo 104 partidos
  probabilidades/             → Probabilidades en vivo con gráfica time-series
  api/results/fixtures/       → Proxy a API-Football (server-only)
  api/worldcup-probabilities/ → Proxy a Polymarket/Kalshi
components/
  auth-provider.tsx     → Sesión con localStorage
  bottom-nav.tsx        → Navegación inferior (7 rutas)
  ui.tsx                → Flag, GroupBadge, Countdown, etc.
  worldcup/
    match-card.tsx      → Tarjeta de partido con ciudad sede
lib/
  data.ts               → Tipos, grupos oficiales, datos demo, scoring
  flags.ts              → Mapeo país → bandera (con emoji fallback)
  worldcup/
    schedule.ts         → 104 partidos (source of truth)
    zones.ts            → Regiones (west/central/east) + paleta de colores
    normalize-team.ts   → Normalización de nombres + flag helper
    validate.ts         → Validación de 104 partidos
  predictions/
    team-config.ts      → Configuración de 7 selecciones favoritas
    polymarket.ts       → Integración Polymarket
    kalshi.ts           → Integración Kalshi (fallback)
    market-selection.ts → Orquestador con fallback
public/flags/           → Banderas PNG + logo de la porra
```

## Calendario del Mundial 2026

Source of truth: `lib/worldcup/schedule.ts`

- 104 partidos exactos (IDs 1-104)
- 72 fase de grupos + 16 ronda de 32 + 8 octavos + 4 cuartos + 2 semis + 1 tercer puesto + 1 final
- Solo se muestra la **ciudad** sede, nunca estadio ni país
- 16 ciudades agrupadas en 3 regiones (Oeste, Centro, Este)
- Cada región tiene paleta de colores propia para chips de sede

### Regiones y ciudades

| Región | Ciudades | Color primario |
|---|---|---|
| Oeste | Vancouver, Seattle, San Francisco, Los Ángeles | `#58BBB4` |
| Centro | Ciudad de México, Monterrey, Guadalajara, Houston, Dallas, Kansas City | `#6DBF75` |
| Este | Toronto, Boston, Filadelfia, Miami, Nueva York/Nueva Jersey, Atlanta | `#F58020` |

## Helper de banderas

`lib/worldcup/normalize-team.ts`

- `normalizeTeamKey(name)` → clave filesystem-safe (sin tildes, ñ → n)
- `getFlagForTeam(name)` → ruta a PNG o null
- `getFlagEmoji(name)` → emoji fallback
- Aliases manuales para edge cases (Países Bajos, Estados Unidos, etc.)
- Si falta una bandera: emoji fallback, warning solo en desarrollo

## Módulo de probabilidades

Fuente de datos:
1. **Polymarket** (preferente): busca mercados "World Cup 2026 winner" via Gamma API
2. **Kalshi** (fallback): busca mercados FIFA equivalentes

### Selecciones favoritas (orden fijo)

| # | Selección | Color |
|---|---|---|
| 1 | 🇪🇸 España (destacada) | `#C1121F` |
| 2 | 🇦🇷 Argentina | `#6EC6FF` |
| 3 | 🇫🇷 Francia | `#1D4ED8` |
| 4 | 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra | `#6B7280` |
| 5 | 🇵🇹 Portugal | `#C1121F` |
| 6 | 🇧🇷 Brasil | `#EAB308` |
| 7 | 🇩🇪 Alemania | `#FFFFFF` (con stroke) |

### Cómo cambiar market refs manualmente

Si un mercado cambia de slug o ID, configura la variable de entorno:
```
WORLDCUP_MANUAL_MARKET_MAP={"slug":"world-cup-2026-winner-v2"}
```

### Estados de UI
- **En vivo**: datos actualizados cada 5s
- **Retrasado**: último dato válido, badge "datos retrasados"
- **Sin datos**: placeholder elegante con mensaje de error

## Datos demo vs datos reales

- **Clasificación, picks, favoritos**: datos demo deterministas (`seededRandom(42)`). Preparados para sustituirse por CSV/Excel.
- **Resultados**: mock local sin API key; live con `API_SPORTS_KEY`.
- **Probabilidades**: conecta con Polymarket/Kalshi en tiempo real. Si falla, muestra estado degradado.
- **Calendario**: 104 partidos estáticos, no requieren API.
