import type { Metadata } from 'next';
import { contacto, type Linea } from './contenido';

export const SITIO = 'https://imaninki.com';
export const IMAGEN_SOCIAL = { url: '/fotos/cumbre.webp', width: 1900, height: 1267, alt: 'Imaninki: soluciones en construcción e industria' };

/** Metadatos de una página: canonical, Open Graph y Twitter con el mismo título y descripción. */
export function meta(titulo: string, descripcion: string, ruta: string): Metadata {
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: ruta, languages: { 'es-PE': ruta } },
    openGraph: { title: `${titulo} | Imaninki`, description: descripcion, url: ruta, siteName: 'Imaninki', locale: 'es_PE', type: 'website', images: [IMAGEN_SOCIAL] },
    twitter: { card: 'summary_large_image', title: `${titulo} | Imaninki`, description: descripcion, images: [IMAGEN_SOCIAL.url] },
  };
}

const abs = (ruta: string) => `${SITIO}${ruta}`;

/** Organización (E-E-A-T y GEO): quién es Imaninki, qué vende, a quién y dónde. Se emite en todas las páginas. */
export const organizacion = (lineas: Linea[]) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITIO}/#organizacion`,
  name: 'Imaninki',
  legalName: 'CORPORACION JAE SOLUTIONS E.I.R.L.',
  taxID: '20606010886',
  url: SITIO,
  logo: abs('/brand/logo.png'),
  image: abs(IMAGEN_SOCIAL.url),
  slogan: 'Soluciones en construcción e industria',
  description: 'Imaninki ofrece pinturas, mobiliario corporativo y soluciones para construcción y emergencia, con venta directa, licitaciones públicas y privadas y fichas en Perú Compras.',
  email: contacto.correo,
  telephone: contacto.telefono,
  address: { '@type': 'PostalAddress', addressCountry: 'PE' },
  areaServed: { '@type': 'Country', name: 'Perú' },
  knowsLanguage: 'es-PE',
  contactPoint: [{ '@type': 'ContactPoint', contactType: 'ventas', telephone: contacto.telefono, email: contacto.correo, areaServed: 'PE', availableLanguage: 'es' }],
  makesOffer: lineas.map((l) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: l.nombre, url: abs(`/lineas/${l.id}`) } })),
});

export const sitioWeb = { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITIO}/#sitio`, url: SITIO, name: 'Imaninki', inLanguage: 'es-PE', publisher: { '@id': `${SITIO}/#organizacion` } };

/** Migas de pan para una página interior. */
export const migas = (items: { nombre: string; ruta: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [{ nombre: 'Inicio', ruta: '/' }, ...items].map((m, i) => ({ '@type': 'ListItem', position: i + 1, name: m.nombre, item: abs(m.ruta) })),
});

/** Línea de producto: lista de productos con su descripción (sin precios: la venta es por cotización). */
export const jsonLinea = (l: Linea) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: l.nombre,
    url: abs(`/lineas/${l.id}`),
    description: `${l.lema} ${l.texto}`,
    inLanguage: 'es-PE',
    isPartOf: { '@id': `${SITIO}/#sitio` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: l.productos.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: { '@type': 'Product', name: p.nombre, description: p.descripcion, image: abs(p.img), brand: { '@type': 'Brand', name: 'Imaninki' }, url: abs(`/lineas/${l.id}`) },
      })),
    },
  };
};
