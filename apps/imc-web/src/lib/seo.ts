import type { Metadata } from "next";
import { EMPRESA, SERVICIOS, MARCAS } from "./datos";

export const SITIO = "https://companyimc.com";
export const IMAGEN_SOCIAL = { url: "/img/perucompras.webp", alt: "Company IMC: soluciones tecnológicas para empresas e instituciones en Perú" };

/** Metadatos de una página: canonical, Open Graph y Twitter con el mismo título y descripción. */
export function meta(titulo: string, descripcion: string, ruta: string): Metadata {
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: ruta, languages: { "es-PE": ruta } },
    openGraph: { title: `${titulo} | Company IMC`, description: descripcion, url: ruta, siteName: "Company IMC", locale: "es_PE", type: "website", images: [IMAGEN_SOCIAL] },
    twitter: { card: "summary_large_image", title: `${titulo} | Company IMC`, description: descripcion, images: [IMAGEN_SOCIAL.url] },
  };
}

const abs = (ruta: string) => `${SITIO}${ruta}`;

/** Empresa local (E-E-A-T y GEO): quién es, qué ofrece, dónde está y a quién atiende. Se emite en todas las páginas. */
export const organizacion = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  "@id": `${SITIO}/#organizacion`,
  name: EMPRESA.nombre,
  alternateName: "Company IMC",
  url: SITIO,
  logo: abs("/logo.svg"),
  image: abs(IMAGEN_SOCIAL.url),
  description:
    "Equipos de cómputo, impresión, networking, servidores, software, cableado estructurado y centrales telefónicas para empresas e instituciones. Proveedor en Perú Compras.",
  email: EMPRESA.correo,
  telephone: EMPRESA.telefono,
  address: { "@type": "PostalAddress", streetAddress: "Pq. Manuel García Rosell, Urb. Círculo Nro. 197", addressLocality: "Pueblo Libre", addressRegion: "Lima", addressCountry: "PE" },
  areaServed: { "@type": "Country", name: "Perú" },
  knowsLanguage: "es-PE",
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:30", closes: "18:30" }],
  contactPoint: [{ "@type": "ContactPoint", contactType: "ventas", telephone: EMPRESA.telefono, email: EMPRESA.correo, areaServed: "PE", availableLanguage: "es" }],
  brand: MARCAS.map((m) => ({ "@type": "Brand", name: m.n })),
  makesOffer: SERVICIOS.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.t, description: s.d, url: abs("/servicios/") } })),
};

export const sitioWeb = { "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITIO}/#sitio`, url: SITIO, name: "Company IMC", inLanguage: "es-PE", publisher: { "@id": `${SITIO}/#organizacion` } };

/** Migas de pan para una página interior. */
export const migas = (nombre: string, ruta: string) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ nombre: "Inicio", ruta: "/" }, { nombre, ruta }].map((m, i) => ({ "@type": "ListItem", position: i + 1, name: m.nombre, item: abs(m.ruta) })),
});
