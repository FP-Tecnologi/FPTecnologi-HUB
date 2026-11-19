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
  const [vistaDoble, setVistaDoble] = useState(false);

  useEffect(() => {
    let vivo = true;
    const urls: string[] = [];
    setEstado('cargando');
    setProgreso(0);
    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
        // Sin estas rutas pdf.js no puede decodificar imágenes JPEG2000/JBIG2, perfiles de color ICC, fuentes estándar
        // ni CMaps (CJK): esas imágenes salían en blanco o deformes. Los archivos viven en public/pdfjs-6-5 (se copian de pdfjs-dist en cada build; si cambia la versión, nuevo nombre para romper la caché de 30 días).
        const base = `${window.location.origin}/pdfjs-6-5/`;
        const pdf = await pdfjs.getDocument({
          url: src,
          wasmUrl: `${base}wasm/`,
          iccUrl: `${base}iccs/`,
          cMapUrl: `${base}cmaps/`,
          cMapPacked: true,
          standardFontDataUrl: `${base}standard_fonts/`,
        }).promise;
        const imgs: string[] = [];
        let ratio = 0.707;
        let fallidas = 0;
        // Resolución según la pantalla: la página se ve a ~90 % del alto de la ventana; se rinde a 1.5× ese tamaño
        // en píxeles reales (devicePixelRatio) para que el texto quede nítido incluso al ampliar. Con tope de memoria.
        const dpr = Math.min(window.devicePixelRatio || 1, 3);
        const altoObjetivo = Math.min(2800, Math.max(1500, Math.round(Math.min(window.innerHeight * 0.9, 1000) * dpr * 1.5)));
        for (let n = 1; n <= pdf.numPages; n++) {
          // Una página que falle (imagen rara, memoria) queda en blanco: no tumba todo el folleto.
          let u = '';
          try {
            const p = await pdf.getPage(n);
            const base = p.getViewport({ scale: 1 });
            const vp = p.getViewport({ scale: Math.min(4, altoObjetivo / base.height) });
            if (n === 1) ratio = vp.width / vp.height;
            const c = document.createElement('canvas');
            c.width = vp.width;
            c.height = vp.height;
            // Fondo blanco: el JPEG no tiene transparencia y las zonas transparentes del PDF salían negras.
            await p.render({ canvas: c, viewport: vp, background: '#ffffff' }).promise;
            const blob = await new Promise<Blob>((ok) => c.toBlob((b) => ok(b!), 'image/jpeg', 0.93));
            u = URL.createObjectURL(blob);
            urls.push(u);
            c.width = c.height = 0; // libera la memoria del lienzo (en el celular se acaba con folletos largos)
            p.cleanup();
          } catch {
            fallidas++;
          }
          imgs.push(u);
          if (!vivo) return;
          setProgreso(Math.round((n / pdf.numPages) * 100));
        }
        if (fallidas === pdf.numPages) throw new Error('sin páginas');
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
      // PDF cuyas páginas ya son apaisadas (cada hoja trae las dos caras del libro): se muestra una hoja a la vez;
      // si no, se armaría un libro de dobles páginas y cada cara saldría repetida.
      const yaEsPliego = r > 1.15;
      const una = Math.min(aW, aH * r);
      const dos = Math.min(aW / 2, aH * r);
      const doble = !yaEsPliego && dos >= una * 0.9;
      setVistaDoble(doble);
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
        // Como un libro real: la portada sola, luego pliegos de dos caras (2-3, 4-5…) y la contraportada sola.
        showCover: !yaEsPliego,
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
        if (!u) { el.appendChild(d); return d; }
        const im = document.createElement('img');
        im.src = u;
        im.alt = `Página ${i + 1}`;
        im.draggable = false;
        im.style.cssText = 'display:block;width:100%;height:100%;object-fit:fill;user-select:none;-webkit-user-drag:none';
        d.appendChild(im);
        el.appendChild(d);
        return d;
      });
      pf.loadFromHTML(hojas);
      // Aspecto de libro real: sombra sobre la mesa, canto de páginas apiladas a los lados y sombra del lomo en el pliegue.
      // En la portada y la contraportada (una sola hoja visible) no hay pliegue ni canto doble: solo la sombra de la mesa.
      const canto = (lado: 1 | -1) => [1, 3, 5].map((n, i) => `${lado * n}px 0 0 ${i % 2 ? '#fff' : '#d9dde3'}`).join(',');
      const mesa = '0 26px 40px -14px rgba(12,40,90,.45)';
      let lomo: HTMLDivElement | null = null;
      const aplicarVista = (idx: number) => {
        const n = imagenes.current.length;
        const sola = !doble || (!yaEsPliego && (idx === 0 || (n % 2 === 0 && idx >= n - 1)));
        el.style.boxShadow = sola ? mesa : `${canto(1)},${canto(-1)},${mesa}`;
        if (lomo) lomo.style.opacity = sola ? '0' : '1';
      };
      pf.on('flip', (e: { data: unknown }) => {
        paginaRef.current = e.data as number;
        setPagina(paginaRef.current + 1);
        aplicarVista(paginaRef.current);
      });
      el.style.position = 'relative';
      if (doble) {
        lomo = document.createElement('div');
        lomo.setAttribute('aria-hidden', 'true');
        lomo.style.cssText = `position:absolute;top:0;bottom:0;left:50%;width:${Math.round(pw * 0.2)}px;transform:translateX(-50%);pointer-events:none;z-index:50;background:linear-gradient(to right,rgba(0,0,0,0),rgba(0,0,0,.14) 36%,rgba(0,0,0,.38) 49.5%,rgba(255,255,255,.22) 50.5%,rgba(0,0,0,.16) 64%,rgba(0,0,0,0))`;
        el.appendChild(lomo);
      }
      aplicarVista(paginaRef.current);
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
  // En vista de libro (portada sola, luego pliegos 2-3, 4-5…) se muestra el par visible, no solo la página de la izquierda.
  const izq = vistaDoble && pagina > 1 ? (pagina % 2 === 0 ? pagina : pagina - 1) : pagina;
  const etiquetaPagina = vistaDoble && pagina > 1 && izq < total ? `${izq}–${izq + 1}` : `${pagina}`;
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
        <span className="min-w-20 text-center text-sm text-ink/70">{listo ? `${etiquetaPagina} / ${total}` : '—'}</span>
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
