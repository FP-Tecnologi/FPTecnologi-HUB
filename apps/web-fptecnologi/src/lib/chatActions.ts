import { CONTACT_INFO, COTIZADOR_URL, PARTNER_BRANDS, SOLUTIONS, TIENDA_CATEGORIES, WHATSAPP_AREAS, brandSlug } from './content';
import { productHref } from './catalog';

/*
 * Botones/enlaces que el asistente virtual puede adjuntar a una respuesta.
 * La IA solo elige IDs de esta lista (nunca escribe URLs): el servidor los
 * resuelve acá, así no puede inventar ni inyectar links.
 */
export type ChatActionKind = 'whatsapp' | 'maps' | 'email' | 'phone' | 'page';
export type ChatAction = { kind: ChatActionKind; label: string; href: string };

const WHATSAPP_NUMBER = WHATSAPP_AREAS[0].number;

export function whatsappHref(text = 'Hola, quiero hablar con un asesor de FPTecnologi') {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

const FIXED: Record<string, ChatAction> = {
  whatsapp: { kind: 'whatsapp', label: 'Hablar por WhatsApp', href: whatsappHref() },
  maps: {
    kind: 'maps',
    label: 'Ver ubicación en Maps',
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_INFO.address)}`,
  },
  email: { kind: 'email', label: CONTACT_INFO.email, href: `mailto:${CONTACT_INFO.email}` },
  telefono: { kind: 'phone', label: `Llamar ${CONTACT_INFO.phoneVentas}`, href: `tel:${CONTACT_INFO.phoneVentas.replace(/\s/g, '')}` },
  cotizar: { kind: 'page', label: 'Ir al cotizador', href: COTIZADOR_URL },
  servicios: { kind: 'page', label: 'Ver servicios', href: '/servicios' },
  tienda: { kind: 'page', label: 'Ver tienda', href: '/tienda' },
  contacto: { kind: 'page', label: 'Contacto', href: '/contacto' },
  nosotros: { kind: 'page', label: 'Nosotros', href: '/nosotros' },
  proyectos: { kind: 'page', label: 'Proyectos', href: '/proyectos' },
  blog: { kind: 'page', label: 'Blog', href: '/blog' },
  marcas: { kind: 'page', label: 'Marcas', href: '/marcas' },
  devoluciones: { kind: 'page', label: 'Cambios y devoluciones', href: '/legal/devoluciones' },
  reclamaciones: { kind: 'page', label: 'Libro de reclamaciones', href: '/libro-de-reclamaciones' },
};

/** Productos reales de la tienda (sku -> nombre/slug) para el id `producto:<sku>`; los pasa el servidor. */
export type ProductoEnlace = { sku: string; name: string; slug?: string };

export function resolveAction(id: string, productos: readonly ProductoEnlace[] = []): ChatAction | null {
  if (FIXED[id]) return FIXED[id];
  const sep = id.indexOf(':');
  const prefix = sep === -1 ? id : id.slice(0, sep);
  const slug = sep === -1 ? '' : id.slice(sep + 1);
  if (prefix === 'servicio') {
    const s = SOLUTIONS.find((x) => x.slug === slug);
    if (s) return { kind: 'page', label: s.title, href: `/servicios/${s.slug}` };
  }
  if (prefix === 'tienda') {
    const c = TIENDA_CATEGORIES.find((x) => x.slug === slug);
    if (c) return { kind: 'page', label: c.title, href: `/tienda/${c.slug}` };
  }
  if (prefix === 'marca') {
    const b = PARTNER_BRANDS.find((x) => brandSlug(x.name) === slug);
    if (b) return { kind: 'page', label: b.name, href: `/marcas/${brandSlug(b.name)}` };
  }
  if (prefix === 'producto') {
    const p = productos.find((x) => x.sku === slug);
    if (p) return { kind: 'page', label: p.name.slice(0, 40), href: productHref(p.sku, p.slug) };
  }
  return null;
}

/** Lista de IDs válidos, para el prompt de la IA. */
export const ACTION_IDS_HELP = [
  'whatsapp (hablar con un asesor)',
  'maps (ubicación de la oficina)',
  'email (correo de ventas)',
  'telefono (llamar a ventas)',
  'cotizar (cotizador)',
  'servicios, tienda, contacto, nosotros, proyectos, blog, marcas (páginas)',
  'devoluciones (cambios y devoluciones), reclamaciones (libro de reclamaciones)',
  'producto:<SKU exacto del producto> (ficha de un producto de la lista)',
  'marca:<nombre en minúsculas> (ej. marca:dell)',
  ...SOLUTIONS.map((s) => `servicio:${s.slug} (${s.title})`),
  ...TIENDA_CATEGORIES.map((c) => `tienda:${c.slug} (${c.title})`),
].join('\n');
