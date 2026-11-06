import type { MetadataRoute } from 'next';
import { getLineas } from '@/lib/lineas';
import { getPagina } from '@/lib/cms';
import { SITIO } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lineas = await getLineas();
  const legal = (await getPagina('legal')).estado.publicado ? ['/legal/privacidad', '/legal/terminos', '/legal/devoluciones'] : [];
  const rutas = ['/', '/nosotros', '/contacto', '/catalogos', ...lineas.map((l) => `/lineas/${l.id}`), '/libro-de-reclamaciones', '/tickets', ...legal];
  return rutas.map((r) => ({ url: `${SITIO}${r}`, changeFrequency: r === '/' ? 'weekly' : 'monthly', priority: r === '/' ? 1 : r.startsWith('/lineas') ? 0.8 : 0.5 }));
}
