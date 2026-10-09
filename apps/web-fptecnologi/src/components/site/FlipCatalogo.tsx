'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';

/* Folleto con pasa-páginas: renderiza el PDF a imágenes (pdf.js) y las voltea con page-flip. */
export function FlipCatalogo({ src, titulo }: { src: string; titulo: string }) {
  const caja = useRef<HTMLDivElement>(null);
  const flip = useRef<{ flipNext(): void; flipPrev(): void; destroy(): void } | null>(null);
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
          const vp = p.getViewport({ scale: 1.3 });
          if (n === 1) ratio = vp.width / vp.height;
          const c = document.createElement('canvas');
          c.width = vp.width;
          c.height = vp.height;
          await p.render({ canvas: c, viewport: vp }).promise;
          const blob = await new Promise<Blob>((ok) => c.toBlob((b) => ok(b!), 'image/jpeg', 0.82));
          const u = URL.createObjectURL(blob);
          urls.push(u);
          imgs.push(u);
          if (!vivo) return;
          setProgreso(Math.round((n / pdf.numPages) * 100));
        }
        const { PageFlip } = await import('page-flip');
        if (!vivo || !caja.current) return;
        const alto = 620;
        const pf = new PageFlip(caja.current, {
          width: Math.round(alto * ratio),
          height: alto,
          size: 'stretch',
          minWidth: 280,
          maxWidth: 700,
          minHeight: 380,
          maxHeight: 990,
          showCover: true,
          usePortrait: true,
          maxShadowOpacity: 0.4,
          mobileScrollSupport: false,
        });
        pf.loadFromImages(imgs);
        pf.on('flip', (e: { data: unknown }) => setPagina((e.data as number) + 1));
        flip.current = pf;
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

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="relative flex min-h-[420px] items-center justify-center rounded-3xl bg-brand-50 p-4 sm:p-8">
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
        <div ref={caja} aria-label={titulo} className={estado === 'listo' ? '' : 'invisible absolute'} />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button type="button" disabled={estado !== 'listo'} onClick={() => flip.current?.flipPrev()} aria-label="Página anterior" className="rounded-full border border-brand-primary/30 p-2 text-brand-700 transition hover:bg-brand-50 disabled:opacity-40">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="min-w-24 text-center text-sm text-ink/70">{estado === 'listo' ? `${pagina} / ${total}` : '—'}</span>
        <button type="button" disabled={estado !== 'listo'} onClick={() => flip.current?.flipNext()} aria-label="Página siguiente" className="rounded-full border border-brand-primary/30 p-2 text-brand-700 transition hover:bg-brand-50 disabled:opacity-40">
          <ChevronRight className="h-5 w-5" />
        </button>
        <a href={src} download className="ml-2 inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
          <Download className="h-4 w-4" /> Descargar PDF
        </a>
      </div>
    </div>
  );
}
