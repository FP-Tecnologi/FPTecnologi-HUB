/*
 * Contenido editable de la web de Imaninki (Administrador → Web Imaninki). CMS_DEFAULTS son los textos que la web tenía
 * fijos; lo que se guarde en el dashboard (API central, /public/contenido/:pagina, por sección) los reemplaza campo
 * por campo. Sin HUB_MARCA_ID o si la API no responde, la web sale con los defaults. Mismo modelo que Fimav.
 *
 * No se editan desde aquí: las líneas de producto, ni las fotos. El teléfono, WhatsApp, correo y redes sí: página «ajustes».
 */
import { cache } from 'react';
import { LEGAL_DEFAULTS } from './legal';
import { contacto, mision, preguntas, propuesta, valoresDetalle, vision } from './contenido';

export const CMS_DEFAULTS = {
  inicio: {
    hero: {
      etiqueta: 'Industria · Construcción · Corporativo',
      titulo: 'Soluciones en',
      acento: 'construcción e industria',
      texto: 'Soluciones confiables y de alto valor para tus proyectos: pinturas, mobiliario corporativo y productos para construcción y emergencia, con cobertura a nivel nacional.',
    },
    quienes: {
      etiqueta: 'Quiénes somos',
      titulo: 'Más que productos,',
      acento: 'soluciones que generan impacto',
      texto: 'Desarrollamos y ofrecemos soluciones confiables, eficientes y de alto valor para los sectores industrial y construcción, con productos que integran calidad, rendimiento, durabilidad y precios competitivos.',
      texto2: 'Creemos en el trabajo bien hecho y en relaciones comerciales basadas en la confianza, la responsabilidad, la transparencia y un servicio oportuno.',
      mision: 'Brindar soluciones confiables y de alta calidad que impulsen proyectos en diversos sectores, con cobertura nacional y un servicio cercano.',
      vision: 'Ser una marca reconocida por su excelencia, cercanía y compromiso, aliada de nuestros clientes en cada etapa de sus proyectos.',
    },
    porque: {
      etiqueta: '¿Por qué Imaninki?',
      titulo: 'Construimos',
      acento: 'relaciones que duran',
      texto: 'Buen servicio es acompañarte de cerca, entender los desafíos de tu proyecto y proponer alternativas eficientes, oportunas y alineadas a tus objetivos.',
    },
    canales: {
      etiqueta: 'Sector público y privado',
      titulo: 'Venta directa y',
      acento: 'licitaciones',
      texto: 'Atendemos ventas directas y licitaciones públicas y privadas. Encuentra todas nuestras fichas en Perú Compras.',
      boton: 'Consultar disponibilidad',
    },
  },
  nosotros: {
    banner: {
      titulo: 'Un aliado estratégico',
      acento: 'en cada etapa',
      texto: 'Más que proveer productos, acompañamos cada etapa de tu proyecto con atención personalizada y asesoría.',
    },
    mision: { mision, vision },
    valores: {
      etiqueta: 'Lo que nos define',
      titulo: 'Nuestros',
      acento: 'valores',
      items: valoresDetalle.map((v) => ({ nombre: v.nombre, texto: v.texto })),
    },
    listos: {
      texto: propuesta[0],
      texto2: propuesta[1],
      texto3: propuesta[2],
    },
  },
  // Los textos legales son un borrador: no se muestran en la web hasta que se active «publicado» (Web Imaninki → Textos legales).
  ajustes: {
    contacto: { telefono: contacto.telefono, whatsapp: contacto.whatsapp.replace(/^51/, ''), correo: contacto.correo },
    redes: { texto: contacto.redes },
  },
  legal: {
    estado: { publicado: false },
    privacidad: LEGAL_DEFAULTS.privacidad,
    terminos: LEGAL_DEFAULTS.terminos,
    devoluciones: LEGAL_DEFAULTS.devoluciones,
  },
  catalogos: {
    banner: {
      titulo: 'Nuestros',
      acento: 'catálogos',
      texto: 'Descarga en PDF nuestras líneas y productos.',
    },
    // archivo: PDF subido desde el dashboard (/uploads/...).
    lista: { items: [] as { titulo: string; archivo: string }[] },
  },
  contacto: {
    banner: {
      titulo: 'Contáctanos para',
      acento: 'cualquier duda',
      texto: 'Elige el canal que prefieras: te atendemos de inmediato y te ayudamos a encontrar la solución precisa para tu proyecto.',
    },
    preguntas: {
      etiqueta: 'Preguntas frecuentes',
      titulo: 'Razones para',
      acento: 'confiar en Imaninki',
      items: preguntas.map((q) => ({ p: q.p, r: q.r })),
    },
  },
};

export type CmsContenido = typeof CMS_DEFAULTS;
export type PaginaCms = keyof CmsContenido;
export const PAGINAS_CMS = Object.keys(CMS_DEFAULTS) as PaginaCms[];

/** Ruta pública de un PDF guardado: los subidos al dashboard (/uploads/...) pasan por el proxy de la web (sin CORS). */
export const urlArchivo = (a: string) => (a.startsWith('/uploads/') ? `/api/archivos${a.slice('/uploads'.length)}` : a);

const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const esObjeto = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

/** Mezcla una sección guardada sobre su default: solo campos conocidos y del mismo tipo (texto con texto, lista con lista). */
function mezclar<T extends Record<string, unknown>>(base: T, guardado: unknown): T {
  if (!esObjeto(guardado)) return base;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(base)) {
    const g = guardado[k];
    if (typeof v === 'string' && typeof g === 'string') out[k] = g;
    else if (Array.isArray(v) && Array.isArray(g)) out[k] = g;
    else if (typeof v === 'boolean' && typeof g === 'boolean') out[k] = g;
  }
  return out as T;
}

/** Defaults + lo guardado en el dashboard para una página (cada sección por separado). */
export const getPagina = cache(async <K extends PaginaCms>(pagina: K): Promise<CmsContenido[K]> => {
  // En cada visita (nunca prerenderizado): lo guardado se ve al instante y no depende de HUB_MARCA_ID al compilar.
  const defaults = CMS_DEFAULTS[pagina];
  const marca = process.env.HUB_MARCA_ID;
  if (!marca) return defaults;
  try {
    const res = await fetch(`${API_URL}/public/contenido/${pagina}?marcaId=${encodeURIComponent(marca)}`, { next: { revalidate: 30 }, signal: AbortSignal.timeout(3000) });
    if (!res.ok) return defaults;
    const guardado = ((await res.json())?.data ?? {}) as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [seccion, base] of Object.entries(defaults)) out[seccion] = mezclar(base as Record<string, unknown>, guardado[seccion]);
    return out as CmsContenido[K];
  } catch {
    return defaults;
  }
});

/** Datos de contacto vigentes (Ajustes del dashboard) con los derivados que usa la web (tel:, wa.me). */
export type Contacto = { telefono: string; telefonoHref: string; whatsapp: string; correo: string; redes: string };

export const getContacto = cache(async (): Promise<Contacto> => {
  const { contacto: c, redes } = await getPagina('ajustes');
  const digitos = c.whatsapp.replace(/\D/g, '');
  const tel = c.telefono.replace(/[^\d+]/g, '');
  return {
    telefono: c.telefono,
    telefonoHref: `tel:${tel.startsWith('+') ? tel : `+51${tel.replace(/^0/, '')}`}`,
    whatsapp: digitos.length === 9 ? `51${digitos}` : digitos || contacto.whatsapp,
    correo: c.correo,
    redes: redes.texto,
  };
});

export const waUrlDe = (numero: string, texto: string) => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
