'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { DesktopNav, MobileNav } from '@/components/site/MainNav';
import { CartButton } from '@/components/site/CartButton';
import { CONTACT_INFO, COTIZADOR_URL } from '@/lib/content';
import { QuoteIcon } from '@/components/site/icons';

export function Header2({ forceScrolled }: { forceScrolled?: boolean } = {}) {
  const [autoScrolled, setAutoScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const scrolled = forceScrolled ?? autoScrolled;

  useEffect(() => {
    if (forceScrolled !== undefined) return;
    const onScroll = () => setAutoScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [forceScrolled]);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled ? 'bg-ink shadow-lg' : 'bg-transparent'}`}>
      <div className="hidden border-b border-white/10 py-2 text-xs text-white/60 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <span>{CONTACT_INFO.address}</span>
          <div className="flex items-center gap-5">
            <span>{CONTACT_INFO.email}</span>
            <span>{CONTACT_INFO.phoneVentas}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <a href="#inicio" className="flex items-center gap-2">
          <Image src="/logo-fptecnologi.svg" alt="FPTecnologi & System" width={168} height={40} priority className="h-8 w-auto brightness-0 invert" />
        </a>

        <DesktopNav tone="dark" dropdownVariant="dark" />

        <div className="flex items-center gap-3">
          <a
            href={COTIZADOR_URL}
            target="_blank"
            rel="noreferrer"
            className="btn-sweep hidden items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white before:bg-brand-dark lg:inline-flex"
          >
            <QuoteIcon />
            Cotizador
          </a>
          <CartButton tone="dark" />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white lg:hidden"
            aria-label="Abrir menú"
          >
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
          <a href={COTIZADOR_URL} target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className="mt-2 flex items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-center text-sm font-semibold text-white">
            <QuoteIcon />
            Cotizador
          </a>
        </div>
      )}
    </header>
  );
}
