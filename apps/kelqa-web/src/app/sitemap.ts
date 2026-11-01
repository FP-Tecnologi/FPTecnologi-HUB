import type { MetadataRoute } from 'next';
import { lineas } from '@/lib/contenido';
import { SITIO } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const rutas = ['/', '/nosotros', '/contacto', ...lineas.map((l) => `/lineas/${l.id}`), '/libro-de-reclamaciones', '/tickets'];
  return rutas.map((r) => ({ url: `${SITIO}${r}`, changeFrequency: r === '/' ? 'weekly' : 'monthly', priority: r === '/' ? 1 : r.startsWith('/lineas') ? 0.8 : 0.5 }));
}
