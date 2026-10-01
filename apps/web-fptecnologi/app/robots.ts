import type { MetadataRoute } from 'next';

const SITE = process.env.SITE_URL ?? 'https://fptecnologi.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/checkout', '/carrito'] },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
