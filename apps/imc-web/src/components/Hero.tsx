"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import Enlace from "./Enlace";
import { Icono } from "./ui";
import { MARCAS } from "@/lib/datos";

const DURACION = 7000;

type Widget = { n: string; t: string; s: string; pos: string; t0: string; dl: string };
type Slide = {
  etiqueta: string;
  a: string;
  b: string;
  texto: string;
  fondo: string;
  btn1: [string, string];
  btn2: [string, string];
  widgets: Widget[];
};

const SLIDES: Slide[] = [
  {
    etiqueta: "Proveedor en Perú Compras",
    a: "Soluciones tecnológicas para el",
    b: "crecimiento empresarial",
    texto: "No nos limitamos a vender productos: nos convertimos en tu socio estratégico. Equipos, redes, servidores, cableado y soporte, de principio a fin.",
    fondo: "/img/cableado.webp",
    btn1: ["Solicitar cotización", "/contacto/"],
    btn2: ["Ver servicios", "/servicios/"],
    widgets: [
      { n: "check", t: "+4 años", s: "de experiencia", pos: "left-0 top-[12%]", t0: "6s", dl: "0s" },
      { n: "estrella", t: "Perú Compras", s: "Proveedor del Estado", pos: "right-0 top-[26%]", t0: "7s", dl: "-2s" },
      { n: "idea", t: "A tu medida", s: "Según tu presupuesto", pos: "left-0 bottom-[16%]", t0: "8s", dl: "-4s" },
      { n: "equipo", t: "Soporte continuo", s: "Técnico especializado", pos: "right-0 bottom-[4%]", t0: "6.5s", dl: "-1s" },
    ],
  },
  {
    etiqueta: "Equipos de las mejores marcas",
    a: "Tecnología original,",
    b: "con garantía y soporte técnico",
    texto: "Computadoras, monitores, impresoras, proyectores, servidores y equipos de red de HP, Dell, Lenovo, Epson, Cisco y más, listos para tu operación.",
    fondo: "/img/telefonia.webp",
    btn1: ["Ver productos", "/productos/"],
    btn2: ["Cotizar ahora", "/contacto/"],
    widgets: [
      { n: "servidor", t: "Marcas líderes", s: "HP · Dell · Lenovo", pos: "left-0 top-[10%]", t0: "7s", dl: "0s" },
      { n: "cable", t: "Cableado", s: "estructurado certificado", pos: "right-0 top-[22%]", t0: "6s", dl: "-3s" },
      { n: "telefono", t: "Centrales", s: "telefónicas IP", pos: "left-0 bottom-[2%]", t0: "8s", dl: "-2s" },
    ],
  },
  {
    etiqueta: "Compras estatales",
    a: "Tus adquisiciones del Estado,",
    b: "más simples y seguras",
    texto: "Tenemos fichas publicadas en Perú Compras y una logística que atiende de manera directa a sus clientes, con seguridad y confianza.",
    fondo: "/img/perucompras.webp",
    btn1: ["Conocer más", "/peru-compras/"],
    btn2: ["Contáctanos", "/contacto/"],
    widgets: [
      { n: "megafono", t: "Fichas publicadas", s: "Para tu comodidad", pos: "left-0 top-[14%]", t0: "7s", dl: "0s" },
      { n: "grafico", t: "Logística directa", s: "Atención a entidades", pos: "right-0 top-[30%]", t0: "6s", dl: "-2s" },
      { n: "check", t: "Seguridad", s: "y confianza", pos: "left-0 bottom-[10%]", t0: "8s", dl: "-4s" },
    ],
  },
];

function Wid({ w }: { w: Widget }) {
  return (
    <div className={`flota absolute z-20 hidden w-[13.5rem] items-center gap-3 border border-white/20 bg-white/10 p-3 shadow-[0_20px_40px_-20px_rgba(0,0,0,.6)] backdrop-blur-md sm:flex ${w.pos}`} style={{ ["--t" as string]: w.t0, ["--dl" as string]: w.dl, ["--rot" as string]: "0deg" } as CSSProperties}>
      <span className="hex flex h-11 w-11 shrink-0 items-center justify-center bg-naranja text-tinta"><Icono n={w.n} className="h-5 w-5" /></span>
      <span className="min-w-0 text-sm font-bold leading-tight text-white">{w.t}<br /><span className="block truncate text-xs font-medium text-white/65">{w.s}</span></span>
    </div>
  );
}

