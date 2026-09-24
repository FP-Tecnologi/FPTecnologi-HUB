import { CONTACT_INFO, COTIZADOR_URL, SOLUTIONS, TIENDA_CATEGORIES, WHATSAPP_AREAS } from './content';

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
};

export function resolveAction(id: string): ChatAction | null {
  if (FIXED[id]) return FIXED[id];
  const [prefix, slug] = id.split(':');
  if (prefix === 'servicio') {
    const s = SOLUTIONS.find((x) => x.slug === slug);
    if (s) return { kind: 'page', label: s.title, href: `/servicios/${s.slug}` };
  }
  if (prefix === 'tienda') {
    const c = TIENDA_CATEGORIES.find((x) => x.slug === slug);
    if (c) return { kind: 'page', label: c.title, href: `/tienda/${c.slug}` };
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
  'servicios, tienda, contacto, nosotros (páginas)',
  ...SOLUTIONS.map((s) => `servicio:${s.slug} (${s.title})`),
  ...TIENDA_CATEGORIES.map((c) => `tienda:${c.slug} (${c.title})`),
].join('\n');
