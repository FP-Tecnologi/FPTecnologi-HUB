'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { waUrl } from '@/lib/contacto';

// Botón fijo de WhatsApp. En armador, cotizador y carrito se oculta: ahí hay barras fijas propias.
const VISIBLE = ['/', '/tienda', '/producto'];

export default function WhatsAppFlotante() {
  const ruta = usePathname();
  const [sobreCierre, setSobreCierre] = useState(false);

  useEffect(() => {
    const zonas = ['contacto', 'pie'].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!zonas.length) return;
    const visibles = new Set<Element>();
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? visibles.add(e.target) : visibles.delete(e.target)));
      setSobreCierre(visibles.size > 0);
    });
    zonas.forEach((z) => io.observe(z));
    return () => io.disconnect();
  }, [ruta]);

  if (!VISIBLE.some((v) => (v === '/' ? ruta === '/' : ruta.startsWith(v)))) return null;
  return (
    <a
      href={waUrl('Hola Quamtu, quisiera más información.')}
      target="_blank"
      rel="noreferrer"
      aria-label="Escribir por WhatsApp"
      className={`group fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] p-3 sm:bottom-5 sm:right-5 sm:p-3.5 text-[#04210f] shadow-[0_8px_24px_rgba(0,0,0,.45)] transition hover:scale-105 sm:pr-5 ${sobreCierre ? 'pointer-events-none translate-y-4 opacity-0' : ''}`}
    >
      <MessageCircle size={26} fill="currentColor" strokeWidth={1.5} />
      <span className="hidden font-display text-xs font-bold tracking-wide sm:inline">ESCRÍBENOS</span>
    </a>
  );
}
