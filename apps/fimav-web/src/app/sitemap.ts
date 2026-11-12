import type { MetadataRoute } from 'next';
import { getCategorias } from '@/lib/cms';
import { legal } from '@/lib/legal';
import { SITIO } from '@/lib/seo';
import { getProductosTienda } from '@/lib/tienda';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categorias, productos] = await Promise.all([getCategorias(), getProductosTienda()]);
  const fijas = ['/', '/nosotros', '/catalogo', '/tienda', '/peru-compras', '/tarjetas-bbva', '/contacto', '/libro-de-reclamaciones'];
  const rutas = [...fijas, ...categorias.map((c) => `/catalogo/${c.slug}`), ...(productos ?? []).map((p) => `/tienda/${p.slug}`), ...Object.keys(legal).map((s) => `/legal/${s}`)];
  return rutas.map((r) => ({ url: `${SITIO}${r}`, changeFrequency: r === '/' ? 'weekly' : 'monthly', priority: r === '/' ? 1 : r.startsWith('/catalogo') || r.startsWith('/tienda') || r === '/peru-compras' ? 0.8 : r.startsWith('/legal') ? 0.2 : 0.5 }));
}
