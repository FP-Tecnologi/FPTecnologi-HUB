'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { FileText, Menu } from 'lucide-react';
import BotonHex, { CapasHex } from './hex/BotonHex';
import { enlaces, esActivo } from './EnlacesNav';

export default function MenuMovil() {
  const ref = useRef<HTMLDetailsElement>(null);
  const ruta = usePathname();
  const cerrar = () => ref.current?.removeAttribute('open');

  useEffect(cerrar, [ruta]);
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && cerrar();
    const fuera = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && cerrar();
    document.addEventListener('keydown', tecla);
    document.addEventListener('click', fuera);
    return () => {
      document.removeEventListener('keydown', tecla);
      document.removeEventListener('click', fuera);
    };
  }, []);

  return (
    <details ref={ref} className="relative md:hidden">
      <summary className="group/hex relative isolate flex min-h-11 cursor-pointer list-none items-center gap-2 px-6 font-display text-lg font-bold uppercase tracking-widest text-carbon focus-visible:outline-hidden [&::-webkit-details-marker]:hidden">
        <CapasHex variante="contorno" /><Menu aria-hidden="true" size={18} />Menú
      </summary>
      <nav aria-label="Principal" className="absolute right-0 top-full mt-2 flex w-72 flex-col gap-1 rounded-2xl border border-gris bg-white p-3 shadow-lg">
        {enlaces.map((e) => (
          <Link key={e.href} href={e.href} aria-current={esActivo(ruta, e.href) ? 'page' : undefined} className={`flex min-h-12 items-center rounded-lg border-l-4 px-3 font-display text-2xl font-bold uppercase tracking-widest hover:bg-gris hover:text-rojo-hondo ${esActivo(ruta, e.href) ? 'border-rojo text-rojo-hondo' : 'border-transparent text-carbon'}`}>
            {e.texto}
          </Link>
        ))}
        <BotonHex href="/cotizar" icono={FileText} size="lg" className="mt-2 font-display text-xl font-bold uppercase tracking-widest">Cotizar</BotonHex>
      </nav>
    </details>
  );
}
