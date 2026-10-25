import { createHash } from 'node:crypto';

/** Navegadores automáticos (buscadores, vistas previas de enlaces, monitores): no son visitas de personas. */
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp\/|preview|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch|go-http|java\//i;

export const esBot = (ua: string) => !ua || BOT.test(ua);

export function dispositivoDe(ua: string): 'movil' | 'tablet' | 'escritorio' {
  if (/iPad|Tablet|Android(?!.*Mobile)/i.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return 'movil';
  return 'escritorio';
}

/** Solo el path (sin ?query ni #), y nada de rutas internas o archivos. `null` = no se cuenta. */
export function rutaLimpia(ruta: string): string | null {
  const path = (ruta || '').split(/[?#]/)[0]!.trim();
  if (!path.startsWith('/') || path.startsWith('//')) return null;
  if (/^\/(api|_next)(\/|$)/.test(path) || /\.[a-z0-9]{2,5}$/i.test(path)) return null;
  const sinBarra = path.length > 1 ? path.replace(/\/+$/, '') : path;
  return sinBarra.slice(0, 200) || '/';
}

const CONOCIDOS: [RegExp, string][] = [
  [/(^|\.)google\./, 'google'],
  [/(^|\.)bing\.com$/, 'bing'],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, 'facebook'],
  [/(^|\.)instagram\.com$/, 'instagram'],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, 'whatsapp'],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, 'linkedin'],
  [/(^|\.)tiktok\.com$/, 'tiktok'],
  [/(^|\.)(youtube\.com|youtu\.be)$/, 'youtube'],
  [/(^|\.)(t\.co|x\.com|twitter\.com)$/, 'x'],
  [/(^|\.)(chatgpt\.com|openai\.com)$/, 'chatgpt'],
];

const sinWww = (h: string) => h.toLowerCase().replace(/^www\./, '');

/**
 * De dónde llegó la visita. Prioridad: `utm_source` del enlace → sitio que lo refirió (redes y buscadores con nombre
 * propio; cualquier otro, su dominio) → `directo`. Navegar dentro de la misma web es `interno` (no es una visita nueva).
 */
export function origenDe(referrer: string, host: string, utm?: string): string {
  const fuente = (utm || '').toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 40);
  if (fuente) return CONOCIDOS.find(([re]) => re.test(`${fuente}.com`))?.[1] ?? (fuente === 'fb' ? 'facebook' : fuente === 'ig' ? 'instagram' : fuente === 'wa' ? 'whatsapp' : fuente);
  let ref: string;
  try { ref = sinWww(new globalThis.URL(referrer).hostname); } catch { return 'directo'; }
  if (!ref) return 'directo';
  if (host && ref === sinWww(host.split(':')[0]!)) return 'interno';
  return CONOCIDOS.find(([re]) => re.test(ref))?.[1] ?? ref.slice(0, 60);
}

/** Identificador anónimo del visitante, válido solo ese día: no guarda la IP y no se puede seguir a nadie entre días. */
export function visitanteDe(ip: string, ua: string, dia: string): string {
  const sal = process.env.VISITAS_SAL || process.env.JWT_ACCESS_SECRET || 'fptecnologi-hub';
  return createHash('sha256').update(`${sal}|${dia}|${ip}|${ua}`).digest('hex').slice(0, 24);
}

/** Perú no cambia de horario: UTC−5 todo el año. */
const LIMA_MS = 5 * 3600_000;
export const diaLima = (d: Date) => new Date(d.getTime() - LIMA_MS).toISOString().slice(0, 10);
/** Inicio (en UTC) del día de Lima de hace `atras` días. */
export function inicioDiaLima(atras: number, ahora = new Date()): Date {
  const [y, m, d] = diaLima(ahora).split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d - atras) + LIMA_MS);
}
