'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';

export const CARRITO_KEY = 'quamtu-carrito';

export default function Header() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const leer = () => {
      try { setN(JSON.parse(localStorage.getItem(CARRITO_KEY) ?? '[]').length); } catch { setN(0); }
    };
    leer();
    window.addEventListener('quamtu-carrito', leer);
    return () => window.removeEventListener('quamtu-carrito', leer);
  }, []);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/60 bg-bg/60 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link href="/" className="font-display text-xl font-black tracking-[0.25em]">
          QUAM<span className="text-cyan">TU</span>
        </Link>
        <nav className="hidden gap-8 text-sm text-slate-300 md:flex">
          <Link href="/#builds" className="hover:text-cyan">Builds listos</Link>
          <Link href="/#pasos" className="hover:text-cyan">Cómo funciona</Link>
          <Link href="/#por-que" className="hover:text-cyan">Por qué Quamtu</Link>
        </nav>
        <div className="flex items-center gap-4">
          <span className="relative">
            <ShoppingCart size={20} />
            {n > 0 && <b className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-cyan px-1 text-[10px] text-black">{n}</b>}
          </span>
          <Link href="/armar" className="btn-neon rounded-full px-5 py-2 text-xs">ARMA TU PC</Link>
        </div>
      </div>
    </header>
  );
}
