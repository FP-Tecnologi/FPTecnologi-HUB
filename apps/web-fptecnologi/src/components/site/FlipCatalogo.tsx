'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Maximize2, Minimize2, Share2 } from 'lucide-react';

/* Folleto con pasa-páginas: renderiza el PDF a imágenes (pdf.js) y las voltea con page-flip. */
export function FlipCatalogo({ src, titulo, inmersivo = false }: { src: string; titulo: string; inmersivo?: boolean }) {
  const caja = useRef<HTMLDivElement>(null);
  const marco = useRef<HTMLDivElement>(null);
  const [pantalla, setPantalla] = useState(inmersivo);
  const imagenes = useRef<string[]>([]);
  const ratioRef = useRef(0.707);
  const paginaRef = useRef(0);
  const [tam, setTam] = useState(0);
  const flip = useRef<{ flipNext(): void; flipPrev(): void; flip(n: number): void; destroy(): void } | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'error'>('cargando');
  const [progreso, setProgreso] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let vivo = true;
    const urls: string[] = [];
    setEstado('cargando');
    setProgreso(0);
    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
        const pdf = await pdfjs.getDocument({ url: src }).promise;
        const imgs: string[] = [];
        let ratio = 0.707;
        // Resolución según la pantalla: la página se ve a ~90 % del alto de la ventana; se rinde a 1.5× ese tamaño
        // en píxeles reales (devicePixelRatio) para que el texto quede nítido incluso al ampliar. Con tope de memoria.
        const dpr = Math.min(window.devicePixelRatio || 1, 3);
        const altoObjetivo = Math.min(2800, Math.max(1500, Math.round(Math.min(window.innerHeight * 0.9, 1000) * dpr * 1.5)));
        for (let n = 1; n <= pdf.numPages; n++) {
          const p = await pdf.getPage(n);
          const base = p.getViewport({ scale: 1 });
          const vp = p.getViewport({ scale: Math.min(4, altoObjetivo / base.height) });
          if (n === 1) ratio = vp.width / vp.height;
          const c = document.createElement('canvas');
          c.width = vp.width;
          c.height = vp.height;
          await p.render({ canvas: c, viewport: vp }).promise;
          const blob = await new Promise<Blob>((ok) => c.toBlob((b) => ok(b!), 'image/jpeg', 0.93));
          const u = URL.createObjectURL(blob);
          urls.push(u);
          imgs.push(u);
          if (!vivo) return;
          setProgreso(Math.round((n / pdf.numPages) * 100));
        }
        if (!vivo) return;
        imagenes.current = imgs;
        ratioRef.current = ratio;
        setTotal(imgs.length);
        setPagina(1);
        setEstado('listo');
      } catch {
        if (vivo) setEstado('error');
      }
    })();
    return () => {
      vivo = false;
      flip.current?.destroy();
      flip.current = null;
      urls.forEach(URL.revokeObjectURL);
    };
  }, [src]);

  useEffect(() => {
    if (estado !== 'listo' || !caja.current) return;
    let vivo = true;
    (async () => {
      const { PageFlip } = await import('page-flip');
      if (!vivo || !caja.current) return;
      const r = ratioRef.current;
      const aW = caja.current.clientWidth;
      const aH = caja.current.clientHeight;
      const una = Math.min(aW, aH * r);
      const dos = Math.min(aW / 2, aH * r);
      const doble = dos >= una * 0.9;
      const pw = Math.floor(doble ? dos : una);
      const ph = Math.floor(pw / r);
      const el = document.createElement('div');
      el.style.margin = '0 auto';
      caja.current.appendChild(el);
      el.style.width = `${doble ? pw * 2 : pw}px`;
      el.style.height = `${ph}px`;
      const pf = new PageFlip(el, {
        width: pw,
        height: ph,
        size: 'fixed',
        showCover: true,
        usePortrait: true,
        startPage: paginaRef.current,
        maxShadowOpacity: 0.4,
        mobileScrollSupport: false,
      });
      // Páginas como <img> del DOM (modo HTML): el navegador las escala nítidas. El modo canvas de la librería
      // dibuja a tamaño CSS sin devicePixelRatio y el texto salía borroso.
      const hojas = imagenes.current.map((u, i) => {
        const d = document.createElement('div');
        d.style.cssText = 'background:#fff;overflow:hidden';
        if (i === 0 || i === imagenes.current.length - 1) d.setAttribute('data-density', 'hard');
        const im = document.createElement('img');
        im.src = u;
        im.alt = `Página ${i + 1}`;
        im.draggable = false;
        im.style.cssText = 'display:block;width:100%;height:100%;object-fit:fill;user-select:none;-webkit-user-drag:none';
        d.appendChild(im);
        el.appendChild(d);
        return d;
      });
      // Abierto en dos páginas, la portada (y la contraportada) quedan solas en una mitad: se desplaza el libro
      // media página para que se vea centrada y no con una página en blanco al lado.
      const total = hojas.length;
      const centrar = (i: number, animar: boolean) => {
        let dx = 0;
        if (doble) {
          if (i <= 0) dx = -pw / 2;
          else if (i % 2 === 1 && i + 1 >= total) dx = pw / 2;
        }
        el.style.transition = animar ? 'transform .45s ease' : 'none';
        el.style.transform = dx ? `translateX(${dx}px)` : '';
      };
      centrar(paginaRef.current, false);
      pf.loadFromHTML(hojas);
      pf.on('flip', (e: { data: unknown }) => {
        paginaRef.current = e.data as number;
        setPagina(paginaRef.current + 1);
        centrar(paginaRef.current, true);
      });
      flip.current = pf;
    })();
    return () => {
      vivo = false;
      flip.current?.destroy();
      flip.current = null;
      caja.current?.replaceChildren();
    };
  }, [estado, pantalla, tam]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const r = () => {
      clearTimeout(t);
      t = setTimeout(() => setTam((v) => v + 1), 250);
    };
    window.addEventListener('resize', r);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', r);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = pantalla ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [pantalla]);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPantalla(inmersivo);
      else if (e.key === 'ArrowRight') flip.current?.flipNext();
      else if (e.key === 'ArrowLeft') flip.current?.flipPrev();
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [inmersivo]);

  const [copiado, setCopiado] = useState(false);
  const compartir = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: titulo, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }
    } catch {}
  };
  // Pantalla completa real (API del navegador) sobre el marco del folleto; sin soporte (iPhone) queda el modo ampliado.
  const [real, setReal] = useState(false);
  const [puedeReal, setPuedeReal] = useState(false);
  useEffect(() => {
    setPuedeReal(!!document.fullscreenEnabled);
    const cambio = () => {
      const activa = !!document.fullscreenElement;
      setReal(activa);
      if (!activa) setPantalla(inmersivo);
    };
    document.addEventListener('fullscreenchange', cambio);
    return () => document.removeEventListener('fullscreenchange', cambio);
  }, [inmersivo]);
  const alternarPantalla = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
      return;
    }
    if (!inmersivo && pantalla) return setPantalla(false);
    if (!inmersivo) setPantalla(true);
    try {
      await marco.current?.requestFullscreen?.();
    } catch {}
  };
  const enPantalla = real || (!inmersivo && pantalla);
  const botonPantalla = (inmersivo ? puedeReal : true) && (
    <button type="button" disabled={estado !== 'listo'} onClick={alternarPantalla} className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:opacity-40">
      {enPantalla ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      {enPantalla ? 'Salir de pantalla completa' : 'Pantalla completa'}
    </button>
  );
  const listo = estado === 'listo';
  const btn = 'rounded-full border border-brand-primary/30 p-2 text-brand-700 transition hover:bg-brand-50 disabled:opacity-40';

  return (
    <div ref={marco} className={`mx-auto flex w-full max-w-5xl flex-col ${pantalla ? 'fixed inset-0 z-[200] max-w-none bg-white p-3' : ''}`}>
      {inmersivo && (
        <header className="flex items-center justify-between gap-3 px-1 pb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-fptecnologi.svg" alt="FPTecnologi & System" className="h-8 w-auto sm:h-10" />
          <span className="min-w-0 truncate text-sm font-semibold text-ink/70">{titulo}</span>
        </header>
      )}
      <div className={`relative flex items-center justify-center rounded-3xl bg-brand-50 p-2 sm:p-8 ${pantalla ? 'min-h-0 flex-1 overflow-hidden' : 'min-h-[420px] sm:min-h-[560px]'}`}>
        {estado === 'cargando' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-sm text-ink/70">
            <div className="h-2 w-48 overflow-hidden rounded-full bg-white">
              <div className="h-full bg-brand-primary transition-all" style={{ width: `${progreso}%` }} />
            </div>
            Preparando el folleto… {progreso}%
          </div>
        )}
        {estado === 'error' && (
          <p className="text-sm text-ink/70">
            No se pudo mostrar el folleto. <a className="font-semibold text-brand-700 underline" href={src}>Descárgalo en PDF</a>.
          </p>
        )}
        <div ref={caja} aria-label={titulo} className={estado === 'listo' ? 'w-full' : 'invisible absolute'} style={{ height: pantalla ? '100%' : 'min(78vh, 760px)' }} />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <button type="button" disabled={!listo} onClick={() => flip.current?.flip(0)} aria-label="Primera página" className={btn}>
          <ChevronsLeft className="h-5 w-5" />
        </button>
        <button type="button" disabled={!listo} onClick={() => flip.current?.flipPrev()} aria-label="Página anterior" className={btn}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="min-w-20 text-center text-sm text-ink/70">{listo ? `${pagina} / ${total}` : '—'}</span>
        <button type="button" disabled={!listo} onClick={() => flip.current?.flipNext()} aria-label="Página siguiente" className={btn}>
          <ChevronRight className="h-5 w-5" />
        </button>
        <button type="button" disabled={!listo} onClick={() => flip.current?.flip(total - 1)} aria-label="Última página" className={btn}>
          <ChevronsRight className="h-5 w-5" />
        </button>
        {inmersivo && (
          <button type="button" onClick={compartir} className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50">
            <Share2 className="h-4 w-4" /> {copiado ? 'Enlace copiado' : 'Compartir'}
          </button>
        )}
        {botonPantalla}
        <a href={src} download className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
          <Download className="h-4 w-4" /> Descargar PDF
        </a>
      </div>
    </div>
  );
}
