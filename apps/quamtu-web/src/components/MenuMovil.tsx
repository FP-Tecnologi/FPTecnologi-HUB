'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

// Menú desplegable para pantallas menores a lg (el menú horizontal queda oculto).
export default function MenuMovil({ enlaces }: { enlaces: { href: string; texto: string }[] }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="lg:hidden">
      <button onClick={() => setAbierto(!abierto)} aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={abierto} className="grid h-9 w-9 place-items-center">
        {abierto ? <X size={22} /> : <Menu size={22} />}
      </button>
      {abierto && (
        <nav className="absolute inset-x-0 top-full border-b border-line bg-bg/95 px-4 py-4 backdrop-blur-md">
          <ul className="mx-auto max-w-[1600px] divide-y divide-line/60">
            {enlaces.map((e) => (
              <li key={e.href}>
                <Link href={e.href} onClick={() => setAbierto(false)} className="block py-3.5 font-display text-base uppercase tracking-wide text-slate-200 hover:text-claro">{e.texto}</Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
