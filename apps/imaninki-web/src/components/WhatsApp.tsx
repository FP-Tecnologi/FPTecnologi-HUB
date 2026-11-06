'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Armchair, ChevronRight, FileText, HardHat, HelpCircle, Landmark, PaintBucket, Phone, X, type LucideIcon } from 'lucide-react';
import { contacto, waUrl } from '@/lib/contenido';

/** Logo de WhatsApp (glifo oficial, un solo color). */
export function IconoWhatsApp({ className = 'size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.41z" />
    </svg>
  );
}

// Cada motivo abre WhatsApp con un mensaje ya escrito, así el equipo sabe de qué se trata.
const MOTIVOS: { titulo: string; detalle: string; Icono: LucideIcon; mensaje: string }[] = [
  { titulo: 'Cotizar productos', detalle: 'Pide una propuesta para tu proyecto', Icono: FileText, mensaje: 'Hola Imaninki, quisiera cotizar productos para mi proyecto.' },
  { titulo: 'Línea de pinturas', detalle: 'Vial, gloss, arquitectónica, látex y base', Icono: PaintBucket, mensaje: 'Hola Imaninki, quisiera información sobre la línea de pinturas.' },
  { titulo: 'Mobiliario corporativo', detalle: 'Sillas presidenciales, gerenciales y butacas', Icono: Armchair, mensaje: 'Hola Imaninki, quisiera información sobre el mobiliario corporativo.' },
  { titulo: 'Construcción y emergencia', detalle: 'Calaminas, carpas y herramientas', Icono: HardHat, mensaje: 'Hola Imaninki, quisiera información sobre calaminas, carpas o herramientas.' },
  { titulo: 'Licitaciones y Perú Compras', detalle: 'Entidades públicas y privadas', Icono: Landmark, mensaje: 'Hola Imaninki, represento a una entidad y quisiera información sobre licitaciones o Perú Compras.' },
  { titulo: 'Otra consulta', detalle: 'Cualquier otro tema', Icono: HelpCircle, mensaje: 'Hola Imaninki, quisiera más información.' },
];

// Zonas donde el botón estorba (pie y formulario): se oculta mientras se solapan, salvo con el panel abierto.
const ZONAS = ['pie', 'contacto-form'];

