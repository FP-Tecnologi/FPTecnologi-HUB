import type { MetadataRoute } from 'next';
import { categorias } from '@/lib/categorias';
import { legal } from '@/lib/legal';
import { SITIO } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const fijas = ['/', '/nosotros', '/catalogo', '/peru-compras', '/contacto', '/libro-de-reclamaciones'];
  const rutas = [...fijas, ...categorias.map((c) => `/catalogo/${c.slug}`), ...Object.keys(legal).map((s) => `/legal/${s}`)];
  return rutas.map((r) => ({ url: `${SITIO}${r}`, changeFrequency: r === '/' ? 'weekly' : 'monthly', priority: r === '/' ? 1 : r.startsWith('/catalogo') || r === '/peru-compras' ? 0.8 : r.startsWith('/legal') ? 0.2 : 0.5 }));
}
