'use client';

import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2, MessageCircle } from 'lucide-react';
import { whatsappHref } from '@/lib/chatActions';
import type { Campo, Formulario, LandingContenido } from '@/lib/landings';

const input =
  'mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-[15px] text-ink outline-none transition-all placeholder:text-ink/65 hover:border-brand-dark/40 focus:border-brand-dark focus:ring-4 focus:ring-brand-dark/10 aria-[invalid=true]:border-rose-400';

type Valores = Record<string, string | boolean>;

/** Valida un campo en el navegador (el servidor repite todo): devuelve el mensaje o ''. */
function error(c: Campo, v: string | boolean | undefined): string {
  if (c.tipo === 'checkbox') return c.requerido && v !== true ? 'Debes aceptar para continuar.' : '';
  const s = typeof v === 'string' ? v.trim() : '';
  if (!s) return c.requerido ? 'Este campo es obligatorio.' : '';
  if (c.tipo === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) return 'Ingresa un correo válido.';
  if (c.tipo === 'telefono' && !/^9\d{8}$/.test(s.replace(/[\s()-]/g, '').replace(/^\+?51(?=9\d{8}$)/, ''))) return 'Ingresa un celular de 9 dígitos (empieza con 9).';
  if (c.tipo === 'documento' && ![8, 11].includes(s.replace(/\D/g, '').length)) return 'Ingresa un DNI (8) o RUC (11) válido.';
  return '';
}

/*
 * Formulario de una landing: lo que definió el equipo en el dashboard (campos, tipos, pasos). Con varios
 * pasos muestra un avance como el de EXPOMINA; al enviar valida en el servidor y muestra el mensaje de éxito.
 * En vista previa (borrador) no envía nada.
 */
