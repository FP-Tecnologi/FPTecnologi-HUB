'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Search } from 'lucide-react';

const input =
  'mt-1.5 block min-h-11 w-full rounded-xl border border-brand-dark/15 bg-paper px-4 py-2.5 text-base text-ink outline-none transition-colors placeholder:text-ink/65 focus:border-brand-dark focus:bg-white focus:ring-2 focus:ring-brand-dark/15 aria-[invalid=true]:border-red-600';
const fecha = (d: string) => new Date(d).toLocaleDateString('es-PE', { timeZone: 'America/Lima', day: 'numeric', month: 'long', year: 'numeric' });
const ESTADOS: Record<string, string> = { RECIBIDO: 'Recibido', EN_PROCESO: 'En proceso', RESPONDIDO: 'Respondido' };
type Hoja = { codigo: string; tipo: string; estado: string; fecha: string; fechaLimite: string; respuesta?: string | null; respondidoAt?: string | null };

export function ConsultaReclamo() {
  const [codigo, setCodigo] = useState('');
  const [documento, setDocumento] = useState('');
  const [cargando, setCargando] = useState(false);
  const [hoja, setHoja] = useState<Hoja | null>(null);
  const [error, setError] = useState('');
  const [vacio, setVacio] = useState(false);
  const salidaRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (hoja || error) salidaRef.current?.focus(); }, [hoja, error]);

  const consultar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setHoja(null); setError(''); setVacio(false);
    if (!codigo.trim() || !documento.trim()) { setVacio(true); setError('Ingresa el código y el documento.'); return; }
    setCargando(true);
    try {
      const res = await fetch('/api/hub/libro-reclamaciones/consulta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ codigo: codigo.trim(), documento: documento.trim() }) });
      const j = await res.json().catch(() => ({}));
      if (res.ok) setHoja(j.data ?? j);
      else if (res.status === 404) setError('No encontramos una hoja con esos datos.');
      else if (res.status === 429) setError('Demasiadas consultas seguidas. Intenta de nuevo en unos minutos.');
      else setError('No pudimos consultar ahora. Intenta de nuevo más tarde.');
    } catch {
      setError('No pudimos consultar ahora. Intenta de nuevo más tarde.');
    } finally {
      setCargando(false);
    }
  };

  const inv = (v: string) => (vacio && !v.trim() ? { 'aria-invalid': true as const, 'aria-describedby': 'c-error' } : {});

  return (
    <div className="rounded-2xl border border-brand-dark/10 p-5 sm:p-6">
      <form onSubmit={consultar} noValidate className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-codigo" className="block text-sm font-medium text-ink">Código de la hoja</label>
          <input id="c-codigo" value={codigo} onChange={(e) => { setCodigo(e.target.value); setVacio(false); }} maxLength={40} placeholder="LR-0001-2026" className={input} {...inv(codigo)} />
        </div>
        <div>
          <label htmlFor="c-doc" className="block text-sm font-medium text-ink">N.º de documento</label>
          <input id="c-doc" value={documento} onChange={(e) => { setDocumento(e.target.value); setVacio(false); }} maxLength={40} className={input} {...inv(documento)} />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={cargando} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-brand-dark/30 transition-colors hover:bg-brand-dark disabled:opacity-60">
            {cargando ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Search aria-hidden="true" className="h-4 w-4" />}
            Consultar estado
          </button>
        </div>
      </form>
      <div ref={salidaRef} tabIndex={-1} className="outline-none">
        {error && <p id="c-error" role="alert" className="mt-4 text-sm font-medium text-red-600">{error}</p>}
        {hoja && (
          <dl role="status" className="mt-4 grid gap-1 text-ink/80">
            <div><dt className="inline font-semibold text-ink">Hoja: </dt><dd className="inline">{hoja.codigo} ({hoja.tipo === 'QUEJA' ? 'Queja' : 'Reclamo'})</dd></div>
            <div><dt className="inline font-semibold text-ink">Estado: </dt><dd className="inline">{ESTADOS[hoja.estado] ?? hoja.estado}</dd></div>
            <div><dt className="inline font-semibold text-ink">Registrada: </dt><dd className="inline">{fecha(hoja.fecha)}</dd></div>
            <div><dt className="inline font-semibold text-ink">Fecha límite de respuesta: </dt><dd className="inline">{fecha(hoja.fechaLimite)}</dd></div>
            {hoja.respuesta && <div className="mt-2"><dt className="font-semibold text-ink">Respuesta{hoja.respondidoAt ? ` (${fecha(hoja.respondidoAt)})` : ''}</dt><dd className="whitespace-pre-line break-words">{hoja.respuesta}</dd></div>}
          </dl>
        )}
      </div>
    </div>
  );
}
