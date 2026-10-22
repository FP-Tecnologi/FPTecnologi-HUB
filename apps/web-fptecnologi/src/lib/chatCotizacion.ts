/*
 * Cotización armada por el asistente virtual. La IA solo propone QUÉ cotizar (SKUs + cantidades, o un servicio) y los
 * datos de contacto que la persona ya dio; los precios, el IGV y el total los calcula este archivo con el catálogo
 * real. Nada se envía solo: el widget muestra la tarjeta y la persona pulsa «Enviar solicitud», que usa los mismos
 * endpoints que los formularios de la web (/api/presupuestos o /api/hub/cotizaciones).
 */
import type { CatalogProduct } from './catalog';
import { productHref } from './catalog';

export const MIN_MAYORISTA = 6;
const TASA_IGV = 0.18;
const MAX_LINEAS = 15;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type ContactoCotizacion = { nombre: string; email: string; telefono?: string; empresa?: string; documento?: string };

export type LineaCotizacion = {
  sku: string;
  nombre: string;
  imagen: string;
  href: string;
  cantidad: number;
  precioLista: number;
  precioMayor: number | null;
  precioUnitario: number;
  mayorista: boolean;
  subtotal: number;
};

export type CotizacionChat =
  | {
      tipo: 'productos';
      /** presupuesto: todas las líneas con ≥6 u. (presupuesto mayorista formal); carrito: compra normal. */
      destino: 'presupuesto' | 'carrito';
      lineas: LineaCotizacion[];
      subtotal: number;
      igv: number;
      total: number;
      contacto: ContactoCotizacion | null;
    }
  | { tipo: 'servicio'; servicio: { slug: string; title: string }; detalle: string; contacto: ContactoCotizacion | null };

/** Tarjeta de producto que el chat muestra (foto, título, precio y stock reales del catálogo). */
export type ProductoChat = { sku: string; nombre: string; marca: string; imagen: string; href: string; precio: number; precioAntes: number | null; stock: 'si' | 'no' | 'consultar' };

export function productoChat(p: CatalogProduct): ProductoChat {
  return {
    sku: p.sku,
    nombre: p.name,
    marca: p.brand,
    imagen: p.images[0] ?? '',
    href: productHref(p.sku, p.slug),
    precio: p.price,
    precioAntes: p.priceBefore ?? null,
    // Sin dato de la API (catálogo local de respaldo) no se afirma nada.
    stock: p.stock === undefined ? 'consultar' : p.stock > 0 ? 'si' : 'no',
  };
}

/** Tarjeta de servicio en el chat (datos del servicio cargado en el dashboard). */
export type ServicioChat = { slug: string; titulo: string; etiqueta: string; descripcion: string; imagen: string; precioDesde: number | null; href: string };

export function servicioChat(s: { slug: string; title: string; tag: string; description: string; image: string; precioDesde: number | null }): ServicioChat {
  const d = s.description.trim();
  return { slug: s.slug, titulo: s.title, etiqueta: s.tag, descripcion: d.length > 150 ? `${d.slice(0, 147)}…` : d, imagen: s.image, precioDesde: s.precioDesde, href: `/servicios/${s.slug}` };
}

/** Bloque de datos (horario, dirección, plazos…) que el modelo arma con la información de la web. */
export type DatosChat = { titulo: string; filas: { etiqueta: string; valor: string }[] };

export function datosDe(raw: unknown): DatosChat | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as { titulo?: unknown; filas?: unknown };
  const limpio = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/[<>]/g, '').replace(/https?:\/\/\S+/g, '').trim().slice(0, max) : '');
  const filas = (Array.isArray(r.filas) ? r.filas : [])
    .map((f) => ({ etiqueta: limpio(f?.etiqueta, 40), valor: limpio(f?.valor, 160) }))
    .filter((f) => f.etiqueta && f.valor)
    .slice(0, 6);
  return filas.length ? { titulo: limpio(r.titulo, 60) || 'Datos', filas } : null;
}

const redondear = (n: number) => Math.round(n * 100) / 100;
const texto = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/[<>]/g, '').trim().slice(0, max) : '');

/** Contacto válido o null: nombre ≥2 y correo con formato; lo demás opcional. */
export function contactoDe(raw: unknown): ContactoCotizacion | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const nombre = texto(r.nombre, 120);
  const email = texto(r.email, 120);
  if (nombre.length < 2 || !EMAIL.test(email)) return null;
  const telefono = texto(r.telefono, 20).replace(/[^\d+ ]/g, '');
  const documento = texto(r.documento, 11).replace(/\D/g, '');
  return {
    nombre,
    email,
    ...(telefono ? { telefono } : {}),
    ...(texto(r.empresa, 120) ? { empresa: texto(r.empresa, 120) } : {}),
    ...(/^\d{8}$|^\d{11}$/.test(documento) ? { documento } : {}),
  };
}

/** Valida la propuesta de la IA contra el catálogo y los servicios reales; null si no hay nada válido. */
export function armarCotizacion(
  raw: unknown,
  contactoRaw: unknown,
  productos: readonly CatalogProduct[],
  servicios: readonly { slug: string; title: string }[],
): CotizacionChat | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const contacto = contactoDe(contactoRaw);

  if (r.tipo === 'servicio') {
    const s = servicios.find((x) => x.slug === r.servicio);
    if (!s) return null;
    return { tipo: 'servicio', servicio: { slug: s.slug, title: s.title }, detalle: texto(r.detalle, 900), contacto };
  }

  if (r.tipo !== 'productos' || !Array.isArray(r.items)) return null;
  const porSku = new Map<string, number>();
  for (const it of r.items.slice(0, MAX_LINEAS)) {
    const sku = typeof it?.sku === 'string' ? it.sku : '';
    const cantidad = Math.floor(Number(it?.cantidad));
    if (!sku || !Number.isFinite(cantidad) || cantidad < 1 || cantidad > 10_000) continue;
    porSku.set(sku, (porSku.get(sku) ?? 0) + cantidad);
  }
  const lineas: LineaCotizacion[] = [];
  for (const [sku, cantidad] of porSku) {
    const p = productos.find((x) => x.sku === sku);
    if (!p) continue;
    const mayorista = cantidad >= MIN_MAYORISTA && p.priceMayor != null;
    const precioUnitario = mayorista ? p.priceMayor! : p.price;
    lineas.push({
      sku: p.sku,
      nombre: p.name,
      imagen: p.images[0] ?? '',
      href: productHref(p.sku, p.slug),
      cantidad,
      precioLista: p.price,
      precioMayor: p.priceMayor ?? null,
      precioUnitario,
      mayorista,
      subtotal: redondear(precioUnitario * cantidad),
    });
  }
  if (lineas.length === 0) return null;
  const subtotal = redondear(lineas.reduce((a, l) => a + l.subtotal, 0));
  const igv = redondear(subtotal * TASA_IGV);
  return {
    tipo: 'productos',
    destino: lineas.every((l) => l.cantidad >= MIN_MAYORISTA) ? 'presupuesto' : 'carrito',
    lineas,
    subtotal,
    igv,
    total: redondear(subtotal + igv),
    contacto,
  };
}
