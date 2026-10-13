import Link from 'next/link';
import { ChevronDown, ClipboardList } from 'lucide-react';
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

// Versiones del home para elegir (A es la de la raíz; B y C viven en /propuestas).
export const VERSIONES_HOME = [
  { href: '/', texto: 'Versión A', desc: 'Actual: líneas Turing y armador' },
  { href: '/propuestas/b', texto: 'Versión B', desc: 'Ficha técnica y organizaciones primero' },
  { href: '/propuestas/c', texto: 'Versión C', desc: 'Armador de PC primero' },
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
          <div className="group relative">
            <Link href="/" className="inline-flex items-center gap-1 transition hover:text-claro">Home <ChevronDown size={14} className="transition group-hover:rotate-180" /></Link>
            <div className="invisible absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <ul className="rounded-xl border border-line bg-bg/95 p-2 normal-case tracking-normal shadow-2xl backdrop-blur-md">
                {VERSIONES_HOME.map((v) => (
                  <li key={v.href}>
                    <Link href={v.href} className="block rounded-lg px-3 py-2 transition hover:bg-white/5 hover:text-claro">
                      <span className="block font-display text-sm uppercase tracking-wide">{v.texto}</span>
                      <span className="block text-xs text-slate-400">{v.desc}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
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
          <MenuMovil enlaces={[...VERSIONES_HOME.map((v) => ({ href: v.href, texto: `Home · ${v.texto}` })), ...ENLACES]} />
        </div>
      </div>
    </CabeceraFija>
  );
}
