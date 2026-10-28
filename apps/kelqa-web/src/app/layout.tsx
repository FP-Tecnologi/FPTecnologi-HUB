import type { Metadata } from 'next';
import { DM_Sans, Montserrat } from 'next/font/google';
import { MessageCircle } from 'lucide-react';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { waUrl } from '@/lib/contenido';

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', weight: ['600', '700', '800'] });
const dm = DM_Sans({ subsets: ['latin'], variable: '--font-dm' });

export const metadata: Metadata = {
  metadataBase: new URL('https://kelqa.com'),
  title: { default: 'Kelqa — Hecha para avanzar contigo', template: '%s | Kelqa' },
  description: 'Pinturas, mobiliario corporativo y soluciones para construcción y emergencia. Venta directa, licitaciones y Perú Compras con cobertura nacional.',
  openGraph: { images: ['/fotos/cumbre.webp'], locale: 'es_PE', type: 'website' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${montserrat.variable} ${dm.variable}`}>
      <body>
        <Header />
        {children}
        <Footer />
        <a
          href={waUrl('Hola Kelqa, quisiera más información.')}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escribir por WhatsApp (se abre en otra pestaña)"
          className="anillo fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-2xl text-white"
        >
          <span className="boton grid size-full place-items-center rounded-2xl bg-kelqa shadow-xl shadow-kelqa-hondo/40 hover:bg-kelqa-hondo">
            <MessageCircle aria-hidden="true" size={26} className="icono-sacude" />
          </span>
        </a>
      </body>
    </html>
  );
}
