# Peñita Mundial · IV Edición

Porra del Mundial 2026 — Dashboard premium con clasificación, resultados en vivo, picks y sistema Versus.

## Estructura

```
app/
  page.tsx              → Home (countdown, podio, mini porra)
  clasificacion/        → Ranking general + detalle modal
  resultados/           → Partidos por fase + bracket eliminatorias
  mi-club/              → Login + zona privada con tabs
  versus/               → Comparativa cara a cara
  api/results/fixtures/ → Proxy a API-Football (server-only)
components/
  auth-provider.tsx     → Contexto de autenticación
  bottom-nav.tsx        → Navegación inferior
  ui.tsx                → Flag, GroupBadge, Countdown, etc.
lib/
  data.ts               → Tipos, grupos oficiales, mock data, scoring
  flags.ts              → Mapeo país → imagen de bandera
public/flags/           → 48 banderas PNG + logo
```

## Despliegue en Vercel

### Opción 1 — Git + Vercel (recomendado)

1. **Sube el proyecto a GitHub/GitLab:**
   ```bash
   cd penita-mundial
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TU_USUARIO/penita-mundial.git
   git push -u origin main
   ```

2. **Conecta en Vercel:**
   - Ve a [vercel.com/new](https://vercel.com/new)
   - Importa el repositorio
   - Vercel detectará Next.js automáticamente
   - Click en **Deploy**

3. **Configura variables de entorno (opcional):**
   - En Vercel → Settings → Environment Variables
   - Añade `API_SPORTS_KEY` con tu clave de api-sports.io

### Opción 2 — Vercel CLI

```bash
# Instala Vercel CLI
npm i -g vercel

# Desde la raíz del proyecto
cd penita-mundial
npm install
vercel

# Para producción
vercel --prod
```

### Opción 3 — Drag & Drop

```bash
cd penita-mundial
npm install
npm run build
# Sube la carpeta .next/standalone a Vercel
```

## Desarrollo local

```bash
npm install
npm run dev
# → http://localhost:3000
```

**Login de prueba:** `Carlos_M` (o cualquier usuario de mock) con cualquier contraseña.

## API de Resultados

La app está preparada para consumir API-Football (api-sports.io):
- El proxy en `/api/results/fixtures` mantiene la API key en servidor
- Si no hay API key, devuelve datos mock
- La normalización de nombres (ej: "Netherlands" → "Países Bajos") es automática

## Datos Oficiales

Los 12 grupos del Mundial 2026 están definidos en `lib/data.ts` como fuente de verdad.
Las 48 banderas oficiales están en `public/flags/`.

## Iteración Incremental

El proyecto está preparado para evolucionar sin rehacerse:
- Modifica solo archivos afectados
- Añade nuevas features en sus propias rutas/componentes
- Los datos mock en `lib/data.ts` se pueden sustituir por API real
