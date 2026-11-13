'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, X } from 'lucide-react';
import { AbanicoBbva, HREF_BBVA, LogoBbva } from './Tarjetas';

const CLAVE = 'bbva-popup-visto';
// Páginas informativas donde el aviso no estorba. Nunca en formularios (cotizar, contacto, reclamos) ni en la propia página de BBVA.
const PAGINAS = ['/', '/catalogo', '/nosotros', '/peru-compras', '/tienda'];
const aplica = (ruta: string) => PAGINAS.some((p) => (p === '/' ? ruta === '/' : ruta === p || ruta.startsWith(`${p}/`)));

/* Aviso en esquina con el abanico de tarjetas: una vez por sesión, al bajar la mitad de la página o a los 25 s. */
export default function PopupBbva() {
  const ruta = usePathname();
  const [visible, setVisible] = useState(false);
  const ok = aplica(ruta);

  useEffect(() => {
    if (!ok) return;
    try {
      if (sessionStorage.getItem(CLAVE)) return;
    } catch {
      return;
    }
    const mostrar = () => {
      setVisible(true);
      try {
        sessionStorage.setItem(CLAVE, '1');
      } catch {
        /* sin almacenamiento: igual se muestra una vez en esta vista */
      }
      window.removeEventListener('scroll', alBajar);
      clearTimeout(t);
    };
    const alBajar = () => {
      if (window.scrollY > (document.documentElement.scrollHeight - window.innerHeight) * 0.5) mostrar();
    };
    const t = setTimeout(mostrar, 25_000);
    window.addEventListener('scroll', alBajar, { passive: true });
    return () => {
      window.removeEventListener('scroll', alBajar);
      clearTimeout(t);
    };
  }, [ok, ruta]);

  useEffect(() => {
    if (!visible) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setVisible(false);
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [visible]);

  if (!visible || !ok) return null;
  return (
    <aside
      role="dialog"
      aria-label="Tarjetas de crédito BBVA"
      className="print:hidden fixed bottom-24 left-4 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-gradient-to-br from-[#070E46] via-[#004481] to-[#001391] p-5 text-white shadow-2xl shadow-[#001391]/40 sm:bottom-5 motion-safe:animate-[aparecer_0.3s_ease-out]"
    >
      <button type="button" onClick={() => setVisible(false)} aria-label="Cerrar aviso de BBVA" className="absolute right-2 top-2 z-10 grid size-11 place-items-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-white">
        <X aria-hidden="true" size={18} />
      </button>
      <LogoBbva blanco className="h-4" />
      <AbanicoBbva className="mx-auto mt-2 w-48" />
      <p className="mt-2 font-display text-xl font-bold leading-snug">¿Ya sabes qué tarjeta BBVA tienes preaprobada?</p>
      <p className="mt-1 text-sm text-white/90">Consulta con tu DNI en 1 minuto. Sin costo.</p>
      <Link href={`${HREF_BBVA}#consulta`} onClick={() => setVisible(false)} className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#85C8FF] font-semibold text-[#070E46] transition-colors hover:bg-white focus-visible:outline-white">
        Ver mis tarjetas <ArrowRight aria-hidden="true" size={18} />
      </Link>
    </aside>
  );
}
