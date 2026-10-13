'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ClipboardList, Headset, HelpCircle, PackageSearch, ShoppingBag, TriangleAlert, X, type LucideIcon } from 'lucide-react';
import { waUrl } from '@/lib/contacto';
import { porId } from '@/lib/piezas';

// Botón fijo de WhatsApp. En armador, cotizador y carrito se oculta: ahí hay barras fijas propias.
const VISIBLE = ['/', '/tienda', '/producto'];

type Motivo = { id: string; titulo: string; detalle: string; Icono: LucideIcon; mensaje: (producto?: string) => string };

// Cada motivo abre WhatsApp con un mensaje ya escrito para que el especialista sepa de qué se trata.
const MOTIVOS: Motivo[] = [
  {
    id: 'consulta',
    titulo: 'Consulta de un producto',
    detalle: 'Dudas sobre características, stock o precio',
    Icono: PackageSearch,
    mensaje: (p) => (p ? `Hola Quamtu, tengo una consulta sobre este producto: ${p}.` : 'Hola Quamtu, tengo una consulta sobre un producto.'),
  },
  {
    id: 'compra',
    titulo: 'Comprar o cotizar',
    detalle: 'Quiero comprar o pedir una cotización',
    Icono: ShoppingBag,
    mensaje: (p) => (p ? `Hola Quamtu, quiero comprar o cotizar: ${p}.` : 'Hola Quamtu, quiero comprar o pedir una cotización.'),
  },
  {
    id: 'asesoria',
    titulo: 'Asesoría para armar mi PC',
    detalle: 'Ayuda para elegir las piezas',
    Icono: ClipboardList,
    mensaje: () => 'Hola Quamtu, necesito asesoría para elegir y armar mi equipo.',
  },
  {
    id: 'soporte',
    titulo: 'Soporte técnico',
    detalle: 'Ayuda con mi equipo Quamtu',
    Icono: Headset,
    mensaje: () => 'Hola Quamtu, necesito soporte técnico para mi equipo. Mi equipo/modelo es: ',
  },
  {
    id: 'problema',
    titulo: 'Problema con mi producto',
    detalle: 'Falla, garantía o reclamo',
    Icono: TriangleAlert,
    mensaje: () => 'Hola Quamtu, tengo un problema con mi producto. Mi pedido/equipo es: ',
  },
  {
    id: 'otro',
    titulo: 'Otra consulta',
    detalle: 'Cualquier otro tema',
    Icono: HelpCircle,
    mensaje: () => 'Hola Quamtu, quisiera más información.',
  },
];

// Logotipo de WhatsApp
function IconoWa({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export default function WhatsAppFlotante() {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [sobreCierre, setSobreCierre] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  // Si el visitante está en la ficha de un producto, el mensaje ya lo nombra.
  const producto = ruta.startsWith('/producto/') ? porId(decodeURIComponent(ruta.split('/')[2] ?? ''))?.nombre : undefined;

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

  useEffect(() => {
    setAbierto(false);
  }, [ruta]);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => !caja.current?.contains(e.target as Node) && setAbierto(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false);
    document.addEventListener('mousedown', fuera);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', fuera);
      document.removeEventListener('keydown', esc);
    };
  }, [abierto]);

  if (!VISIBLE.some((v) => (v === '/' ? ruta === '/' : ruta.startsWith(v)))) return null;
  const oculto = sobreCierre && !abierto;

  return (
    <div ref={caja} className={`fixed bottom-4 right-4 z-40 sm:bottom-5 sm:right-5 ${oculto ? 'pointer-events-none translate-y-4 opacity-0' : ''} transition duration-200`}>
      {abierto && (
        <div role="dialog" aria-label="Chat de Quamtu" className="absolute bottom-[4.5rem] right-0 w-[calc(100vw-2rem)] max-w-80 overflow-hidden rounded-2xl border border-line bg-bg shadow-[0_18px_44px_rgba(0,0,0,.45)]">
          {/* Cabecera con los colores de la marca */}
          <div className="flex items-center gap-3 bg-gradient-to-br from-boton to-violet px-4 py-4 text-white">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15">
              <IconoWa size={22} />
            </span>
            <div>
              <p className="font-display text-sm font-bold leading-tight">¿En qué te ayudamos?</p>
              <p className="text-xs text-white/85">Elige un tema y seguimos por WhatsApp</p>
            </div>
          </div>
          <ul className="max-h-[55vh] divide-y divide-line/60 overflow-y-auto px-2 py-1">
            {MOTIVOS.map(({ id, titulo, detalle, Icono, mensaje }) => (
              <li key={id}>
                <a
                  href={waUrl(mensaje(producto))}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setAbierto(false)}
                  className="group flex items-center gap-3 rounded-lg px-2 py-3 transition duration-200 hover:translate-x-1 hover:bg-cyan/10"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-claro transition-all duration-300 group-hover:-rotate-12 group-hover:scale-125 group-hover:border-claro group-hover:bg-claro/15"><Icono size={17} /></span>
                  <span className="min-w-0">
                    <b className="block text-sm text-white">{titulo}</b>
                    <span className="block text-xs text-slate-400">{detalle}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => setAbierto(!abierto)}
        aria-label={abierto ? 'Cerrar el chat' : 'Abrir el chat de WhatsApp'}
        aria-expanded={abierto}
        title={abierto ? 'Cerrar' : 'Chat'}
        className={`wa-boton relative grid h-14 w-14 place-items-center rounded-full ${abierto ? '' : 'wa-pulso'}`}
      >
        {abierto ? <X size={26} /> : <IconoWa size={28} />}
      </button>
    </div>
  );
}
