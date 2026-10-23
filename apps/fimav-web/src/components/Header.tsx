import Link from 'next/link';
import { FileText } from 'lucide-react';
import Logo from './Logo';
import BotonHex from './hex/BotonHex';
import EnlacesNav from './EnlacesNav';
import MenuMovil from './MenuMovil';

export default function Header() {
  return (
    <header className="cabecera print:hidden fixed inset-x-0 top-3 z-50 mx-auto w-[calc(100%-1rem)] max-w-7xl">
      <div className="cabecera-interior mx-auto flex min-h-[4.5rem] items-center justify-between gap-4 px-5 sm:px-9">
        <Link href="/" aria-label="Fimav Perú, inicio" className="cabecera-marca block">
          <Logo src="/brand/logo-cabecera-transparente.png" alt="" className="cabecera-logo cabecera-logo-transparente h-12 w-auto object-contain" />
          <Logo src="/brand/logo-cabecera-fijo.png" alt="" className="cabecera-logo cabecera-logo-fijo h-12 w-auto object-contain" />
        </Link>
        <nav aria-label="Principal" className="cabecera-nav hidden items-center gap-8 lg:flex">
          <EnlacesNav />
          <BotonHex href="/cotizar" icono={FileText} rotulo>Cotizar</BotonHex>
        </nav>
        <MenuMovil />
      </div>
    </header>
  );
}
