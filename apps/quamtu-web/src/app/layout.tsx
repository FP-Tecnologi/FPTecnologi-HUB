import type { Metadata, Viewport } from 'next';
import { Carlito, Play } from 'next/font/google';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PieCondicional from '@/components/PieCondicional';
import WhatsAppFlotante from '@/components/WhatsAppFlotante';
import ContadorVisitas from '@/components/ContadorVisitas';
import JsonLd from '@/components/JsonLd';
import { organizacion, sitioWeb } from '@/lib/seo';
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
  twitter: { card: 'summary_large_image', title: 'Quamtu — Equipos de cómputo a medida', description: 'Arma tu PC o workstation pieza por pieza en 3D y cotiza para tu empresa.', images: ['/og.jpg'] },
  applicationName: 'Quamtu',
  alternates: { canonical: '/', languages: { 'es-PE': '/' } },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

export const viewport: Viewport = { themeColor: '#060b17', width: 'device-width', initialScale: 1 };

// Aplica el tema elegido (?tema=… o el recordado) antes del primer pintado, para no parpadear.
const SCRIPT_TEMA = `(function(){try{var q=new URLSearchParams(location.search).get('tema');var t=q||localStorage.getItem('quamtu-tema');if(t==='claro'||t==='medio'||t==='oscuro'){document.documentElement.dataset.tema=t;if(q)localStorage.setItem('quamtu-tema',q)}}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE" suppressHydrationWarning className={`${play.variable} ${carlito.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body>
        <a href="#contenido" className="sr-only z-[60] rounded-lg bg-white px-4 py-3 font-semibold text-slate-900 shadow-xl focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Saltar al contenido</a>
        <JsonLd datos={[organizacion, sitioWeb]} />
        <Header />
        {children}
        <PieCondicional>
          <Footer />
        </PieCondicional>
        <WhatsAppFlotante />
        <ContadorVisitas />
      </body>
    </html>
  );
}
