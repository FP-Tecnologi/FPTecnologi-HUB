import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Montserrat } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { ChatWidgetProvider } from '@/context/ChatWidgetContext';
import { ChatWidget } from '@/components/site/ChatWidget';
import { PopupsSitio } from '@/components/site/PopupsSitio';
import { PopupBbva } from '@/components/site/TarjetasBbvaVitrina';
import ContadorVisitas from '@/components/site/ContadorVisitas';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { FavoritesWidget } from '@/components/site/FavoritesWidget';
import { ServiciosProvider } from '@/context/ServiciosContext';
import { TransicionPagina } from '@/components/site/TransicionPagina';
import { SitioProvider } from '@/context/SitioContext';
import { getServicios } from '@/lib/servicios';
import { getSitio } from '@/lib/sitio';
import { organizacionJsonLd } from '@/lib/seo';
import JsonLd from '@/components/site/JsonLd';
import { api } from '@/lib/catalogo';
import './globals.css';

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', weight: ['400', '500', '600', '700', '800'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'https://fptecnologi.com'),
  applicationName: 'FPTecnologi & System',
  // canonical relativo a cada ruta (se resuelve contra metadataBase); sin query ni parámetros de seguimiento.
  alternates: { canonical: './', languages: { 'es-PE': './' } },
  openGraph: { siteName: 'FPTecnologi & System', locale: 'es_PE', type: 'website', images: [{ url: '/herobanner/Servicios.webp', alt: 'FPTecnologi & System: tecnología para tu negocio' }] },
  twitter: { card: 'summary_large_image' },
  ...(process.env.NOINDEX === '1'
    ? { robots: { index: false, follow: false } }
    : { robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' as const, 'max-snippet': -1 } } }),
  title: {
    default: 'FPTecnologi & System — Tecnología para tu negocio',
    template: '%s · FPTecnologi',
  },
  description:
    'Equipamiento TI y soluciones para empresas: seguridad, videoconferencia, servidores, data centers y más. Distribución autorizada de las principales marcas.',
  icons: {
    icon: '/logo-fptecnologi-icon.svg',
    shortcut: '/logo-fptecnologi-icon.svg',
    apple: '/logo-fptecnologi-icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#2898ee',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [servicios, sitio, categorias] = await Promise.all([getServicios(), getSitio(), api<{ nombre: string; slug: string | null }[]>('/categorias')]);
  return (
    <html lang="es-PE" className={montserrat.variable}>
      <body>
        <a href="#contenido" className="sr-only z-[100] rounded-lg bg-white px-4 py-3 font-semibold text-[#2898ee] shadow-xl focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Saltar al contenido</a>
        <JsonLd datos={organizacionJsonLd(sitio)} />
        <SitioProvider sitio={sitio}>
        <ServiciosProvider servicios={servicios.map((s) => ({ title: s.title, slug: s.slug }))} categorias={(categorias ?? []).filter((c) => c.slug).map((c) => ({ title: c.nombre, slug: c.slug as string }))}>
        <CurrencyProvider>
          <CartProvider>
            <FavoritesProvider>
              <ChatWidgetProvider>
                {children}
                <ChatWidget />
                <PopupsSitio />
                <PopupBbva />
                <ContadorVisitas />
                <FavoritesWidget />
                <TransicionPagina />
              </ChatWidgetProvider>
            </FavoritesProvider>
          </CartProvider>
        </CurrencyProvider>
        </ServiciosProvider>
        </SitioProvider>
      </body>
    </html>
  );
}
