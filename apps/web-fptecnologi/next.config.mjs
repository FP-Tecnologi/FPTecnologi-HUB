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
].map(([source, destination]) => ({ source, destination, permanent: true }));

const nextConfig = {
  async redirects() {
    return REDIRECCIONES;
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'fptecnologi.com' }],
  },
};

export default nextConfig;
