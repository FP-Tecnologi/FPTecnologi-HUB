/*
 * Líneas de producto y sus productos, gestionados desde el dashboard (Ecommerce → Catálogo y Productos):
 * cada línea es una Categoría de la marca y cada producto cuelga de ella. Si la API no responde, no hay
 * HUB_MARCA_ID o todavía no hay líneas cargadas, la web muestra las de `contenido.ts` (así nunca queda vacía).
 */
import { cache } from 'react';
import { lineas as LINEAS_BASE, type Linea } from './contenido';

const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID;

type ApiCategoria = { id: string; nombre: string; slug: string | null; portadaUrl: string | null; resumen: string | null; texto: string | null; galeria: string[]; orden: number };
type ApiProducto = { nombre: string; detalle: string | null; descripcion: string | null; imagenes: string[]; categoriaId: string | null; createdAt: string };

async function pedir<T>(ruta: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/public/${ruta}${ruta.includes('?') ? '&' : '?'}marcaId=${encodeURIComponent(MARCA_ID ?? '')}`, { next: { revalidate: 30 }, signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    return ((await res.json())?.data ?? null) as T | null;
  } catch {
    return null;
  }
}

/** «Línea de Pinturas» → «Pinturas» (o el corto de la línea original si es la misma). */
const cortoDe = (nombre: string, id: string) => LINEAS_BASE.find((l) => l.id === id)?.corto ?? nombre.replace(/^L[ií]nea de /i, '');

export const getLineas = cache(async (): Promise<Linea[]> => {
  if (!MARCA_ID) return LINEAS_BASE;
  const [cats, prods] = await Promise.all([pedir<ApiCategoria[]>('categorias'), pedir<{ data: ApiProducto[] }>('productos?limit=100')]);
  const categorias = (cats ?? []).filter((c) => c.slug);
  if (!categorias.length) return LINEAS_BASE;
  const productos = [...(prods?.data ?? [])].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return categorias.map((c) => {
    const fotos = c.galeria ?? [];
    return {
      id: c.slug as string,
      nombre: c.nombre,
      corto: cortoDe(c.nombre, c.slug as string),
      lema: c.resumen ?? '',
      texto: c.texto ?? '',
      foto: c.portadaUrl || fotos[0] || '/icon.svg',
      galeria: fotos.map((src) => ({ src, alt: c.nombre })),
      productos: productos
        .filter((p) => p.categoriaId === c.id)
        .map((p) => ({ nombre: p.nombre, img: p.imagenes[0] ?? '/icon.svg', detalle: p.detalle ?? '', descripcion: p.descripcion ?? '' })),
    };
  });
});
