import type { Metadata } from 'next';
import { getPagina, type PaginasContenido } from './paginasContenido';
import type { Sitio } from './sitio';

/** Título y descripción de la página; si el dashboard (Web informativa → SEO) guardó otros, reemplazan a los base. */
export async function metaSeo(pagina: keyof PaginasContenido['seo'], base: Metadata = {}): Promise<Metadata> {
  const s = (await getPagina('seo'))[pagina];
  return {
    ...base,
    ...(s.titulo.trim() ? { title: pagina === 'home' ? { absolute: s.titulo.trim() } : s.titulo.trim() } : {}),
    ...(s.descripcion.trim() ? { description: s.descripcion.trim() } : {}),
  };
}

const SITE = process.env.SITE_URL ?? 'https://fptecnologi.com';

/** Imagen al compartir enlaces (WhatsApp, redes): el logo en PNG 1200×630, porque WhatsApp y Facebook no leen SVG. */
export const OG_LOGO = { url: '/og-fptecnologi.png', width: 1200, height: 630, alt: 'FPTecnologi & System' };
/** Una página que define su propio openGraph reemplaza al del layout completo: estos campos se repiten ahí. */
export const OG_BASE = { siteName: 'FPTecnologi & System', locale: 'es_PE' };

/** Organización (GEO y SEO local): quién es FPTecnologi, qué ofrece, dónde está y sus redes. Usa los datos vigentes del dashboard. */
export function organizacionJsonLd(sitio: Sitio) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE}/#organizacion`,
      name: 'FPTecnologi & System',
      url: SITE,
      logo: `${SITE}/logo-fptecnologi.svg`,
      description: 'Equipamiento TI y soluciones tecnológicas para empresas: seguridad, videoconferencia, servidores, data centers y más. Distribución autorizada de las principales marcas, con tienda B2B y servicios a medida.',
      email: sitio.contact.email,
      telephone: sitio.contact.phoneVentas,
      address: { '@type': 'PostalAddress', streetAddress: sitio.contact.address, addressCountry: 'PE' },
      areaServed: { '@type': 'Country', name: 'Perú' },
      knowsLanguage: 'es-PE',
      sameAs: sitio.social.filter((r) => r.red !== 'whatsapp').map((r) => r.href),
      contactPoint: [{ '@type': 'ContactPoint', contactType: 'ventas', telephone: sitio.contact.phoneVentas, email: sitio.contact.email, areaServed: 'PE', availableLanguage: 'es' }],
    },
    { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE}/#sitio`, url: SITE, name: 'FPTecnologi & System', inLanguage: 'es-PE', publisher: { '@id': `${SITE}/#organizacion` } },
  ];
}
