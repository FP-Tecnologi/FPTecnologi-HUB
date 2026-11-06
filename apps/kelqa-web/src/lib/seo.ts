import type { Metadata } from 'next';
import { contacto, preguntas, type Linea } from './contenido';

export const SITIO = 'https://kelqa.com';
export const IMAGEN_SOCIAL = { url: '/fotos/cumbre.webp', width: 1672, height: 941, alt: 'Kelqa: pinturas, mobiliario y soluciones para construcción' };

/** Metadatos de una página: canonical, Open Graph y Twitter con el mismo título y descripción. */
export function meta(titulo: string, descripcion: string, ruta: string): Metadata {
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: ruta, languages: { 'es-PE': ruta } },
    openGraph: { title: `${titulo} | Kelqa`, description: descripcion, url: ruta, siteName: 'Kelqa', locale: 'es_PE', type: 'website', images: [IMAGEN_SOCIAL] },
    twitter: { card: 'summary_large_image', title: `${titulo} | Kelqa`, description: descripcion, images: [IMAGEN_SOCIAL.url] },
  };
}

const abs = (ruta: string) => `${SITIO}${ruta}`;

/** Organización (E-E-A-T y GEO): quién es Kelqa, qué vende, a quién y dónde. Se emite en todas las páginas. */
export const organizacion = (lineas: Linea[]) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITIO}/#organizacion`,
  name: 'Kelqa',
  url: SITIO,
  logo: abs('/brand/kelqa.svg'),
  image: abs(IMAGEN_SOCIAL.url),
  slogan: 'Hecha para avanzar contigo',
  description: 'Kelqa ofrece pinturas, mobiliario corporativo y soluciones para construcción y emergencia, con venta directa, licitaciones públicas y privadas y fichas en Perú Compras.',
  email: contacto.correo,
  telephone: contacto.telefono,
  areaServed: { '@type': 'Country', name: 'Perú' },
  knowsLanguage: 'es-PE',
  contactPoint: [{ '@type': 'ContactPoint', contactType: 'ventas', telephone: contacto.telefono, email: contacto.correo, areaServed: 'PE', availableLanguage: 'es' }],
  makesOffer: lineas.map((l) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: l.nombre, url: abs(`/lineas/${l.id}`) } })),
});

export const sitioWeb = { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITIO}/#sitio`, url: SITIO, name: 'Kelqa', inLanguage: 'es-PE', publisher: { '@id': `${SITIO}/#organizacion` } };

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
        item: { '@type': 'Product', name: p.nombre, description: p.descripcion, image: abs(p.img), brand: { '@type': 'Brand', name: 'Kelqa' }, url: abs(`/lineas/${l.id}`) },
      })),
    },
  };
};

export const jsonPreguntas = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: preguntas.map((q) => ({ '@type': 'Question', name: q.p, acceptedAnswer: { '@type': 'Answer', text: q.r } })),
};
