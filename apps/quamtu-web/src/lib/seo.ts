import type { Metadata } from 'next';
import { WHATSAPP } from './contacto';

export const SITIO = 'https://quamtu.com';
export const IMAGEN_SOCIAL = { url: '/og.jpg', width: 1200, height: 630, alt: 'Quamtu: equipos de cómputo a medida' };
const abs = (ruta: string) => `${SITIO}${ruta}`;

/** Metadatos de una página: canonical, Open Graph y Twitter. El título ya trae la marca (la plantilla del layout es `%s`). */
export function meta(titulo: string, descripcion: string, ruta: string, extra: Metadata = {}): Metadata {
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: ruta, languages: { 'es-PE': ruta } },
    openGraph: { title: titulo, description: descripcion, url: ruta, siteName: 'Quamtu', locale: 'es_PE', type: 'website', images: [IMAGEN_SOCIAL] },
    twitter: { card: 'summary_large_image', title: titulo, description: descripcion, images: [IMAGEN_SOCIAL.url] },
    ...extra,
  };
}

/** Páginas sin valor para buscadores (seguimiento de tickets). */
export const sinIndexar: Metadata = { robots: { index: false, follow: false } };

/** Organización (GEO): qué es Quamtu, qué vende y dónde atiende. */
export const organizacion = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITIO}/#organizacion`,
  name: 'Quamtu',
  url: SITIO,
  logo: abs('/og.jpg'),
  image: abs(IMAGEN_SOCIAL.url),
  description: 'Quamtu ofrece equipos de cómputo y estaciones de trabajo a medida; cotiza para tu empresa o institución.',
  telephone: `+${WHATSAPP}`,
  areaServed: { '@type': 'Country', name: 'Perú' },
  knowsLanguage: 'es-PE',
  contactPoint: [{ '@type': 'ContactPoint', contactType: 'ventas', telephone: `+${WHATSAPP}`, areaServed: 'PE', availableLanguage: 'es' }],
};

export const sitioWeb = { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITIO}/#sitio`, url: SITIO, name: 'Quamtu', inLanguage: 'es-PE', publisher: { '@id': `${SITIO}/#organizacion` } };

/** Migas de pan para una página interior. */
export const migas = (items: { nombre: string; ruta: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [{ nombre: 'Inicio', ruta: '/' }, ...items].map((m, i) => ({ '@type': 'ListItem', position: i + 1, name: m.nombre, item: abs(m.ruta) })),
});
