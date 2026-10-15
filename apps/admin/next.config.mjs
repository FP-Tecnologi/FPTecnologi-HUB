// Archivo .mjs (no .ts): en el hosting (Linux antiguo, sin el compilador nativo de Next) un next.config.ts no se puede leer.
/*
 * FPTecnologi-HUB · Dashboard (edición Next.js 15 — App Router + React 19 + Tailwind v4,
 * basada en la plantilla Vireo).
 *
 * The shared --ax-* token core (src/styles/app.css) is imported once in
 * app/layout.tsx. Tailwind v4 compiles via the PostCSS plugin (postcss.config.mjs).
 * Demo avatars/thumbnails use pravatar/picsum/loremflickr; allow them through
 * next/image just in case a page opts into <Image> (pages use plain <img> by
 * default, mirroring the reference, so this is permissive, not required).
 */
/** @type {import('next').NextConfig} */
// Rutas en inglés de la plantilla → su nombre en español (enlaces guardados, correos y la API de antes siguen funcionando).
const RUTAS_EN_ES = [
  ['/auth/sign-in', '/auth/iniciar-sesion'],
  ['/auth/sign-in-cover', '/auth/iniciar-sesion-cover'],
  ['/auth/sign-up', '/auth/registro'],
  ['/auth/sign-up-cover', '/auth/registro-cover'],
  ['/auth/two-step', '/auth/verificacion'],
  ['/auth/two-step-cover', '/auth/verificacion-cover'],
  ['/auth/two-step-totp', '/auth/verificacion-totp'],
  ['/auth/lock-screen-basic', '/auth/bloqueo-basic'],
  ['/auth/lock-screen-cover', '/auth/bloqueo-cover'],
  ['/auth/create-password-basic', '/auth/crear-contrasena-basic'],
  ['/auth/create-password-cover', '/auth/crear-contrasena-cover'],
  ['/auth/reset-password', '/auth/restablecer-contrasena'],
  ['/auth/reset-password-cover', '/auth/restablecer-contrasena-cover'],
  ['/auth/coming-soon', '/auth/proximamente'],
  ['/auth/maintenance', '/auth/mantenimiento'],
  ['/pages/terms', '/pages/terminos'],
  ['/pages/privacy', '/pages/privacidad'],
].map(([source, destination]) => ({ source, destination, permanent: true }));

const nextConfig = {
  async redirects() {
    return RUTAS_EN_ES;
  },
  // Menos RAM en el build: el contenedor de AI App Hosting mata el proceso ("Killed") si se pasa de memoria.
  experimental: { webpackMemoryOptimizations: true, cpus: 1 },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'loremflickr.com' },
    ],
  },
};

export default nextConfig;
