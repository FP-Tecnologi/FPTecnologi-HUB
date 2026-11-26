/*
 * Blog de Imaninki: artículos publicados desde el dashboard (Blogs → API central, /public/blog, con el marcaId de la
 * marca). Si la API no responde o falta HUB_MARCA_ID, el blog sale vacío y la web no se rompe.
 */
import { cache } from 'react';

export type ArticuloResumen = {
  id: string; titulo: string; slug: string; resumen: string; portadaUrl: string | null; categoria: string;
  etiquetas: string[]; autorNombre: string; destacado: boolean; publicadoEn: string | null;
};
export type Articulo = ArticuloResumen & { contenido: string };

const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';

async function pedir<T>(ruta: string): Promise<T | null> {
  const marca = process.env.HUB_MARCA_ID;
  if (!marca) return null;
  try {
    const res = await fetch(`${API_URL}/public/blog${ruta}?marcaId=${encodeURIComponent(marca)}`, { next: { revalidate: 30 }, signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    return ((await res.json())?.data ?? null) as T | null;
  } catch {
    return null;
  }
}

// Lo subido desde el dashboard viene como /uploads/…: pasa por el proxy de la web (/api/archivos), sin CORS.
const aProxy = (u: string) => `/api/archivos${u.slice('/uploads'.length)}`;
const imagen = (u: string | null) => (u?.startsWith('/uploads/') ? aProxy(u) : u);

export const getArticulos = cache(async () => ((await pedir<ArticuloResumen[]>('')) ?? []).map((a) => ({ ...a, portadaUrl: imagen(a.portadaUrl) })));
export const getArticulo = cache(async (slug: string) => {
  const a = await pedir<Articulo>(`/${encodeURIComponent(slug)}`);
  return a && { ...a, portadaUrl: imagen(a.portadaUrl), contenido: a.contenido.replaceAll('](/uploads/', '](/api/archivos/') };
});

export const fechaLarga = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : '');
export const PORTADA_DEFECTO = '/fotos/cumbre.webp';
