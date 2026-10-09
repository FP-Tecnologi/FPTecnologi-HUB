/*
 * Contenido editable de las páginas internas (CMS del dashboard: Web
 * informativa → Nosotros / Servicios / Proyectos / Contacto). PAGINAS_DEFAULTS
 * son los textos actuales del sitio; lo que se guarde desde el dashboard (API
 * central, /public/contenido/:pagina) los reemplaza sección por sección. Si la
 * API no responde, la página sale con los defaults. Mismo patrón que
 * homeContenido.ts.
 */
import { CONTACT_INFO, SOCIAL_LINKS, STATS } from './content';
import { COMPLIANCE_DOCS, COMPLIANCE_MD } from './compliance';

type Enc = { badge: string; titulo: string; destacado: string; descripcion: string };
const enc = (o: Partial<Enc>): Enc => ({ badge: '', titulo: '', destacado: '', descripcion: '', ...o });

export const PAGINAS_DEFAULTS = {
  nosotros: {
    hero: enc({
      badge: 'Nosotros',
      titulo: 'Tecnología empresarial',
      destacado: 'con respaldo real',
      descripcion:
        'Somos FPTecnologi & System: distribuimos las principales marcas de tecnología y diseñamos soluciones TI a medida para empresas e instituciones de todo el Perú.',
    }),
    quienes: {
      badge: 'Quiénes somos',
      titulo: 'Más de una década',
      destacado: 'equipando empresas',
      parrafos: [
        'Ayudamos a empresas a equiparse con la tecnología correcta: distribución autorizada de las principales marcas, stock local listo para despachar y un equipo técnico que arma cada propuesta a medida de tu operación.',
        'Trabajamos en dos líneas: una tienda B2B con equipamiento en stock y servicios TI por proyecto — seguridad, videoconferencia, cloud y data centers — con diseño, instalación y soporte de nuestros propios especialistas.',
      ],
    },
    proposito: {
      badge: 'Lo que nos mueve',
      titulo: 'Nuestro',
      destacado: 'propósito',
      items: [
        { title: 'Misión', text: 'Equipar a las empresas peruanas con la tecnología correcta para su operación, con asesoría honesta, stock local y soporte técnico cercano.' },
        { title: 'Visión', text: 'Ser el aliado tecnológico de referencia para empresas e instituciones del Perú, reconocido por cumplir lo que promete.' },
        { title: 'Valores', text: 'Transparencia en cada cotización, compromiso con los plazos y relaciones de largo plazo con clientes y partners.' },
      ],
    },
  },
  servicios: {
    hero: enc({
      badge: 'Servicios TI',
      titulo: 'Soluciones tecnológicas',
      destacado: 'a medida de tu empresa',
      descripcion: 'Seguridad, videoconferencia, cloud, data centers y más — diseñados, instalados y soportados por nuestros especialistas.',
    }),
    listado: enc({
      badge: 'Nuestros servicios',
      titulo: 'Servicios TI',
      destacado: 'para cada sector',
      descripcion: 'Elige el servicio y conoce cómo lo implementamos en tu empresa.',
    }),
  },
  proyectos: {
    hero: enc({
      titulo: 'Proyectos que ya',
      destacado: 'funcionan en todo el Perú',
      descripcion: 'Seguridad ciudadana, educación, data centers, videoconferencia y cloud: implementaciones reales, de la visita técnica al soporte.',
    }),
  },
  contacto: {
    hero: enc({
      badge: 'Contacto',
      titulo: 'Hablemos de',
      destacado: 'tu próximo proyecto',
      descripcion: 'Escríbenos, llámanos o visítanos en Breña. Un asesor te responde en horario de oficina.',
    }),
    asesores: enc({ badge: 'Asesores', titulo: 'Habla directo con', destacado: 'el área que necesitas' }),
    visita: { ...enc({ badge: 'Visítanos', titulo: 'Nuestra', destacado: 'oficina' }), horario: 'Lunes a viernes, 9:00 a 18:00' },
  },
  alquiler: {
    hero: enc({
      titulo: 'Alquiler de equipos',
      destacado: 'a tu medida',
      descripcion: 'Cotiza la cantidad y el modelo de equipos que necesites: tenemos la mayor variedad de equipos IT para tu empresa y la mejor solución de garantías.',
    }),
    beneficios: {
      ...enc({ badge: 'Por qué alquilar con nosotros', titulo: 'Equipos listos,', destacado: 'con respaldo' }),
      items: [
        { title: 'Entrega en 24 horas', text: 'Recibe los equipos dentro de las 24 horas de confirmado tu pedido.' },
        { title: '+20 especialistas', text: 'Un equipo técnico a tu disposición durante todo el alquiler.' },
        { title: 'Atención de incidencias', text: 'Resolvemos cualquier problema rápido, sin que se detenga tu operación.' },
        { title: 'Cambio inmediato', text: 'Si un equipo falla, lo cambiamos de manera inmediata.' },
      ],
    },
    equipos: {
      ...enc({ badge: 'Qué puedes alquilar', titulo: 'Variedad de equipos', destacado: 'para tu empresa' }),
      items: [
        { title: 'Laptops', text: 'Para equipos de trabajo, capacitaciones y eventos.' },
        { title: 'Computadoras', text: 'PCs de escritorio y all-in-one listas para usar.' },
        { title: 'Monitores', text: 'Pantallas para oficinas, salas y puestos temporales.' },
        { title: 'Servidores', text: 'Capacidad de cómputo para proyectos y contingencias.' },
        { title: 'Proyectores y pantallas interactivas', text: 'Para aulas, salas de reuniones y presentaciones.' },
        { title: 'Impresoras', text: 'Impresión para oficinas y operaciones temporales.' },
      ],
    },
    pasos: {
      ...enc({ badge: 'Cómo funciona', titulo: 'Alquilar es', destacado: 'simple' }),
      items: [
        { title: '1. Cotiza', text: 'Indícanos la cantidad y el modelo de equipos que necesitas.' },
        { title: '2. Recibe', text: 'Coordinamos la logística y entregamos en 24 horas.' },
        { title: '3. Usa con respaldo', text: 'Soporte técnico y cambio inmediato durante todo el alquiler.' },
      ],
    },
  },
  education: {
    hero: enc({
      titulo: 'FP',
      destacado: 'Education',
      descripcion: 'Tecnología para el aula: lleva a tu institución las mejores soluciones, con acompañamiento de un especialista.',
    }),
    tarjetas: {
      ...enc({ badge: 'Tecnología en el aula', titulo: 'Aprende y prueba', destacado: 'en tu institución' }),
      items: [
        { title: 'Coordina una visita a tu institución', text: 'Llevamos la mejor tecnología a tus aulas para que la conozcas y pruebes en vivo, de la mano de un especialista que te enseñará cada uno de sus beneficios.' },
        { title: 'Aprende sobre la tecnología en el aula', text: 'Descubre cómo implementar de la mejor manera tu institución con nuestras marcas aliadas, todas con beneficios increíbles.' },
        { title: 'Elige el equipo que se amolda a ti', text: 'Te orientamos para escoger el equipo que más se ajusta a las necesidades de tu institución.' },
      ],
    },
    accion: {
      titulo: 'Mira las soluciones en acción',
      texto: 'Conoce en video cómo nuestras marcas aliadas transforman el aula, o revisa los equipos disponibles en la tienda.',
    },
  },
  compliance: {
    hero: enc({
      titulo: 'Procesos y',
      destacado: 'cumplimiento',
      descripcion: 'Nuestro sistema de Compliance Empresarial: ética, transparencia y prevención de riesgos en cada proceso.',
    }),
    // "## Título" abre sección; "**Subtítulo.** texto" resalta el inicio del párrafo.
    contenido: { texto: COMPLIANCE_MD },
    documentos: { items: COMPLIANCE_DOCS as { titulo: string; archivo: string }[] },
  },
  catalogos: {
    hero: enc({ titulo: 'Nuestros', destacado: 'catálogos', descripcion: 'Hojéalos como un folleto o descárgalos en PDF.' }),
    // archivo: PDF subido desde el dashboard (/uploads/...) o un PDF de la carpeta public de la web.
    lista: {
      items: [
        { titulo: 'Videoconferencia', archivo: '/catalogos/videoconferencia.pdf' },
        { titulo: 'Stock FP', archivo: '/catalogos/stock-fp.pdf' },
      ] as { titulo: string; archivo: string }[],
    },
  },
  // Ajustes generales (dashboard → Web informativa → Ajustes del sitio). Los consume lib/sitio.ts.
  sitio: {
    contacto: {
      direccion: CONTACT_INFO.address,
      telefonoVentas: CONTACT_INFO.phoneVentas,
      telefonoWeb: CONTACT_INFO.phoneVentasWeb,
      correo: CONTACT_INFO.email,
      whatsapp: '51908856286',
    },
    redes: Object.fromEntries(SOCIAL_LINKS.map((r) => [r.red, r.href])) as Record<(typeof SOCIAL_LINKS)[number]['red'], string>,
    cifras: { items: STATS.map((s) => ({ title: `${s.value}${s.suffix}`, text: s.label })) },
    cambio: { tipoCambio: process.env.TIPO_CAMBIO_USD_PEN || '3.75' },
  },
  // Textos legales en markdown ("## Título" abre una sección). Vacío = se usa el texto base de lib/legal.ts.
  legal: {
    privacidad: { resumen: '', actualizado: '', contenido: '' },
    terminos: { resumen: '', actualizado: '', contenido: '' },
    devoluciones: { resumen: '', actualizado: '', contenido: '' },
  },
  // Título y descripción para buscadores por página. Vacío = el de la página.
  seo: {
    home: { titulo: '', descripcion: '' },
    nosotros: { titulo: '', descripcion: '' },
    servicios: { titulo: '', descripcion: '' },
    proyectos: { titulo: '', descripcion: '' },
    contacto: { titulo: '', descripcion: '' },
    tienda: { titulo: '', descripcion: '' },
    cotizador: { titulo: '', descripcion: '' },
    blog: { titulo: '', descripcion: '' },
    alquiler: { titulo: '', descripcion: '' },
    education: { titulo: '', descripcion: '' },
    compliance: { titulo: '', descripcion: '' },
    catalogos: { titulo: '', descripcion: '' },
  },
};