export function FormularioLanding({ slug, formulario, contenido, vistaPrevia = false }: { slug: string; formulario: Formulario; contenido: LandingContenido; vistaPrevia?: boolean }) {
  const pasos = formulario.pasos.length ? formulario.pasos : ['Datos'];
  const [paso, setPaso] = useState(0);
  const [v, setV] = useState<Valores>({});
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok'>('idle');
  const [errorGeneral, setErrorGeneral] = useState('');
  const [trampa, setTrampa] = useState('');
  const tope = useRef<HTMLDivElement>(null);

  const delPaso = (n: number) => formulario.campos.filter((c) => (c.paso ?? 0) === n);
  const set = (id: string, val: string | boolean) => {
    setV((p) => ({ ...p, [id]: val }));
    if (errores[id]) setErrores((p) => ({ ...p, [id]: '' }));
  };

  function validarPaso(n: number) {
    const e: Record<string, string> = {};
    for (const c of delPaso(n)) {
      const m = error(c, v[c.id]);
      if (m) e[c.id] = m;
    }
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  async function enviar(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validarPaso(paso)) return;
    if (paso < pasos.length - 1) {
      setPaso(paso + 1);
      tope.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    if (vistaPrevia) return setErrorGeneral('Vista previa: el formulario no envía datos hasta que publiques la landing.');
    setEstado('enviando');
    setErrorGeneral('');
    try {
      const res = await fetch(`/api/hub/landings/${encodeURIComponent(slug)}/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datos: v, origen: window.location.search.slice(1, 200) || window.location.pathname, website: trampa }),
      });
      if (res.ok) return setEstado('ok');
      const cuerpo = (await res.json().catch(() => ({}))) as { message?: string | string[] };
      const msg = Array.isArray(cuerpo.message) ? cuerpo.message[0] : cuerpo.message;
      setErrorGeneral(msg || 'No pudimos enviar tus datos. Intenta de nuevo.');
    } catch {
      setErrorGeneral('No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.');
    }
    setEstado('idle');
  }

  if (estado === 'ok') {
    return (
      <div role="status" className="cot-step flex flex-col items-center py-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-whatsapp/15 text-whatsapp-dark">
          <CheckCircle2 className="h-9 w-9" strokeWidth={1.7} />
        </span>
        <h3 className="mt-5 font-display text-2xl font-bold text-ink">{contenido.exitoTitulo}</h3>
        <p className="mt-2 max-w-sm text-ink/60">{contenido.exitoMensaje}</p>
        {contenido.whatsappTexto && (
          <a href={whatsappHref(contenido.whatsappTexto)} target="_blank" rel="noreferrer" className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-whatsapp-dark px-6 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-whatsapp-deep">
            <MessageCircle className="h-5 w-5" strokeWidth={2} /> Escribir por WhatsApp
          </a>
        )}
      </div>
    );
  }

  const ultimo = paso === pasos.length - 1;
  return (
    <div ref={tope} className="scroll-mt-28">
      {pasos.length > 1 && (
        <ol className="mb-6 grid gap-2" style={{ gridTemplateColumns: `repeat(${pasos.length}, minmax(0, 1fr))` }} aria-label={`Paso ${paso + 1} de ${pasos.length}`}>
          {pasos.map((p, i) => (
            <li key={i} className="min-w-0">
              <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
                <div className={`h-full rounded-full bg-brand-primary transition-all duration-500 ${i <= paso ? 'w-full' : 'w-0'}`} />
              </div>
              <span className={`mt-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide ${i <= paso ? 'text-brand-700' : 'text-ink/65'}`}>
                {i < paso ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <span>{i + 1}</span>}
                <span className="truncate">{p}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
      <form noValidate onSubmit={enviar}>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trampa} onChange={(e) => setTrampa(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
        <div key={paso} className="cot-step space-y-4">
          {delPaso(paso).map((c) => (
            <div key={c.id}>
              {c.tipo === 'checkbox' ? (
                <label className="flex cursor-pointer items-start gap-3 text-sm text-ink/70">
                  <input id={`lf-${c.id}`} type="checkbox" checked={v[c.id] === true} onChange={(e) => set(c.id, e.target.checked)} className="peer sr-only" />
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-ink/25 bg-white text-transparent transition-colors peer-checked:border-brand-primary peer-checked:bg-brand-primary peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-brand-dark/20">
                    <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                  </span>
                  <span>{c.etiqueta}{c.requerido && ' *'}</span>
                </label>
              ) : (
                <>
                  <label htmlFor={`lf-${c.id}`} className="text-sm font-semibold text-ink/80">{c.etiqueta}{c.requerido && <span className="text-rose-500"> *</span>}</label>
                  {c.tipo === 'select' ? (
                    <select id={`lf-${c.id}`} value={(v[c.id] as string) ?? ''} onChange={(e) => set(c.id, e.target.value)} aria-invalid={!!errores[c.id]} className={input}>
                      <option value="">Selecciona…</option>
                      {c.opciones?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : c.tipo === 'textarea' ? (
                    <textarea id={`lf-${c.id}`} rows={3} maxLength={1000} value={(v[c.id] as string) ?? ''} onChange={(e) => set(c.id, e.target.value)} placeholder={c.placeholder} aria-invalid={!!errores[c.id]} className={`${input} resize-none`} />
                  ) : (
                    <input
                      id={`lf-${c.id}`}
                      type={c.tipo === 'email' ? 'email' : c.tipo === 'telefono' ? 'tel' : 'text'}
                      inputMode={c.tipo === 'telefono' || c.tipo === 'documento' ? 'numeric' : undefined}
                      maxLength={c.tipo === 'documento' ? 11 : 200}
                      value={(v[c.id] as string) ?? ''}
                      onChange={(e) => set(c.id, c.tipo === 'documento' ? e.target.value.replace(/\D/g, '') : e.target.value)}
                      placeholder={c.placeholder}
                      aria-invalid={!!errores[c.id]}
                      className={input}
                    />
                  )}
                </>
              )}
              {errores[c.id] && <p role="alert" className="mt-1.5 text-sm font-medium text-rose-600">{errores[c.id]}</p>}
            </div>
          ))}
        </div>
        {errorGeneral && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{errorGeneral}</p>}
        <div className="mt-6 flex items-center gap-3">
          {paso > 0 && (
            <button type="button" onClick={() => setPaso(paso - 1)} className="inline-flex h-12 items-center gap-2 rounded-xl border border-ink/15 px-5 text-sm font-semibold text-ink transition-colors hover:bg-brand-primary hover:text-white">
              <ArrowLeft className="h-4 w-4" strokeWidth={2.2} /> Atrás
            </button>
          )}
          <button type="submit" disabled={estado === 'enviando'} className="group inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-brand-dark/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-primary disabled:opacity-60">
            {estado === 'enviando' ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando…</> : ultimo ? formulario.boton : <>Siguiente <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.2} /></>}
          </button>
        </div>
      </form>
    </div>
  );
}
