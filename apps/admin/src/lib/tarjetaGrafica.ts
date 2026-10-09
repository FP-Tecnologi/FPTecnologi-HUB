/*
 * Tarjeta gráfica descargable (PNG 1050 × 600 px = 3,5 × 2 in a 300 dpi) en 4 estilos, dibujada en un canvas del
 * navegador: no usa servidor ni librerías. El estilo es el mismo de la página pública /tarjeta/<enlace>.
 */
export type EstiloTarjeta = 'clasico' | 'moderno' | 'oscuro' | 'minimal';

export const ESTILOS_TARJETA: { id: EstiloTarjeta; nombre: string; detalle: string }[] = [
  { id: 'clasico', nombre: 'Clásico', detalle: 'Franja azul y fondo blanco' },
  { id: 'moderno', nombre: 'Moderno', detalle: 'Degradé azul a todo color' },
  { id: 'oscuro', nombre: 'Oscuro', detalle: 'Fondo oscuro, acentos celestes' },
  { id: 'minimal', nombre: 'Minimal', detalle: 'Blanco, limpio y sobrio' },
];

export interface DatosTarjeta {
  nombre: string;
  cargo?: string | null;
  area?: string | null;
  empresa: string;
  telefono?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  web?: string | null;
  fotoUrl?: string | null;
}

export const ANCHO = 1050;
export const ALTO = 600;

interface Tema {
  fondo: (c: CanvasRenderingContext2D) => string | CanvasGradient;
  panel: ((c: CanvasRenderingContext2D) => string | CanvasGradient) | null;
  texto: string;
  suave: string;
  acento: string;
  aro: string;
}

const degradado = (c: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, paradas: [number, string][]) => {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  paradas.forEach(([p, col]) => g.addColorStop(p, col));
  return g;
};

const TEMAS: Record<EstiloTarjeta, Tema> = {
  clasico: {
    fondo: () => '#ffffff',
    panel: (c) => degradado(c, 0, 0, 360, ALTO, [[0, '#2898ee'], [1, '#107acc']]),
    texto: '#0b1b26', suave: '#5b6b78', acento: '#107acc', aro: '#ffffff',
  },
  moderno: {
    fondo: (c) => degradado(c, 0, ALTO, ANCHO, 0, [[0, '#0c60a1'], [0.55, '#2898ee'], [1, '#81c4f8']]),
    panel: null,
    texto: '#ffffff', suave: 'rgba(255,255,255,.85)', acento: '#ffffff', aro: '#ffffff',
  },
  oscuro: {
    fondo: () => '#0b1b26',
    panel: (c) => degradado(c, 0, 0, 360, ALTO, [[0, '#0e3858'], [1, '#0b1b26']]),
    texto: '#ffffff', suave: 'rgba(255,255,255,.7)', acento: '#81c4f8', aro: '#2898ee',
  },
  minimal: {
    fondo: () => '#ffffff',
    panel: null,
    texto: '#0b1b26', suave: '#5b6b78', acento: '#2898ee', aro: '#2898ee',
  },
};

const cargarImagen = (src: string, cors = false) =>
  new Promise<HTMLImageElement | null>((ok) => {
    const img = new Image();
    if (cors) img.crossOrigin = 'anonymous';
    img.onload = () => ok(img);
    img.onerror = () => ok(null);
    img.src = src;
  });

