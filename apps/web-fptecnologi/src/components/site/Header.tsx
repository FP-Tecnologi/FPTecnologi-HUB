'use client';

import Image from 'next/image';
import { useState } from 'react';
import { DesktopNav, MobileNav } from './MainNav';
import { CartButton } from './CartButton';
import { COTIZADOR_URL } from '@/lib/content';

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3">
        <a href="#inicio" className="flex items-center gap-2">
          <Image src="/logo-fptecnologi.svg" alt="FPTecnologi & System" width={168} height={40} priority className="h-8 w-auto" />
        </a>

        <DesktopNav tone="light" dropdownVariant="default" />

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={COTIZADOR_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-primary/30 transition-transform hover:scale-[1.03] hover:bg-brand-dark"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M8 3h6l4 4v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M14 3v4h4M9 12h6M9 15.5h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            Cotizador
          </a>
        </div>

        <div className="flex items-center gap-2">
          <CartButton tone="light" />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 lg:hidden"
            aria-label="Abrir menú"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-ink">
              {open ? (
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-black/5 bg-white px-6 py-4 lg:hidden">
          <MobileNav onNavigate={() => setOpen(false)} />
          <a
            href={COTIZADOR_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-center text-sm font-semibold text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M8 3h6l4 4v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M14 3v4h4M9 12h6M9 15.5h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            Cotizador
          </a>
        </div>
      )}
    </header>
  );
}
