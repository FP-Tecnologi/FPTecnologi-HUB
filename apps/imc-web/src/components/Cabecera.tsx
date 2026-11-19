"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Enlace from "./Enlace";
import { Icono } from "./ui";
import { EMPRESA, NAV } from "@/lib/datos";

export default function Cabecera() {
  const ruta = usePathname();
  const [scroll, setScroll] = useState(false);
  const [avance, setAvance] = useState(0);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const f = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      setScroll(scrollY > 24);
      setAvance(max > 0 ? Math.min(scrollY / max, 1) : 0);
    };
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => setAbierto(false), [ruta]);
  useEffect(() => { document.body.style.overflow = abierto ? "hidden" : ""; }, [abierto]);

  const activo = (h: string) => (h === "/" ? ruta === "/" : ruta.startsWith(h.replace(/\/$/, "")));
  // Transparente arriba (texto claro sobre el hero oscuro); blanco al hacer scroll (texto oscuro).
  const claro = !scroll && !abierto;

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[var(--ease-salida)] ${abierto ? "bg-transparent py-4" : scroll ? "bg-white/90 py-2 shadow-[0_12px_30px_-18px_rgba(23,46,94,.55)] backdrop-blur-xl" : "bg-gradient-to-b from-[#0a1a3d]/55 to-transparent py-5"}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5">
          <Enlace href="/" aria-label="Company IMC, inicio" className="relative shrink-0 transition-transform duration-300 hover:scale-105">
            <img src={claro || abierto ? "/logo-blanco.svg" : "/logo.svg"} alt="Company IMC E.I.R.L." className={`w-auto transition-all duration-500 ${scroll ? "h-9" : "h-12"}`} />
          </Enlace>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
            {NAV.map(([t, h]) => (
              <Enlace
                key={h}
                href={h}
                aria-current={activo(h) ? "page" : undefined}
                className={`relative px-4 py-2 text-sm font-semibold transition-colors duration-300 after:absolute after:inset-x-4 after:bottom-0.5 after:h-[3px] after:origin-left after:scale-x-0 after:bg-naranja after:transition-transform after:duration-500 after:ease-[var(--ease-salida)] hover:after:scale-x-100 aria-[current=page]:after:scale-x-100 ${claro ? "text-white/80 hover:text-white aria-[current=page]:text-white" : "text-grafito hover:text-azul-2 aria-[current=page]:text-azul-2"}`}
              >
                {t}
              </Enlace>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a href={`tel:${EMPRESA.telefono.replace(/\s/g, "")}`} className={`hidden items-center gap-2 text-sm font-bold transition-colors xl:flex ${claro ? "text-white hover:text-naranja" : "text-azul-osc hover:text-azul-2"}`}>
              <span className={`hex flex h-8 w-8 items-center justify-center transition-colors ${claro ? "bg-white/15" : "bg-azul-claro"}`}><Icono n="telefono" className="h-4 w-4" /></span>
              {EMPRESA.telefono}
            </a>
            <Enlace href="/contacto/" className="btn btn-naranja hidden !px-6 !py-2.5 sm:inline-flex">Cotizar</Enlace>
            <button onClick={() => setAbierto((v) => !v)} aria-expanded={abierto} aria-label="Menú" className={`relative flex h-11 w-11 flex-col items-center justify-center gap-1.5 border transition-colors duration-300 lg:hidden ${claro || abierto ? "border-white/40 bg-white/10" : "border-azul-2 bg-azul-2"}`}>
              <span className={`h-0.5 w-5 bg-white transition-transform duration-300 ${abierto ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`h-0.5 w-5 bg-white transition-opacity duration-300 ${abierto ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-5 bg-white transition-transform duration-300 ${abierto ? "-translate-y-2 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
        {/* Avance de lectura */}
        <span className={`absolute inset-x-0 bottom-0 h-[3px] origin-left bg-gradient-to-r from-azul-2 to-naranja transition-opacity duration-500 ${scroll ? "opacity-100" : "opacity-0"}`} style={{ transform: `scaleX(${avance})` }} aria-hidden />
      </header>

      <div data-abierto={abierto} className="menu-movil degradado-azul fixed inset-0 z-[45] flex flex-col justify-center gap-2 px-8 lg:hidden" aria-hidden={!abierto}>
        {NAV.map(([t, h], i) => (
          <Enlace key={h} href={h} style={{ ["--i" as string]: i }} tabIndex={abierto ? 0 : -1} className={`text-4xl font-extrabold tracking-tight ${activo(h) ? "text-naranja" : "text-white"}`}>{t}</Enlace>
        ))}
        <Enlace href="/contacto/" style={{ ["--i" as string]: NAV.length }} tabIndex={abierto ? 0 : -1} className="btn btn-naranja mt-6 self-start">Solicitar cotización <Icono n="flecha" className="h-5 w-5" /></Enlace>
      </div>
    </>
  );
}
