'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { leerCarrito } from '@/lib/carrito';

export default function Header() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const leer = () => setN(leerCarrito().length);
    leer();
    window.addEventListener('quamtu-carrito', leer);
    return () => window.removeEventListener('quamtu-carrito', leer);
  }, []);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link href="/" aria-label="Quamtu">
          {/* Logo en blanco sobre fondo oscuro (manual B.01/B.02) */}
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
          <Link href="/carrito" className="relative" aria-label={`Carrito: ${n}`}>
            <ShoppingCart size={20} />
            {n > 0 && <b className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-cyan px-1 text-[10px] text-white">{n}</b>}
          </Link>
          <Link href="/armar" className="btn-neon rounded-full px-5 py-2 font-display text-xs">ARMA TU PC</Link>
        </div>
      </div>
    </header>
  );
}
