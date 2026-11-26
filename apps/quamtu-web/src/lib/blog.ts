/*
 * Blog de Quamtu: artículos publicados desde el dashboard (Blogs → API central, /public/blog, con el marcaId de
 * Quamtu). La web es estática: los artículos se leen UNA vez al compilar (npm run build), así que un artículo nuevo
 * aparece al volver a compilar y subir out/. Si la API no responde o falta HUB_MARCA_ID, el blog sale vacío y la web
 * no se rompe.
 */
import { cache } from 'react';

export type ArticuloResumen = {
  id: string; titulo: string; slug: string; resumen: string; portadaUrl: string | null; categoria: string;
  etiquetas: string[]; autorNombre: string; destacado: boolean; publicadoEn: string | null;
};
export type Articulo = ArticuloResumen & { contenido: string };

const API_URL = process.env.HUB_API_URL || 'http://localhost:3001';
// Lo subido desde el dashboard viene como /uploads/…: en la web estática se pide a la API pública (la que ven los navegadores).
const API_PUBLICA = process.env.NEXT_PUBLIC_HUB_API_URL || API_URL;

async function pedir<T>(ruta: string): Promise<T | null> {
  const marca = process.env.HUB_MARCA_ID;
  if (!marca) return null;
  try {
    const res = await fetch(`${API_URL}/public/blog${ruta}?marcaId=${encodeURIComponent(marca)}`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return ((await res.json())?.data ?? null) as T | null;
  } catch {
    return null;
  }
}

const imagen = (u: string | null) => (u?.startsWith('/uploads/') ? `${API_PUBLICA}${u}` : u);

export const getArticulos = cache(async () => ((await pedir<ArticuloResumen[]>('')) ?? []).map((a) => ({ ...a, portadaUrl: imagen(a.portadaUrl) })));
export const getArticulo = cache(async (slug: string) => {
  const a = await pedir<Articulo>(`/${encodeURIComponent(slug)}`);
  return a && { ...a, portadaUrl: imagen(a.portadaUrl), contenido: a.contenido.replaceAll('](/uploads/', `](${API_PUBLICA}/uploads/`) };
});

export const fechaLarga = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : '');
export const PORTADA_DEFECTO = '/og.jpg';
