import type { Metadata } from 'next';
import { Carlito, Play } from 'next/font/google';
import Header from '@/components/Header';
import './globals.css';

// Manual de identidad: Play (corporativa) y Calibri para web → Carlito (misma métrica).
const play = Play({ subsets: ['latin'], variable: '--font-play', weight: ['400', '700'] });
const carlito = Carlito({ subsets: ['latin'], variable: '--font-carlito', weight: ['400', '700'], style: ['normal', 'italic'] });

export const metadata: Metadata = {
  title: 'Quamtu — Equipos de cómputo a medida',
  description: 'Configuración de precisión: arma tu PC o workstation en 3D, o cotiza equipos para tu empresa.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${play.variable} ${carlito.variable}`}>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
