'use client';

import { useEffect, useState } from 'react';
import { User } from 'lucide-react';

type Sesion = { nombre: string | null; email: string } | null;

const iniciales = (s: { nombre: string | null; email: string }) =>
  (s.nombre?.trim() || s.email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

/* Avatar de «Mi cuenta» en el encabezado: con sesión muestra las iniciales del cliente en un círculo blanco;
   sin sesión, el ícono de usuario con el texto «Iniciar sesión». Ambos llevan a /cuenta. */
export function CuentaAvatar({ className = '' }: { className?: string }) {
  const [sesion, setSesion] = useState<Sesion | undefined>(undefined);

  useEffect(() => {
    let vivo = true;
    fetch('/api/cuenta/sesion', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => vivo && setSesion(d.sesion ?? null))
      .catch(() => vivo && setSesion(null));
    return () => {
      vivo = false;
    };
  }, []);

  const conSesion = !!sesion;
  return (
    <a
      href="/cuenta"
      aria-label={conSesion ? `Mi cuenta: ${sesion!.nombre ?? sesion!.email}` : 'Iniciar sesión'}
      title={conSesion ? 'Mi cuenta' : 'Iniciar sesión'}
      className={`flex items-center justify-center rounded-xl border border-white/40 text-white transition-colors hover:border-white hover:bg-white/20 ${conSesion ? 'bg-white text-brand-700 hover:bg-white' : 'bg-white/10'} ${className}`}
    >
      {conSesion ? <span className="text-[13px] font-extrabold leading-none text-brand-700">{iniciales(sesion!)}</span> : <User className="h-5 w-5" strokeWidth={2} />}
    </a>
  );
}
