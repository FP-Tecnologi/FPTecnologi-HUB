'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Maximize2, Minimize2 } from 'lucide-react';

/* Folleto con pasa-páginas: renderiza el PDF a imágenes (pdf.js) y las voltea con page-flip. */
export function FlipCatalogo({ src, titulo }: { src: string; titulo: string }) {
  const caja = useRef<HTMLDivElement>(null);
  const marco = useRef<HTMLDivElement>(null);
  const [pantalla, setPantalla] = useState(false);
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
        for (let n = 1; n <= pdf.numPages; n++) {
          const p = await pdf.getPage(n);
          const vp = p.getViewport({ scale: 1.5 });
          if (n === 1) ratio = vp.width / vp.height;
          const c = document.createElement('canvas');
          c.width = vp.width;
          c.height = vp.height;
          await p.render({ canvas: c, viewport: vp }).promise;
          const blob = await new Promise<Blob>((ok) => c.toBlob((b) => ok(b!), 'image/jpeg', 0.8));
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
      pf.loadFromImages(imagenes.current);
      pf.on('flip', (e: { data: unknown }) => {
        paginaRef.current = e.data as number;
        setPagina(paginaRef.current + 1);
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
      if (e.key === 'Escape') setPantalla(false);
      else if (e.key === 'ArrowRight') flip.current?.flipNext();
      else if (e.key === 'ArrowLeft') flip.current?.flipPrev();
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, []);

  const alternarPantalla = () => setPantalla((v) => !v);
  const listo = estado === 'listo';
  const btn = 'rounded-full border border-brand-primary/30 p-2 text-brand-700 transition hover:bg-brand-50 disabled:opacity-40';

  return (
    <div ref={marco} className={`mx-auto flex w-full max-w-5xl flex-col ${pantalla ? 'fixed inset-0 z-[200] max-w-none bg-white p-3' : ''}`}>
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
        <button type="button" disabled={!listo} onClick={alternarPantalla} className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:opacity-40">
          {pantalla ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          {pantalla ? 'Salir' : 'Pantalla completa'}
        </button>
        <a href={src} download className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
          <Download className="h-4 w-4" /> Descargar PDF
        </a>
      </div>
    </div>
  );
}
