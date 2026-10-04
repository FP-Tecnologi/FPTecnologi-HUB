'use client';

import { useMemo, useState } from 'react';
import { Download, FileText, FileArchive, Film, Image as ImageIcon, Search } from 'lucide-react';
import type { RecursoSocio } from '@/lib/cuenta';

const ICONO = { IMAGEN: ImageIcon, PDF: FileText, VIDEO: Film, DOCUMENTO: FileText, OTRO: FileArchive } as const;
const TIPOS: { v: '' | RecursoSocio['tipo']; label: string }[] = [
  { v: '', label: 'Todo' },
  { v: 'IMAGEN', label: 'Imágenes' },
  { v: 'PDF', label: 'PDF' },
  { v: 'VIDEO', label: 'Videos' },
  { v: 'DOCUMENTO', label: 'Documentos' },
];
const peso = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

/* Material para socios: filtros por marca del fabricante, tipo y búsqueda; cada tarjeta muestra vista previa
   (imagen o video) y descarga directa. */
export function RecursosView({ socio, recursos }: { socio: { nombre: string | null; empresa: string | null }; recursos: RecursoSocio[] }) {
  const [fabricante, setFabricante] = useState('');
  const [tipo, setTipo] = useState<'' | RecursoSocio['tipo']>('');
  const [q, setQ] = useState('');

  const fabricantes = useMemo(() => [...new Set(recursos.map((r) => r.fabricante).filter(Boolean) as string[])].sort(), [recursos]);
  const visibles = recursos.filter(
    (r) =>
      (!fabricante || r.fabricante === fabricante) &&
      (!tipo || r.tipo === tipo) &&
      (!q.trim() || `${r.titulo} ${r.descripcion ?? ''} ${r.categoria ?? ''} ${r.fabricante ?? ''}`.toLowerCase().includes(q.trim().toLowerCase())),
  );
  const chip = (activo: boolean) =>
    `rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${activo ? 'bg-brand-primary text-white' : 'bg-brand-100 text-brand-700 hover:bg-brand-primary hover:text-white'}`;

  return (
    <div>
      <p className="text-sm text-ink/65">
        Hola{socio.nombre ? `, ${socio.nombre}` : ''}{socio.empresa ? ` (${socio.empresa})` : ''}. Descarga el material para tu promoción y ventas.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/55" aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar recurso…" aria-label="Buscar recurso" className="w-full rounded-xl border border-brand-200 bg-white py-2.5 pl-10 pr-3 text-sm text-ink outline-none focus:border-brand-primary" />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Tipo de archivo">
          {TIPOS.map((t) => (
            <button key={t.label} type="button" onClick={() => setTipo(t.v)} aria-pressed={tipo === t.v} className={chip(tipo === t.v)}>{t.label}</button>
          ))}
        </div>
      </div>

      {fabricantes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Marca">
          <button type="button" onClick={() => setFabricante('')} aria-pressed={!fabricante} className={chip(!fabricante)}>Todas las marcas</button>
          {fabricantes.map((f) => (
            <button key={f} type="button" onClick={() => setFabricante(f)} aria-pressed={fabricante === f} className={chip(fabricante === f)}>{f}</button>
          ))}
        </div>
      )}

      {visibles.length === 0 ? (
        <p className="mt-10 text-center text-sm text-ink/65">{recursos.length === 0 ? 'Todavía no hay recursos publicados. Vuelve pronto.' : 'Ningún recurso coincide con el filtro.'}</p>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibles.map((r) => {
            const Icono = ICONO[r.tipo];
            return (
              <li key={r.id} className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg shadow-brand-950/10">
                <div className="flex aspect-[4/3] items-center justify-center bg-brand-100">
                  {r.tipo === 'IMAGEN' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.archivoUrl} alt={r.titulo} loading="lazy" className="h-full w-full object-contain" />
                  ) : r.tipo === 'VIDEO' ? (
                    <video src={r.archivoUrl} controls preload="none" className="h-full w-full bg-ink object-contain" />
                  ) : (
                    <Icono className="h-12 w-12 text-brand-primary" strokeWidth={1.5} aria-hidden />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{[r.fabricante, r.categoria].filter(Boolean).join(' · ') || 'Recurso'}</p>
                  <h3 className="mt-1 font-display text-base font-bold text-ink">{r.titulo}</h3>
                  {r.descripcion && <p className="mt-1 line-clamp-2 text-sm text-ink/65">{r.descripcion}</p>}
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-xs text-ink/55">{peso(r.bytes)}</span>
                    <a href={r.archivoUrl} download target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
                      <Download className="h-4 w-4" aria-hidden />
                      Descargar
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
