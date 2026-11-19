"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Enlace from "./Enlace";
import { Icono } from "./ui";
import { NAV } from "@/lib/datos";

export default function Cabecera() {
  const ruta = usePathname();
  const [scroll, setScroll] = useState(false);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const f = () => setScroll(window.scrollY > 12);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => setAbierto(false), [ruta]);
  useEffect(() => { document.body.style.overflow = abierto ? "hidden" : ""; }, [abierto]);

  const activo = (h: string) => (h === "/" ? ruta === "/" : ruta.startsWith(h.replace(/\/$/, "")));

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scroll ? "bg-white/85 py-2 shadow-[0_10px_30px_-18px_rgba(23,46,94,.5)] backdrop-blur-xl" : "bg-transparent py-4"}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5">
          <Enlace href="/" aria-label="Company IMC, inicio" className=" bg-white/90 px-3 py-1.5 transition hover:scale-105">
            <img src="/logo.svg" alt="Company IMC E.I.R.L." className={`w-auto transition-all duration-500 ${scroll ? "h-9" : "h-11"}`} />
          </Enlace>
          <nav className="hidden items-center gap-1 bg-white/90 p-1.5 shadow-sm backdrop-blur lg:flex" aria-label="Principal">
            {NAV.map(([t, h]) => (
              <Enlace key={h} href={h} aria-current={activo(h) ? "page" : undefined} className={`relative px-4 py-2 text-sm font-semibold transition-colors duration-300 ${activo(h) ? "bg-azul-2 text-white" : "text-grafito hover:bg-azul-claro hover:text-azul-2"}`}>
                {t}
              </Enlace>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Enlace href="/contacto/" className="btn btn-naranja hidden !px-6 !py-2.5 sm:inline-flex">Cotizar</Enlace>
            <button onClick={() => setAbierto((v) => !v)} aria-expanded={abierto} aria-label="Menú" className="relative z-[60] flex h-11 w-11 flex-col items-center justify-center gap-1.5 bg-azul-2 lg:hidden">
              <span className={`h-0.5 w-5 bg-white transition-transform duration-300 ${abierto ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`h-0.5 w-5 bg-white transition-opacity duration-300 ${abierto ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-5 bg-white transition-transform duration-300 ${abierto ? "-translate-y-2 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      <div data-abierto={abierto} className="menu-movil degradado-azul fixed inset-0 z-[55] flex flex-col justify-center gap-2 px-8 lg:hidden" aria-hidden={!abierto}>
        {NAV.map(([t, h], i) => (
          <Enlace key={h} href={h} style={{ ["--i" as string]: i }} tabIndex={abierto ? 0 : -1} className={`text-4xl font-extrabold tracking-tight ${activo(h) ? "text-naranja" : "text-white"}`}>{t}</Enlace>
        ))}
        <Enlace href="/contacto/" style={{ ["--i" as string]: NAV.length }} tabIndex={abierto ? 0 : -1} className="btn btn-naranja mt-6 self-start">Solicitar cotización <Icono n="flecha" className="h-5 w-5" /></Enlace>
      </div>
    </>
  );
}
