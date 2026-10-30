/*
 * Contenido editable de la web de Kelqa (Administrador → Web Kelqa). CMS_DEFAULTS son los textos e imágenes que la web
 * tenía fijos (contenido.ts); lo que se guarde en el dashboard (API central, /public/contenido/:pagina, por sección)
 * los reemplaza campo por campo. Si la API no responde o no hay HUB_MARCA_ID, la web sale con los defaults.
 *
 * Mismo modelo que Fimav y FPTecnologi (ContenidoWeb: marca + página + sección). Se lee en cada visita (sin caché,
 * deduplicado por petición con `cache` de React) para que la vista previa del editor muestre lo guardado al instante.
 * Por eso esta web necesita servidor (`next start` / server.cjs): exportada como HTML estático no refleja el CMS.
 *
 * No se editan desde aquí (son parte de la estructura): el identificador de cada línea (URL /lineas/…), los íconos y los
 * logos de clientes.
 */
import { cache } from 'react';
import { connection } from 'next/server';
import { contacto, lineas, mision, preguntas, propuesta, razones, testimonios, valores, valoresDetalle, vision, type Linea } from './contenido';

type Titulo = { etiqueta: string; claro: string; acento: string };
const titulo = (etiqueta: string, claro: string, acento: string): Titulo => ({ etiqueta, claro, acento });
const lin = (id: string) => lineas.find((l) => l.id === id)!;

/** Datos de una línea tal como se editan (el id sale de la clave de la sección). */
const deLinea = (l: Linea) => ({ nombre: l.nombre, corto: l.corto, lema: l.lema, texto: l.texto, foto: l.foto, galeria: l.galeria, productos: l.productos });

