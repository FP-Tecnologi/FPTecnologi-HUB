/** @type {import('next').NextConfig} */
// Web estática: `npm run build` deja todo en out/ para subirlo tal cual al hosting (sin Node). Cabeceras de seguridad: public/.htaccess.
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  transpilePackages: ['three'],
  poweredByHeader: false,
};
export default nextConfig;
