/*
 * Tarjeta física (de presentación) en SVG: frente y reverso, 1050 × 600 px = 3,5 × 2 in a 300 dpi. Se descarga en SVG
 * (vectorial, para imprenta) o en PNG. Las imágenes (foto, logo, QR) van incrustadas, así el archivo es autosuficiente.
 * El estilo es el mismo de la página pública /tarjeta/<enlace>.
 */
import type { EstiloTarjeta } from './tarjetaGrafica';

export const ANCHO = 1050;
export const ALTO = 600;
export type Lado = 'frente' | 'reverso';

export interface DatosFisica {
  nombre: string;
  cargo?: string | null;
  area?: string | null;
  empresa: string;
  telefono?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  web?: string | null;
  fotoUrl?: string | null;
  /** Enlace de la tarjeta digital (sale en el reverso, junto al QR). */
  url?: string;
}
export interface OpcionesFisica {
  qrSvg: string | null;
  /** Logo de la marca (URL); sin él, el de FPTecnologi. */
  logoUrl?: string | null;
  /** Colores de la marca para el reverso; sin ellos, los del estilo. */
  colorMarca?: string | null;
  colorMarca2?: string | null;
  resolver?: (u: string) => string;
}

interface Tema { fondo: string; panel: string | null; texto: string; suave: string; acento: string; aro: string; oscuro: boolean; defs: string }

