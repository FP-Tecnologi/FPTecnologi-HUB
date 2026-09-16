'use client';

import Image from 'next/image';
import { useState } from 'react';
import { DesktopNav, MobileNav } from '@/components/site/MainNav';
import { CartButton } from '@/components/site/CartButton';
import { CONTACT_INFO, COTIZADOR_URL } from '@/lib/content';
import { QuoteIcon } from '@/components/site/icons';

export function Header5() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-50 bg-ink text-white">
      <div className="relative flex items-center justify-between overflow-hidden px-6 py-2 text-xs">
        <div className="absolute inset-y-0 left-0 flex w-56 items-center bg-brand-primary pl-6 pr-10 [clip-path:polygon(0_0,100%_0,78%_100%,0_100%)]">
          <span className="truncate font-medium">{CONTACT_INFO.address}</span>
        </div>
        <span className="invisible w-56">.</span>
        <div className="hidden items-center gap-5 text-white/70 sm:flex">
          <span>{CONTACT_INFO.email}</span>
          <div className="flex items-center gap-2">
            {['X', 'in', 'yt'].map((s) => (
              <span key={s} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] transition-colors hover:bg-brand-primary">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <a href="#inicio" className="flex items-center gap-2">
          <Image src="/logo-fptecnologi.svg" alt="FPTecnologi & System" width={168} height={40} priority className="h-8 w-auto brightness-0 invert" />
        </a>

        <DesktopNav tone="dark" dropdownVariant="accent" />

        <div className="flex items-center gap-3">
          <a href={COTIZADOR_URL} target="_blank" rel="noreferrer" className="btn-sweep hidden items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white before:bg-white before:opacity-10 lg:inline-flex">
            <QuoteIcon />
            Cotizador
          </a>
          <CartButton tone="dark" />
          <button type="button" onClick={() => setOpen((v) => !v)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 lg:hidden" aria-label="Abrir menú">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
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
        <div className="flex flex-col gap-1 bg-ink px-6 py-4 lg:hidden">
          <MobileNav tone="dark" onNavigate={() => setOpen(false)} />
        </div>
      )}
    </header>
  );
}
