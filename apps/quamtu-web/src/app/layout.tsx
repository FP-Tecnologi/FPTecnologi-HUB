import type { Metadata } from 'next';
import { Inter, Orbitron } from 'next/font/google';
import Header from '@/components/Header';
import './globals.css';

const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron', weight: ['500', '700', '900'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Quamtu — PC gamer armadas pieza por pieza',
  description: 'Arma tu PC gamer en 3D: elige cada componente y mira cómo cobra vida antes de comprar.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${orbitron.variable} ${inter.variable}`}>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
