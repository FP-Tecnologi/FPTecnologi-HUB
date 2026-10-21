'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import BotonHex from './hex/BotonHex';

export default function MenuMovil({ enlaces }: { enlaces: { href: string; texto: string }[] }) {
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
      <summary className="cursor-pointer list-none flex min-h-11 items-center rounded-lg border border-gris px-4 font-medium text-carbon">Menú</summary>
      <nav aria-label="Principal" className="absolute right-0 top-full mt-2 flex w-56 flex-col gap-1 rounded-2xl border border-gris bg-white p-3 shadow-lg">
        {enlaces.map((e) => (
          <Link key={e.href} href={e.href} className="flex min-h-11 items-center rounded-lg px-3 text-carbon hover:text-rojo">
            {e.texto}
          </Link>
        ))}
        <BotonHex href="/cotizar" className="mt-2">Cotizar</BotonHex>
      </nav>
    </details>
  );
}
