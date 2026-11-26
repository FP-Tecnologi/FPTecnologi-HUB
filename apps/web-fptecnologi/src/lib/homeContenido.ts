/*
 * Contenido editable de la home (CMS del dashboard: Web informativa → Home
 * page). HOME_DEFAULTS son los textos actuales del sitio; lo que se guarde
 * desde el dashboard (API central, /public/contenido/home) los reemplaza
 * sección por sección. Si la API no responde, la home sale con los defaults.
 *
 * Cada sección tiene `visible` (mostrar/ocultar en la home). Encabezado =
 * badge + título en dos tonos (titulo sólido + destacado con brillo) +
 * descripción y botón opcionales.
 */
import { COMPANY_VALUES, HERO_SLIDES, PARTNER_BRANDS, PARTNER_STEPS, TIENDA_CATEGORIES, WHY_CHOOSE_US } from './content';

export type Encabezado = {
  visible: boolean;
  badge: string;
  titulo: string;
  destacado: string;
  descripcion: string;
  botonTexto: string;
  botonUrl: string;
};
/** Textos del formulario de contacto de la home (editables desde el dashboard). */
export type FormularioContacto = {
  formTitulo: string;
  formSubtitulo: string;
  etiquetaNombre: string;
  etiquetaCorreo: string;
  etiquetaTelefono: string;
  etiquetaMensaje: string;
  placeholderMensaje: string;
  botonEnviar: string;
  mensajeExito: string;
  mostrarTelefono: boolean;
};
export type HeroSlide = { eyebrow: string; titleLead: string; titleAccent: string; text: string };
export type ItemTexto = { title: string; text: string };
/** Tarjeta de categoría de la home. `image` vacío = foto por defecto de la categoría. */
/** Logo del carrusel de marcas. `solido` = 'si' si el logo trae caja o fondo de color (se muestra a color siempre). */
export type MarcaHome = { name: string; logo: string; solido: string };
export type CategoriaHome = { title: string; slug: string; image: string };
/** Video de YouTube elegido desde el dashboard (url + título opcional). */
export type VideoHome = { url: string; titulo: string };

export type HomeContenido = {
  hero: { visible: boolean; slides: HeroSlide[] };
  marcas: { visible: boolean; items: MarcaHome[] };
  nosotros: Encabezado & { puntos: string[] };
  servicios: Encabezado;
  porque: Encabezado & { items: ItemTexto[] };
  categorias: Encabezado & { items: CategoriaHome[] };
  productos: Encabezado;
  proyectos: Encabezado;
  clientes: Encabezado;
  partners: Encabezado & { pasos: ItemTexto[] };
  videos: Encabezado & { items: VideoHome[] };
  contacto: Encabezado & FormularioContacto;
};

const enc = (e: Partial<Encabezado>): Encabezado => ({
  visible: true,
  badge: '',
  titulo: '',
  destacado: '',
  descripcion: '',
  botonTexto: '',
  botonUrl: '',
  ...e,
});

