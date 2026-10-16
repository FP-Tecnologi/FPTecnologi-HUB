/* Qué datos y bloques de la tarjeta digital puede mostrar u ocultar cada persona (mismas claves que la API). */
import type { Tarjeta } from '../screens/pages/MiTarjeta';

export type CampoMostrar = 'foto' | 'cargo' | 'area' | 'bio' | 'telefono' | 'whatsapp' | 'email' | 'linkedin' | 'web' | 'agenda' | 'enlaces' | 'cotizar' | 'vcard' | 'compartir' | 'qr';

export const GRUPOS_MOSTRAR: { titulo: string; campos: { id: CampoMostrar; etiqueta: string }[] }[] = [
  {
    titulo: 'Tu perfil',
    campos: [
      { id: 'cargo', etiqueta: 'Cargo' },
      { id: 'area', etiqueta: 'Área' },
      { id: 'bio', etiqueta: 'Presentación corta' },
    ],
  },
  {
    titulo: 'Cómo contactarte',
    campos: [
      { id: 'whatsapp', etiqueta: 'WhatsApp' },
      { id: 'telefono', etiqueta: 'Teléfono' },
      { id: 'email', etiqueta: 'Correo' },
      { id: 'agenda', etiqueta: 'Agendar una reunión' },
      { id: 'linkedin', etiqueta: 'LinkedIn' },
      { id: 'web', etiqueta: 'Sitio web' },
      { id: 'enlaces', etiqueta: 'Enlaces extra' },
    ],
  },
  {
    titulo: 'Botones y bloques',
    campos: [
      { id: 'cotizar', etiqueta: 'Botón «Pide una cotización»' },
      { id: 'vcard', etiqueta: 'Botón «Guardar contacto»' },
      { id: 'compartir', etiqueta: 'Botón «Compartir»' },
      { id: 'qr', etiqueta: 'Código QR' },
    ],
  },
];

/** La tarjeta como la verá el público: sin lo que se ocultó (misma regla que aplica la API). */
export function aplicarMostrar(t: Tarjeta): Tarjeta {
  const m = t.mostrar ?? {};
  const r = { ...t };
  if (m.cargo === false) r.cargo = null;
  if (m.area === false) r.area = null;
  if (m.bio === false) r.bio = null;
  if (m.telefono === false) r.telefono = null;
  if (m.whatsapp === false) r.whatsapp = null;
  if (m.email === false) r.email = null;
  if (m.linkedin === false) r.linkedin = null;
  if (m.web === false) r.web = null;
  if (m.agenda === false) r.agendaUrl = null;
  if (m.enlaces === false) r.enlaces = [];
  return r;
}

const luz = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Contraste entre dos colores #rrggbb (1 a 21) y si el QR quedó «invertido» (puntos más claros que el fondo). */
export function contrasteQr(color: string, fondo: string) {
  const a = luz(color);
  const b = luz(fondo);
  return { ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), invertido: a > b };
}
