/*
 * Tarjeta física (de presentación) en SVG: frente y reverso, 1050 × 600 px = 3,5 × 2 in a 300 dpi. Se descarga en SVG
 * (vectorial, para imprenta) o en PNG. Las imágenes (foto, logo, QR) van incrustadas, así el archivo es autosuficiente.
 * El estilo es el mismo de la página pública /tarjeta/<enlace> y los colores salen de la marca (FPTecnologi, Quamtu…).
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
  /** Colores de la marca; sin ellos, la paleta base de FPTecnologi. */
  colorMarca?: string | null;
  colorMarca2?: string | null;
  resolver?: (u: string) => string;
}

// ---- color: mezclas en hexadecimal (el SVG se rasteriza sin CSS, así que no se usa color-mix) ----
const aRgb = (h: string): [number, number, number] => {
  const x = h.replace('#', '');
  const n = parseInt(x.length === 3 ? x.split('').map((c) => c + c).join('') : x.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const aHex = (r: number, g: number, b: number) => `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
/** `pct` % de `a` y el resto de `b`. */
const mezcla = (a: string, pct: number, b: string) => {
  const [r1, g1, b1] = aRgb(a); const [r2, g2, b2] = aRgb(b);
  const k = pct / 100;
  return aHex(r1 * k + r2 * (1 - k), g1 * k + g2 * (1 - k), b1 * k + b2 * (1 - k));
};
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

interface Tema { fondo: string; panel: string | null; texto: string; suave: string; acento: string; aro: string; oscuro: boolean; defs: string; punto: string }

const grad = (id: string, x1: number, y1: number, x2: number, y2: number, paradas: [number, string][]) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${paradas.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;

function temas(p: string, s: string): Record<EstiloTarjeta, Tema> {
  const tinta = mezcla(s, 28, '#000000');
  return {
    clasico: { fondo: '#ffffff', panel: 'url(#gp)', texto: tinta, suave: '#5b6b78', acento: mezcla(p, 55, s), aro: '#ffffff', oscuro: false, punto: mezcla(p, 22, '#ffffff'), defs: grad('gp', 0, 0, 360, ALTO, [[0, p], [1, mezcla(p, 55, s)]]) },
    moderno: { fondo: 'url(#gf)', panel: null, texto: '#ffffff', suave: 'rgba(255,255,255,.88)', acento: '#ffffff', aro: '#ffffff', oscuro: true, punto: '#ffffff', defs: grad('gf', 0, ALTO, ANCHO, 0, [[0, s], [0.55, p], [1, mezcla(p, 45, '#ffffff')]]) },
    oscuro: { fondo: mezcla(s, 30, '#000000'), panel: 'url(#gp)', texto: '#ffffff', suave: 'rgba(255,255,255,.72)', acento: mezcla(p, 60, '#ffffff'), aro: p, oscuro: true, punto: '#ffffff', defs: grad('gp', 0, 0, 360, ALTO, [[0, mezcla(s, 62, '#000000')], [1, mezcla(s, 30, '#000000')]]) },
    minimal: { fondo: '#ffffff', panel: null, texto: tinta, suave: '#5b6b78', acento: p, aro: p, oscuro: false, punto: mezcla(p, 25, '#ffffff'), defs: '' },
  };
}

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

/** Puntos de la marca como textura de fondo (los mismos que usa la web). */
const puntos = (id: string, color: string, opacidad: number, paso = 26) =>
  `<pattern id="${id}" width="${paso}" height="${paso}" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2.2" fill="${color}" fill-opacity="${opacidad}"/></pattern>`;

export async function tarjetaFisicaSvg(estilo: EstiloTarjeta, d: DatosFisica, lado: Lado, o: OpcionesFisica): Promise<string> {
  const primario = o.colorMarca && HEX.test(o.colorMarca) ? o.colorMarca : '#2898ee';
  const secundario = o.colorMarca2 && HEX.test(o.colorMarca2) ? o.colorMarca2 : o.colorMarca && HEX.test(o.colorMarca) ? mezcla(o.colorMarca, 62, '#000000') : '#0c60a1';
  const t = temas(primario, secundario)[estilo];
  const r = o.resolver ?? ((u: string) => u);
  const [foto, logo] = await Promise.all([
    lado === 'frente' && d.fotoUrl ? aDataUrl(r(d.fotoUrl)) : Promise.resolve(null),
    aDataUrl(o.logoUrl ? r(o.logoUrl) : '/logo-fptecnologi.svg'),
  ]);
  const inicial = esc((d.nombre || '?').trim().charAt(0).toUpperCase());
  const blanco = '<filter id="blanco"><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/></filter>';
  const gm = grad('gm', 0, 0, ANCHO, ALTO, [[0, primario], [1, secundario]]);
  let cuerpo = '';
  let extraDefs = '';

  if (lado === 'frente') {
    const conPanel = !!t.panel;
    cuerpo += `<rect width="${ANCHO}" height="${ALTO}" fill="${t.fondo}"/>`;
    // Textura de puntos en la zona clara (o en todo el fondo si no hay panel) y logo en marca de agua.
    extraDefs += puntos('pf', t.punto, t.oscuro && !conPanel ? 0.16 : 0.55);
    cuerpo += `<rect x="${conPanel ? 360 : 0}" width="${conPanel ? ANCHO - 360 : ANCHO}" height="${ALTO}" fill="url(#pf)"/>`;
    if (logo) cuerpo += `<image href="${logo}" x="${ANCHO - 400}" y="${ALTO - 250}" width="420" height="260" preserveAspectRatio="xMaxYMax meet" opacity="${t.oscuro && !conPanel ? 0.10 : 0.07}"${t.oscuro && !conPanel ? ' filter="url(#blanco)"' : ''}/>`;
    if (conPanel) {
      cuerpo += `<rect width="360" height="${ALTO}" fill="${t.panel}"/>`;
      extraDefs += puntos('pp', '#ffffff', 0.14, 22);
      cuerpo += `<rect width="360" height="${ALTO}" fill="url(#pp)"/>`;
    }
    if (estilo === 'minimal') cuerpo += `<rect width="${ANCHO}" height="14" fill="${primario}"/>`;
    const cx = conPanel ? 180 : 140;
    const cy = conPanel ? 250 : 170;
    const rad = conPanel ? 118 : 96;
    cuerpo += `<clipPath id="cf"><circle cx="${cx}" cy="${cy}" r="${rad}"/></clipPath>`;
    cuerpo += foto
      ? `<image href="${foto}" x="${cx - rad}" y="${cy - rad}" width="${rad * 2}" height="${rad * 2}" preserveAspectRatio="xMidYMin slice" clip-path="url(#cf)"/>`
      : `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="rgba(255,255,255,.22)"/><text x="${cx}" y="${cy + rad * 0.33}" text-anchor="middle" font-size="${rad}" font-weight="700" fill="${estilo === 'minimal' ? primario : '#ffffff'}" ${FUENTE}>${inicial}</text>`;
    cuerpo += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="${t.aro}" stroke-width="8"/>`;
    if (conPanel) cuerpo += `<text x="180" y="520" text-anchor="middle" font-size="22" font-weight="600" fill="${estilo === 'clasico' ? 'rgba(255,255,255,.92)' : t.suave}" ${FUENTE}>${esc(corta(d.empresa, 300, 22))}</text>`;

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
    // Reverso: fondo de la marca con puntos y el logo grande en marca de agua, logo, QR y el enlace.
    const sobreOscuro = estilo !== 'minimal';
    cuerpo += `<rect width="${ANCHO}" height="${ALTO}" fill="${sobreOscuro ? 'url(#gm)' : '#ffffff'}"/>`;
    extraDefs += puntos('pr', sobreOscuro ? '#ffffff' : t.punto, sobreOscuro ? 0.16 : 0.6);
    cuerpo += `<rect width="${ANCHO}" height="${ALTO}" fill="url(#pr)"/>`;
    if (logo) cuerpo += `<image href="${logo}" x="-40" y="-60" width="620" height="420" preserveAspectRatio="xMinYMin meet" opacity="0.07"${sobreOscuro ? ' filter="url(#blanco)"' : ''}/>`;
    if (!sobreOscuro) cuerpo += `<rect width="${ANCHO}" height="14" fill="${primario}"/>`;
    const tinta = sobreOscuro ? '#ffffff' : t.texto;
    const suave = sobreOscuro ? 'rgba(255,255,255,.82)' : t.suave;
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

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${ALTO}" viewBox="0 0 ${ANCHO} ${ALTO}"><defs>${t.defs}${gm}${extraDefs}${blanco}</defs>${cuerpo}</svg>`;
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
