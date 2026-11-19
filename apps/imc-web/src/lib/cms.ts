/*
 * Contenido editable de la web de Company IMC (Administrador → Web IMC). CMS_DEFAULTS son los textos que la web tenía
 * fijos; lo que se guarde en el dashboard (API central, /public/contenido/:pagina, por sección) los reemplaza campo
 * por campo. Sin HUB_MARCA_ID o si la API no responde, la web sale con los defaults. Mismo modelo que Kelqa y Fimav.
 *
 * No se editan desde aquí: fotos, logos de marcas, servicios ni productos. Teléfono, WhatsApp, correo, dirección y
 * horario sí: página «ajustes».
 */
import { cache } from "react";
import { EMPRESA, MOTIVOS } from "./datos";

export const CMS_DEFAULTS = {
  inicio: {
    sobre: {
      cita: "Nos mantenemos a la vanguardia de la tecnología para ofrecer soluciones de última generación.",
      texto:
        "En Company IMC creemos en el poder de la tecnología para transformar negocios y mejorar vidas. Nos hemos consolidado como un socio estratégico para empresas de diversos sectores, con soluciones integrales que impulsan el crecimiento y la eficiencia.",
    },
    porque: {
      cita: "Entendemos que cada empresa es única y enfrenta desafíos específicos. Por eso, nos convertimos en tu socio estratégico.",
      items: MOTIVOS.map((texto) => ({ texto })),
    },
  },
  contacto: {
    banner: {
      etiqueta: "Hablemos",
      titulo: "Contáctenos",
      acento: "hoy",
      texto: "Pide asesoría personalizada para tus proyectos de tecnología. Te respondemos a la brevedad.",
    },
  },
  ajustes: {
    contacto: {
      telefono: EMPRESA.telefono,
      whatsapp: EMPRESA.whatsapp.replace(/\D/g, "").replace(/^51/, ""),
      correo: EMPRESA.correo,
      direccion: EMPRESA.direccion.join(", "),
      horario: EMPRESA.horario,
    },
  },
};

export type CmsContenido = typeof CMS_DEFAULTS;
export type PaginaCms = keyof CmsContenido;
export const PAGINAS_CMS = Object.keys(CMS_DEFAULTS) as PaginaCms[];

const API_URL = process.env.HUB_API_URL ?? "http://localhost:3001";
const esObjeto = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

/** Mezcla una sección guardada sobre su default: solo campos conocidos y del mismo tipo (texto con texto, lista con lista). */
function mezclar<T extends Record<string, unknown>>(base: T, guardado: unknown): T {
  if (!esObjeto(guardado)) return base;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(base)) {
    const g = guardado[k];
    if (typeof v === "string" && typeof g === "string") out[k] = g;
    else if (Array.isArray(v) && Array.isArray(g)) out[k] = g;
    else if (typeof v === "boolean" && typeof g === "boolean") out[k] = g;
  }
  return out as T;
}

/** Defaults + lo guardado en el dashboard para una página (cada sección por separado). */
export const getPagina = cache(async <K extends PaginaCms>(pagina: K): Promise<CmsContenido[K]> => {
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

/** Datos de la empresa vigentes (Ajustes del dashboard) con los derivados que usa la web (wa.me, tel:). */
export type Empresa = { nombre: string; telefono: string; telefonoHref: string; whatsapp: string; correo: string; direccion: string; horario: string };

export const getEmpresa = cache(async (): Promise<Empresa> => {
  const { contacto: c } = await getPagina("ajustes");
  const digitos = c.whatsapp.replace(/\D/g, "");
  return {
    nombre: EMPRESA.nombre,
    telefono: c.telefono,
    telefonoHref: `tel:${c.telefono.replace(/[^\d+]/g, "")}`,
    whatsapp: `https://wa.me/${digitos.length === 9 ? `51${digitos}` : digitos}`,
    correo: c.correo,
    direccion: c.direccion,
    horario: c.horario,
  };
});
