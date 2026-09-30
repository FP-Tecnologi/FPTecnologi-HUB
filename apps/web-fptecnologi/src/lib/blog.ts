/*
 * Blog: artículos publicados desde el dashboard (Blogs → API central,
 * /public/blog). Si la API no responde, el blog sale vacío (no rompe la web).
 */
export type ArticuloResumen = {
  id: string;
  titulo: string;
  slug: string;
  resumen: string;
  portadaUrl: string | null;
  categoria: string;
  etiquetas: string[];
  autorNombre: string;
  destacado: boolean;
  publicadoEn: string | null;
};
export type Articulo = ArticuloResumen & { contenido: string };

const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

async function get<T>(path: string): Promise<T | null> {
  if (!MARCA_ID) return null;
  try {
    const res = await fetch(`${API_URL}/public/blog${path}?marcaId=${MARCA_ID}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return ((await res.json())?.data ?? null) as T | null;
  } catch {
    return null;
  }
}

export const getArticulos = async () => (await get<ArticuloResumen[]>('')) ?? [];
export const getArticulo = (slug: string) => get<Articulo>(`/${encodeURIComponent(slug)}`);

export const fechaLarga = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

export const PORTADA_DEFECTO = '/images/modelo9/hero-office.jpg';