/** Marco hexagonal con el visual de cada slide. */
function Visual({ i }: { i: number }) {
  const W = SLIDES[i].widgets;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[32rem]">
      {W.map((w) => <Wid key={w.t} w={w} />)}
      <div className="hex absolute inset-[4%] bg-azul-2" />
      <div className="hex absolute inset-[8%] bg-gradient-to-b from-[#1b3a7e] to-[#0f2656]" />
      <div className="absolute inset-[4%] bg-naranja" style={{ clipPath: "polygon(7% 75%, 50% 100%, 93% 75%, 93% 69%, 50% 91%, 7% 69%)" }} />
      {i === 0 && (
        <img src="/img/laptop.webp" alt="Asesora de Company IMC presentando una laptop" className="absolute inset-x-[12%] bottom-[9%] top-[0%] h-[90%] w-[76%] object-contain object-bottom" style={{ maskImage: "linear-gradient(to top, transparent 0%, #000 30%)", WebkitMaskImage: "linear-gradient(to top, transparent 0%, #000 30%)" }} />
      )}
      {i === 1 && (
        <>
          <img src="/img/monitor.webp" alt="Monitor" className="absolute left-[24%] top-[14%] w-[52%] drop-shadow-2xl" />
          <img src="/img/computadora.webp" alt="Computadora" className="flota absolute bottom-[20%] left-[18%] w-[46%] drop-shadow-2xl" style={{ ["--rot" as string]: "0deg", ["--t" as string]: "7s" } as CSSProperties} />
          <img src="/img/proyector.webp" alt="Proyector" className="flota absolute bottom-[26%] right-[6%] w-[40%] drop-shadow-2xl" style={{ ["--rot" as string]: "0deg", ["--t" as string]: "9s", ["--dl" as string]: "-3s" } as CSSProperties} />
        </>
      )}
      {i === 2 && (
        <>
          <img src="/img/perucompras.webp" alt="Palacio de Gobierno, Lima" className="hex absolute inset-[11%] h-[78%] w-[78%] object-cover" />
          <div className="absolute inset-[11%] bg-gradient-to-t from-[#0f2656]/70 to-transparent" style={{ clipPath: "polygon(50% 0, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)" }} />
          <div className="absolute bottom-[14%] left-1/2 z-10 w-44 -translate-x-1/2 bg-white p-3 shadow-2xl"><img src="/img/perucompras-logo.webp" alt="Perú Compras" className="mx-auto h-auto w-full" /></div>
        </>
      )}
    </div>
  );
}

export default function Hero() {
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);
  const inicial = useRef(true);
  const mover = useCallback((n: number) => { inicial.current = false; setI((v) => (v + n + SLIDES.length) % SLIDES.length); }, []);

  const base = inicial.current ? 1750 : 0; // la primera vez espera a que se abra la cortina
  const d = (ms: number) => ({ ["--d" as string]: `${base + ms}ms` }) as CSSProperties;
  const s = SLIDES[i];

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#0a1a3d] text-white" onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)} aria-roledescription="carrusel">
      {/* Fondo: fotos que se funden entre sí con zoom lento + capas oscuras */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        {SLIDES.map((sl, k) => (
          <img key={k} src={sl.fondo} alt="" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ${k === i ? "opacity-40" : "opacity-0"}`} style={{ animation: "zoom-lento 14s ease-out infinite alternate" }} />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1a3d] via-[#0a1a3d]/85 to-[#0a1a3d]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a3d] via-transparent to-[#0a1a3d]/60" />
        <div className="cuadricula-claro absolute inset-0 opacity-70" />
        <div className="hex flota absolute -left-24 top-1/4 h-80 w-80 bg-azul-2/20" style={{ ["--t" as string]: "12s", ["--rot" as string]: "20deg" } as CSSProperties} />
        <div className="hex flota absolute right-[6%] top-24 h-24 w-24 bg-naranja/25" style={{ ["--t" as string]: "7s", ["--dl" as string]: "-2s" } as CSSProperties} />
        <div className="hex flota absolute bottom-24 left-[44%] h-14 w-14 bg-naranja/20" style={{ ["--t" as string]: "9s", ["--dl" as string]: "-5s" } as CSSProperties} />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 pb-8 pt-32 lg:grid-cols-[1.25fr_.9fr] lg:pt-28">
        <div key={`t${i}`} aria-live="polite">
          <span className="etiqueta entra" style={d(0)}><Icono n="estrella" className="h-4 w-4" /> {s.etiqueta}</span>
          <h1 className="titulo claro entra mt-6 text-4xl sm:text-5xl xl:text-[3.4rem] lg:min-h-[3.2em]" style={d(120)}>
            {s.a} <b>{s.b}</b>
          </h1>
          <p className="entra mt-6 max-w-2xl text-lg leading-relaxed text-white/80" style={d(240)}>{s.texto}</p>
          <div className="entra mt-9 flex flex-wrap gap-4" style={d(360)}>
            <Enlace href={s.btn1[1]} className="btn btn-naranja">{s.btn1[0]} <Icono n="flecha" className="h-5 w-5" /></Enlace>
            <Enlace href={s.btn2[1]} className="btn btn-linea-claro">{s.btn2[0]}</Enlace>
          </div>
        </div>
        <div key={`v${i}`} className="entra hidden lg:block" style={d(200)}><Visual i={i} /></div>
      </div>

      {/* Parte baja: flechas y marcas dentro del hero */}
      <div className="relative z-30">
        <span key={i} aria-hidden onAnimationEnd={() => mover(1)} className="pointer-events-none absolute h-px w-px opacity-0" style={{ animation: `progreso ${DURACION}ms linear forwards`, animationPlayState: pausa ? "paused" : "running" }} />
        <div className="marquesina-caja overflow-hidden border-t border-white/10 bg-[#07132e]/70 py-7 backdrop-blur" aria-label="Marcas con las que trabajamos">
          <div className="marquesina flex items-center gap-24 whitespace-nowrap">
            {[...MARCAS, ...MARCAS].map((m, k) => (
              <img key={k} src={`/marcas/${m.f}.svg`} alt={m.n} className="h-14 w-auto max-w-[13rem] opacity-70 brightness-0 invert transition hover:opacity-100" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
