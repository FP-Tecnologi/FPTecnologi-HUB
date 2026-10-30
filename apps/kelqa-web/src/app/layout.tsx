import type { Metadata } from 'next';
import { DM_Sans, Montserrat } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsApp from '@/components/WhatsApp';
import { getContacto, getLineas } from '@/lib/cms';

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', weight: ['600', '700', '800'] });
const dm = DM_Sans({ subsets: ['latin'], variable: '--font-dm' });

export const metadata: Metadata = {
  metadataBase: new URL('https://kelqa.com'),
  title: { default: 'Kelqa — Hecha para avanzar contigo', template: '%s | Kelqa' },
  description: 'Pinturas, mobiliario corporativo y soluciones para construcción y emergencia. Venta directa, licitaciones y Perú Compras con cobertura nacional.',
  openGraph: { images: ['/fotos/cumbre.webp'], locale: 'es_PE', type: 'website' },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [contacto, lineas] = await Promise.all([getContacto(), getLineas()]);
  return (
    <html lang="es" className={`${montserrat.variable} ${dm.variable}`}>
      <body>
        <Header lineas={lineas} whatsapp={contacto.whatsapp} />
        {children}
        <Footer lineas={lineas} contacto={contacto} />
        <WhatsApp contacto={contacto} />
      </body>
    </html>
  );
}
