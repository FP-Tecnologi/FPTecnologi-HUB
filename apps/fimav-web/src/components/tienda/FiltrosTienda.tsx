'use client';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import CampoHex from './CampoHex';
import SelectHex from './SelectHex';

type Opcion = { valor: string; texto: string };
type Props = { categorias: Opcion[]; marcas: string[]; ordenes: Opcion[]; inicial: { categoria: string; q: string; marca: string; orden: string } };
const campo = 'min-h-10 w-full min-w-0 bg-transparent text-base text-tinta outline-none placeholder:text-carbon/60';

/** Filtros de la tienda: se aplican solos al elegir (listas) o al dejar de escribir (búsqueda); sin botón Filtrar. */
export default function FiltrosTienda({ categorias, marcas, ordenes, inicial }: Props) {
  const router = useRouter();
  const [f, setF] = useState(inicial);
  const [pendiente, iniciar] = useTransition();
  const primera = useRef(true);

  useEffect(() => {
    if (primera.current) { primera.current = false; return; }
    const t = setTimeout(() => {
      const p = new URLSearchParams();
      if (f.categoria) p.set('categoria', f.categoria);
      if (f.q.trim()) p.set('q', f.q.trim());
      if (f.marca) p.set('marca', f.marca);
      if (f.orden && f.orden !== 'nuevos') p.set('orden', f.orden);
      const qs = p.toString();
      iniciar(() => router.replace(qs ? `/tienda?${qs}` : '/tienda', { scroll: false }));
    }, 350);
    return () => clearTimeout(t);
  }, [f, router]);

  const setQ = (e: React.ChangeEvent<HTMLInputElement>) => setF((x) => ({ ...x, q: e.target.value }));

  return (
    <form action="/tienda" role="search" aria-busy={pendiente} onSubmit={(e) => e.preventDefault()} className="flex flex-wrap items-end gap-x-3 gap-y-4">
      <label className="grow text-sm font-medium text-carbon sm:min-w-64">Buscar
        <CampoHex className="mt-1"><input name="q" type="search" value={f.q} onChange={setQ} placeholder="Nombre, marca o código" className={campo} /></CampoHex>
      </label>
      <div className="text-sm font-medium text-carbon">
        <span id="et-categoria">Categoría</span>
        <SelectHex className="mt-1 min-w-44" etiqueta="Categoría" valor={f.categoria} opciones={[{ valor: '', texto: 'Todo' }, ...categorias]} onCambio={(v) => setF((x) => ({ ...x, categoria: v }))} />
      </div>
      <div className="text-sm font-medium text-carbon">
        <span id="et-marca">Marca</span>
        <SelectHex className="mt-1 min-w-44" etiqueta="Marca" valor={f.marca} opciones={[{ valor: '', texto: 'Todas' }, ...marcas.map((m) => ({ valor: m, texto: m }))]} onCambio={(v) => setF((x) => ({ ...x, marca: v }))} />
      </div>
      <div className="text-sm font-medium text-carbon">
        <span id="et-orden">Ordenar por</span>
        <SelectHex className="mt-1 min-w-44" etiqueta="Ordenar por" valor={f.orden} opciones={ordenes} onCambio={(v) => setF((x) => ({ ...x, orden: v }))} />
      </div>
      <noscript><button className="min-h-11 rounded-lg bg-carbon px-5 font-bold text-white">Filtrar</button></noscript>
    </form>
  );
}