export const HOME_DEFAULTS: HomeContenido = {
  hero: {
    visible: true,
    slides: HERO_SLIDES.filter((s) => s.key === 'servicios' || s.key === 'tienda').map((s) => ({
      eyebrow: s.eyebrow,
      titleLead: s.titleLead,
      titleAccent: s.titleAccent,
      text: s.text,
    })),
  },
  marcas: { visible: true, items: PARTNER_BRANDS.map((b) => ({ name: b.name, logo: b.logo, solido: b.solido ? 'si' : '' })) },
  nosotros: {
    ...enc({
      badge: 'FPTecnologi & System',
      titulo: 'Tecnología empresarial con',
      destacado: 'respaldo real y soporte local',
      descripcion:
        'Más de una década ayudando a empresas a equiparse con la tecnología correcta: distribución autorizada de las principales marcas, stock local listo para despachar y un equipo técnico que arma cada propuesta a medida de tu operación.',
      botonTexto: 'Más información',
      botonUrl: '/nosotros',
    }),
    puntos: COMPANY_VALUES.map((v) => v.title),
  },
  servicios: enc({
    badge: 'Nuestros servicios',
    titulo: 'Servicios TI a medida',
    destacado: 'para cada sector',
    botonTexto: 'Ver servicios',
    botonUrl: '/servicios',
  }),
  porque: {
    ...enc({ badge: 'Por qué elegirnos', titulo: 'Lo que nos hace', destacado: 'distintos' }),
    items: WHY_CHOOSE_US.map((i) => ({ title: i.title, text: i.text })),
  },
  categorias: {
    ...enc({
      badge: 'Nuestra tienda',
      titulo: 'Categorías del',
      destacado: 'catálogo',
      descripcion: 'Monitores, laptops, pantallas y servidores de las principales marcas, con stock local listo para despachar.',
      botonTexto: 'Ver tienda',
      botonUrl: '/tienda',
    }),
    items: TIENDA_CATEGORIES.map((c) => ({ title: c.title, slug: c.slug, image: '' })),
  },
  productos: enc({ badge: 'Tienda B2B', titulo: 'Los más', destacado: 'vendidos', botonTexto: 'Ver tienda', botonUrl: '/tienda' }),
  proyectos: enc({
    badge: 'Nuestro trabajo',
    titulo: 'Nuestros',
    destacado: 'proyectos',
    descripcion: 'Selecciona una región en el mapa para ver los proyectos.',
  }),
  clientes: enc({
    badge: 'Confían en nosotros',
    titulo: 'Nuestros',
    destacado: 'clientes',
    descripcion: 'Organizaciones que confían en nosotros en 3 sectores clave.',
  }),
  partners: {
    ...enc({
      badge: 'Programa de Partners',
      titulo: 'Súmate como',
      destacado: 'Partner FP',
      descripcion: 'Precios y beneficios especiales para partners, con soporte comercial dedicado y cotización directa.',
      botonTexto: 'Ser partner',
    }),
    pasos: PARTNER_STEPS.map((p) => ({ title: p.title, text: p.text })),
  },
  // Videos generales (demostraciones de equipos, soluciones). Al final, tras el contacto.
  videos: {
    ...enc({
      badge: 'Nuestros videos',
      titulo: 'Mira lo que',
      destacado: 'hacemos',
      descripcion: 'Demostraciones de equipos, soluciones y proyectos que implementamos. Mira más en nuestro canal o visítanos y te los mostramos en persona.',
      botonTexto: 'Ver más en nuestro canal',
    }),
    // Vacío = se muestran solos los últimos videos del canal.
    items: [],
  },
  contacto: {
    ...enc({
    badge: 'Hablemos',
    titulo: '¿Listo para modernizar',
    destacado: 'la tecnología de tu empresa?',
    descripcion:
      'Escríbenos y un asesor especializado te ayuda a armar la mejor solución para tu negocio, con stock local y tiempos de entrega reales.',
    }),
    formTitulo: 'Déjanos tu mensaje',
    formSubtitulo: 'Un asesor te responderá pronto.',
    etiquetaNombre: 'Nombres o empresa',
    etiquetaCorreo: 'Correo electrónico',
    etiquetaTelefono: 'Teléfono / WhatsApp',
    etiquetaMensaje: 'Mensaje',
    placeholderMensaje: 'Cuéntanos qué solución o equipamiento necesita tu empresa',
    botonEnviar: 'Enviar mensaje',
    mensajeExito: '¡Gracias! Tu mensaje ha sido enviado exitosamente. Un asesor te responderá pronto.',
    mostrarTelefono: true,
  },
};

const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

/** Defaults + lo guardado en el dashboard (se mezcla campo por campo, por sección). */
export async function getHomeContenido(fresco = false): Promise<HomeContenido> {
  if (!MARCA_ID) return HOME_DEFAULTS;
  try {
    // Con caché de 30 s la home deja de renderizarse en cada visita; el editor del dashboard pide `fresco`.
    const res = await fetch(`${API_URL}/public/contenido/home?marcaId=${MARCA_ID}`, fresco ? { cache: 'no-store' } : { next: { revalidate: 30 } });
    if (!res.ok) return HOME_DEFAULTS;
    const saved = ((await res.json())?.data ?? {}) as Record<string, Record<string, unknown>>;
    const out = { ...HOME_DEFAULTS } as Record<string, unknown>;
    for (const key of Object.keys(HOME_DEFAULTS)) {
      if (saved[key] && typeof saved[key] === 'object') {
        out[key] = { ...(HOME_DEFAULTS as unknown as Record<string, object>)[key], ...saved[key] };
      }
    }
    return out as HomeContenido;
  } catch {
    return HOME_DEFAULTS;
  }
}
