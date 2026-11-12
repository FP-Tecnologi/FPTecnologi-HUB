/*
 * Tienda de Fimav Perú: muestra los productos de FPTecnologi (otra marca de la misma API central) con el estilo de esta web.
 * Solo lectura: GET /public/productos de la marca TIENDA_MARCA_ID (el marcaId de FPTecnologi). Sin esa variable, o si la API
 * no responde, la tienda muestra un aviso y deriva a /cotizar. No hay carrito: Fimav vende por cotización (B2B / Estado),
 * cada producto lleva a /cotizar con el equipo ya indicado. Precios en USD sin IGV, solo referenciales.
 */
import { cache } from 'react';

const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA = process.env.TIENDA_MARCA_ID ?? '';
const SITIO_ORIGEN = 'https://fptecnologi.com';

export type ProductoTienda = {
  id: string; sku: string; slug: string; nombre: string; descripcion: string; marca: string;
  categoria: { slug: string; nombre: string };
  precio: number; precioAntes: number | null; imagenes: string[]; stock: number;
};

type ApiProducto = {
  id: string; nombre: string; descripcion: string | null; sku: string; slug: string | null;
  precio: string | number; precioAntes: string | number | null; marcaComercial: string | null;
  imagenes: string[]; stock: number; categoria: { nombre: string; slug: string | null } | null;
};

export const slugDe = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Las fotos pueden venir absolutas, subidas a la API (/uploads) o de la web de FPTecnologi (/images).
const imagen = (u: string) => (/^https?:\/\//.test(u) ? u : u.startsWith('/uploads') ? `${API_URL}${u}` : `${SITIO_ORIGEN}${u.startsWith('/') ? '' : '/'}${u}`);

function mapear(p: ApiProducto): ProductoTienda {
  const precio = Number(p.precio);
  const antes = p.precioAntes === null ? null : Number(p.precioAntes);
  const catSlug = p.categoria?.slug ?? (p.categoria ? slugDe(p.categoria.nombre) : 'otros');
  return {
    id: p.id, sku: p.sku, slug: p.slug || slugDe(p.sku), nombre: p.nombre, descripcion: p.descripcion ?? '', marca: p.marcaComercial ?? '',
    categoria: { slug: catSlug, nombre: p.categoria?.nombre ?? 'Otros' },
    precio, precioAntes: antes !== null && antes > precio ? antes : null,
    imagenes: p.imagenes.map(imagen), stock: p.stock,
  };
}

async function api<T>(ruta: string): Promise<T | null> {
  if (!MARCA) return null;
  try {
    const sep = ruta.includes('?') ? '&' : '?';
    const res = await fetch(`${API_URL}/public${ruta}${sep}marcaId=${encodeURIComponent(MARCA)}`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    return ((await res.json())?.data ?? null) as T | null;
  } catch {
    return null;
  }
}

/** Todo el catálogo activo (la API pagina de a 100); null si la tienda no está configurada o la API no responde. */
export const getProductosTienda = cache(async (): Promise<ProductoTienda[] | null> => {
  const primera = await api<{ data: ApiProducto[]; totalPages: number }>('/productos?limit=100&page=1');
  if (!primera) return null;
  const todos = [...primera.data];
  for (let page = 2; page <= Math.min(primera.totalPages, 20); page++) {
    const sig = await api<{ data: ApiProducto[] }>(`/productos?limit=100&page=${page}`);
    if (!sig) break;
    todos.push(...sig.data);
  }
  return todos.map(mapear);
});

export const getProductoTienda = cache(async (slug: string): Promise<ProductoTienda | null> => {
  const directo = await api<ApiProducto>(`/productos/slug/${encodeURIComponent(slug)}`);
  if (directo) return mapear(directo);
  return (await getProductosTienda())?.find((p) => p.slug === slug || slugDe(p.sku) === slug) ?? null;
});

export const usd = (n: number) => `US$ ${n.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
