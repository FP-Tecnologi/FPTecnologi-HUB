/* Tarjeta digital del equipo comercial: limpieza de datos y vCard. Sin acceso a la base (se prueba aparte). */

export const MAX_ENLACES = 12;

export const VISTAS = ['perfil', 'linktree'] as const;
export type VistaTarjeta = (typeof VISTAS)[number];

export const ESTILOS = ['clasico', 'moderno', 'oscuro', 'minimal'] as const;
export type EstiloTarjeta = (typeof ESTILOS)[number];

/** Qué le falta a una tarjeta para estar completa y qué hacer (se muestra en el dashboard). */
export function faltantes(t: { fotoUrl?: string | null; cargo?: string | null; bio?: string | null; whatsapp?: string | null; telefono?: string | null; email?: string | null }) {
  const f: { campo: string; aviso: string }[] = [];
  if (!t.fotoUrl) f.push({ campo: 'foto', aviso: 'Agrega tu foto: en «Mi tarjeta digital» pulsa «Subir foto». Las tarjetas con foto generan más confianza.' });
  if (!t.cargo) f.push({ campo: 'cargo', aviso: 'Escribe tu cargo para que el cliente sepa quién eres.' });
  if (!t.bio) f.push({ campo: 'bio', aviso: 'Agrega una presentación corta de lo que haces.' });
  if (!t.whatsapp && !t.telefono) f.push({ campo: 'contacto', aviso: 'Agrega tu WhatsApp o teléfono para que te puedan contactar.' });
  if (!t.email) f.push({ campo: 'email', aviso: 'Agrega tu correo de contacto.' });
  return f;
}


/** Datos y bloques que cada persona puede mostrar u ocultar en su tarjeta pública. */
export const CAMPOS_MOSTRAR = ['foto', 'cargo', 'area', 'bio', 'telefono', 'whatsapp', 'email', 'linkedin', 'web', 'agenda', 'enlaces', 'cotizar', 'vcard', 'compartir', 'qr'] as const;
export type CampoMostrar = (typeof CAMPOS_MOSTRAR)[number];
export type Mostrar = Partial<Record<CampoMostrar, boolean>>;

/** Solo claves conocidas con valor booleano; se guarda únicamente lo que está oculto (false). */
export function limpiarMostrar(v: unknown): Mostrar {
  const out: Mostrar = {};
  if (!v || typeof v !== 'object') return out;
  for (const k of CAMPOS_MOSTRAR) if ((v as Record<string, unknown>)[k] === false) out[k] = false;
  return out;
}

/** Quita de la tarjeta lo que su dueño decidió no mostrar (para la web pública, la vCard y el QR). */
export function aplicarMostrar<T extends { fotoUrl?: string | null; cargo?: string | null; area?: string | null; bio?: string | null; telefono?: string | null; whatsapp?: string | null; email?: string | null; linkedin?: string | null; web?: string | null; agendaUrl?: string | null; enlaces?: unknown }>(t: T, m: unknown): T {
  const o = limpiarMostrar(m);
  const r = { ...t };
  if (o.foto === false) r.fotoUrl = null;
  if (o.cargo === false) r.cargo = null;
  if (o.area === false) r.area = null;
  if (o.bio === false) r.bio = null;
  if (o.telefono === false) r.telefono = null;
  if (o.whatsapp === false) r.whatsapp = null;
  if (o.email === false) r.email = null;
  if (o.linkedin === false) r.linkedin = null;
  if (o.web === false) r.web = null;
  if (o.agenda === false) r.agendaUrl = null;
  if (o.enlaces === false) r.enlaces = [];
  return r;
}

/** #rrggbb válido, null si está vacío, undefined si no es un color. */
export function limpiarColor(c: string | null | undefined): string | null | undefined {
  const t = (c ?? '').trim();
  if (!t) return null;
  return /^#[0-9a-fA-F]{6}$/.test(t) ? t.toLowerCase() : undefined;
}

/** Enlaces que no puede tomar una persona (rutas propias de la web). */
export const SLUGS_RESERVADOS = ['vista-previa'];

export interface EnlaceTarjeta {
  titulo: string;
  url: string;
}

/** «María Pérez» → «maria-perez» (para /tarjeta/maria-perez). */
export function slugDe(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');
}

export const SLUG_VALIDO = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Solo http(s) o una ruta /uploads/… (nunca javascript:, data:, etc.). Devuelve null si está vacía; undefined si no es válida. */
export function limpiarUrl(u: string | null | undefined, permitirUploads = false): string | null | undefined {
  const t = (u ?? '').trim();
  if (!t) return null;
  if (/^https?:\/\/[^\s]+$/i.test(t) && t.length <= 500) return t;
  if (permitirUploads && /^\/uploads\/[\w./-]+$/.test(t)) return t;
  return undefined;
}

export const soloDigitos = (t: string | null | undefined) => (t ?? '').replace(/\D/g, '').slice(0, 15) || null;

export function limpiarEnlaces(lista: unknown): EnlaceTarjeta[] | undefined {
  if (!Array.isArray(lista) || lista.length > MAX_ENLACES) return undefined;
  const out: EnlaceTarjeta[] = [];
  for (const it of lista) {
    const titulo = String((it as EnlaceTarjeta)?.titulo ?? '').trim().slice(0, 60);
    const url = limpiarUrl((it as EnlaceTarjeta)?.url);
    if (!titulo && !(it as EnlaceTarjeta)?.url) continue; // fila vacía
    if (!titulo || !url) return undefined;
    out.push({ titulo, url });
  }
  return out;
}

const esc = (t: string) => t.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[;,]/g, (c) => `\\${c}`);

export interface DatosVcard {
  nombre: string;
  cargo?: string | null;
  empresa: string;
  telefono?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  web?: string | null;
  linkedin?: string | null;
  urlTarjeta: string;
}

/** vCard 3.0 (la abren iPhone, Android y Outlook para «Guardar contacto»). */
export function vcard(d: DatosVcard): string {
  const partes = d.nombre.trim().split(/\s+/);
  const apellido = partes.length > 1 ? partes.slice(-1)[0] : '';
  const nombres = partes.length > 1 ? partes.slice(0, -1).join(' ') : partes[0];
  const lineas = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${esc(apellido)};${esc(nombres)};;;`,
    `FN:${esc(d.nombre)}`,
    `ORG:${esc(d.empresa)}`,
    d.cargo ? `TITLE:${esc(d.cargo)}` : '',
    d.telefono ? `TEL;TYPE=WORK,VOICE:${d.telefono.replace(/[^\d+ ]/g, '')}` : '',
    d.whatsapp ? `TEL;TYPE=CELL:+${d.whatsapp}` : '',
    d.email ? `EMAIL;TYPE=WORK:${d.email}` : '',
    d.web ? `URL:${d.web}` : '',
    d.linkedin ? `URL;TYPE=LinkedIn:${d.linkedin}` : '',
    `URL;TYPE=Tarjeta:${d.urlTarjeta}`,
    'END:VCARD',
  ].filter(Boolean);
  return lineas.join('\r\n') + '\r\n';
}
