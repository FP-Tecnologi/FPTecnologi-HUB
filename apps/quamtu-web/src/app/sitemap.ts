import type { MetadataRoute } from 'next';
import { SITIO } from '@/lib/seo';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const rutas = ['/', '/equipos', '/cotizar', '/blog', '/tickets', '/libro-de-reclamaciones'];
  return rutas.map((r) => ({ url: `${SITIO}${r}`, changeFrequency: r === '/' ? 'weekly' : 'monthly', priority: r === '/' ? 1 : r === '/equipos' ? 0.8 : 0.4 }));
}