/** Recorta la foto a un círculo (cover) y le pone un aro. */
function circulo(c: CanvasRenderingContext2D, img: HTMLImageElement | null, inicial: string, cx: number, cy: number, r: number, aro: string, tinta: string) {
  c.save();
  c.beginPath();
  c.arc(cx, cy, r, 0, Math.PI * 2);
  c.closePath();
  c.clip();
  if (img) {
    const k = Math.max((r * 2) / img.width, (r * 2) / img.height);
    const w = img.width * k;
    const h = img.height * k;
    c.drawImage(img, cx - w / 2, cy - h / 2 + (h > r * 2 ? (h - r * 2) * 0.18 : 0), w, h); // un poco hacia arriba: el rostro
  } else {
    c.fillStyle = 'rgba(255,255,255,.22)';
    c.fillRect(cx - r, cy - r, r * 2, r * 2);
    c.fillStyle = tinta;
    c.font = `700 ${r}px Montserrat, Arial, sans-serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(inicial, cx, cy + r * 0.06);
  }
  c.restore();
  c.beginPath();
  c.arc(cx, cy, r, 0, Math.PI * 2);
  c.lineWidth = 8;
  c.strokeStyle = aro;
  c.stroke();
}

function recortarTexto(c: CanvasRenderingContext2D, t: string, max: number) {
  if (c.measureText(t).width <= max) return t;
  let s = t;
  while (s.length > 1 && c.measureText(`${s}…`).width > max) s = s.slice(0, -1);
  return `${s}…`;
}

/** Dibuja la tarjeta en `canvas` (1050 × 600). `qrSvg` es el SVG que entrega la API para la tarjeta guardada. */
export async function dibujarTarjeta(canvas: HTMLCanvasElement, estilo: EstiloTarjeta, d: DatosTarjeta, qrSvg: string | null, resolverFoto: (u: string) => string = (u) => u) {
  canvas.width = ANCHO;
  canvas.height = ALTO;
  const c = canvas.getContext('2d')!;
  const t = TEMAS[estilo];
  const [foto, qr] = await Promise.all([
    d.fotoUrl ? cargarImagen(resolverFoto(d.fotoUrl), true) : Promise.resolve(null),
    qrSvg ? cargarImagen(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg)}`) : Promise.resolve(null),
  ]);

  c.fillStyle = t.fondo(c);
  c.fillRect(0, 0, ANCHO, ALTO);
  if (t.panel) { c.fillStyle = t.panel(c); c.fillRect(0, 0, 360, ALTO); }
  if (estilo === 'minimal') { c.fillStyle = '#2898ee'; c.fillRect(0, 0, ANCHO, 14); }

  // Foto
  const conPanel = !!t.panel;
  const cx = conPanel ? 180 : 140;
  const cy = conPanel ? 250 : 170;
  circulo(c, foto, (d.nombre || '?').trim().charAt(0).toUpperCase(), cx, cy, conPanel ? 118 : 96, t.aro, estilo === 'minimal' ? '#2898ee' : '#ffffff');
  if (conPanel) {
    c.fillStyle = estilo === 'clasico' ? 'rgba(255,255,255,.9)' : t.suave;
    c.font = '600 22px Montserrat, Arial, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'alphabetic';
    c.fillText(recortarTexto(c, d.empresa, 300), 180, 520);
  }

  // Texto
  const x = conPanel ? 420 : 280;
  const ancho = ANCHO - x - 60;
  c.textAlign = 'left';
  c.textBaseline = 'alphabetic';
  c.fillStyle = t.texto;
  c.font = '700 54px Montserrat, Arial, sans-serif';
  c.fillText(recortarTexto(c, d.nombre, ancho), x, conPanel ? 130 : 120);
  let y = conPanel ? 130 : 120;
  if (d.cargo) { y += 44; c.fillStyle = t.suave; c.font = '500 28px Montserrat, Arial, sans-serif'; c.fillText(recortarTexto(c, d.cargo, ancho), x, y); }
  if (d.area) { y += 38; c.fillStyle = t.acento; c.font = '700 24px Montserrat, Arial, sans-serif'; c.fillText(recortarTexto(c, d.area, ancho), x, y); }
  if (!conPanel) { y += 36; c.fillStyle = t.suave; c.font = 'italic 500 22px Montserrat, Arial, sans-serif'; c.fillText(recortarTexto(c, d.empresa, ancho), x, y); }

  // Contacto
  const lineas = [
    d.whatsapp ? `WhatsApp  +${d.whatsapp}` : d.telefono ? `Tel.  ${d.telefono}` : '',
    d.email ? d.email : '',
    d.web ? d.web.replace(/^https?:\/\//, '').replace(/\/$/, '') : '',
  ].filter(Boolean);
  c.font = '500 25px Montserrat, Arial, sans-serif';
  let yy = Math.max(y + 70, 330);
  for (const l of lineas) {
    c.fillStyle = t.acento;
    c.beginPath();
    c.arc(x + 8, yy - 8, 6, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = t.texto;
    c.fillText(recortarTexto(c, l, ancho - 190), x + 30, yy);
    yy += 46;
  }

  // QR
  if (qr) {
    const q = 150;
    const qx = ANCHO - q - 56;
    const qy = ALTO - q - 52;
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.roundRect(qx - 12, qy - 12, q + 24, q + 24, 16);
    c.fill();
    c.drawImage(qr, qx, qy, q, q);
  }
}

export function descargarCanvas(canvas: HTMLCanvasElement, nombre: string) {
  canvas.toBlob((b) => {
    if (!b) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = nombre;
    a.click();
    URL.revokeObjectURL(a.href);
  }, 'image/png');
}
