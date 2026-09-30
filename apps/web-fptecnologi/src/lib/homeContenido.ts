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
import { COMPANY_VALUES, HERO_SLIDES, PARTNER_STEPS, WHY_CHOOSE_US } from './content';

export type Encabezado = {
  visible: boolean;
  badge: string;
  titulo: string;
  destacado: string;
  descripcion: string;
  botonTexto: string;
  botonUrl: string;
};
export type HeroSlide = { eyebrow: string; titleLead: string; titleAccent: string; text: string };
export type ItemTexto = { title: string; text: string };

export type HomeContenido = {
  hero: { visible: boolean; slides: HeroSlide[] };
  marcas: { visible: boolean };
  nosotros: Encabezado & { puntos: string[] };
  servicios: Encabezado;
  porque: Encabezado & { items: ItemTexto[] };
  categorias: Encabezado;
  productos: Encabezado;
  proyectos: Encabezado;
  clientes: Encabezado;
  partners: Encabezado & { pasos: ItemTexto[] };
  contacto: Encabezado;
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
  marcas: { visible: true },
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
  categorias: enc({
    badge: 'Nuestra tienda',
    titulo: 'Categorías del',
    destacado: 'catálogo',
    descripcion: 'Monitores, laptops, pantallas y servidores de las principales marcas, con stock local listo para despachar.',
    botonTexto: 'Ver Tienda TI',
    botonUrl: '/tienda',
  }),
  productos: enc({ badge: 'Tienda B2B', titulo: 'Los más', destacado: 'vendidos', botonTexto: 'Ver Tienda B2B', botonUrl: '/tienda' }),
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
      titulo: 'Súmate como integrador',
      destacado: 'o revendedor',
      descripcion: 'Precios y beneficios especiales para partners, con soporte comercial dedicado y cotización directa.',
      botonTexto: 'Sumarme como partner',
    }),
    pasos: PARTNER_STEPS.map((p) => ({ title: p.title, text: p.text })),
  },
  contacto: enc({
    badge: 'Hablemos',
    titulo: '¿Listo para modernizar',
    destacado: 'la tecnología de tu empresa?',
    descripcion:
      'Escríbenos y un asesor especializado te ayuda a armar la mejor solución para tu negocio, con stock local y tiempos de entrega reales.',
  }),
};

const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

/** Defaults + lo guardado en el dashboard (se mezcla campo por campo, por sección). */
export async function getHomeContenido(): Promise<HomeContenido> {
  if (!MARCA_ID) return HOME_DEFAULTS;
  try {
    const res = await fetch(`${API_URL}/public/contenido/home?marcaId=${MARCA_ID}`, { cache: 'no-store' });
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