export default function WhatsApp() {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [sobreZona, setSobreZona] = useState(false);
  const [aviso, setAviso] = useState(false);
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
    return () => { io.disconnect(); setSobreZona(false); };
  }, [ruta]);

  useEffect(() => setAbierto(false), [ruta]);

  // Burbuja de saludo una sola vez por visita, a los pocos segundos.
  useEffect(() => {
    let visto = false;
    try { visto = sessionStorage.getItem('imaninki-saludo') === '1'; } catch {}
    if (visto) return;
    const t = setTimeout(() => { setAviso(true); try { sessionStorage.setItem('imaninki-saludo', '1'); } catch {} }, 12000);
    const fin = setTimeout(() => setAviso(false), 22000);
    return () => { clearTimeout(t); clearTimeout(fin); };
  }, []);

  useEffect(() => {
    if (!abierto) return;
    setAviso(false);
    try { sessionStorage.setItem('imaninki-saludo', '1'); } catch {}
    panel.current?.querySelector('a')?.focus();
    const fuera = (e: MouseEvent) => !caja.current?.contains(e.target as Node) && setAbierto(false);
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setAbierto(false); boton.current?.focus(); } };
    document.addEventListener('mousedown', fuera);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', fuera); document.removeEventListener('keydown', esc); };
  }, [abierto]);

  const oculto = sobreZona && !abierto;

  return (
    <div ref={caja} className={`fixed bottom-5 right-5 z-50 transition duration-300 ${oculto ? 'invisible translate-y-4 opacity-0' : ''}`}>
      {abierto && (
        <div
          ref={panel}
          id="panel-whatsapp"
          role="dialog"
          aria-label="Escribirnos por WhatsApp"
          className="absolute bottom-[5rem] right-0 w-[calc(100vw-2.5rem)] max-w-sm origin-bottom-right overflow-hidden rounded-md bg-white shadow-[0_30px_60px_-20px_rgb(13_13_14/0.45),0_0_0_1px_rgb(212_24_42/0.12)] motion-safe:animate-[panel-wa_0.35s_var(--suave)]"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-tinta via-carbon to-rojo-hondo px-5 pb-5 pt-4 text-white">
            <img loading="lazy" decoding="async" src="/icon.svg" alt="" aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 w-32 opacity-15 brightness-[3] grayscale" />
            <div className="relative flex items-center gap-3">
              <span className="relative grid size-11 place-items-center rounded-md bg-white">
                <img loading="lazy" decoding="async" src="/icon.svg" alt="" className="size-7" />
                <span aria-hidden="true" className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-white bg-[#25d366]" />
              </span>
              <div>
                <p className="font-titulo font-bold leading-tight">Imaninki · Atención comercial</p>
                <p className="text-xs text-white/75">En línea · te respondemos de inmediato</p>
              </div>
            </div>
            <p className="relative mt-4 w-fit max-w-[85%] rounded-md rounded-tl-md bg-white/12 px-4 py-2.5 text-sm leading-snug backdrop-blur">
              ¡Hola! ¿En qué te ayudamos? Elige un tema y seguimos por WhatsApp.
            </p>
          </div>
          <ul className="max-h-[calc(100svh-17rem)] overflow-y-auto p-2">
            {MOTIVOS.map(({ titulo, detalle, Icono, mensaje }, i) => (
              <li key={titulo} className="entrada" style={{ '--retraso': `${60 + i * 45}ms` } as React.CSSProperties}>
                <a
                  href={waUrl(mensaje)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setAbierto(false)}
                  className="group flex min-h-14 items-center gap-3 rounded-md px-2.5 py-2.5 transition duration-300 hover:bg-niebla focus-visible:bg-niebla"
                >
                  <span className="icono-caja grid size-10 shrink-0 place-items-center rounded-md bg-rojo/10 text-rojo-hondo group-hover:bg-rojo group-hover:text-white">
                    <Icono aria-hidden="true" size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block text-sm font-semibold leading-snug text-tinta">{titulo}<span className="sr-only"> (se abre en otra pestaña)</span></b>
                    <span className="block text-xs leading-snug text-carbon/75">{detalle}</span>
                  </span>
                  <ChevronRight aria-hidden="true" size={18} className="shrink-0 text-carbon/50 transition duration-300 group-hover:translate-x-1 group-hover:text-rojo" />
                </a>
              </li>
            ))}
          </ul>
          <a href={contacto.telefonoHref} className="flex items-center justify-center gap-2 border-t border-rojo/10 bg-niebla px-4 py-3 text-xs font-semibold text-carbon/80 transition hover:text-rojo-hondo">
            <Phone aria-hidden="true" size={16} className="text-rojo-hondo" />Llamar al {contacto.telefono}
          </a>
        </div>
      )}

      {aviso && !abierto && (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="absolute bottom-3 right-[4.75rem] w-max max-w-56 rounded-md rounded-br-md bg-white px-4 py-2.5 text-left text-sm font-semibold text-tinta shadow-xl shadow-tinta/15 ring-1 ring-rojo/10 motion-safe:animate-[entrada_0.5s_var(--suave)]"
        >
          ¿Necesitas una cotización? <span className="text-rojo-hondo">Escríbenos</span>
        </button>
      )}

      <button
        ref={boton}
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-label={abierto ? 'Cerrar opciones de WhatsApp' : 'Escribir por WhatsApp'}
        aria-expanded={abierto}
        aria-controls="panel-whatsapp"
        aria-haspopup="dialog"
        className={`relative grid size-16 place-items-center rounded-md text-white`}
      >
        <span className="boton grid size-full place-items-center rounded-md bg-gradient-to-br from-rojo to-rojo-hondo shadow-xl shadow-rojo-hondo/40">
          {abierto ? <X size={28} aria-hidden="true" /> : <IconoWhatsApp className="icono-sacude size-8" />}
        </span>
      </button>
    </div>
  );
}
