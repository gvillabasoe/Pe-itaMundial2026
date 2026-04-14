# Peñita Mundial · IV Edición

App Next.js App Router preparada para Vercel.

## Qué incluye

- Home / General
- Clasificación con detalle contextual y favoritos
- Resultados con polling controlado y capa mock sustituible
- Mi Club con login por @usuario, zona privada y selector de equipo
- Versus privado contra consenso o rival
- Route Handlers internos para auth, ranking, favoritos, mini porras, resultados y comparativas
- Proxy server-only para API-FOOTBALL / API-Sports

## Capa de datos

- `data/demo-data.json` contiene una instantánea demo coherente con las reglas oficiales pedidas.
- La demo está generada desde la muestra subida en `data/source/participants.csv`.
- Eliminatorias y especiales se dejan en estado `Pendiente` para no inventar resultados.
- Cuando configures API-FOOTBALL, la ruta de resultados puede dejar de usar el mock para fixtures reales.

## Credenciales demo

- Handles demo: `@usuario01` a `@usuario20`
- Contraseña demo compartida: `mundial2026`

## Entorno

Copia `.env.example` a `.env.local` si quieres activar API-FOOTBALL.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run typecheck`
