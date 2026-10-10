'use client';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { waUrl } from '@/lib/contacto';

// Botón fijo de WhatsApp. En armador, cotizador y carrito se oculta: ahí hay barras fijas propias.
const VISIBLE = ['/', '/tienda', '/producto'];

export default function WhatsAppFlotante() {
  const ruta = usePathname();
  if (!VISIBLE.some((v) => (v === '/' ? ruta === '/' : ruta.startsWith(v)))) return null;
  return (
    <a
      href={waUrl('Hola Quamtu, quisiera más información.')}
      target="_blank"
      rel="noreferrer"
      aria-label="Escribir por WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-[0_8px_28px_rgba(37,211,102,.45)] transition hover:scale-105 sm:pr-5"
    >
      <MessageCircle size={26} fill="currentColor" strokeWidth={1.5} />
      <span className="hidden font-display text-xs font-bold tracking-wide sm:inline">ESCRÍBENOS</span>
    </a>
  );
}
