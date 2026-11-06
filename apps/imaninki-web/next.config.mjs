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

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // CDN solo para archivos: con CDN_URL (p. ej. https://cdn.midominio.com) el JS/CSS de /_next/static se pide a ese subdominio. Sin la variable no cambia nada.
  assetPrefix: process.env.CDN_URL || undefined,
  async headers() {
    // Sin esto Next sirve public/ con max-age=0 y el navegador revalida cada imagen en cada visita.
    const larga = [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }];
    return [
      { source: '/:path*', headers: SEGURIDAD },
      ...['brand', 'clientes', 'fotos'].map((d) => ({ source: `/${d}/:path*`, headers: larga })),
    ];
  },
  async redirects() {
    return [{ source: '/legal/reclamaciones', destination: '/libro-de-reclamaciones', permanent: true }];
  },
};
export default nextConfig;
