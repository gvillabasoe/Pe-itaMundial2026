# Peñita Mundial · IV Edición

Porra del Mundial 2026. Dashboard premium, mobile-first, desplegable en Vercel.

## Estado actual

La app funciona **out-of-the-box con datos demo deterministas** incluidos en el proyecto. No necesita CSV, Excel ni base de datos externa para arrancar.

Los resultados de partidos pueden enriquecerse opcionalmente conectando la API de API-Football.

## Desarrollo local

```bash
npm install
npm run dev
# → http://localhost:3000
```

**Login de prueba:** `Carlos_M` (o cualquier usuario del dataset demo) con cualquier contraseña.

## Despliegue en Vercel

### Opción 1 — Git + Vercel (recomendada)

```bash
git init && git add . && git commit -m "Initial"
git remote add origin <tu-repo>
git push -u origin main
```

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Importa el repositorio — Vercel detecta Next.js automáticamente
3. Deploy

### Opción 2 — Vercel CLI

```bash
npx vercel       # preview
npx vercel --prod # producción
```

## Variables de entorno (opcionales)

| Variable | Descripción |
|---|---|
| `API_SPORTS_KEY` | Clave de [api-sports.io](https://www.api-football.com/) para resultados en vivo y sedes |

Sin `API_SPORTS_KEY`, la app usa fixtures mock y lo indica discretamente en la UI.

## Estructura

```
app/
  page.tsx              → Home (countdown, podio, scoring)
  clasificacion/        → Ranking + búsqueda + favoritos + detalle modal
  resultados/           → Partidos con SWR + API + sedes por ciudad
  mi-club/              → Login demo + zona privada con picks reales
  versus/               → Comparativa con cálculos reales
  api/results/fixtures/ → Proxy a API-Football (server-only)
components/
  auth-provider.tsx     → Sesión con localStorage
  bottom-nav.tsx        → Navegación inferior
  ui.tsx                → Flag, GroupBadge, Countdown, etc.
lib/
  data.ts               → Tipos, grupos oficiales, datos demo, scoring, helpers
  flags.ts              → Mapeo país → bandera con emoji fallback
  venues.ts             → Normalización de sedes + paleta regional
public/flags/           → Banderas PNG
```

## Datos demo vs datos reales

- **Clasificación, picks, favoritos**: datos demo generados determinísticamente en `lib/data.ts` con `seededRandom(42)`. Preparados para sustituirse por CSV/Excel real en el futuro.
- **Resultados de partidos**: mock local si no hay API key; datos live de API-Football si la hay.
- **Sedes/ciudades**: solo visibles cuando la API las proporciona. Si no hay API, no se fabrican ciudades.

## Sistema de puntuación

Centralizado en `lib/data.ts` → `SCORING`. Visible en la Home. Es la única fuente de verdad.
