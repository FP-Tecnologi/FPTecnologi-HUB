/*
 * Catálogo de la tienda desde la API central (GET /public/productos y
 * /public/productos/slug/:slug), solo para componentes de servidor. Si la API
 * no está configurada (falta HUB_MARCA_ID) o no responde, se usa el catálogo
 * local de `catalog.ts` para que la tienda no quede vacía. Precios en USD sin
 * IGV. El catálogo se cachea 60 s (ISR) para no pegarle a la API en cada visita.
 */
import { CATALOG, productSlug, type CatalogProduct } from './catalog';
import { TIENDA_CATEGORIES } from './content';

const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';
const REVALIDATE = 60;

export type Categoria = { slug: string; title: string; image: string; imageFit: 'cover' | 'contain' };

type ApiProducto = {
  id: string;
  nombre: string;
  descripcion: string | null;
  sku: string;
  slug: string | null;
  precio: string | number;
  precioAntes: string | number | null;
  marcaComercial: string | null;
  imagenes: string[];
  stock: number;
  categoria: { nombre: string; slug: string | null } | null;
};

const IMAGEN_VACIA = '/images/producto-sin-foto.svg';

function mapear(p: ApiProducto): CatalogProduct {
  const antes = p.precioAntes === null ? null : Number(p.precioAntes);
  return {
    id: p.id,
    sku: p.sku,
    slug: p.slug ?? undefined,
    name: p.nombre,
    brand: p.marcaComercial ?? 'FPTecnologi',
    category: p.categoria?.slug ?? 'otros',
    price: Number(p.precio),
    priceBefore: antes !== null && antes > Number(p.precio) ? antes : null,
    images: p.imagenes.length > 0 ? p.imagenes : [IMAGEN_VACIA],
    stock: p.stock,
    description: p.descripcion,
  };
}

async function api<T>(path: string): Promise<T | null> {
  if (!MARCA_ID) return null;
  try {
    const sep = path.includes('?') ? '&' : '?';
    const res = await fetch(`${API_URL}/public${path}${sep}marcaId=${encodeURIComponent(MARCA_ID)}`, { next: { revalidate: REVALIDATE } });
    if (!res.ok) return null;
    return ((await res.json())?.data ?? null) as T | null;
  } catch {
    return null;
  }
}

/** Todo el catálogo activo (la API pagina de a 100). `fuente: 'local'` = respaldo sin API. */
export async function getCatalogo(): Promise<{ products: CatalogProduct[]; fuente: 'api' | 'local' }> {
  const primera = await api<{ data: ApiProducto[]; totalPages: number }>('/productos?limit=100&page=1');
  if (!primera) return { products: CATALOG, fuente: 'local' };
  const todos = [...primera.data];
  for (let page = 2; page <= Math.min(primera.totalPages, 20); page++) {
    const sig = await api<{ data: ApiProducto[] }>(`/productos?limit=100&page=${page}`);
    if (!sig) break;
    todos.push(...sig.data);
  }
  return { products: todos.map(mapear), fuente: 'api' };
}

/** Un producto por su URL: slug de la API o, para enlaces viejos, el slug del SKU. */
export async function getProducto(slug: string): Promise<CatalogProduct | null> {
  const directo = await api<ApiProducto>(`/productos/slug/${encodeURIComponent(slug)}`);
  if (directo) return mapear(directo);
  const { products } = await getCatalogo();
  return products.find((p) => p.slug === slug || productSlug(p.sku) === slug) ?? null;
}

/** Categorías con producto en el catálogo (con la foto de TIENDA_CATEGORIES si hay), en el orden de la tienda. */
export function categoriasDe(products: CatalogProduct[]): Categoria[] {
  const conocidas = new Map<string, (typeof TIENDA_CATEGORIES)[number]>(TIENDA_CATEGORIES.map((c) => [c.slug, c]));
  const slugs = [...new Set(products.map((p) => p.category))];
  const orden = TIENDA_CATEGORIES.map((c) => c.slug as string);
  slugs.sort((a, b) => (orden.indexOf(a) === -1 ? 99 : orden.indexOf(a)) - (orden.indexOf(b) === -1 ? 99 : orden.indexOf(b)));
  return slugs.map((slug) => {
    const c = conocidas.get(slug);
    return {
      slug,
      title: c?.title ?? slug.replace(/-/g, ' ').replace(/^./, (m) => m.toUpperCase()),
      image: c?.image ?? '/images/modelo9/hero-office.jpg',
      imageFit: c?.imageFit ?? 'cover',
    };
  });
}
