'use client';
import { useEffect, useRef } from 'react';
import { Menu, MessageCircle, X } from 'lucide-react';
import { waUrl } from '@/lib/contenido';

const enlaces = [
  { href: '#lineas', texto: 'Líneas' },
  { href: '#nosotros', texto: 'Nosotros' },
  { href: '#clientes', texto: 'Clientes' },
  { href: '#contacto', texto: 'Contacto' },
];
const cotizar = waUrl('Hola Kelqa, quisiera cotizar productos para mi proyecto.');

/** Cabecera fija: transparente sobre el hero y blanca al bajar (marca html[data-scrolled]). */
export default function Header() {
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const h = document.documentElement;
    const f = () => h.toggleAttribute('data-scrolled', window.scrollY > 40);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  const cerrar = () => menu.current?.removeAttribute('open');

  return (
    <header className="cabecera fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-[var(--alto-cabecera)] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <a href="#inicio" aria-label="Kelqa, inicio" className="shrink-0">
          <img src="/brand/kelqa-blanco.svg" alt="" className="cabecera-logo-blanco h-9 w-auto" />
          <img src="/brand/kelqa.svg" alt="" className="cabecera-logo-color h-9 w-auto" />
        </a>
        <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
          {enlaces.map((e) => (
            <a key={e.href} href={e.href} className="cabecera-link relative py-2 text-[15px] font-semibold text-carbon after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-kelqa after:transition-transform hover:after:scale-x-100">
              {e.texto}
            </a>
          ))}
          <a href={cotizar} target="_blank" rel="noopener noreferrer" className="boton inline-flex h-11 items-center gap-2 rounded-xl bg-kelqa px-5 text-[15px] font-semibold text-white shadow-lg shadow-kelqa-hondo/30 hover:bg-kelqa-hondo">
            <MessageCircle aria-hidden="true" size={18} className="icono-sacude" />Cotizar
          </a>
        </nav>
        <details ref={menu} className="group relative lg:hidden">
          <summary className="boton grid size-11 cursor-pointer list-none place-items-center rounded-xl bg-kelqa text-white [&::-webkit-details-marker]:hidden [&_svg]:transition-transform group-open:[&_svg]:rotate-90">
            <Menu aria-hidden="true" className="group-open:hidden" />
            <X aria-hidden="true" className="hidden group-open:block" />
            <span className="sr-only">Abrir menú</span>
          </summary>
          <nav aria-label="Principal" className="absolute right-0 top-full mt-3 flex w-64 origin-top-right flex-col gap-1 rounded-2xl bg-white p-3 shadow-xl shadow-tinta/20 motion-safe:animate-[entrada_0.35s_var(--suave)]">
            {enlaces.map((e) => (
              <a key={e.href} href={e.href} onClick={cerrar} className="flex min-h-12 items-center rounded-lg px-3 font-semibold text-carbon hover:bg-niebla hover:text-kelqa-hondo">{e.texto}</a>
            ))}
            <a href={cotizar} target="_blank" rel="noopener noreferrer" className="mt-1 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-kelqa font-semibold text-white">
              <MessageCircle aria-hidden="true" size={18} />Cotizar por WhatsApp
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}
