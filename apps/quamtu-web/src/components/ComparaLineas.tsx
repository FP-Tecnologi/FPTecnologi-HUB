import { BUILDS, seleccionDe, total } from '@/lib/piezas';

const soles = (n: number) => `S/ ${n.toLocaleString('es-PE')}`;
const desde = (ids: number[]) => Math.min(...ids.map((i) => total(seleccionDe(BUILDS[i].ids))));
const nombres = (ids: number[], cat: 'ram' | 'ssd' | 'gpu' | 'cooler' | 'cpu') =>
  [...new Set(ids.map((i) => seleccionDe(BUILDS[i].ids)[cat]?.nombre))].join(' · ');

const FILAS: { t: string; turing: string; ws: string }[] = [
  { t: 'Ideal para', turing: 'Productividad diaria, estudio y diseño', ws: 'Edición, render, ingeniería e IA' },
  { t: 'Procesadores', turing: nombres([0, 1], 'cpu'), ws: nombres([2, 3], 'cpu') },
  { t: 'Memoria', turing: nombres([0, 1], 'ram'), ws: nombres([2, 3], 'ram') },
  { t: 'Video', turing: nombres([0, 1], 'gpu'), ws: nombres([2, 3], 'gpu') },
  { t: 'Almacenamiento', turing: nombres([0, 1], 'ssd'), ws: nombres([2, 3], 'ssd') },
  { t: 'Refrigeración', turing: nombres([0, 1], 'cooler'), ws: nombres([2, 3], 'cooler') },
  { t: 'Desde', turing: soles(desde([0, 1])), ws: soles(desde([2, 3])) },
];

// Tabla generada con las configuraciones listas: si cambian en el catálogo, cambia aquí.
export default function ComparaLineas() {
  return (
    <>
    <div className="mt-10 hidden overflow-hidden rounded-2xl border border-line md:block">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-panel text-sm">
            <th className="w-40 p-4" />
            <th className="p-4 font-display text-lg text-white"><span className="text-claro">Línea</span> TURING</th>
            <th className="p-4 font-display text-lg text-white"><span className="text-claro">Línea</span> TURING WS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {FILAS.map((f) => (
            <tr key={f.t} className="align-top">
              <th className="p-4 text-xs font-bold tracking-widest text-slate-400">{f.t.toUpperCase()}</th>
              <td className={`p-4 text-slate-200 ${f.t === 'Desde' ? 'font-display text-xl font-bold text-claro' : ''}`}>{f.turing}</td>
              <td className={`p-4 text-slate-200 ${f.t === 'Desde' ? 'font-display text-xl font-bold text-claro' : ''}`}>{f.ws}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Celular: cada fila se apila con las dos líneas una bajo la otra */}
    <dl className="mt-8 divide-y divide-line border-y border-line md:hidden">
      {FILAS.map((f) => (
        <div key={f.t} className="py-4">
          <dt className="text-xs font-bold tracking-widest text-slate-400">{f.t.toUpperCase()}</dt>
          <dd className="mt-2 space-y-2">
            <p className="text-slate-200"><b className="text-claro">Turing: </b>{f.turing}</p>
            <p className="text-slate-200"><b className="text-claro">Turing WS: </b>{f.ws}</p>
          </dd>
        </div>
      ))}
    </dl>
    </>
  );
}
