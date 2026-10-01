/*
 * Proxy del checkout hacia la API central (POST /public/pedidos).
 * El navegador manda SKUs y cantidades; acá se traducen a los id reales del
 * catálogo (así el cliente nunca decide precios ni ids) y se arma el pedido.
 * La API recalcula todo (precios, IGV, stock) en el servidor. Mismo patrón que
 * los demás proxies: sin CORS, el marcaId lo pone el servidor y la IP real del
 * visitante viaja en x-forwarded-for para el tope anti-spam.
 */
import { getCatalogo } from '@/lib/catalogo';

const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

type Entrada = {
  nombre?: string;
  email?: string;
  celular?: string;
  documento?: string;
  comprobante?: 'BOLETA' | 'FACTURA';
  razonSocial?: string;
  entrega?: 'RECOJO' | 'ENVIO';
  direccion?: string;
  distrito?: string;
  metodoPago?: string;
  notas?: string;
  website?: string;
  items?: { sku?: string; cantidad?: number }[];
};

const error = (message: string, status: number) => Response.json({ message }, { status });

export async function POST(req: Request) {
  if (!MARCA_ID) return error('La tienda no está configurada todavía.', 503);
  const raw = await req.text();
  if (raw.length > 20_000) return error('Solicitud demasiado grande.', 413);
  let b: Entrada;
  try {
    b = JSON.parse(raw);
  } catch {
    return error('Solicitud inválida.', 400);
  }
  if (!Array.isArray(b.items) || b.items.length === 0) return error('Tu carrito está vacío.', 400);

  // SKU → id del catálogo real. Con el catálogo local de respaldo no hay ids: no se puede vender.
  const { products, fuente } = await getCatalogo();
  if (fuente !== 'api') return error('La tienda no está disponible en este momento. Intenta más tarde.', 503);
  const porSku = new Map(products.map((p) => [p.sku, p]));
  const items: { productoId: string; cantidad: number }[] = [];
  for (const it of b.items) {
    const p = porSku.get(String(it.sku ?? ''));
    if (!p?.id) return error('Un producto de tu carrito ya no está disponible. Revisa tu carrito.', 409);
    items.push({ productoId: p.id, cantidad: Math.floor(Number(it.cantidad)) });
  }

  // El comprobante, la razón social y la entrega viajan en las notas del pedido.
  const notas = [
    `Comprobante: ${b.comprobante === 'FACTURA' ? 'Factura' : 'Boleta'}${b.razonSocial ? ` — ${b.razonSocial.trim()}` : ''}`,
    `Entrega: ${b.entrega === 'ENVIO' ? 'Envío a domicilio (costo a coordinar)' : 'Recojo en tienda'}`,
    b.notas?.trim() ? `Notas: ${b.notas.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n')
    .slice(0, 500);

  try {
    const res = await fetch(`${API_URL}/public/pedidos?marcaId=${encodeURIComponent(MARCA_ID)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '',
      },
      body: JSON.stringify({
        nombre: b.nombre,
        email: b.email,
        celular: b.celular,
        documento: b.documento || undefined,
        direccion: b.entrega === 'ENVIO' ? b.direccion || undefined : undefined,
        distrito: b.entrega === 'ENVIO' ? b.distrito || undefined : undefined,
        metodoPago: b.metodoPago,
        notas,
        items,
        website: b.website,
      }),
      cache: 'no-store',
    });
    return new Response(await res.text(), { status: res.status, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return error('No pudimos conectarnos. Intenta de nuevo.', 502);
  }
}
