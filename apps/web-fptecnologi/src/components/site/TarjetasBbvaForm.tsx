'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, Calendar, CreditCard, IdCard, Loader2, Lock, Mail, RotateCcw, Signal, Smartphone } from 'lucide-react';
import { TarjetaBbva, TarjetasAbanico } from './BannerBbva';

type Oferta = { id: number; tarjeta: string; codigo: string; linea: number; moneda: string; tea: number; imagen: string | null };
type Resultado = { consultaId: string | null; nombre: string | null; ofertas: Oferta[]; enlace: string };

const OPERADORES = [
  { v: 'M', label: 'Movistar' },
  { v: 'C', label: 'Claro' },
  { v: 'B', label: 'Bitel' },
  { v: 'E', label: 'Entel' },
] as const;

const input =
  'mt-1.5 w-full rounded-xl border border-ink/15 bg-white py-3 pl-12 pr-4 text-base text-ink outline-none transition-all placeholder:text-ink/65 focus:border-[#001391] focus:ring-4 focus:ring-[#001391]/10';
const iconCls = 'pointer-events-none absolute left-4 top-1/2 mt-[3px] h-5 w-5 -translate-y-1/2 text-ink/65';

function Campo({ id, label, icon: Icon, children }: { id: string; label: string; icon: typeof Mail; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink/80">{label}</label>
      <div className="relative">
        <Icon className={iconCls} strokeWidth={1.8} />
        {children}
      </div>
    </div>
  );
}

const dinero = (n: number, moneda: string) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: moneda, maximumFractionDigits: 0 }).format(n);

