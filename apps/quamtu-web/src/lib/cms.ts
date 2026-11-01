/*
 * Contenido editable de la web de Quamtu (Administrador → Web Quamtu). CMS_DEFAULTS son los textos que la web tenía
 * fijos; lo que se guarde en el dashboard (API central, /public/contenido/:pagina, por sección) los reemplaza campo
 * por campo. Sin HUB_MARCA_ID o si la API no responde, la web sale con los defaults. Mismo modelo que Fimav y Kelqa.
 *
 * No se editan desde aquí: el catálogo de piezas, los precios, los casos de éxito ni el número de WhatsApp.
 */
import { cache } from 'react';
import { connection } from 'next/server';
import { PARA_ORGANIZACIONES, PREGUNTAS } from './contenido';

export const CMS_DEFAULTS = {
  inicio: {
    hero: {
      etiqueta: 'CONFIGURACIÓN DE PRECISIÓN',
      titulo: 'Equipos',
      acento: 'a la medida',
      cierre: 'de tu trabajo.',
      texto: 'No construimos hardware convencional: diseñamos herramientas de ingeniería a la medida. Arma tu equipo en 3D o cotiza para tu organización.',
    },
    organizaciones: {
      titulo: 'Para empresas e',
      acento: 'instituciones',
      texto: 'Quien decide por TI no busca solo un precio: busca continuidad y rendimiento. Cada componente se selecciona para cumplir una función específica, sin la incertidumbre del hardware genérico.',
      items: PARA_ORGANIZACIONES.map((p) => ({ t: p.t, d: p.d })),
    },
    faq: {
      preguntas: PREGUNTAS.map((q) => ({ p: q.p, r: q.r })),
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
  await connection();
  const defaults = CMS_DEFAULTS[pagina];
  const marca = process.env.HUB_MARCA_ID;
  if (!marca) return defaults;
  try {
    const res = await fetch(`${API_URL}/public/contenido/${pagina}?marcaId=${encodeURIComponent(marca)}`, { cache: 'no-store', signal: AbortSignal.timeout(3000) });
    if (!res.ok) return defaults;
    const guardado = ((await res.json())?.data ?? {}) as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [seccion, base] of Object.entries(defaults)) out[seccion] = mezclar(base as Record<string, unknown>, guardado[seccion]);
    return out as CmsContenido[K];
  } catch {
    return defaults;
  }
});
