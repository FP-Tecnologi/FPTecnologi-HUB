/*
 * Landing pages (Campañas → Landing pages del dashboard): tipos y lectura desde la API central
 * (GET /public/landings/:slug). Se lee en el servidor, sin caché, para que lo que se publica o edita
 * se vea al instante. Misma forma que apps/api/src/landings/landings.modelo.ts.
 */
export type TipoCampo = 'texto' | 'textarea' | 'email' | 'telefono' | 'documento' | 'select' | 'checkbox';
export interface Campo { id: string; tipo: TipoCampo; etiqueta: string; requerido: boolean; placeholder?: string; opciones?: string[]; paso?: number }
export interface Formulario { pasos: string[]; campos: Campo[]; boton: string }
export interface LandingContenido {
  badge: string; titulo: string; destacado: string; descripcion: string; imagenUrl: string; logoUrl: string;
  fecha: string; lugar: string; tema: 'azul' | 'oscuro' | 'claro'; ctaTexto: string; formTitulo: string; formSubtitulo: string;
  exitoTitulo: string; exitoMensaje: string; beneficiosTitulo: string; beneficios: { titulo: string; texto: string }[];
  agendaTitulo: string; agenda: { hora: string; titulo: string; texto: string }[]; faqs: { p: string; r: string }[]; whatsappTexto: string;
}
export interface LandingPublica {
  nombre: string; slug: string; plantilla: 'evento' | 'oferta' | 'captacion'; estado: 'BORRADOR' | 'PUBLICADA';
  contenido: LandingContenido; formulario: Formulario;
}

const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

export async function getLanding(slug: string, preview?: string): Promise<LandingPublica | null> {
  if (!MARCA_ID) return null;
  try {
    const q = new URLSearchParams({ marcaId: MARCA_ID, ...(preview ? { preview } : {}) });
    const res = await fetch(`${API_URL}/public/landings/${encodeURIComponent(slug)}?${q}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return ((await res.json())?.data ?? null) as LandingPublica | null;
  } catch {
    return null;
  }
}

/** Las imágenes subidas desde el dashboard vienen como /uploads/…: se sirven desde la API. */
export const imagenLanding = (u: string) => (u.startsWith('/uploads/') ? `${API_URL}${u}` : u);