/* Formulario de consulta (campos que pide BBVA Cards offer) y lista de tarjetas disponibles. */
export function TarjetasBbvaForm() {
  const [v, setV] = useState({ dni: '', nacimiento: '', celular: '', operador: '', email: '', aceptaDatos: false });
  const [trampa, setTrampa] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [res, setRes] = useState<Resultado | null>(null);
  const [eligiendo, setEligiendo] = useState<number | null>(null);
  const set = <K extends keyof typeof v>(k: K, val: (typeof v)[K]) => setV((p) => ({ ...p, [k]: val }));

  const hoy = new Date();
  const maxNac = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate()).toISOString().slice(0, 10);

  async function consultar(e: FormEvent) {
    e.preventDefault();
    setError('');
    const celular = v.celular.replace(/\D/g, '').replace(/^51(?=9\d{8}$)/, '');
    if (!/^\d{8}$/.test(v.dni)) return setError('El DNI debe tener 8 dígitos.');
    if (!v.nacimiento) return setError('Ingresa tu fecha de nacimiento.');
    if (!/^9\d{8}$/.test(celular)) return setError('Ingresa un celular válido de 9 dígitos.');
    if (!v.operador) return setError('Elige tu operador de celular.');
    if (!v.aceptaDatos) return setError('Debes aceptar el tratamiento de tus datos personales.');
    setEnviando(true);
    try {
      const r = await fetch('/api/bbva/ofertas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, celular, website: trampa || undefined }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'No pudimos hacer la consulta.');
      setRes(j as Resultado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos hacer la consulta.');
    } finally {
      setEnviando(false);
    }
  }

  async function solicitar(o: Oferta) {
    if (!res) return;
    setEligiendo(o.id);
    let enlace = res.enlace;
    try {
      if (res.consultaId) {
        const r = await fetch('/api/bbva/solicitar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ consultaId: res.consultaId, ofertaId: o.id }),
        });
        if (r.ok) enlace = ((await r.json()) as { enlace?: string }).enlace || enlace;
      }
    } catch {
      /* si falla el registro, igual se lleva al visitante a BBVA */
    }
    window.location.href = enlace;
  }

  if (res) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-xl shadow-brand-dark/10 md:p-10">
        {res.ofertas.length ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#001391]">Tus ofertas preaprobadas</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
              {res.nombre ? `${res.nombre}, ` : ''}tienes {res.ofertas.length === 1 ? 'una tarjeta disponible' : `${res.ofertas.length} tarjetas disponibles`}
            </h2>
            <p className="mt-2 text-sm text-ink/65">Elige la que prefieras: la solicitud continúa en la web o app de BBVA.</p>
            <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-6">
              {res.ofertas.map((o) => (
                <article key={o.id} className="flex flex-col rounded-2xl border border-[#001391]/10 bg-gradient-to-b from-[#eef2ff] to-white p-5 shadow-md shadow-brand-dark/10 transition-transform hover:-translate-y-1">
                  {o.imagen ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={o.imagen} alt={o.tarjeta} className="mx-auto aspect-[188/304] w-32 object-contain drop-shadow-[0_18px_30px_rgba(0,19,145,0.35)]" />
                  ) : (
                    <TarjetaBbva className="mx-auto w-32" />
                  )}
                  <h3 className="mt-5 font-display text-xl font-bold text-ink">{o.tarjeta}</h3>
                  <dl className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(7.5rem,1fr))] gap-3 text-sm">
                    <div className="rounded-xl bg-white p-3 shadow-sm shadow-brand-dark/5">
                      <dt className="text-xs text-ink/65">Línea de crédito</dt>
                      <dd className="whitespace-nowrap font-mono text-base font-bold text-[#001391]">{dinero(o.linea, o.moneda)}</dd>
                    </div>
                    <div className="rounded-xl bg-white p-3 shadow-sm shadow-brand-dark/5">
                      <dt className="text-xs text-ink/65">TEA referencial</dt>
                      <dd className="whitespace-nowrap font-mono text-base font-bold text-ink">{o.tea}%</dd>
                    </div>
                  </dl>
                  <div className="h-5" />
                  <button
                    type="button"
                    onClick={() => solicitar(o)}
                    disabled={eligiendo !== null}
                    className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#001391] px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#070E46] disabled:opacity-60"
                  >
                    {eligiendo === o.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" strokeWidth={2} />}
                    Solicitar esta tarjeta
                  </button>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center">
            <TarjetasAbanico ancho="w-24" />
            <h2 className="mt-6 font-display text-2xl font-bold text-ink">Por ahora no tienes ofertas preaprobadas</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/65">Tu perfil puede cambiar con el tiempo: vuelve a consultar más adelante o revisa todas las tarjetas en la web de BBVA.</p>
            <a href={res.enlace} className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-[#001391] px-6 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#070E46]">
              Ver tarjetas BBVA <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </a>
          </div>
        )}
        <button type="button" onClick={() => setRes(null)} className="mx-auto mt-8 flex items-center gap-2 text-sm font-semibold text-ink/65 transition-colors hover:text-[#001391]">
          <RotateCcw className="h-4 w-4" strokeWidth={2} /> Hacer otra consulta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={consultar} noValidate className="relative rounded-3xl bg-white p-6 shadow-xl shadow-brand-dark/10 md:p-8">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trampa} onChange={(e) => setTrampa(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <h2 className="font-display text-xl font-bold text-ink">Consulta tus tarjetas disponibles</h2>
      <p className="mt-1 text-sm text-ink/65">BBVA evalúa tu perfil y te muestra las tarjetas que puedes solicitar.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Campo id="bb-dni" label="DNI" icon={IdCard}>
          <input id="bb-dni" inputMode="numeric" autoComplete="off" maxLength={8} value={v.dni} onChange={(e) => set('dni', e.target.value.replace(/\D/g, ''))} className={input} placeholder="12345678" />
        </Campo>
        <Campo id="bb-nac" label="Fecha de nacimiento" icon={Calendar}>
          <input id="bb-nac" type="date" max={maxNac} min="1920-01-01" value={v.nacimiento} onChange={(e) => set('nacimiento', e.target.value)} className={input} />
        </Campo>
        <Campo id="bb-cel" label="Celular" icon={Smartphone}>
          <input id="bb-cel" type="tel" inputMode="numeric" autoComplete="tel" maxLength={12} value={v.celular} onChange={(e) => set('celular', e.target.value)} className={input} placeholder="987 654 321" />
        </Campo>
        <Campo id="bb-op" label="Operador" icon={Signal}>
          <select id="bb-op" value={v.operador} onChange={(e) => set('operador', e.target.value)} className={`${input} appearance-none ${v.operador ? '' : 'text-ink/65'}`}>
            <option value="" disabled>Elige tu operador</option>
            {OPERADORES.map((o) => (
              <option key={o.v} value={o.v}>{o.label}</option>
            ))}
          </select>
        </Campo>
        <div className="sm:col-span-2">
          <Campo id="bb-email" label="Correo electrónico" icon={Mail}>
            <input id="bb-email" type="email" autoComplete="email" maxLength={120} value={v.email} onChange={(e) => set('email', e.target.value)} className={input} placeholder="tucorreo@gmail.com" />
          </Campo>
        </div>
      </div>
      <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-ink/70">
        <input type="checkbox" checked={v.aceptaDatos} onChange={(e) => set('aceptaDatos', e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#001391]" />
        <span>
          Autorizo a FP Tecnologi y a BBVA Perú a tratar mis datos personales para consultar y ofrecerme tarjetas de crédito, conforme a la Ley N.° 29733 de Protección de Datos Personales.{' '}
          <a href="/legal/privacidad" className="font-semibold text-[#001391] underline-offset-2 hover:underline">Política de privacidad</a>
        </span>
      </label>
      {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
      <button type="submit" disabled={enviando} className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#001391] py-4 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#070E46] disabled:opacity-60">
        {enviando ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" strokeWidth={2.2} />}
        {enviando ? 'Consultando…' : 'Ver mis tarjetas'}
      </button>
      <p className="mt-4 flex items-start gap-2 text-xs text-ink/60">
        <Lock className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
        Tus datos viajan cifrados y la consulta no tiene costo.
      </p>
    </form>
  );
}