export type PaginasContenido = typeof PAGINAS_DEFAULTS;
export type PaginaKey = keyof PaginasContenido;
export const PAGINAS = Object.keys(PAGINAS_DEFAULTS) as PaginaKey[];

/** Ruta pública de un PDF guardado: los subidos al dashboard (/uploads/...) pasan por el proxy de la web (sin CORS). */
export const urlArchivo = (a: string) => (a.startsWith('/uploads/') ? `/api/archivos${a.slice('/uploads'.length)}` : a);

const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

/** Defaults + lo guardado en el dashboard (se mezcla campo por campo, por sección). */
export async function getPagina<K extends PaginaKey>(pagina: K): Promise<PaginasContenido[K]> {
  const defaults = PAGINAS_DEFAULTS[pagina];
  if (!MARCA_ID) return defaults;
  try {
    const res = await fetch(`${API_URL}/public/contenido/${pagina}?marcaId=${MARCA_ID}`, { cache: 'no-store' });
    if (!res.ok) return defaults;
    const saved = ((await res.json())?.data ?? {}) as Record<string, Record<string, unknown>>;
    const out: Record<string, unknown> = { ...defaults };
    for (const key of Object.keys(defaults)) {
      if (saved[key] && typeof saved[key] === 'object') {
        out[key] = { ...(defaults as Record<string, object>)[key], ...saved[key] };
      }
    }
    return out as PaginasContenido[K];
  } catch {
    return defaults;
  }
}
