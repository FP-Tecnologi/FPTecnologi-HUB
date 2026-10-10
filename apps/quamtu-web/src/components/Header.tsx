import Link from 'next/link';
import CarritoMini from './CarritoMini';

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5">
        <Link href="/" aria-label="Quamtu">
          {/* Logo en blanco sobre fondo oscuro (manual B.01/B.02) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-blanco.png" alt="Quamtu" width={140} height={37} className="h-9 w-auto" />
        </Link>
        <nav className="hidden gap-8 font-display text-sm text-slate-300 md:flex">
          <Link href="/tienda" className="hover:text-claro">Tienda</Link>
          <Link href="/#lineas" className="hover:text-claro">Líneas Turing</Link>
          <Link href="/#builds" className="hover:text-claro">Configuraciones</Link>
          <Link href="/#respaldo" className="hover:text-claro">Respaldo</Link>
          <Link href="/#contacto" className="hover:text-claro">Cotizar</Link>
        </nav>
        <div className="flex items-center gap-4">
          <CarritoMini />
          <Link href="/armar" className="btn-neon rounded-full px-5 py-2 font-display text-xs">ARMA TU PC</Link>
        </div>
      </div>
    </header>
  );
}
