/*
 * Contenido editable de la web de Imaninki (Administrador → Web Imaninki). CMS_DEFAULTS son los textos que la web tenía
 * fijos; lo que se guarde en el dashboard (API central, /public/contenido/:pagina, por sección) los reemplaza campo
 * por campo. Sin HUB_MARCA_ID o si la API no responde, la web sale con los defaults. Mismo modelo que Fimav.
 *
 * No se editan desde aquí: las líneas de producto, los datos de contacto (teléfono, WhatsApp, correo) ni las fotos.
 */
import { cache } from 'react';
import { preguntas } from './contenido';

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
