# Web pública — fptecnologi.com (Next.js)

Web pública de fptecnologi.com (`apps/web-fptecnologi` en este repo,
Fase 2 del plan). Next.js 16 (App Router) + React 19 + Tailwind v4,
**sin login**. Toma prestado el ADN visual (glassmorfismo, botones con
degradé+glow) de la plantilla comercial Vireo/Aurora ya adaptada en
`apps/web/src/styles/components.css` — ver
[`VIREO-REFERENCE.md`](../../VIREO-REFERENCE.md).

**Contenido hoy hardcodeado en `src/lib/content.ts`** (productos, marcas,
soluciones, datos de contacto — copiados de fptecnologi.com real, no
inventados), **no conectado todavía** a `GET /public/*` de la API
central. Conectarlo es el próximo paso pendiente de Fase 2.

## Requisitos

- Node.js 22+
- No necesita la API corriendo para verse (contenido hardcodeado), pero
  sí para cuando se conecte `/public/*` (ver arriba)

## Puesta en marcha

1. Instalar dependencias:

   ```powershell
   npm install
   ```

2. Levantar el servidor de desarrollo:

   ```powershell
   npm run dev -- --port 3002
   ```

   El sitio queda en http://localhost:3002 (puerto fijado en
   `.claude/launch.json`, entrada `web-fptecnologi`, para no chocar con
   el dashboard en 3000 ni la API en 3001).

3. Build de producción:

   ```powershell
   npm run build
   npm run start
   ```

## Puntos de entrada útiles

- `/` .. `/modelo-6` — 6 modelos completos de home para elegir dirección
  visual (5 basados en la plantilla comercial Techon, 1 propuesta
  propia). Ver `/modelos` para el índice.
- `/guia-estilos` — catálogo vivo de todos los componentes reales
  (headers, botones, tarjetas, carrito, chat, etc.) más propuestas de
  diseño no aplicadas, cada una marcada explícitamente como tal. Punto de
  partida obligado antes de tocar el look de cualquier componente
  existente.

## Contexto del proyecto

- [`AGENTS.md`](../../AGENTS.md) — contexto técnico canónico del
  proyecto (arquitectura, stack, convenciones).
- [`docs/ESTADO-ACTUAL.md`](../../docs/ESTADO-ACTUAL.md) — estado real y
  bitácora, sección "Fase 2" tiene el detalle completo de qué se
  construyó, qué falta y notas técnicas no obvias (bugs de CSS
  encontrados, límites reales de Server/Client Components en esta app,
  etc.) — leer antes de retomar trabajo en esta app desde otra máquina.
