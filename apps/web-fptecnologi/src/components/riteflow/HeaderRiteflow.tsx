'use client';

import Image from 'next/image';
import { useState } from 'react';
import { NAV_LINKS } from '@/lib/nav';
import { COTIZADOR_URL } from '@/lib/content';

/* Header simple propio para este modelo (no se portó el mega-menú del
   template original -- tiene dropdowns/mobile-overlay propios, mucho más
   grandes que lo que necesita este home). Paleta indigo oscura de Riteflow. */
export function HeaderRiteflow() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#2d3a57] bg-[#0e1422]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center gap-6 px-4 py-4 md:px-6 lg:px-12 xl:px-16">
        <a href="#inicio" className="flex items-center gap-2">
          <Image src="/logo-fptecnologi.svg" alt="FPTecnologi & System" width={150} height={36} className="h-7 w-auto brightness-0 invert" />
        </a>

        <nav className="hidden flex-1 items-center justify-center gap-7 text-sm text-[#fbfbfb]/70 lg:flex" aria-label="Principal">
          {NAV_LINKS.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-[#a78bfa]">
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href={COTIZADOR_URL}
          target="_blank"
          rel="noreferrer"
          className="ml-auto hidden rounded-[10px] px-5 py-2.5 text-sm font-medium text-white sm:inline-flex"
          style={{ background: 'linear-gradient(to bottom, #7D76FF 0%, #2F27B1 51%, #7D76FF 100%)' }}
        >
          Cotizar ahora
        </a>
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#2d3a57] lg:hidden" aria-label="Abrir menú" aria-expanded={open}>
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
            {open ? <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-[#2d3a57] bg-[#0e1422] p-4 lg:hidden">
          {NAV_LINKS.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-[#fbfbfb]/80 hover:bg-white/5">
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
