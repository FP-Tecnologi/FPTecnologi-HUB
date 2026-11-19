/*
 * Contenido editable de la web de Company IMC (Administrador → Web IMC). CMS_DEFAULTS son los textos que la web tenía
 * fijos; lo que se guarde en el dashboard (API central, /public/contenido/:pagina, por sección) los reemplaza campo
 * por campo. Sin HUB_MARCA_ID o si la API no responde, la web sale con los defaults. Mismo modelo que Kelqa y Fimav.
 *
 * No se editan desde aquí: fotos, logos de marcas, servicios ni productos. Teléfono, WhatsApp, correo, dirección y
 * horario sí: página «ajustes».
 */
import { cache } from "react";
import { EMPRESA, MOTIVOS, VALORES, PROYECTOS, SERVICIOS, PASOS, PRODUCTOS, PERU_COMPRAS } from "./datos";

const td = <T extends { t: string; d: string }>(l: readonly T[]) => l.map(({ t, d }) => ({ t, d }));

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
  nosotros: {
    banner: { etiqueta: "Sobre nosotros", titulo: "Tecnología que", acento: "transforma negocios", texto: "Más de 4 años siendo el socio estratégico de empresas e instituciones que buscan eficiencia y crecimiento." },
    historia: {
      citaInicio: "Nos mantenemos a la vanguardia de la tecnología para ofrecer soluciones de",
      citaAcento: "última generación",
      citaFin: ".",
      parrafo1: "En Company IMC creemos en el poder de la tecnología para transformar negocios y mejorar vidas. Con más de 4 años de experiencia, nos hemos consolidado como un buen socio estratégico para empresas de diversos sectores, brindando soluciones integrales que impulsan el valor del crecimiento y la eficiencia.",
      parrafo2: "Somos especialistas en soluciones tecnológicas para el sector público: equipos de cómputo, servidores, monitores y todo el ecosistema TI que impulsa la transformación digital de las instituciones del Estado.",
    },
    mision: { lema: "Hacia dónde trabajamos", texto: "Ser una organización en constante transformación, que crece de forma sostenible y mejora la calidad de las soluciones que ofrece a sus clientes, dentro de un ecosistema empresarial sostenible." },
    vision: { lema: "Dónde queremos llegar", texto: "Ser un referente nacional en equipos informáticos y proyectos tecnológicos, con innovación, calidad y responsabilidad social, cuidando el medio ambiente en cada solución." },
    valores: { items: td(VALORES) },
    kelqa: { titulo: "Kelqa, nuestra nueva marca", texto: "Nace de nuestra experiencia para elevar los estándares del mercado peruano con productos de valor real y duradero." },
  },
  servicios: {
    banner: { etiqueta: "Qué hacemos", titulo: "Nuestros", acento: "servicios", texto: "Desde equipos de cómputo hasta cableado estructurado y telefonía: un portafolio completo para cubrir todas tus necesidades tecnológicas." },
    proyectos: { items: td(PROYECTOS) },
    oficina: { items: td(SERVICIOS), ctaTexto: "¿No ves lo que buscas? Lo conseguimos." },
    pasos: { items: td(PASOS) },
  },
  productos: {
    banner: { etiqueta: "Catálogo", titulo: "Nuestros", acento: "productos", texto: "Trabajamos con las marcas más reconocidas del mercado para garantizar la calidad y confiabilidad de cada equipo." },
    catalogo: { items: PRODUCTOS.map(({ t }) => ({ t })) },
    marcas: { texto: "Alianzas con fabricantes reconocidos que nos permiten ofrecer productos originales, garantía y valor agregado." },
  },
  perucompras: {
    banner: { etiqueta: "Compras estatales", titulo: "Estamos en", acento: "Perú Compras", texto: "Fichas publicadas y una logística que atiende de manera directa a los clientes de Perú Compras." },
    fichas: { items: td(PERU_COMPRAS) },
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
