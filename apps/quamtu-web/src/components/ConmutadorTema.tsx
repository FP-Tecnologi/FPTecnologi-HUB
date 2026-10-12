'use client';
import { useEffect, useState } from 'react';
import { Contrast, Moon, Sun } from 'lucide-react';

type Tema = 'oscuro' | 'medio' | 'claro';
const OPCIONES: { id: Tema; titulo: string; Icono: typeof Sun }[] = [
  { id: 'oscuro', titulo: 'Oscuro', Icono: Moon },
  { id: 'medio', titulo: 'Medio', Icono: Contrast },
  { id: 'claro', titulo: 'Claro', Icono: Sun },
];

// Elige la apariencia de la web. Se recuerda en el navegador y también acepta ?tema=claro|medio|oscuro.
export default function ConmutadorTema({ className = '', etiqueta = false }: { className?: string; etiqueta?: boolean }) {
  const [tema, setTema] = useState<Tema>('oscuro');
  useEffect(() => setTema((document.documentElement.dataset.tema as Tema) || 'oscuro'), []);

  const elegir = (t: Tema) => {
    setTema(t);
    document.documentElement.dataset.tema = t;
    try {
      localStorage.setItem('quamtu-tema', t);
    } catch {
      /* sin almacenamiento: el tema vale solo para esta visita */
    }
  };

  return (
    <div className={`items-center gap-2 ${className || 'flex'}`}>
      {etiqueta && <span className="text-xs tracking-widest text-slate-400">APARIENCIA</span>}
      <div role="group" aria-label="Apariencia de la web" className="flex rounded-full border border-line p-0.5">
        {OPCIONES.map(({ id, titulo, Icono }) => (
          <button
            key={id}
            onClick={() => elegir(id)}
            aria-pressed={tema === id}
            aria-label={`Tema ${titulo.toLowerCase()}`}
            title={titulo}
            className={`grid h-8 w-8 place-items-center rounded-full transition ${tema === id ? 'bg-boton text-white' : 'text-slate-400 hover:text-claro'}`}
          >
            <Icono size={15} />
          </button>
        ))}
      </div>
    </div>
  );
}
