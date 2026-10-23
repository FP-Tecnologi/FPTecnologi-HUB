/*
 * Contenido editable de la web de Fimav Perú (Administrador → Web Fimav). CMS_DEFAULTS son los textos e imágenes que
 * la web tenía fijos; lo que se guarde en el dashboard (API central, /public/contenido/:pagina, por sección) los
 * reemplaza campo por campo. Si la API no responde o no hay HUB_MARCA_ID, la web sale con los defaults.
 *
 * Mismo modelo que la web de FPTecnologi (ContenidoWeb: marca + página + sección), con el marcaId de Fimav. Se lee en
 * cada visita (sin caché, deduplicado por petición con `cache` de React) para que la vista previa del editor muestre lo
 * guardado al instante.
 *
 * No se editan desde aquí (son parte de la estructura del sitio): el slug e ícono de cada categoría (URLs y formulario
 * de cotizar), los logos de las marcas aliadas y los botones del WhatsApp flotante.
 */
import { cache } from 'react';
import { connection } from 'next/server';
import { contenido } from './contenido';
import { contacto } from './contacto';
import { categorias } from './categorias';
import { legal } from './legal';

type Banner = { eyebrow: string; titulo: string; resaltado: string; imagen: string };
type Titulo = { eyebrow: string; claro: string; rojo: string };
const banner = (eyebrow: string, titulo: string, resaltado: string, imagen: string): Banner => ({ eyebrow, titulo, resaltado, imagen });
const titulo = (eyebrow: string, claro: string, rojo: string): Titulo => ({ eyebrow, claro, rojo });

export type Slide = {
  claro: string; rojo: string; subtitulo: string; texto: string;
  fondo: string; imagenIzquierda: string; imagenDerecha: string;
  boton1Texto: string; boton1Url: string; boton2Texto: string; boton2Url: string;
};

export type CategoriaCms = { slug: string; nombre: string; resumen: string; marcas: string; foto1: string; foto2: string; foto3: string };

const legalMd = (slug: string) => ({ titulo: legal[slug]!.titulo, texto: legal[slug]!.parrafos.join('\n\n') });

