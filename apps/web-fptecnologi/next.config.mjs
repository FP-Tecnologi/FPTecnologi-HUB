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
  // Estructura típica de WordPress/WooCommerce que Google pudo indexar: a la sección equivalente (sin ID no hay página exacta).
  ['/category/:resto*', '/blog'],
  ['/tag/:resto*', '/blog'],
  ['/author/:resto*', '/nosotros'],
  ['/feed', '/blog'],
  ['/comments/feed', '/blog'],
  ['/producto-categoria/:resto*', '/tienda'],
  ['/product-category/:resto*', '/tienda'],
  ['/shop', '/tienda'],
  ['/cart', '/carrito'],
  ['/my-account/:resto*', '/cuenta'],
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
  // CDN solo para archivos: con CDN_URL (p. ej. https://cdn.midominio.com) el JS/CSS de /_next/static se pide a ese subdominio. Sin la variable no cambia nada.
  assetPrefix: process.env.CDN_URL || undefined,
  async headers() {
    // Archivos de public/ que casi nunca cambian: sin esto Next los sirve con max-age=0 y el navegador los revalida siempre.
    const larga = [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }];
    return [
      { source: '/:path*', headers: SEGURIDAD },
      ...['fonts', 'images', 'wp-content', 'herobanner', 'pdfjs'].map((d) => ({ source: `/${d}/:path*`, headers: larga })),
    ];
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
