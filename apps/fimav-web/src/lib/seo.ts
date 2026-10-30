import type { Metadata } from 'next';
import { categorias } from './categorias';
import { contacto as respaldo } from './contacto';
import type { Contacto } from './cms';

export const SITIO = 'https://fimavperu.com';
export const IMAGEN_SOCIAL = { url: '/brand/og.jpg', alt: 'Fimav Perú: especialistas en bienes y servicios' };
const abs = (ruta: string) => `${SITIO}${ruta}`;

/** Metadatos de una página: canonical, Open Graph y Twitter con el mismo título y descripción. */
export function meta(titulo: string, descripcion: string, ruta: string): Metadata {
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: ruta, languages: { 'es-PE': ruta } },
    openGraph: { title: `${titulo} | Fimav Perú`, description: descripcion, url: ruta, siteName: 'Fimav Perú', locale: 'es_PE', type: 'website', images: [IMAGEN_SOCIAL] },
    twitter: { card: 'summary_large_image', title: `${titulo} | Fimav Perú`, description: descripcion, images: [IMAGEN_SOCIAL.url] },
  };
}

/** Organización (GEO y SEO local): quién es Fimav, qué vende, a quién y dónde. Usa los datos vigentes del CMS. */
export const organizacion = (c: Contacto) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITIO}/#organizacion`,
  name: 'Fimav Perú',
  legalName: respaldo.razonSocialLegal,
  taxID: respaldo.ruc,
  url: SITIO,
  logo: abs('/brand/og.jpg'),
  image: abs(IMAGEN_SOCIAL.url),
  description: 'Organización comercial especializada en bienes y servicios tecnológicos para empresas y entidades del Estado: equipos de cómputo, impresión, networking, servidores, aire acondicionado y más. Atiende en Perú Compras.',
  email: c.ventas,
  telephone: c.telefono,
  address: { '@type': 'PostalAddress', streetAddress: c.direccion, addressCountry: 'PE' },
  areaServed: { '@type': 'Country', name: 'Perú' },
  knowsLanguage: 'es-PE',
  contactPoint: [{ '@type': 'ContactPoint', contactType: 'ventas', telephone: c.telefono, email: c.ventas, areaServed: 'PE', availableLanguage: 'es' }],
  makesOffer: categorias.map((k) => ({ '@type': 'Offer', itemOffered: { '@type': 'Product', name: k.nombre, url: abs(`/catalogo/${k.slug}`) } })),
});

export const sitioWeb = { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITIO}/#sitio`, url: SITIO, name: 'Fimav Perú', inLanguage: 'es-PE', publisher: { '@id': `${SITIO}/#organizacion` } };

/** Migas de pan para una página interior. */
export const migas = (items: { nombre: string; ruta: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [{ nombre: 'Inicio', ruta: '/' }, ...items].map((m, i) => ({ '@type': 'ListItem', position: i + 1, name: m.nombre, item: abs(m.ruta) })),
});

/** Categoría del catálogo (sin precios: la venta es por cotización). */
export const jsonCategoria = (c: { slug: string; nombre: string; resumen: string; marcas: string[] }) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: c.nombre,
  url: abs(`/catalogo/${c.slug}`),
  description: c.resumen,
  inLanguage: 'es-PE',
  isPartOf: { '@id': `${SITIO}/#sitio` },
  about: c.marcas.map((m) => ({ '@type': 'Brand', name: m })),
});
