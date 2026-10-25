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
  transpilePackages: ['three'],
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: SEGURIDAD }];
  },
};
export default nextConfig;
