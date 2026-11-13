'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export const enlaces = [
  { href: '/', texto: 'Inicio' },
  { href: '/tienda', texto: 'Tienda', hijos: [{ href: '/tienda', texto: 'Todos los productos' }, { href: '/catalogo', texto: 'Catálogo' }] },
  { href: '/nosotros', texto: 'Nosotros' },
  { href: '/peru-compras', texto: 'Perú Compras' },
  { href: '/contacto', texto: 'Contacto' },
];

export const esActivo = (ruta: string, href: string) => (href === '/' ? ruta === '/' : ruta === href || ruta.startsWith(`${href}/`));
/** Un enlace con submenú está activo si lo está él o cualquiera de sus hijos (Tienda → Catálogo). */
export const esActivoConHijos = (ruta: string, e: { href: string; hijos?: { href: string }[] }) => esActivo(ruta, e.href) || !!e.hijos?.some((h) => esActivo(ruta, h.href));

/** Enlaces de la barra de escritorio con el activo marcado (aria-current="page") y subrayado animado. También marca el scroll en <html data-scrolled>. */
export default function EnlacesNav() {
  const ruta = usePathname();
  useEffect(() => {
    const h = document.documentElement;
    const f = () => h.toggleAttribute('data-scrolled', window.scrollY > 40);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, [ruta]);
  return (
    <>
      {enlaces.map((e) => {
        const activo = esActivoConHijos(ruta, e);
        const clase = `cabecera-link relative flex min-h-11 items-center font-display text-lg font-bold uppercase tracking-widest after:absolute after:inset-x-0 after:bottom-1.5 after:h-0.5 after:origin-left after:rounded-full after:bg-rojo after:transition-transform after:duration-300 hover:text-rojo-hondo hover:after:scale-x-100 focus-visible:after:scale-x-100 ${activo ? 'text-rojo-hondo after:scale-x-100' : 'text-carbon after:scale-x-0'}`;
        if (!e.hijos) return <Link key={e.href} href={e.href} aria-current={activo && esActivo(ruta, e.href) ? 'page' : undefined} className={clase}>{e.texto}</Link>;
        return (
          <div key={e.href} className="group/sub relative">
            <Link href={e.href} aria-current={esActivo(ruta, e.href) ? 'page' : undefined} className={`${clase} gap-1`}>
              {e.texto}<ChevronDown aria-hidden="true" size={16} className="transition-transform group-hover/sub:rotate-180 group-focus-within/sub:rotate-180" />
            </Link>
            <ul className="invisible absolute left-1/2 top-full z-40 min-w-52 -translate-x-1/2 pt-3 opacity-0 transition-[opacity,visibility] group-focus-within/sub:visible group-focus-within/sub:opacity-100 group-hover/sub:visible group-hover/sub:opacity-100">
              <li className="overflow-hidden rounded-2xl border-2 border-rojo-hondo bg-white p-1.5 shadow-xl">
                <ul>
                  {e.hijos.map((h) => (
                    <li key={h.href + h.texto}>
                      <Link href={h.href} aria-current={ruta === h.href ? 'page' : undefined} className={`flex min-h-10 items-center whitespace-nowrap rounded-xl px-4 font-display text-base font-bold uppercase tracking-widest hover:bg-boton hover:text-white focus-visible:bg-boton focus-visible:text-white ${ruta === h.href ? 'text-rojo-hondo' : 'text-carbon'}`}>{h.texto}</Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </div>
        );
      })}
    </>
  );
}
