'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader2, Search } from 'lucide-react';

const campo = 'mt-1 block min-h-11 w-full rounded-lg border border-[color:var(--c-borde)] bg-bg/60 px-4 py-2.5 text-base text-white transition focus:border-claro aria-invalid:border-[color:var(--c-error)]';
const fecha = (d: string) => new Date(d).toLocaleDateString('es-PE', { timeZone: 'America/Lima', day: 'numeric', month: 'long', year: 'numeric' });
const ESTADOS: Record<string, string> = { RECIBIDO: 'Recibido', EN_PROCESO: 'En proceso', RESPONDIDO: 'Respondido' };
type Hoja = { codigo: string; tipo: string; estado: string; fecha: string; fechaLimite: string; respuesta?: string | null; respondidoAt?: string | null };

export default function ConsultaReclamo() {
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

  const inv = (v: string) => (vacio && !v.trim() ? { 'aria-invalid': true as const } : {});

  return (
    <div className="glass rounded-2xl p-5 sm:p-8">
      <form onSubmit={consultar} noValidate className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-codigo" className="text-sm font-medium text-slate-200">Código de la hoja</label>
          <input id="c-codigo" value={codigo} onChange={(e) => { setCodigo(e.target.value); setVacio(false); }} maxLength={40} aria-describedby={vacio && !codigo.trim() ? 'c-error c-ayuda' : 'c-ayuda'} {...inv(codigo)} className={campo} />
          <p id="c-ayuda" className="mt-1 text-sm text-slate-400">Ejemplo: LR-0001-2026</p>
        </div>
        <div>
          <label htmlFor="c-doc" className="text-sm font-medium text-slate-200">N.º de documento</label>
          <input id="c-doc" value={documento} onChange={(e) => { setDocumento(e.target.value); setVacio(false); }} maxLength={40} aria-describedby={vacio && !documento.trim() ? 'c-error' : undefined} {...inv(documento)} className={campo} />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={cargando} className="btn-neon flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-8 py-4 font-display text-sm disabled:opacity-60 sm:w-auto">
            {cargando ? <Loader2 aria-hidden="true" size={18} className="animate-spin" /> : <Search aria-hidden="true" size={18} />} CONSULTAR ESTADO
          </button>
        </div>
      </form>
      <div ref={salidaRef} tabIndex={-1} className="outline-none">
        {error && <p id="c-error" role="alert" className="mt-4 text-sm text-[color:var(--c-error)]">{error}</p>}
        {hoja && (
          <dl role="status" className="mt-4 grid gap-1 text-slate-300">
            <div><dt className="inline font-bold text-white">Hoja: </dt><dd className="inline">{hoja.codigo} ({hoja.tipo === 'QUEJA' ? 'Queja' : 'Reclamo'})</dd></div>
            <div><dt className="inline font-bold text-white">Estado: </dt><dd className="inline">{ESTADOS[hoja.estado] ?? hoja.estado}</dd></div>
            <div><dt className="inline font-bold text-white">Registrada: </dt><dd className="inline">{fecha(hoja.fecha)}</dd></div>
            <div><dt className="inline font-bold text-white">Fecha límite de respuesta: </dt><dd className="inline">{fecha(hoja.fechaLimite)}</dd></div>
            {hoja.respuesta && <div className="mt-2"><dt className="font-bold text-white">Respuesta{hoja.respondidoAt ? ` (${fecha(hoja.respondidoAt)})` : ''}</dt><dd className="whitespace-pre-line break-words">{hoja.respuesta}</dd></div>}
          </dl>
        )}
      </div>
    </div>
  );
}
