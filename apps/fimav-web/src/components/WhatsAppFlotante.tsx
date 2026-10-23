'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRight, FileText, Headset, HelpCircle, Landmark, MessageCircle, PackageSearch, TriangleAlert, X, type LucideIcon } from 'lucide-react';
import Espiral from './Espiral';
import Hexagono from './Hexagono';
import { rutaHexagono } from './hex/rutaHexagono';
import { waUrl } from '@/lib/contacto';

const HEX = rutaHexagono({ orientacion: 'punta-arriba', radio: 0.12 });
const capa = (cls: string) => (
  <span aria-hidden="true" className={`pointer-events-none absolute -z-10 ${cls}`}>
    <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="block size-full"><path d={HEX} fill="currentColor" /></svg>
  </span>
);

// Cada motivo abre WhatsApp con un mensaje ya escrito para que el equipo sepa de qué se trata.
const MOTIVOS: { titulo: string; detalle: string; Icono: LucideIcon; mensaje: string }[] = [
  { titulo: 'Cotizar equipos', detalle: 'Pide una propuesta para tu organización', Icono: FileText, mensaje: 'Hola Fimav Perú, quisiera cotizar equipos para mi organización.' },
  { titulo: 'Consulta de un producto', detalle: 'Características, stock o disponibilidad', Icono: PackageSearch, mensaje: 'Hola Fimav Perú, tengo una consulta sobre un producto.' },
  { titulo: 'Entidades del Estado y Perú Compras', detalle: 'Compras públicas y convenio marco', Icono: Landmark, mensaje: 'Hola Fimav Perú, represento a una entidad del Estado y quisiera información sobre Perú Compras.' },
  { titulo: 'Soporte técnico y garantía', detalle: 'Ayuda con un equipo o su garantía', Icono: Headset, mensaje: 'Hola Fimav Perú, necesito soporte técnico o consultar la garantía de un equipo. Mi equipo/modelo es: ' },
  { titulo: 'Postventa o reclamo', detalle: 'Seguimiento de una compra o un reclamo', Icono: TriangleAlert, mensaje: 'Hola Fimav Perú, tengo una consulta de postventa o un reclamo. Mi pedido/comprobante es: ' },
  { titulo: 'Otra consulta', detalle: 'Cualquier otro tema', Icono: HelpCircle, mensaje: 'Hola Fimav Perú, quisiera más información.' },
];

// Zonas donde el botón estorba (pie y formularios): se oculta mientras se solapan, salvo que el panel esté abierto.
const ZONAS = ['pie', 'contacto-form', 'cotizar-form'];

export default function WhatsAppFlotante() {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [sobreZona, setSobreZona] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const zonas = ZONAS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!zonas.length) return;
    const visibles = new Set<Element>();
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? visibles.add(e.target) : visibles.delete(e.target)));
      setSobreZona(visibles.size > 0);
    });
    zonas.forEach((z) => io.observe(z));
    return () => { io.disconnect(); visibles.clear(); setSobreZona(false); };
  }, [ruta]);

  useEffect(() => setAbierto(false), [ruta]);

  useEffect(() => {
    if (!abierto) return;
    panel.current?.querySelector('a')?.focus();
    const fuera = (e: MouseEvent) => !caja.current?.contains(e.target as Node) && setAbierto(false);
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setAbierto(false); boton.current?.focus(); } };
    document.addEventListener('mousedown', fuera);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', fuera); document.removeEventListener('keydown', esc); };
  }, [abierto]);

  const oculto = sobreZona && !abierto;

  return (
    <div ref={caja} className={`print:hidden fixed bottom-5 right-5 z-50 transition duration-200 ${oculto ? 'invisible translate-y-4 opacity-0' : ''}`}>
      {abierto && (
        <div
          ref={panel}
          id="panel-whatsapp"
          role="dialog"
          aria-label="Escribirnos por WhatsApp"
          className="absolute bottom-[4.75rem] right-0 w-[calc(100vw-2.5rem)] max-w-sm origin-bottom-right overflow-hidden rounded-3xl border border-carbon/15 bg-white shadow-[0_24px_48px_-16px_rgb(192_32_32/0.35),0_12px_28px_-12px_rgb(56_56_60/0.45)] motion-safe:animate-[aparecer_0.2s_ease-out]"
        >
          <div className="relative overflow-hidden bg-carbon px-5 py-4 text-white">
            <Espiral contorno className="pointer-events-none absolute -right-8 -top-10 w-32 opacity-30" />
            <p className="relative font-display text-lg font-bold uppercase leading-tight tracking-wide">¿En qué te ayudamos?</p>
            <p className="relative mt-0.5 text-sm text-white/90">Elige un tema y seguimos por WhatsApp</p>
          </div>
          <ul className="max-h-[calc(100svh-15rem)] divide-y divide-carbon/10 overflow-y-auto px-2 py-1">
            {MOTIVOS.map(({ titulo, detalle, Icono, mensaje }) => (
              <li key={titulo}>
                <a
                  href={waUrl(mensaje)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setAbierto(false)}
                  className="group/tarjeta flex min-h-14 items-center gap-3 rounded-2xl px-2 py-2.5 transition hover:bg-gris"
                >
                  <Hexagono icono={Icono} tam={40} />
                  <span className="min-w-0 flex-1">
                    <b className="block text-sm font-semibold leading-snug text-carbon">{titulo}<span className="sr-only"> (se abre en otra pestaña)</span></b>
                    <span className="block text-xs leading-snug text-carbon/80">{detalle}</span>
                  </span>
                  <ChevronRight aria-hidden="true" size={18} className="shrink-0 text-carbon transition-transform motion-safe:group-hover/tarjeta:translate-x-0.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        ref={boton}
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-label={abierto ? 'Cerrar opciones de WhatsApp' : 'Escribir por WhatsApp'}
        aria-expanded={abierto}
        aria-controls="panel-whatsapp"
        aria-haspopup="dialog"
        className="group isolate grid h-16 w-14 place-items-center text-white drop-shadow-lg focus-visible:outline-hidden"
      >
        {capa('-inset-[5px] text-tinta opacity-0 group-focus-visible:opacity-100')}
        {capa('-inset-[3px] text-white opacity-0 group-focus-visible:opacity-100')}
        {capa('inset-0 text-boton transition-colors group-hover:text-rojo-hondo')}
        {abierto ? <X size={26} aria-hidden="true" /> : <MessageCircle size={26} aria-hidden="true" />}
      </button>
    </div>
  );
}
