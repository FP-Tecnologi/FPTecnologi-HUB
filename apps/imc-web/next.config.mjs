/** @type {import('next').NextConfig} */
// Web con servidor (Node): lee el contenido del dashboard (API central) con caché de 30 s.
const nextConfig = { trailingSlash: true, images: { unoptimized: true }, poweredByHeader: false };
export default nextConfig;
