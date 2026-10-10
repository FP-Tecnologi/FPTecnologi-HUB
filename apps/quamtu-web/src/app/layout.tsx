import type { Metadata } from 'next';
import { Carlito, Play } from 'next/font/google';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PieCondicional from '@/components/PieCondicional';
import WhatsAppFlotante from '@/components/WhatsAppFlotante';
import './globals.css';

// Manual de identidad: Play (corporativa) y Calibri para web → Carlito (misma métrica).
const play = Play({ subsets: ['latin'], variable: '--font-play', weight: ['400', '700'] });
const carlito = Carlito({ subsets: ['latin'], variable: '--font-carlito', weight: ['400', '700'], style: ['normal', 'italic'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://quamtu.com'),
  title: { default: 'Quamtu — Equipos de cómputo a medida', template: '%s' },
  description: 'Configuración de precisión: arma tu PC o workstation en 3D, compra componentes o cotiza equipos para tu empresa.',
  openGraph: {
    type: 'website',
    siteName: 'Quamtu',
    locale: 'es_PE',
    title: 'Quamtu — Equipos de cómputo a medida',
    description: 'Arma tu PC o workstation pieza por pieza en 3D y cotiza para tu empresa.',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Quamtu' }],
  },
  twitter: { card: 'summary_large_image', images: ['/og.jpg'] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${play.variable} ${carlito.variable}`}>
      <body>
        <Header />
        {children}
        <PieCondicional>
          <Footer />
        </PieCondicional>
        <WhatsAppFlotante />
      </body>
    </html>
  );
}
