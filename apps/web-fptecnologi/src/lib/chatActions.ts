import { CONTACT_INFO, COTIZADOR_URL, PARTNER_BRANDS, SOLUTIONS, TIENDA_CATEGORIES, WHATSAPP_AREAS, brandSlug } from './content';
import { productHref } from './catalog';

/*
 * Botones/enlaces que el asistente virtual puede adjuntar a una respuesta.
 * La IA solo elige IDs de esta lista (nunca escribe URLs): el servidor los
 * resuelve acá, así no puede inventar ni inyectar links.
 */
export type ChatActionKind = 'whatsapp' | 'maps' | 'email' | 'phone' | 'page';
export type ChatAction = { kind: ChatActionKind; label: string; href: string; /** Descripción corta (tarjeta de página en el chat). */ desc?: string };

// Datos de contacto vigentes (los fija lib/sitio.ts al leer los ajustes del dashboard; por defecto, content.ts).
// ponytail: estado de módulo, válido porque cada despliegue atiende una sola marca.
let WHATSAPP_NUMBER: string = WHATSAPP_AREAS[0].number;
let CONTACTO: { address: string; email: string; phoneVentas: string } = CONTACT_INFO;

export function fijarSitio(s: { whatsapp: string; contact: typeof CONTACTO }) {
  WHATSAPP_NUMBER = s.whatsapp;
  CONTACTO = s.contact;
}

