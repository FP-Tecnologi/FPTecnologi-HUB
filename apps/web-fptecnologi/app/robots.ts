import type { MetadataRoute } from 'next';

const SITE = process.env.SITE_URL ?? 'https://fptecnologi.com';

export default function robots(): MetadataRoute.Robots {
  // Sitio de pruebas en un subdominio (NOINDEX=1): que Google no lo indexe y no compita con el dominio principal.
  if (process.env.NOINDEX === '1') return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/checkout', '/carrito'] },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
