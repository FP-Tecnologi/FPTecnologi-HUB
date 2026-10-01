import type { MetadataRoute } from 'next';
import { getArticulos } from '@/lib/blog';
import { getServicios } from '@/lib/servicios';
import { getCatalogo } from '@/lib/catalogo';

export const dynamic = 'force-dynamic';

const SITE = process.env.SITE_URL ?? 'https://fptecnologi.com';
const FIJAS = ['', '/nosotros', '/servicios', '/proyectos', '/tienda', '/marcas', '/blog', '/cotizador', '/contacto', '/libro-de-reclamaciones'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articulos, servicios, catalogo] = await Promise.all([getArticulos(), getServicios(), getCatalogo()]);
  return [
    ...FIJAS.map((p) => ({ url: `${SITE}${p}` })),
    ...articulos.map((a) => ({ url: `${SITE}/blog/${a.slug}`, lastModified: a.publicadoEn ?? undefined })),
    ...servicios.map((s) => ({ url: `${SITE}/servicios/${s.slug}` })),
    ...catalogo.products.filter((p) => p.slug).map((p) => ({ url: `${SITE}/producto/${p.slug}` })),
  ];
}
