'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Briefcase, ClipboardList, Box, Cpu, Film, Gamepad2, PenTool } from 'lucide-react';
import { BUILDS, seleccionDe, total } from '@/lib/piezas';

const USOS = [
  { id: 'oficina', t: 'Oficina y estudio', i: Briefcase, build: 0, d: 'Ofimática, videollamadas, navegación y sistemas de gestión: productividad diaria sin interrupciones.' },
  { id: 'diseno', t: 'Diseño y multitarea', i: PenTool, build: 1, d: 'Diseño gráfico, muchas aplicaciones abiertas y trabajo fluido sin esperas.' },
  { id: 'edicion', t: 'Edición y render', i: Film, build: 2, d: 'Edición de video, render 3D y proyectos pesados con memoria y video de sobra.' },
  { id: 'ingenieria', t: 'Ingeniería e IA', i: Cpu, build: 3, d: 'Simulación, análisis de datos e inteligencia artificial: potencia para cargas críticas.' },
  { id: 'juegos', t: 'Juegos', i: Gamepad2, build: 1, d: 'Alto rendimiento gráfico y refrigeración que sostiene el máximo por horas.' },
] as const;

const soles = (n: number) => `S/ ${n.toLocaleString('es-PE')}`;

// "¿Para qué usarás tu PC?": cada uso recomienda una configuración y lleva al armador o al cotizador.
export default function SelectorUso() {
  const [uso, setUso] = useState<(typeof USOS)[number]['id']>('oficina');
  const u = USOS.find((x) => x.id === uso)!;
  const b = BUILDS[u.build];
  const s = seleccionDe(b.ids);
  const specs = [s.cpu, s.ram, s.gpu, s.ssd].map((o) => o?.nombre).filter(Boolean);

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="flex gap-2 overflow-x-auto pb-1 sin-barra lg:flex-col lg:overflow-visible">
        {USOS.map(({ id, t, i: Icono }) => (
          <button
            key={id}
            onClick={() => setUso(id)}
            aria-pressed={uso === id}
            className={`flex shrink-0 items-center gap-3 rounded-xl border px-4 py-3.5 text-left font-display text-sm transition lg:px-5 ${
              uso === id ? 'border-cyan bg-cyan/15 text-white shadow-[0_0_22px_rgba(35,141,193,.35)]' : 'border-line text-slate-400 hover:border-slate-500'
            }`}
          >
            <Icono size={20} className={uso === id ? 'text-claro' : ''} /> {t}
          </button>
        ))}
      </div>

      <div key={uso} className="hud grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <span className="font-display text-xs tracking-[0.25em] text-claro">RECOMENDADO · {b.linea}</span>
          <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{b.nombre}</h3>
          <p className="mt-3 max-w-xl text-lg text-slate-300">{u.d}</p>
          <ul className="mt-5 grid gap-1.5 text-slate-300 sm:grid-cols-2">
            {specs.map((n) => (
              <li key={n} className="flex items-center gap-2"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-claro" />{n}</li>
            ))}
          </ul>
        </div>
        <div className="md:text-right">
          <span className="block text-xs tracking-widest text-slate-500">DESDE</span>
          <b className="font-display text-3xl text-claro">{soles(total(s))}</b>
          <div className="mt-5 flex flex-wrap gap-3 md:justify-end">
            <Link href={`/armar?build=${u.build}`} className="btn-neon inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-display text-xs">
              <Box size={16} /> VER EN EL ARMADOR
            </Link>
            <Link href={`/cotizar?build=${u.build}`} className="btn-borde inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-display text-xs">
              <ClipboardList size={16} /> COTIZAR
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
