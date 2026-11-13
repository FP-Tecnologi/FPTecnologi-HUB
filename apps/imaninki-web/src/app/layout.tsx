import type { Metadata, Viewport } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsApp from '@/components/WhatsApp';
import JsonLd from '@/components/JsonLd';
import ContadorVisitas from '@/components/ContadorVisitas';
import { IMAGEN_SOCIAL, organizacion, sitioWeb } from '@/lib/seo';
import { getLineas } from '@/lib/lineas';
import { getContacto, getPagina } from '@/lib/cms';
import { ContactoProvider } from '@/components/ContactoContext';

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', weight: ['400', '500', '600', '700', '800', '900'] });

// ISR: cada página se regenera como máximo cada 30 s (lo guardado en el dashboard se ve en <30 s) en vez de consultar la API en cada visita.
export const revalidate = 30;

export const metadata: Metadata = {
  metadataBase: new URL('https://imaninki.com'),
  title: { default: 'Imaninki — Soluciones en construcción e industria', template: '%s | Imaninki' },
  description: 'Pinturas, mobiliario corporativo y soluciones para construcción y emergencia. Venta directa, licitaciones y Perú Compras con cobertura nacional.',
  applicationName: 'Imaninki',
  alternates: { canonical: '/', languages: { 'es-PE': '/' } },
  openGraph: { title: 'Imaninki — Soluciones en construcción e industria', description: 'Pinturas, mobiliario corporativo y soluciones para construcción y emergencia, con cobertura nacional.', url: '/', siteName: 'Imaninki', images: [IMAGEN_SOCIAL], locale: 'es_PE', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Imaninki — Soluciones en construcción e industria', description: 'Pinturas, mobiliario corporativo y soluciones para construcción y emergencia.', images: [IMAGEN_SOCIAL.url] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

export const viewport: Viewport = { themeColor: '#0d0d0e', width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lineas = await getLineas();
  const contacto = await getContacto();
  const conCatalogos = (await getPagina('catalogos')).lista.items.some((x) => x.titulo && x.archivo);
  return (
    <html lang="es-PE" className={montserrat.variable}>
      <body>
        <a href="#contenido" className="sr-only z-[60] rounded-md bg-white px-4 py-3 font-semibold text-rojo-hondo shadow-xl focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Saltar al contenido</a>
        <ContactoProvider contacto={contacto}>
        <JsonLd datos={[organizacion(lineas), sitioWeb]} />
        <Header lineas={lineas} conCatalogos={conCatalogos} />
        {children}
        <Footer lineas={lineas} />
        <WhatsApp />
        <ContadorVisitas />
        </ContactoProvider>
      </body>
    </html>
  );
}
