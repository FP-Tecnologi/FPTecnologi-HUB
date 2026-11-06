import type { Metadata, Viewport } from 'next';
import { Poppins, Rajdhani, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppFlotante from '@/components/WhatsAppFlotante';
import CursorHex from '@/components/motion/CursorHex';
import ContadorVisitas from '@/components/ContadorVisitas';
import { ContactoProvider } from '@/components/ContactoContext';
import JsonLd from '@/components/JsonLd';
import { getContacto } from '@/lib/cms';
import { IMAGEN_SOCIAL, organizacion, sitioWeb } from '@/lib/seo';

const poppins = Poppins({ subsets: ['latin'], variable: '--font-poppins', weight: ['400', '500', '600'] });
// Humanista tipo Myriad (la del brochure) para títulos; fuente variable, cubre 400–600.
const titulo = Source_Sans_3({ subsets: ['latin'], variable: '--font-source' });

// Display cuadrada y condensada para títulos en mayúscula, cercana al rotulado del brochure.
const display = Rajdhani({ subsets: ['latin'], variable: '--font-rajdhani', weight: ['700'] });

// ISR: cada página se regenera como máximo cada 30 s (lo guardado en el dashboard se ve en <30 s) en vez de consultar la API en cada visita.
export const revalidate = 30;

export const metadata: Metadata = {
  metadataBase: new URL('https://fimavperu.com'),
  title: { default: 'Fimav Perú — Especialistas en bienes y servicios', template: '%s | Fimav Perú' },
  description: 'Organización en constante transformación, enfocada en la calidad de las soluciones para nuestros clientes y en un ecosistema empresarial sostenible.',
  applicationName: 'Fimav Perú',
  alternates: { canonical: '/', languages: { 'es-PE': '/' } },
  openGraph: { title: 'Fimav Perú — Especialistas en bienes y servicios', description: 'Soluciones tecnológicas para empresas y entidades del Estado: cómputo, impresión, networking, servidores y más. Atendemos en Perú Compras.', url: '/', siteName: 'Fimav Perú', images: [IMAGEN_SOCIAL], locale: 'es_PE', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Fimav Perú — Especialistas en bienes y servicios', description: 'Soluciones tecnológicas para empresas y entidades del Estado.', images: [IMAGEN_SOCIAL.url] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

export const viewport: Viewport = { themeColor: '#c91f1f', width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const contacto = await getContacto();
  return (
    <html lang="es-PE" className={`${poppins.variable} ${titulo.variable} ${display.variable}`}>
      <body>
        <a href="#contenido" className="sr-only z-[60] rounded-lg bg-white px-4 py-3 font-semibold text-rojo-hondo shadow-xl focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Saltar al contenido</a>
        <JsonLd datos={[organizacion(contacto), sitioWeb]} />
        <ContactoProvider valor={contacto}>
          <Header />
          {children}
          <Footer />
          <WhatsAppFlotante />
          <CursorHex />
          <ContadorVisitas />
        </ContactoProvider>
      </body>
    </html>
  );
}
