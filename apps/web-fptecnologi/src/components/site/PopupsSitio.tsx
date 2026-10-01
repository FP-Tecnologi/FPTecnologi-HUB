'use client';

/*
 * Popups de aviso de la web (se administran en el dashboard: Web informativa → Popups). Pide a la API los
 * popups vigentes de la página actual, elige el de mayor prioridad que corresponda mostrar a este visitante
 * (frecuencia, dispositivo) y lo abre según su disparador: al cargar, tras unos segundos, al bajar por la
 * página o al intentar salir. Nunca muestra más de uno por página.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { useSitio } from '@/context/SitioContext';
import { contarEvento, frecuenciaPermite, marcarVisto, paginaDe, type PopupPublico } from '@/lib/popups';

const TEMAS = {
  azul: { bg: '#107acc', fg: '#ffffff', btn: '#ffffff', btnFg: '#107acc', suave: 'rgba(255,255,255,.16)' },
  oscuro: { bg: '#0f172a', fg: '#ffffff', btn: '#38bdf8', btnFg: '#0f172a', suave: 'rgba(255,255,255,.12)' },
  claro: { bg: '#ffffff', fg: '#0f172a', btn: '#107acc', btnFg: '#ffffff', suave: 'rgba(15,23,42,.07)' },
  acento: { bg: '#f97316', fg: '#ffffff', btn: '#ffffff', btnFg: '#c2410c', suave: 'rgba(255,255,255,.2)' },
} as const;

const esMovil = () => window.matchMedia('(max-width: 767px)').matches;
const dinero = (n: number, moneda: string) => `${moneda === 'USD' ? 'US$' : 'S/'} ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function PopupsSitio() {
  const pathname = usePathname();
  const { whatsapp } = useSitio();
  const [abierto, setAbierto] = useState<PopupPublico | null>(null);
  const [copiado, setCopiado] = useState(false);
  const cerrarRef = useRef<HTMLButtonElement>(null);

  const cerrar = useCallback(() => setAbierto(null), []);

  useEffect(() => {
    setAbierto(null);
    setCopiado(false);
    if (pathname.startsWith('/l/')) return; // las landings de campaña son su propia página, sin avisos encima
    const pagina = paginaDe(pathname);
    let vivo = true;
    const limpiezas: (() => void)[] = [];

    fetch(`/api/hub/popups?pagina=${encodeURIComponent(pagina)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then(({ data }: { data: PopupPublico[] }) => {
        if (!vivo) return;
        const movil = esMovil();
        const elegido = data.find((p) => (p.dispositivo === 'todos' || (p.dispositivo === 'movil') === movil) && frecuenciaPermite(p));
        if (!elegido) return;

        let mostrado = false;
        const mostrar = () => {
          if (!vivo || mostrado) return;
          mostrado = true;
          marcarVisto(elegido);
          contarEvento(elegido.id, 'vista');
          setAbierto(elegido);
        };

        if (elegido.disparador === 'carga') mostrar();
        else if (elegido.disparador === 'retraso') {
          const t = window.setTimeout(mostrar, Math.max(0, elegido.disparadorValor) * 1000);
          limpiezas.push(() => window.clearTimeout(t));
        } else if (elegido.disparador === 'scroll') {
          const alScroll = () => {
            const alto = document.documentElement.scrollHeight - window.innerHeight;
            if (alto > 0 && (window.scrollY / alto) * 100 >= elegido.disparadorValor) mostrar();
          };
          window.addEventListener('scroll', alScroll, { passive: true });
          limpiezas.push(() => window.removeEventListener('scroll', alScroll));
        } else if (elegido.disparador === 'salida' && !movil) {
          // Intención de salida: el cursor sale por el borde superior de la ventana.
          const alSalir = (e: MouseEvent) => { if (e.clientY <= 0) mostrar(); };
          document.addEventListener('mouseleave', alSalir);
          limpiezas.push(() => document.removeEventListener('mouseleave', alSalir));
        }
      })
      .catch(() => undefined);

    return () => { vivo = false; limpiezas.forEach((f) => f()); };
  }, [pathname]);

  // Esc cierra el modal y el foco entra al botón de cerrar.
  useEffect(() => {
    if (!abierto) return;
    if (abierto.formato === 'modal') cerrarRef.current?.focus();
    const alTecla = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrar(); };
    document.addEventListener('keydown', alTecla);
    return () => document.removeEventListener('keydown', alTecla);
  }, [abierto, cerrar]);

  if (!abierto) return null;
  const p = abierto;
  const c = p.contenido;
  const col = TEMAS[c.tema] ?? TEMAS.azul;
  const titulo = c.titulo || p.producto?.nombre || '';
  const imagen = p.producto?.imagen || c.imagenUrl;
  const modal = p.formato === 'modal';
  const barra = p.formato === 'barra';

  const href = c.accion === 'whatsapp' ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(c.whatsappTexto || titulo)}` : p.enlace;
  const hayBoton = c.accion === 'ninguna' ? !!c.botonTexto : !!href;
  const alBoton = () => { contarEvento(p.id, 'clic'); cerrar(); };
  const externo = /^https?:\/\//i.test(href);
  const estiloBoton = { background: col.btn, color: col.btnFg } as const;
  const claseBoton = `inline-flex items-center justify-center rounded-lg font-bold transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 ${barra ? 'px-3 py-1 text-sm' : 'px-5 py-2.5 text-sm'}`;

  async function copiar() {
    try { await navigator.clipboard.writeText(c.codigo); setCopiado(true); window.setTimeout(() => setCopiado(false), 2000); } catch { /* sin portapapeles */ }
  }

  const boton = !hayBoton ? null : c.accion === 'ninguna' ? (
    <button type="button" onClick={cerrar} className={claseBoton} style={estiloBoton}>{c.botonTexto}</button>
  ) : externo ? (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={alBoton} className={claseBoton} style={estiloBoton}>{c.botonTexto}</a>
  ) : (
    <Link href={href} onClick={alBoton} className={claseBoton} style={estiloBoton}>{c.botonTexto}</Link>
  );

  const contenido = (
    <>
      {imagen && modal && (
        // eslint-disable-next-line @next/next/no-img-element -- imágenes de la API/CDN con tamaño variable
        <img src={imagen} alt="" className={`w-full object-cover ${p.producto ? 'h-48 bg-white object-contain p-4' : 'h-44'}`} />
      )}
      <div className={barra ? 'flex flex-wrap items-center gap-x-4 gap-y-1 pe-10' : 'flex flex-col items-start gap-3 p-6'}>
        {c.etiqueta && <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider" style={{ background: col.suave }}>{c.etiqueta}</span>}
        {c.descuento && !barra && <span className="text-5xl font-extrabold leading-none">{c.descuento}</span>}
        <h2 id="popup-titulo" className={barra ? 'text-sm font-bold' : 'text-2xl font-extrabold leading-tight'}>{titulo}</h2>
        {c.texto && !barra && <p className="text-sm leading-relaxed opacity-90">{c.texto}</p>}
        {p.producto && !barra && (
          <p className="text-lg font-bold">
            {dinero(p.producto.precio, p.producto.moneda)} <span className="text-xs font-normal opacity-75">+ IGV</span>
            {p.producto.precioAntes ? <s className="ms-2 text-sm font-normal opacity-60">{dinero(p.producto.precioAntes, p.producto.moneda)}</s> : null}
          </p>
        )}
        {(c.fecha || c.lugar) && !barra && <p className="text-sm font-semibold opacity-90">{[c.fecha, c.lugar].filter(Boolean).join(' · ')}</p>}
        {c.codigo && !barra && (
          <button type="button" onClick={() => void copiar()} aria-label={`Copiar código ${c.codigo}`}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed px-3 py-1.5 font-mono text-base font-bold tracking-widest" style={{ borderColor: col.fg }}>
            {c.codigo} {copiado ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
            <span className="sr-only" role="status">{copiado ? 'Código copiado' : ''}</span>
          </button>
        )}
        {boton}
        {c.cerrarTexto && !barra && <button type="button" onClick={cerrar} className="text-xs underline opacity-75 hover:opacity-100">{c.cerrarTexto}</button>}
      </div>
    </>
  );

  const botonX = (
    <button ref={cerrarRef} type="button" onClick={cerrar} aria-label="Cerrar aviso"
      className={`absolute z-10 flex h-8 w-8 items-center justify-center rounded-full transition hover:opacity-80 ${barra ? 'end-3 top-1/2 -translate-y-1/2' : 'end-3 top-3'}`}
      style={{ background: imagen && modal ? 'rgba(0,0,0,.45)' : col.suave, color: imagen && modal ? '#fff' : col.fg }}>
      <X size={18} aria-hidden />
    </button>
  );

  if (modal) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4" onClick={cerrar}>
        <div role="dialog" aria-modal="true" aria-labelledby="popup-titulo" onClick={(e) => e.stopPropagation()}
          className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl shadow-2xl" style={{ background: col.bg, color: col.fg }}>
          {botonX}
          {contenido}
        </div>
      </div>
    );
  }
  if (barra) {
    return (
      <div role="region" aria-labelledby="popup-titulo" className="fixed inset-x-0 top-0 z-[80] px-4 py-2.5 shadow-lg" style={{ background: col.bg, color: col.fg }}>
        <div className="relative mx-auto max-w-6xl">{botonX}{contenido}</div>
      </div>
    );
  }
  return (
    <div role="dialog" aria-labelledby="popup-titulo" className="fixed bottom-5 left-5 z-[80] w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-2xl shadow-2xl" style={{ background: col.bg, color: col.fg }}>
      {botonX}
      {contenido}
    </div>
  );
}
