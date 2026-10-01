# Dashboard — FPTecnologi-HUB (Next.js)

Dashboard administrativo único para las 5 marcas (`apps/admin` en este repo).
Next.js 15 (App Router) + React 19 + Tailwind v4, con el sistema visual
`--ax-*` heredado de la plantilla comercial Vireo (ver
[`VIREO-REFERENCE.md`](../../VIREO-REFERENCE.md) antes de construir una
pantalla nueva — probablemente ya existe un patrón parecido).

## Requisitos

- Node.js 22+
- La API central corriendo en `http://localhost:3001` (ver
  [`../api/README.md`](../api/README.md))

## Puesta en marcha

1. Copiar variables de entorno:

   ```powershell
   Copy-Item .env.local.example .env.local
   ```

   `NEXT_PUBLIC_API_URL` debe apuntar a la API
   (`http://localhost:3001` en local).

2. Instalar dependencias:

   ```powershell
   npm install
   ```

3. Levantar el servidor de desarrollo:

   ```powershell
   npm run dev
   ```

   El dashboard queda en http://localhost:3000
   (la raíz `/` redirige a `/auth/sign-in` sin sesión).

4. Build de producción:

   ```powershell
   npm run build
   npm run start
   ```

## Contexto del proyecto

- [`AGENTS.md`](../../AGENTS.md) — contexto técnico canónico del proyecto.
- [`docs/ESTADO-ACTUAL.md`](../../docs/ESTADO-ACTUAL.md) — estado real y
  bitácora (actualizar al cerrar cada bloque de trabajo).
