import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppFlotante from '@/components/WhatsAppFlotante';

const poppins = Poppins({ subsets: ['latin'], variable: '--font-poppins', weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://fimavperu.com'),
  title: { default: 'Fimav Perú — Especialistas en bienes y servicios', template: '%s | Fimav Perú' },
  description: 'Organización en constante transformación, enfocada en la calidad de las soluciones para nuestros clientes y en un ecosistema empresarial sostenible.',
  openGraph: { images: ['/brand/og.jpg'], locale: 'es_PE', type: 'website' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={poppins.variable}>
      <body>
        <Header />
        {children}
        <Footer />
        <WhatsAppFlotante />
      </body>
    </html>
  );
}
