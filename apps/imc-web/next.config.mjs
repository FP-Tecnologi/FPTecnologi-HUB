// Web con servidor (Node): lee el contenido del dashboard (API central) con caché de 30 s.
// Solo esta web y el dashboard (vista previa del editor) pueden mostrarla dentro de un iframe (frame-ancestors).
const DASHBOARD = (process.env.DASHBOARD_ORIGIN ?? 'https://admin.fptecnologi.com,http://localhost:3000').split(',').map((s) => s.trim()).filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: [{ key: 'Content-Security-Policy', value: `frame-ancestors 'self' ${DASHBOARD.join(' ')}` }] }];
  },
};
export default nextConfig;
