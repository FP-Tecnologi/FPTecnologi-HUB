import type { Metadata } from 'next';
import { getPagina, type PaginasContenido } from './paginasContenido';

/** Título y descripción de la página; si el dashboard (Web informativa → SEO) guardó otros, reemplazan a los base. */
export async function metaSeo(pagina: keyof PaginasContenido['seo'], base: Metadata = {}): Promise<Metadata> {
  const s = (await getPagina('seo'))[pagina];
  return {
    ...base,
    ...(s.titulo.trim() ? { title: pagina === 'home' ? { absolute: s.titulo.trim() } : s.titulo.trim() } : {}),
    ...(s.descripcion.trim() ? { description: s.descripcion.trim() } : {}),
  };
}