const grad = (id: string, x1: number, y1: number, x2: number, y2: number, paradas: [number, string][]) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${paradas.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;

const TEMAS: Record<EstiloTarjeta, Tema> = {
  clasico: { fondo: '#ffffff', panel: 'url(#gp)', texto: '#0b1b26', suave: '#5b6b78', acento: '#107acc', aro: '#ffffff', oscuro: false, defs: grad('gp', 0, 0, 360, ALTO, [[0, '#2898ee'], [1, '#107acc']]) },
  moderno: { fondo: 'url(#gf)', panel: null, texto: '#ffffff', suave: 'rgba(255,255,255,.85)', acento: '#ffffff', aro: '#ffffff', oscuro: true, defs: grad('gf', 0, ALTO, ANCHO, 0, [[0, '#0c60a1'], [0.55, '#2898ee'], [1, '#81c4f8']]) },
  oscuro: { fondo: '#0b1b26', panel: 'url(#gp)', texto: '#ffffff', suave: 'rgba(255,255,255,.7)', acento: '#81c4f8', aro: '#2898ee', oscuro: true, defs: grad('gp', 0, 0, 360, ALTO, [[0, '#0e3858'], [1, '#0b1b26']]) },
  minimal: { fondo: '#ffffff', panel: null, texto: '#0b1b26', suave: '#5b6b78', acento: '#2898ee', aro: '#2898ee', oscuro: false, defs: '' },
};

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** Recorte aproximado por cantidad de letras (sin medir el texto): `px` de ancho a `tam` px de letra. */
const corta = (t: string, px: number, tam: number) => {
  const max = Math.max(4, Math.floor(px / (tam * 0.56)));
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
};

/** Descarga una imagen y la devuelve como data URI (null si no se puede leer). */
async function aDataUrl(url: string): Promise<string | null> {
  if (url.startsWith('data:')) return url;
  try {
    const r = await fetch(url, { mode: 'cors' });
    if (!r.ok) return null;
    const b = await r.blob();
    return await new Promise<string | null>((ok) => { const fr = new FileReader(); fr.onload = () => ok(String(fr.result)); fr.onerror = () => ok(null); fr.readAsDataURL(b); });
  } catch { return null; }
}

const FUENTE = "font-family=\"Montserrat, 'Helvetica Neue', Arial, sans-serif\"";

export async function tarjetaFisicaSvg(estilo: EstiloTarjeta, d: DatosFisica, lado: Lado, o: OpcionesFisica): Promise<string> {
  const t = TEMAS[estilo];
  const r = o.resolver ?? ((u: string) => u);
  const [foto, logo] = await Promise.all([
    lado === 'frente' && d.fotoUrl ? aDataUrl(r(d.fotoUrl)) : Promise.resolve(null),
    lado === 'reverso' ? aDataUrl(o.logoUrl ? r(o.logoUrl) : '/logo-fptecnologi.svg') : Promise.resolve(null),
  ]);
  const inicial = esc((d.nombre || '?').trim().charAt(0).toUpperCase());
  const marcaDefs = lado === 'reverso' && o.colorMarca ? grad('gm', 0, 0, ANCHO, ALTO, [[0, o.colorMarca], [1, o.colorMarca2 || o.colorMarca]]) : '';
  const blanco = '<filter id="blanco"><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/></filter>';
  let cuerpo = '';

  if (lado === 'frente') {
    const conPanel = !!t.panel;
    cuerpo += `<rect width="${ANCHO}" height="${ALTO}" fill="${t.fondo}"/>`;
    if (conPanel) cuerpo += `<rect width="360" height="${ALTO}" fill="${t.panel}"/>`;
    if (estilo === 'minimal') cuerpo += `<rect width="${ANCHO}" height="14" fill="#2898ee"/>`;
    const cx = conPanel ? 180 : 140;
    const cy = conPanel ? 250 : 170;
    const rad = conPanel ? 118 : 96;
    cuerpo += `<clipPath id="cf"><circle cx="${cx}" cy="${cy}" r="${rad}"/></clipPath>`;
    cuerpo += foto
      ? `<image href="${foto}" x="${cx - rad}" y="${cy - rad}" width="${rad * 2}" height="${rad * 2}" preserveAspectRatio="xMidYMin slice" clip-path="url(#cf)"/>`
      : `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="rgba(255,255,255,.22)"/><text x="${cx}" y="${cy + rad * 0.33}" text-anchor="middle" font-size="${rad}" font-weight="700" fill="${estilo === 'minimal' ? '#2898ee' : '#ffffff'}" ${FUENTE}>${inicial}</text>`;
    cuerpo += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="${t.aro}" stroke-width="8"/>`;
    if (conPanel) cuerpo += `<text x="180" y="520" text-anchor="middle" font-size="22" font-weight="600" fill="${estilo === 'clasico' ? 'rgba(255,255,255,.9)' : t.suave}" ${FUENTE}>${esc(corta(d.empresa, 300, 22))}</text>`;

    const x = conPanel ? 420 : 280;
    const ancho = ANCHO - x - 60;
    let y = conPanel ? 150 : 140;
    cuerpo += `<text x="${x}" y="${y}" font-size="54" font-weight="700" fill="${t.texto}" ${FUENTE}>${esc(corta(d.nombre, ancho, 54))}</text>`;
    if (d.cargo) { y += 44; cuerpo += `<text x="${x}" y="${y}" font-size="28" font-weight="500" fill="${t.suave}" ${FUENTE}>${esc(corta(d.cargo, ancho, 28))}</text>`; }
    if (d.area) { y += 38; cuerpo += `<text x="${x}" y="${y}" font-size="24" font-weight="700" fill="${t.acento}" ${FUENTE}>${esc(corta(d.area, ancho, 24))}</text>`; }
    if (!conPanel) { y += 36; cuerpo += `<text x="${x}" y="${y}" font-size="22" font-style="italic" font-weight="500" fill="${t.suave}" ${FUENTE}>${esc(corta(d.empresa, ancho, 22))}</text>`; }
    const lineas = [
      d.whatsapp ? `WhatsApp  +${d.whatsapp}` : d.telefono ? `Tel.  ${d.telefono}` : '',
      d.email ?? '',
      d.web ? d.web.replace(/^https?:\/\//, '').replace(/\/$/, '') : '',
    ].filter(Boolean);
    let yy = Math.max(y + 70, 360);
    for (const l of lineas) {
      cuerpo += `<circle cx="${x + 8}" cy="${yy - 8}" r="6" fill="${t.acento}"/><text x="${x + 30}" y="${yy}" font-size="25" font-weight="500" fill="${t.texto}" ${FUENTE}>${esc(corta(l, ancho - 40, 25))}</text>`;
      yy += 46;
    }
  } else {
    // Reverso: fondo de la marca (o del estilo), logo, QR grande y el enlace.
    const fondoMarca = marcaDefs ? 'url(#gm)' : t.panel ?? t.fondo;
    cuerpo += `<rect width="${ANCHO}" height="${ALTO}" fill="${fondoMarca}"/>`;
    const sobreOscuro = marcaDefs ? true : t.panel ? true : t.oscuro;
    const tinta = sobreOscuro ? '#ffffff' : t.texto;
    const suave = sobreOscuro ? 'rgba(255,255,255,.8)' : t.suave;
    if (!sobreOscuro && estilo === 'minimal') cuerpo += `<rect width="${ANCHO}" height="14" fill="#2898ee"/>`;
    if (logo) cuerpo += `<image href="${logo}" x="70" y="150" width="400" height="110" preserveAspectRatio="xMinYMid meet"${sobreOscuro ? ' filter="url(#blanco)"' : ''}/>`;
    cuerpo += `<text x="70" y="330" font-size="30" font-weight="700" fill="${tinta}" ${FUENTE}>${esc(corta(d.empresa, 420, 30))}</text>`;
    cuerpo += `<text x="70" y="378" font-size="24" font-weight="500" fill="${suave}" ${FUENTE}>Escanea para abrir mi tarjeta digital</text>`;
    if (d.url) cuerpo += `<text x="70" y="520" font-size="22" font-weight="600" fill="${tinta}" ${FUENTE}>${esc(corta(d.url.replace(/^https?:\/\//, ''), 520, 22))}</text>`;
    if (o.qrSvg) {
      const q = 320;
      const qx = ANCHO - q - 90;
      const qy = (ALTO - q) / 2;
      cuerpo += `<rect x="${qx - 24}" y="${qy - 24}" width="${q + 48}" height="${q + 48}" rx="28" fill="#ffffff"/>`;
      cuerpo += `<image href="data:image/svg+xml;charset=utf-8,${encodeURIComponent(o.qrSvg)}" x="${qx}" y="${qy}" width="${q}" height="${q}"/>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${ALTO}" viewBox="0 0 ${ANCHO} ${ALTO}"><defs>${t.defs}${marcaDefs}${blanco}</defs>${cuerpo}</svg>`;
}

export const svgADataUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

function guardar(blob: Blob, nombre: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}
export const descargarFisicaSvg = (svg: string, nombre: string) => guardar(new Blob([svg], { type: 'image/svg+xml' }), `${nombre}.svg`);

export function descargarFisicaPng(svg: string, nombre: string): Promise<void> {
  return new Promise((ok, no) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = ANCHO; c.height = ALTO;
      const ctx = c.getContext('2d');
      if (!ctx) return no(new Error('Sin lienzo'));
      ctx.drawImage(img, 0, 0, ANCHO, ALTO);
      c.toBlob((b) => { if (!b) return no(new Error('Sin imagen')); guardar(b, `${nombre}.png`); ok(); }, 'image/png');
    };
    img.onerror = () => no(new Error('No se pudo generar la imagen'));
    img.src = svgADataUrl(svg);
  });
}