export const CMS_DEFAULTS = {
  inicio: {
    hero: {
      slides: [
        { claro: 'Tecnología para', rojo: 'cada organización', subtitulo: 'Tecnología para cada espacio de trabajo', texto: 'Organización comercial especializada en el sector Corporativo y Gobierno, con el respaldo de las marcas más representativas del segmento tecnológico.', fondo: '/fotos/escritorios-2.jpg', imagenIzquierda: '/fotos/escritorios-1.jpg', imagenDerecha: '/fotos/all-in-one-1.jpg', boton1Texto: 'Solicitar cotización', boton1Url: '/cotizar', boton2Texto: 'Ver catálogo', boton2Url: '/catalogo' },
        { claro: 'Soluciones para', rojo: 'el Estado', subtitulo: 'Infraestructura que conecta y sostiene tu operación', texto: 'Desarrollamos soluciones tecnológicas según la necesidad de cada entidad, con equipos de las marcas más comerciales del mercado.', fondo: '/fotos/servidores-1.jpg', imagenIzquierda: '/fotos/networking-1.jpg', imagenDerecha: '/fotos/servidores-1.jpg', boton1Texto: 'Ver catálogo', boton1Url: '/catalogo', boton2Texto: '', boton2Url: '' },
        { claro: 'Atención a', rojo: 'Perú Compras', subtitulo: 'Soluciones para entidades del sector público', texto: 'Venta de bienes y servicios y postventa B2G, con presencia en Lima Metropolitana y los demás departamentos del país.', fondo: '/peru-compras/contenedor.jpg', imagenIzquierda: '/fotos/proyectores-1.jpg', imagenDerecha: '/fotos/impresoras-1.jpg', boton1Texto: 'Conoce más', boton1Url: '/peru-compras', boton2Texto: 'Cotizar', boton2Url: '/cotizar' },
        { claro: 'Equipos para', rojo: 'tu empresa', subtitulo: 'Equipamiento para las necesidades de tu organización', texto: 'Impresión, networking, aire acondicionado, baterías, consumibles, mobiliario y papel para tu organización.', fondo: '/fotos/impresoras-2.jpg', imagenIzquierda: '/fotos/impresoras-2.jpg', imagenDerecha: '/fotos/consumibles-1.jpg', boton1Texto: 'Explorar categorías', boton1Url: '/catalogo', boton2Texto: '', boton2Url: '' },
      ] as Slide[],
    },
    nosotros: { ...titulo('Sobre nosotros', 'Conoce a', 'Fimav Perú'), texto: contenido.nosotros, imagen: '/fotos/nosotros.jpg' },
    categorias: titulo('¿Cuáles servicios ofrecemos?', 'Nuestras', 'categorías'),
    perucompras: {
      ...titulo('Estamos en Perú Compras', 'Atendemos al', 'sector Estado'),
      subtitulo: 'Sector Estatal', texto: contenido.perucompras, imagen: '/peru-compras/contenedor.jpg',
      franja: 'Atendemos al Estado a través de la plataforma de contratación pública.', boton: 'Conoce cómo atendemos al Estado',
    },
    porque: { ...titulo('¿Por qué escogernos?', 'Soluciones innovadoras', 'y confiables'), intro: contenido.porQueIntro, items: contenido.porQue, imagen: '/fotos/escogernos.jpg' },
    marcas: titulo('Marcas aliadas', 'Socios de las marcas', 'más comerciales'),
  },
  nosotros: {
    banner: banner('Nosotros', 'Especialistas en', 'bienes y servicios', '/fotos/nosotros.jpg'),
    quienes: { ...titulo('Quiénes somos', 'En constante', 'transformación'), texto: contenido.frase },
    mision: { ...titulo('Nuestra misión', 'Entre los primeros', 'proveedores'), texto: contenido.mision },
    vision: { ...titulo('Nuestra visión', 'Proveedor', 'internacional'), texto: contenido.vision },
    porque: { ...titulo('¿Por qué escogernos?', 'Lo que', 'nos distingue'), items: contenido.porQue },
  },
  catalogo: {
    banner: banner('Catálogo', 'Bienes y', 'servicios', '/fotos/networking-2.jpg'),
    categorias: {
      items: categorias.map((c): CategoriaCms => ({ slug: c.slug, nombre: c.nombre, resumen: c.resumen, marcas: c.marcas.join(', '), foto1: c.fotos[0] ?? '', foto2: c.fotos[1] ?? '', foto3: c.fotos[2] ?? '' })),
    },
  },
  'peru-compras': {
    banner: banner('Perú Compras', 'Atendemos al', 'sector Estado', '/peru-compras/contenedor.jpg'),
    sector: {
      subtitulo: 'Sector Estatal', texto: contenido.perucompras,
      texto2: 'Nuestra experiencia de más de 10 años nos ha posicionado en los primeros puestos del ranking comercial de gobierno en Perú Compras, la plataforma de contratación del Estado.',
      imagen: '/peru-compras/contenedor.jpg',
    },
    trabajo: {
      ...titulo('Cómo trabajamos', 'Venta, postventa y', 'soluciones'),
      items: [
        { title: 'Venta y postventa', text: 'Atendemos la venta de bienes y servicios y acompañamos con postventa.' },
        { title: 'Soluciones a medida', text: 'Desarrollamos diversos tipos de soluciones tecnológicas según la necesidad de cada entidad.' },
        { title: 'Cobertura', text: 'Estamos en diversos puntos de Lima Metropolitana y en los demás departamentos del interior del país.' },
        { title: 'Respaldo de marcas', text: 'Contamos con el respaldo de las marcas más comerciales del mercado y somos socios estratégicos de ellas.' },
      ],
    },
    categorias: titulo('Nuestras categorías', 'Bienes y servicios', 'para el Estado'),
    marcas: titulo('Marcas con las que trabajamos', 'Socios de las marcas', 'más comerciales'),
  },
  contacto: {
    banner: banner('Contacto', 'Hablemos de', 'tu cotización', '/fondos/contacto.jpg'),
    datos: titulo('Datos de contacto', 'Estamos para', 'atenderte'),
    mapa: { ...titulo('Cómo llegar', 'Visítanos en', 'Breña, Lima'), direccionMapa: 'Jr. Huaraz 1833, Breña, Lima' },
    formulario: titulo('Escríbenos un mensaje', 'Te respondemos', 'a la brevedad'),
  },
  cotizar: {
    banner: banner('Cotización', 'Cuéntanos qué', 'necesitas', '/fotos/escogernos.jpg'),
    asesor: { titulo: '¿Prefieres hablar con un asesor?' },
  },
  ajustes: {
    contacto: { direccion: contacto.direccion, telefono: contacto.telefono, whatsapp: contacto.whatsappVisible, ventas: contacto.ventas, comercial: contacto.comercial },
    redes: { facebook: '', instagram: '', linkedin: '' },
    pie: { fraseCorta: contenido.fraseCorta },
    cta: { ...titulo('Cotiza con Fimav Perú', 'Te respondemos con', 'una propuesta'), boton: 'Cotizar ahora' },
  },
  legal: {
    privacidad: legalMd('privacidad'),
    terminos: legalMd('terminos'),
    devoluciones: legalMd('devoluciones'),
    'preguntas-frecuentes': legalMd('preguntas-frecuentes'),
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
  // Siempre en cada visita (nunca prerenderizado en el build): lo guardado en el dashboard se ve al instante y no
  // depende de si HUB_MARCA_ID estaba definido al compilar.
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
export type Contacto = {
  direccion: string; telefono: string; telefonoHref: string; whatsapp: string; whatsappVisible: string; ventas: string; comercial: string;
};

export const getContacto = cache(async (): Promise<Contacto> => {
  const { contacto: c } = await getPagina('ajustes');
  const digitos = c.whatsapp.replace(/\D/g, '');
  const tel = c.telefono.replace(/[^\d+]/g, '');
  return {
    direccion: c.direccion,
    telefono: c.telefono,
    telefonoHref: `tel:${tel.startsWith('+') ? tel : `+51${tel.replace(/^0/, '')}`}`,
    whatsapp: digitos.length === 9 ? `51${digitos}` : digitos || contacto.whatsapp,
    whatsappVisible: c.whatsapp,
    ventas: c.ventas,
    comercial: c.comercial,
  };
});

export const waUrlDe = (numero: string, texto: string) => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

/** Categorías con lo editado en el dashboard (el slug y el ícono vienen del código). */
export const getCategorias = cache(async () => {
  const { categorias: cms } = await getPagina('catalogo');
  return categorias.map((c) => {
    const e = (cms.items as CategoriaCms[]).find((x) => x?.slug === c.slug);
    if (!e) return c;
    const fotos = [e.foto1, e.foto2, e.foto3].filter((f): f is string => typeof f === 'string' && f.trim().length > 0);
    return {
      ...c,
      nombre: e.nombre?.trim() || c.nombre,
      resumen: e.resumen?.trim() || c.resumen,
      marcas: typeof e.marcas === 'string' ? e.marcas.split(',').map((m) => m.trim()).filter(Boolean) : c.marcas,
      fotos: fotos.length ? fotos : c.fotos,
    };
  });
});

/** Texto legal en párrafos ("## " = subtítulo), como lo dibuja la página. */
export const parrafosDe = (texto: string) => texto.replace(/\r/g, '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