export function whatsappHref(text = 'Hola, quiero hablar con un asesor de FPTecnologi') {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

const fijas = (): Record<string, ChatAction> => ({
  whatsapp: { kind: 'whatsapp', label: 'Hablar por WhatsApp', href: whatsappHref() },
  maps: {
    kind: 'maps',
    label: 'Ver ubicación en Maps',
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACTO.address)}`,
  },
  email: { kind: 'email', label: CONTACTO.email, href: `mailto:${CONTACTO.email}` },
  telefono: { kind: 'phone', label: `Llamar ${CONTACTO.phoneVentas}`, href: `tel:${CONTACTO.phoneVentas.replace(/\s/g, '')}` },
  cotizar: { kind: 'page', label: 'Ir al cotizador', href: COTIZADOR_URL, desc: 'Pide tu cotización en 3 pasos' },
  servicios: { kind: 'page', label: 'Ver servicios', href: '/servicios', desc: 'Soluciones TI a medida para tu empresa' },
  tienda: { kind: 'page', label: 'Ver tienda', href: '/tienda', desc: 'Equipos con stock local y precios B2B' },
  contacto: { kind: 'page', label: 'Contacto', href: '/contacto', desc: 'Teléfonos, correo y oficina' },
  nosotros: { kind: 'page', label: 'Nosotros', href: '/nosotros', desc: 'Quiénes somos y cómo trabajamos' },
  proyectos: { kind: 'page', label: 'Proyectos', href: '/proyectos', desc: 'Casos y proyectos realizados' },
  blog: { kind: 'page', label: 'Blog', href: '/blog', desc: 'Novedades y guías de tecnología' },
  marcas: { kind: 'page', label: 'Marcas', href: '/marcas', desc: 'Marcas que distribuimos' },
  devoluciones: { kind: 'page', label: 'Cambios y devoluciones', href: '/legal/devoluciones', desc: 'Condiciones de cambios y devoluciones' },
  reclamaciones: { kind: 'page', label: 'Libro de reclamaciones', href: '/libro-de-reclamaciones', desc: 'Registra o consulta un reclamo' },
  alquiler: { kind: 'page', label: 'Alquiler de equipos', href: '/alquiler-equipos', desc: 'Laptops, PCs y más, entrega en 24 h' },
  educacion: { kind: 'page', label: 'FP Education', href: '/educacion', desc: 'Tecnología para el aula' },
  compliance: { kind: 'page', label: 'Compliance', href: '/compliance', desc: 'Ética y cumplimiento' },
  catalogos: { kind: 'page', label: 'Catálogos PDF', href: '/catalogos', desc: 'Catálogos en PDF para hojear' },
  tickets: { kind: 'page', label: 'Abrir un ticket', href: '/tickets', desc: 'Soporte de productos comprados' },
  seguimiento: { kind: 'page', label: 'Seguimiento de ticket', href: '/tickets/seguimiento', desc: 'Revisa el estado de tu ticket' },
  presupuesto: { kind: 'page', label: 'Presupuesto mayorista', href: '/presupuesto', desc: 'Compra mayorista desde 6 unidades' },
  cuenta: { kind: 'page', label: 'Mi cuenta', href: '/cuenta', desc: 'Tus pedidos y cotizaciones' },
  socios: { kind: 'page', label: 'Registro de socios', href: '/socios/registro', desc: 'Programa de partners' },
  carrito: { kind: 'page', label: 'Ver carrito', href: '/carrito', desc: 'Revisa tu compra' },
});

/** Productos reales de la tienda (sku -> nombre/slug) para el id `producto:<sku>`; los pasa el servidor. */
export type ProductoEnlace = { sku: string; name: string; slug?: string };

export type ServicioEnlace = { slug: string; title: string };

export function resolveAction(
  id: string,
  productos: readonly ProductoEnlace[] = [],
  servicios: readonly ServicioEnlace[] = SOLUTIONS,
): ChatAction | null {
  const fija = fijas()[id];
  if (fija) return fija;
  const sep = id.indexOf(':');
  const prefix = sep === -1 ? id : id.slice(0, sep);
  const slug = sep === -1 ? '' : id.slice(sep + 1);
  if (prefix === 'servicio') {
    const s = servicios.find((x) => x.slug === slug);
    if (s) return { kind: 'page', label: s.title, href: `/servicios/${s.slug}` };
  }
  if (prefix === 'tienda') {
    const c = TIENDA_CATEGORIES.find((x) => x.slug === slug);
    if (c) return { kind: 'page', label: c.title, href: `/tienda/${c.slug}`, desc: 'Categoría de la tienda' };
  }
  if (prefix === 'marca') {
    const b = PARTNER_BRANDS.find((x) => brandSlug(x.name) === slug);
    if (b) return { kind: 'page', label: b.name, href: `/marcas/${brandSlug(b.name)}`, desc: 'Productos de la marca' };
  }
  if (prefix === 'producto') {
    const p = productos.find((x) => x.sku === slug);
    if (p) return { kind: 'page', label: p.name.slice(0, 40), href: productHref(p.sku, p.slug) };
  }
  return null;
}

/** Lista de IDs válidos, para el prompt de la IA. */
export const actionIdsHelp = (servicios: readonly ServicioEnlace[] = SOLUTIONS) => [
  'whatsapp (hablar con un asesor)',
  'maps (ubicación de la oficina)',
  'email (correo de ventas)',
  'telefono (llamar a ventas)',
  'cotizar (cotizador)',
  'servicios, tienda, contacto, nosotros, proyectos, blog, marcas (páginas)',
  'devoluciones (cambios y devoluciones), reclamaciones (libro de reclamaciones)',
  'alquiler (alquiler de equipos), educacion (FP Education), compliance, catalogos (catálogos PDF)',
  'tickets (abrir ticket de soporte), seguimiento (seguimiento de ticket), cuenta (mi cuenta: pedidos y cotizaciones)',
  'presupuesto (presupuesto mayorista), carrito, socios (registro de socios/partners)',
  'producto:<SKU exacto del producto> (ficha de un producto de la lista)',
  'marca:<nombre en minúsculas> (ej. marca:dell)',
  ...servicios.map((s) => `servicio:${s.slug} (${s.title})`),
  ...TIENDA_CATEGORIES.map((c) => `tienda:${c.slug} (${c.title})`),
].join('\n');
