// Archivo .mjs (no .ts): en el hosting (Linux antiguo, sin el compilador nativo de Next) un next.config.ts no se puede leer.
/** @type {import('next').NextConfig} */
// URLs de la web anterior (WordPress) → su página nueva, para no perder enlaces ni posicionamiento en Google.
const REDIRECCIONES = [
  ['/nosotros-fptecnologi', '/nosotros'],
  ['/contactenos', '/contacto'],
  ['/desarrollo/contactenos', '/contacto'],
  ['/partners', '/socios'],
  ['/brochure', '/catalogos'],
  ['/fp-comercial', '/catalogos'],
  ['/3d-flip-book/:resto*', '/catalogos'],
  ['/compliance-microsoft', '/compliance'],
  ['/proyectos-y-servicios', '/proyectos'],
  ['/landing-cotiza-tu-tiempo', '/cotizador'],
  ['/mi-cuenta/:resto*', '/cuenta'],
  ['/lista-de-deseos', '/tienda'],
  ['/tienda-tecnologia', '/tienda'],
  ['/desarrollo/politica-de-privacidad', '/legal/privacidad'],
  ['/desarrollo/terminos-y-condiciones', '/legal/terminos'],
  ['/desarrollo/cambios-devoluciones-y-reembolsos', '/legal/devoluciones'],
  ['/desarrollo/blog', '/blog'],
  ['/checkout', '/finalizar-compra'],
  ['/checkout/gracias', '/finalizar-compra/gracias'],
  ['/education', '/educacion'],
].map(([source, destination]) => ({ source, destination, permanent: true }));

// Cabeceras de seguridad en todas las páginas. Solo esta web y el dashboard (vista previa del editor) pueden mostrarla
// dentro de un iframe (frame-ancestors); la ubicación solo la puede pedir la propia web.
const DASHBOARD = (process.env.DASHBOARD_ORIGIN ?? 'https://admin.fptecnologi.com,http://localhost:3000').split(',').map((s) => s.trim()).filter(Boolean);
const SEGURIDAD = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), usb=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
  { key: 'Content-Security-Policy', value: `frame-ancestors 'self' ${DASHBOARD.join(' ')}` },
];

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: SEGURIDAD }];
  },
  // Menos RAM en el build: el contenedor de AI App Hosting mata el proceso ("Killed") si se pasa de memoria.
  experimental: { webpackMemoryOptimizations: true, cpus: 1 },
  async redirects() {
    // www.fptecnologi.com -> fptecnologi.com (una sola URL canonica, sin contenido duplicado)
    const wwwAApex = { source: '/:path*', has: [{ type: 'host', value: 'www.fptecnologi.com' }], destination: 'https://fptecnologi.com/:path*', permanent: true };
    return [wwwAApex, ...REDIRECCIONES];
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'fptecnologi.com' }],
    // En un hosting con poca RAM, redimensionar fotos en el servidor (sharp) es lo que más memoria pide y puede hacer
    // que el sistema mate el proceso ("Killed"). NEXT_IMAGENES_SIN_OPTIMIZAR=1 sirve las fotos tal cual.
    unoptimized: process.env.NEXT_IMAGENES_SIN_OPTIMIZAR === '1',
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
