"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname, useRouter } from "next/navigation";

type Estado = "inicio" | "cubrir" | "cubierta" | "revelar" | "reposo";

/** Cortina en dos capas: tapa la página al salir y la destapa al entrar (también al cargar el sitio). */
export default function Cortina() {
  const [e, setE] = useState<Estado>("inicio");
  const [n, setN] = useState(0);
  const router = useRouter();
  const ruta = usePathname();
  const esperando = useRef(false);
  const timers = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  // Carga inicial: muestra el sello un instante y destapa.
  useEffect(() => {
    t(() => setE("revelar"), 1700);
    t(() => setE("reposo"), 2700);
    const limpiar = timers.current;
    return () => limpiar.forEach(clearTimeout);
  }, []);

  // Salida: SmartLink avisa con un evento; se tapa y recién ahí se navega.
  useEffect(() => {
    const salir = (ev: Event) => {
      const href = (ev as CustomEvent<string>).detail;
      timers.current.forEach(clearTimeout);
      esperando.current = true;
      setN((v) => v + 1);
      setE("cubrir");
      t(() => router.push(href), 650);
      t(() => { if (esperando.current) { esperando.current = false; setE("revelar"); t(() => setE("reposo"), 900); } }, 4000); // red de seguridad
    };
    window.addEventListener("imc:salir", salir);
    return () => window.removeEventListener("imc:salir", salir);
  }, [router]);

  // Entrada: cuando cambia la ruta, destapa.
  useEffect(() => {
    if (!esperando.current) return;
    esperando.current = false;
    window.scrollTo(0, 0);
    t(() => setE("revelar"), 120);
    t(() => setE("reposo"), 1000);
  }, [ruta]);

  return (
    <div className="cortina" data-e={e} aria-hidden>
      <div className="capa capa-1" />
      <div className="capa capa-2">
        <div className="cuadricula-claro carga-malla absolute inset-0" />
        <span className="hex flota absolute -left-16 top-[12%] h-64 w-64 bg-white/[.06]" style={{ ["--t" as string]: "9s", ["--rot" as string]: "20deg" } as CSSProperties} />
        <span className="hex flota absolute right-[10%] top-[18%] h-20 w-20 bg-naranja/30" style={{ ["--t" as string]: "6s", ["--dl" as string]: "-2s" } as CSSProperties} />
        <span className="hex flota absolute bottom-[14%] left-[22%] h-14 w-14 bg-naranja/25" style={{ ["--t" as string]: "7s", ["--dl" as string]: "-4s" } as CSSProperties} />
        <span className="hex flota absolute -bottom-20 -right-16 h-80 w-80 bg-white/[.06]" style={{ ["--t" as string]: "11s", ["--dl" as string]: "-1s" } as CSSProperties} />
        <div key={n} className="relative flex flex-col items-center">
          <div className="relative grid h-64 w-64 place-items-center sm:h-80 sm:w-80">
            <svg viewBox="0 0 100 100" className="gira absolute inset-0 text-naranja" style={{ ["--t" as string]: "9s" } as CSSProperties} aria-hidden>
              <polygon points="50,3 91,26.5 91,73.5 50,97 9,73.5 9,26.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="22 14" strokeLinecap="round" />
            </svg>
            <svg viewBox="0 0 100 100" className="gira absolute inset-3 text-white/40" style={{ ["--t" as string]: "14s", animationDirection: "reverse" } as CSSProperties} aria-hidden>
              <polygon points="50,3 91,26.5 91,73.5 50,97 9,73.5 9,26.5" fill="none" stroke="currentColor" strokeWidth=".6" />
            </svg>
            <img src="/logo-blanco.svg" alt="" className="logo-carga w-40 sm:w-52" />
          </div>
          <div className="mt-8 h-1 w-56 overflow-hidden bg-white/20 sm:w-72"><span className="carga-barra block h-full bg-naranja" /></div>
          <p className="carga-texto mt-4 text-xs font-bold uppercase tracking-[.35em] text-white/70">Cargando</p>
        </div>
      </div>
    </div>
  );
}
