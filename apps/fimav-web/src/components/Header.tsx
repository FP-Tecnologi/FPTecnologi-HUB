import Link from 'next/link';
import { FileText } from 'lucide-react';
import Logo from './Logo';
import BotonHex from './hex/BotonHex';
import EnlacesNav from './EnlacesNav';
import MenuMovil from './MenuMovil';

// Sticky (en el flujo): no tapa el contenido; scroll-padding-top en globals.css evita que oculte los anclajes.
export default function Header() {
  return (
    <header className="cabecera print:hidden sticky top-0 z-40 border-b border-gris bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" aria-label="Fimav Perú, inicio" className="block">
          <Logo className="cabecera-logo h-14 w-auto object-contain" />
        </Link>
        <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
          <EnlacesNav />
          <BotonHex href="/cotizar" icono={FileText} rotulo>Cotizar</BotonHex>
        </nav>
        <MenuMovil />
      </div>
    </header>
  );
}
