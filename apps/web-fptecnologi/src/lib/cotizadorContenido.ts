/*
 * Contenido editable del cotizador (CMS del dashboard: Cotizador → Formulario).
 * COTIZADOR_DEFAULTS son los textos de fábrica; lo que se guarde desde el
 * dashboard (API central, /public/contenido/cotizador) los reemplaza sección
 * por sección. Si la API no responde, el cotizador sale con los defaults.
 *
 * Los campos del lead (nombres, documento, correo...) son fijos — los exige la
 * API —; lo editable son los textos, las opciones de "¿qué necesitas?" y el
 * mensaje de agradecimiento.
 */
import { SOLUTIONS } from './content';

export type ItemTexto = { title: string; text: string };

export type Encabezado = { badge: string; titulo: string; destacado: string };

export type CotizadorContenido = {
  hero: { badge: string; titulo: string; destacado: string; descripcion: string };
  /** 3 pasos: ¿qué necesitas? · ¿quién eres? · ¿cómo te contactamos? */
  pasos: { items: ItemTexto[] };
  /** Opciones de "servicio o producto de interés". */
  intereses: { items: ItemTexto[]; permitirOtro: boolean; mostrarMensaje: boolean; mensajeLabel: string };
  beneficios: { items: ItemTexto[] };
  proceso: Encabezado & { items: ItemTexto[] };
  faq: Encabezado & { items: ItemTexto[] };
  gracias: { titulo: string; mensaje: string; botonTexto: string; botonUrl: string };
};

export const COTIZADOR_DEFAULTS: CotizadorContenido = {
  hero: {
    badge: 'Cotizador',
    titulo: 'Cotiza tu proyecto',
    destacado: 'en 3 pasos simples',
    descripcion: 'Cuéntanos qué necesitas y un asesor te enviará una propuesta a medida de tu empresa.',
  },
  pasos: {
    items: [
      { title: '¿Qué necesitas cotizar?', text: 'Elige el servicio o producto que te interesa.' },
      { title: '¿Quién solicita?', text: 'Tus datos para preparar la cotización a tu nombre.' },
      { title: '¿Cómo te contactamos?', text: 'Te escribiremos con la propuesta lo antes posible.' },
    ],
  },
  intereses: {
    items: [
      ...SOLUTIONS.map((s) => ({ title: s.title, text: s.description })),
      { title: 'Equipamiento TI', text: 'Computadoras, servidores, redes y periféricos de las principales marcas.' },
    ],
    permitirOtro: true,
    mostrarMensaje: true,
    mensajeLabel: '¿Quieres contarnos algo más? (opcional)',
  },
  beneficios: {
    items: [
      { title: 'Asesoría personalizada', text: 'Un especialista arma la propuesta según tu operación.' },
      { title: 'Marcas autorizadas', text: 'Distribución oficial con stock local y garantía.' },
      { title: 'Sin compromiso', text: 'Cotizar es gratis: tú decides si avanzas.' },
    ],
  },
  proceso: {
    badge: 'Cómo funciona',
    titulo: 'De tu solicitud a',
    destacado: 'una propuesta clara',
    items: [
      { title: 'Nos cuentas tu necesidad', text: 'Llenas el formulario en menos de 2 minutos: sin llamadas ni papeleo.' },
      { title: 'Analizamos tu caso', text: 'Un especialista revisa tu requerimiento y arma la solución adecuada.' },
      { title: 'Recibes tu cotización', text: 'Te contactamos por correo o WhatsApp con una propuesta detallada.' },
    ],
  },
  faq: {
    badge: 'Preguntas frecuentes',
    titulo: 'Antes de',
    destacado: 'cotizar',
    items: [
      { title: '¿Tengo que comprometerme al pedir una cotización?', text: 'No. Un especialista te arma la propuesta y tú decides si avanzas — sin compromiso.' },
      { title: '¿Las marcas que venden son originales?', text: 'Somos distribuidores autorizados: marcas originales con garantía oficial.' },
      { title: '¿Tienen stock disponible?', text: 'Contamos con stock local para despacho inmediato en los equipos más solicitados.' },
      { title: '¿Dónde están ubicados?', text: 'Jr. Huaraz 1841, Breña — Lima, Perú. También atendemos por WhatsApp y correo.' },
    ],
  },
  gracias: {
    titulo: '¡Recibimos tu solicitud!',
    mensaje: 'Un asesor de FPTecnologi se pondrá en contacto contigo muy pronto para enviarte tu cotización.',
    botonTexto: 'Volver al inicio',
    botonUrl: '/',
  },
};

const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

/** Defaults + lo guardado en el dashboard (se mezcla campo por campo, por sección). */
export async function getCotizadorContenido(): Promise<CotizadorContenido> {
  if (!MARCA_ID) return COTIZADOR_DEFAULTS;
  try {
    const res = await fetch(`${API_URL}/public/contenido/cotizador?marcaId=${MARCA_ID}`, { cache: 'no-store' });
    if (!res.ok) return COTIZADOR_DEFAULTS;
    const saved = ((await res.json())?.data ?? {}) as Record<string, Record<string, unknown>>;
    const out = { ...COTIZADOR_DEFAULTS } as Record<string, unknown>;
    for (const key of Object.keys(COTIZADOR_DEFAULTS)) {
      if (saved[key] && typeof saved[key] === 'object') {
        out[key] = { ...(COTIZADOR_DEFAULTS as unknown as Record<string, object>)[key], ...saved[key] };
      }
    }
    return out as CotizadorContenido;
  } catch {
    return COTIZADOR_DEFAULTS;
  }
}