export const CMS_DEFAULTS = {
  inicio: {
    hero: {
      etiqueta: 'Industria · Construcción · Corporativo', claro: 'Hecha para', acento: 'avanzar contigo',
      texto: 'Soluciones confiables y de alto valor para tus proyectos: pinturas, mobiliario corporativo y productos para construcción y emergencia, con cobertura a nivel nacional.',
      boton: 'Cotizar ahora', imagen: '/fotos/cumbre.webp',
      puntos: ['Venta directa', 'Licitaciones públicas y privadas', 'Fichas en Perú Compras'] as string[],
    },
    accesos: { titulo: 'Tres líneas, un mismo estándar' },
    nosotros: {
      ...titulo('Quiénes somos', 'Más que productos,', 'soluciones que generan impacto'),
      texto: 'Desarrollamos y ofrecemos soluciones confiables, eficientes y de alto valor para los sectores industrial y construcción, con productos que integran calidad, rendimiento, durabilidad y precios competitivos.',
      texto2: 'Creemos en el trabajo bien hecho y en relaciones comerciales basadas en la confianza, la responsabilidad, la transparencia y un servicio oportuno.',
      imagen: '/fotos/equipo.webp', destacado: 'Aliado estratégico en cada etapa de tu proyecto',
      valores: valores as string[],
      mision: 'Brindar soluciones confiables y de alta calidad que impulsen proyectos en diversos sectores, con cobertura nacional y un servicio cercano.',
      vision: 'Ser una marca reconocida por su excelencia, cercanía y compromiso, aliada de nuestros clientes en cada etapa de sus proyectos.',
    },
    lineas: titulo('Nuestras líneas', 'Soluciones para', 'cada proyecto'),
    porque: {
      ...titulo('¿Por qué Kelqa?', 'Construimos', 'relaciones que duran'),
      intro: 'Buen servicio es acompañarte de cerca, entender los desafíos de tu proyecto y proponer alternativas eficientes, oportunas y alineadas a tus objetivos.',
      imagen: '/fotos/obrero-casco.webp', items: razones,
    },
    canales: {
      ...titulo('Sector público y privado', 'Venta directa y', 'licitaciones'),
      texto: 'Atendemos ventas directas y licitaciones públicas y privadas. Encuentra todas nuestras fichas en Perú Compras.',
      boton: 'Consultar disponibilidad', imagen: '/fotos/almacen.webp',
    },
    testimonios: { ...titulo('Clientes', 'Nuestra experiencia', 'habla por nosotros'), items: testimonios },
  },
  nosotros: {
    banner: { miga: 'Nosotros', titulo: 'Una marca integral', acento: 'de confianza', texto: 'Más que proveer productos, buscamos ser un aliado estratégico que acompañe cada etapa de tu proyecto.', foto: '/fotos/equipo.webp' },
    quienes: {
      ...titulo('Quiénes somos', 'Hecha para', 'avanzar contigo'),
      texto: 'Desarrollamos y ofrecemos soluciones muy confiables, eficientes y de alto valor para los sectores industrial y construcción, poniendo a disposición productos que integran buena calidad, rendimiento, durabilidad y precios competitivos.',
      texto2: 'Nuestro compromiso es brindar alternativas que respondan de manera precisa a las necesidades reales de cada proyecto, contribuyendo a optimizar procesos, mejorar la productividad y asegurar resultados sólidos y sostenibles en el tiempo.',
      texto3: 'Creemos en el trabajo bien hecho, en la importancia de mantenernos cerca de nuestros clientes y en el valor de construir relaciones comerciales basadas en la confianza, la responsabilidad, la transparencia y un servicio oportuno.',
      imagen: '/fotos/obra.webp', destacado: 'Venta directa y licitaciones públicas y privadas', destacado2: 'Fichas disponibles en Perú Compras',
    },
    mision: { texto: mision },
    vision: { texto: vision },
    valores: { ...titulo('Valores corporativos', 'Lo que nos', 'define'), items: valoresDetalle },
    propuesta: { ...titulo('¿Por qué escoger Kelqa?', 'Innovación que', 'te acompaña'), items: propuesta as string[] },
  },
  contacto: {
    banner: { miga: 'Contacto', titulo: 'Contáctanos para', acento: 'cualquier duda', texto: 'Elige el canal que prefieras: te atendemos de inmediato y te ayudamos a encontrar la solución precisa para tu proyecto.', foto: '/fotos/obrero-casco.webp' },
    canales: { ...titulo('Canales', 'Hablemos de', 'tu proyecto'), aviso: 'Ventas directas y licitaciones públicas y privadas.', avisoTexto: 'Encuentra todas nuestras fichas en Perú Compras.' },
    formulario: { titulo: 'Déjanos tu mensaje' },
    preguntas: { ...titulo('Preguntas frecuentes', 'Razones para', 'confiar en Kelqa'), items: preguntas },
  },
  lineas: {
    pinturas: deLinea(lin('pinturas')),
    mobiliario: deLinea(lin('mobiliario')),
    construccion: deLinea(lin('construccion')),
  },
  ajustes: {
    contacto: { telefono: contacto.telefono, whatsapp: contacto.whatsapp, correo: contacto.correo, redes: contacto.redes },
    pie: { frase: 'Soluciones confiables para los sectores industrial, construcción, vial y ayuda humanitaria, con distribución a nivel nacional.' },
    clientes: { titulo: 'Empresas que confían en Kelqa' },
    widget: {
      visible: true,
      titulo: 'Kelqa · Atención comercial', estado: 'En línea · te respondemos de inmediato',
      saludo: '¡Hola! ¿En qué te ayudamos? Elige un tema y seguimos por WhatsApp.',
      aviso: '¿Necesitas una cotización? Escríbenos',
      motivos: [
        { titulo: 'Cotizar productos', detalle: 'Pide una propuesta para tu proyecto', mensaje: 'Hola Kelqa, quisiera cotizar productos para mi proyecto.' },
        { titulo: 'Línea de pinturas', detalle: 'Vial, gloss, arquitectónica, látex y base', mensaje: 'Hola Kelqa, quisiera información sobre la línea de pinturas.' },
        { titulo: 'Mobiliario corporativo', detalle: 'Sillas presidenciales, gerenciales y butacas', mensaje: 'Hola Kelqa, quisiera información sobre el mobiliario corporativo.' },
        { titulo: 'Construcción y emergencia', detalle: 'Calaminas, carpas y herramientas', mensaje: 'Hola Kelqa, quisiera información sobre calaminas, carpas o herramientas.' },
        { titulo: 'Licitaciones y Perú Compras', detalle: 'Entidades públicas y privadas', mensaje: 'Hola Kelqa, represento a una entidad y quisiera información sobre licitaciones o Perú Compras.' },
        { titulo: 'Otra consulta', detalle: 'Cualquier otro tema', mensaje: 'Hola Kelqa, quisiera más información.' },
      ],
    },
  },
};

