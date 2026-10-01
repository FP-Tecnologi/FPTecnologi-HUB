import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { CartProvider } from '@/context/CartContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { ChatWidgetProvider } from '@/context/ChatWidgetContext';
import { ChatWidget } from '@/components/site/ChatWidget';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { FavoritesWidget } from '@/components/site/FavoritesWidget';
import { ServiciosProvider } from '@/context/ServiciosContext';
import { TransicionPagina } from '@/components/site/TransicionPagina';
import { getServicios } from '@/lib/servicios';
import './globals.css';

export const metadata: Metadata = {
  ...(process.env.NOINDEX === '1' ? { robots: { index: false, follow: false } } : {}),
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
  themeColor: '#155382',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const servicios = await getServicios();
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ServiciosProvider servicios={servicios.map((s) => ({ title: s.title, slug: s.slug }))}>
        <CurrencyProvider>
          <CartProvider>
            <FavoritesProvider>
              <ChatWidgetProvider>
                {children}
                <ChatWidget />
                <FavoritesWidget />
                <TransicionPagina />
              </ChatWidgetProvider>
            </FavoritesProvider>
          </CartProvider>
        </CurrencyProvider>
        </ServiciosProvider>
      </body>
    </html>
  );
}
