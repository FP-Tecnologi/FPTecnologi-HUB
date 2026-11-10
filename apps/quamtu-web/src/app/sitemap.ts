import type { MetadataRoute } from 'next';
import { OPCIONES } from '@/lib/piezas';
import { SITIO } from '@/lib/seo';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const fijas = ['/', '/tienda', '/equipos', '/armar', '/cotizar', '/tickets', '/libro-de-reclamaciones'];
  const rutas = [...fijas, ...OPCIONES.map((o) => `/producto/${o.id}`)];
  return rutas.map((r) => ({ url: `${SITIO}${r}`, changeFrequency: r === '/' ? 'weekly' : 'monthly', priority: r === '/' ? 1 : r === '/tienda' || r === '/armar' ? 0.8 : r.startsWith('/producto') ? 0.6 : 0.4 }));
}