export type CmsContenido = typeof CMS_DEFAULTS;
export type PaginaCms = keyof CmsContenido;

const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const esObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

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
  // Siempre en cada visita (nunca prerenderizado en el build): lo guardado en el dashboard se ve al instante.
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

/** Datos de contacto vigentes (Ajustes del dashboard) con los derivados que usa la web (tel:, wa.me). */
export type ContactoWeb = { telefono: string; telefonoHref: string; whatsapp: string; correo: string; redes: string; frasePie: string };

export const getContacto = cache(async (): Promise<ContactoWeb> => {
  const { contacto: c, pie } = await getPagina('ajustes');
  const tel = c.telefono.replace(/[^\d+]/g, '');
  const digitos = c.whatsapp.replace(/\D/g, '');
  return {
    telefono: c.telefono,
    telefonoHref: `tel:${tel.startsWith('+') ? tel : `+51${tel.replace(/^0/, '')}`}`,
    whatsapp: digitos.length === 9 ? `51${digitos}` : digitos || contacto.whatsapp,
    correo: c.correo,
    redes: c.redes,
    frasePie: pie.frase,
  };
});

/** Widget flotante de WhatsApp (Ajustes → Widget): visibilidad, textos y motivos editables. */
export const getWidget = cache(async () => {
  const { widget: w } = await getPagina('ajustes');
  const motivos = w.motivos.filter((m) => esObjeto(m) && typeof m.titulo === 'string' && m.titulo.trim()).map((m) => ({
    titulo: m.titulo, detalle: typeof m.detalle === 'string' ? m.detalle : '', mensaje: txt(m.mensaje, 'Hola Kelqa, quisiera más información.'),
  }));
  return { ...w, motivos };
});
export type WidgetWeb = Awaited<ReturnType<typeof getWidget>>;

export const waUrlDe = (numero: string, texto: string) => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

const txt = (v: unknown, defecto: string) => (typeof v === 'string' && v.trim() ? v : defecto);

/** Las tres líneas con lo editado en el dashboard (el id y el orden vienen del código; lo vacío usa el default). */
export const getLineas = cache(async (): Promise<Linea[]> => {
  const cms = await getPagina('lineas');
  return lineas.map((base) => {
    const e = cms[base.id as keyof typeof cms] as Partial<Linea> | undefined;
    const productos = (Array.isArray(e?.productos) ? e.productos : []).filter((p) => esObjeto(p) && typeof p.nombre === 'string' && p.nombre.trim());
    const galeria = (Array.isArray(e?.galeria) ? e.galeria : []).filter((g) => esObjeto(g) && typeof g.src === 'string' && g.src.trim());
    return {
      id: base.id,
      nombre: txt(e?.nombre, base.nombre), corto: txt(e?.corto, base.corto), lema: txt(e?.lema, base.lema), texto: txt(e?.texto, base.texto), foto: txt(e?.foto, base.foto),
      galeria: galeria.length ? galeria.map((g) => ({ src: g.src, alt: typeof g.alt === 'string' ? g.alt : '' })) : base.galeria,
      productos: productos.length
        ? productos.map((p) => ({ nombre: p.nombre, img: txt(p.img, base.productos[0]?.img ?? ''), detalle: typeof p.detalle === 'string' ? p.detalle : '', descripcion: typeof p.descripcion === 'string' ? p.descripcion : '' }))
        : base.productos,
    };
  });
});
