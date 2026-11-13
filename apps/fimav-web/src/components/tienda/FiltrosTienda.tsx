'use client';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import CampoHex from './CampoHex';

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

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  return (
    <form action="/tienda" role="search" aria-busy={pendiente} onSubmit={(e) => e.preventDefault()} className="flex flex-wrap items-end gap-x-3 gap-y-4">
      <label className="grow text-sm font-medium text-carbon sm:min-w-64">Buscar
        <CampoHex className="mt-1"><input name="q" type="search" value={f.q} onChange={set('q')} placeholder="Nombre, marca o código" className={campo} /></CampoHex>
      </label>
      <label className="text-sm font-medium text-carbon">Categoría
        <CampoHex rojo className="mt-1">
          <select name="categoria" value={f.categoria} onChange={set('categoria')} className={campo}>
            <option value="">Todo</option>
            {categorias.map((c) => <option key={c.valor} value={c.valor}>{c.texto}</option>)}
          </select>
        </CampoHex>
      </label>
      <label className="text-sm font-medium text-carbon">Marca
        <CampoHex rojo className="mt-1">
          <select name="marca" value={f.marca} onChange={set('marca')} className={campo}>
            <option value="">Todas</option>
            {marcas.map((m) => <option key={m}>{m}</option>)}
          </select>
        </CampoHex>
      </label>
      <label className="text-sm font-medium text-carbon">Ordenar por
        <CampoHex rojo className="mt-1">
          <select name="orden" value={f.orden} onChange={set('orden')} className={campo}>
            {ordenes.map((o) => <option key={o.valor} value={o.valor}>{o.texto}</option>)}
          </select>
        </CampoHex>
      </label>
      <noscript><button className="min-h-11 rounded-lg bg-carbon px-5 font-bold text-white">Filtrar</button></noscript>
    </form>
  );
}
