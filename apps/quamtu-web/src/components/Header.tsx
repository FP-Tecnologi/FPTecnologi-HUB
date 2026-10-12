import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import CabeceraFija from './CabeceraFija';
import CarritoMini from './CarritoMini';
import ConmutadorTema from './ConmutadorTema';
import MenuMovil from './MenuMovil';

export const ENLACES = [
  { href: '/tienda', texto: 'Tienda' },
  { href: '/armar', texto: 'Arma tu PC' },
  { href: '/#lineas', texto: 'Líneas Turing' },
  { href: '/#organizaciones', texto: 'Empresas' },
  { href: '/#respaldo', texto: 'Respaldo' },
];

export default function Header() {
  return (
    <CabeceraFija>
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4 transition-[height] duration-300 group-data-[bajo=true]/cab:h-14 sm:px-5">
        <Link href="/" aria-label="Quamtu" className="shrink-0">
          {/* Logo en blanco sobre fondo oscuro (manual B.01/B.02) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-blanco.png" alt="Quamtu" width={140} height={37} className="logo-sobre-oscuro h-8 w-auto transition-[height] duration-300 group-data-[bajo=true]/cab:h-7 sm:h-9 sm:group-data-[bajo=true]/cab:h-8" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-color.png" alt="" aria-hidden width={140} height={37} className="logo-sobre-claro h-8 w-auto transition-[height] duration-300 group-data-[bajo=true]/cab:h-7 sm:h-9 sm:group-data-[bajo=true]/cab:h-8" />
        </Link>
        <nav className="hidden items-center gap-6 font-display text-[13px] uppercase tracking-wide text-slate-300 lg:flex xl:gap-8">
          {ENLACES.map((e) => (
            <Link key={e.href} href={e.href} className="transition hover:text-claro">{e.texto}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <ConmutadorTema className="hidden lg:flex" />
          <CarritoMini />
          <Link href="/cotizar" className="btn-neon inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-display text-xs sm:px-5 sm:text-xs">
            <ClipboardList size={15} /> COTIZAR
          </Link>
          <MenuMovil enlaces={ENLACES} />
        </div>
      </div>
    </CabeceraFija>
  );
}
