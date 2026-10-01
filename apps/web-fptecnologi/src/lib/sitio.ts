/*
 * Ajustes generales del sitio (contacto, redes, cifras, tipo de cambio, WhatsApp) editables desde el dashboard
 * (Web informativa → Ajustes del sitio). Los componentes cliente los leen con useSitio(); el servidor con getSitio().
 * Si la API no responde salen los valores de content.ts.
 */
import { SOCIAL_LINKS } from './content';
import { fijarSitio } from './chatActions';
import { getPagina, type PaginasContenido } from './paginasContenido';

export type Sitio = {
  contact: { address: string; phoneVentas: string; phoneVentasWeb: string; email: string };
  social: { red: (typeof SOCIAL_LINKS)[number]['red']; label: string; href: string }[];
  stats: { value: number; suffix: string; label: string }[];
  tipoCambio: number;
  whatsapp: string;
};

export function sitioDe(c: PaginasContenido['sitio']): Sitio {
  const { contacto, redes, cifras, cambio } = c;
  const tc = Number(String(cambio.tipoCambio).replace(',', '.'));
  return {
    contact: { address: contacto.direccion, phoneVentas: contacto.telefonoVentas, phoneVentasWeb: contacto.telefonoWeb, email: contacto.correo },
    // ponytail: una red con enlace vacío se oculta; no se pueden agregar redes nuevas sin tocar el código (ícono).
    social: SOCIAL_LINKS.map((r) => ({ red: r.red, label: r.label, href: String(redes[r.red] ?? '').trim() })).filter((r) => r.href),
    stats: (cifras.items ?? []).filter((i) => i.title || i.text).map((i) => {
      const m = i.title.trim().match(/^(\d+)(.*)$/);
      return { value: m ? Number(m[1]) : 0, suffix: m ? m[2] : i.title, label: i.text };
    }),
    tipoCambio: Number.isFinite(tc) && tc > 0 ? tc : 3.75,
    whatsapp: contacto.whatsapp.replace(/\D/g, '') || '51908856286',
  };
}

export async function getSitio(): Promise<Sitio> {
  const s = sitioDe((await getPagina('sitio')) as PaginasContenido['sitio']);
  fijarSitio(s); // el servidor atiende una sola marca: whatsappHref() usa el último contacto leído
  return s;
}
