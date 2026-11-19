"use client";

import { useEffect, useRef, useState } from "react";
import Enlace from "./Enlace";
import { Icono } from "./ui";
import type { Empresa } from "@/lib/cms";

const MENSAJE = encodeURIComponent("Hola Company IMC, quisiera una cotización.");



export default function Whatsapp({ empresa }: { empresa: Empresa }) {
  const OPCIONES = [
    { n: "whatsapp", t: "Escríbenos por WhatsApp", s: "Respuesta rápida", href: `${empresa.whatsapp}?text=${MENSAJE}`, externo: true },
    { n: "telefono", t: "Llámanos", s: empresa.telefono, href: `tel:${empresa.telefonoHref.slice(4)}` },
    { n: "correo", t: "Envíanos un correo", s: empresa.correo, href: `mailto:${empresa.correo}` },
    { n: "cartera", t: "Solicitar cotización", s: "Formulario de contacto", href: "/contacto/", interno: true },
  ] as const;

  const [abierto, setAbierto] = useState(false);
  const [globo, setGlobo] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  // Globo de invitación una sola vez, un rato después de cargar.
  useEffect(() => {
    const a = setTimeout(() => setGlobo(true), 6500);
    const b = setTimeout(() => setGlobo(false), 13500);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => { if (!caja.current?.contains(e.target as Node)) setAbierto(false); };
    const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") setAbierto(false); };
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => { document.removeEventListener("mousedown", fuera); document.removeEventListener("keydown", tecla); };
  }, [abierto]);

  return (
    <div ref={caja} className="fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
      {/* Panel de opciones */}
      <div
        role="dialog"
        aria-label="Opciones de contacto"
        aria-hidden={!abierto}
        className={`w-[min(20rem,calc(100vw-2.5rem))] origin-bottom-right overflow-hidden bg-white shadow-[0_30px_60px_-20px_rgba(10,26,61,.6)] transition-all duration-500 ease-[var(--ease-salida)] ${abierto ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-6 scale-90 opacity-0"}`}
      >
        <div className="degradado-azul puntos-claro relative px-5 py-4 text-white">
          <div className="absolute inset-x-0 top-0 h-1 bg-naranja" />
          <p className="text-lg font-extrabold leading-tight">¿Hablamos?</p>
          <p className="mt-0.5 text-xs text-white/75">Elige cómo prefieres contactarnos</p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-naranja"><Icono n="reloj" className="h-3.5 w-3.5" /> {empresa.horario}</p>
        </div>
        <ul className="divide-y divide-gris/50">
          {OPCIONES.map((o, i) => {
            const fila = (
              <>
                <span className="insignia hex h-11 w-11 shrink-0"><Icono n={o.n} className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1 text-sm font-bold leading-tight text-tinta">{o.t}<span className="block truncate text-xs font-medium text-grafito/65">{o.s}</span></span>
                <Icono n="flecha" className="h-4 w-4 shrink-0 text-azul-2 transition group-hover:translate-x-1" />
              </>
            );
            const cls = "grupo group flex items-center gap-3 px-4 py-3 transition hover:bg-azul-claro";
            const estilo = { transitionDelay: abierto ? `${120 + i * 60}ms` : "0ms" };
            return (
              <li key={o.t} className={`transition-all duration-500 ${abierto ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}`} style={estilo}>
                {"interno" in o ? (
                  <Enlace href={o.href} onClick={() => setAbierto(false)} className={cls}>{fila}</Enlace>
                ) : (
                  <a href={o.href} {...("externo" in o ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={cls}>{fila}</a>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex items-center gap-3">
        {/* Globo de invitación */}
        <div className={`relative hidden bg-white px-4 py-2.5 text-sm font-bold text-tinta shadow-xl transition-all duration-500 sm:block ${globo && !abierto ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-4 opacity-0"}`}>
          ¿Necesitas ayuda? <span className="text-azul-2">Escríbenos</span>
          <span className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 bg-white" aria-hidden />
        </div>

        {/* Botón flotante */}
        <button onClick={() => { setAbierto((v) => !v); setGlobo(false); }} aria-expanded={abierto} aria-label={abierto ? "Cerrar opciones de contacto" : "Abrir opciones de contacto"} className="group relative h-16 w-16">
          <span className="hex absolute inset-0 bg-naranja/60 [animation:ping_2.4s_cubic-bezier(0,0,.2,1)_infinite]" aria-hidden />
          <span className="hex absolute inset-0 bg-naranja shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[30deg]" aria-hidden />
          <span className="absolute inset-0 flex items-center justify-center text-tinta">
            <Icono n="whatsapp" className={`absolute h-8 w-8 transition-all duration-500 ${abierto ? "scale-0 rotate-90 opacity-0" : "scale-100 opacity-100"}`} />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`absolute h-7 w-7 transition-all duration-500 ${abierto ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"}`} aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
          </span>
        </button>
      </div>
    </div>
  );
}
