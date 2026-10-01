'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  Send,
  User,
} from 'lucide-react';
import type { CotizadorContenido } from '@/lib/cotizadorContenido';

type Persona = 'NATURAL' | 'JURIDICA';
type Valores = {
  interes: string;
  otro: string;
  mensaje: string;
  tipoPersona: Persona;
  nroDocumento: string;
  nombres: string;
  apellidos: string;
  empresa: string;
  email: string;
  celular: string;
};
type Errores = Partial<Record<keyof Valores, string>>;

const VACIO: Valores = {
  interes: '',
  otro: '',
  mensaje: '',
  tipoPersona: 'NATURAL',
  nroDocumento: '',
  nombres: '',
  apellidos: '',
  empresa: '',
  email: '',
  celular: '',
};

const OTRO = '__otro__';
const soloDigitos = (v: string, max: number) => v.replace(/\D/g, '').slice(0, max);
const celularLimpio = (v: string) => v.replace(/[\s()-]/g, '').replace(/^\+?51(?=9\d{8}$)/, '');

function validar(paso: number, v: Valores): Errores {
  const e: Errores = {};
  if (paso === 0) {
    if (!v.interes) e.interes = 'Elige una opción para continuar.';
    else if (v.interes === OTRO && v.otro.trim().length < 2) e.otro = 'Cuéntanos qué necesitas cotizar.';
  }
  if (paso === 1) {
    const juridica = v.tipoPersona === 'JURIDICA';
    if (juridica) {
      if (!/^(10|15|16|17|20)\d{9}$/.test(v.nroDocumento)) e.nroDocumento = 'El RUC debe tener 11 dígitos (empieza con 10 o 20).';
      if (v.empresa.trim().length < 2) e.empresa = 'Indica el nombre de tu empresa.';
    } else if (!/^\d{8}$/.test(v.nroDocumento)) {
      e.nroDocumento = 'El DNI debe tener 8 dígitos.';
    }
    if (v.nombres.trim().length < 2) e.nombres = 'Ingresa tus nombres.';
    if (v.apellidos.trim().length < 2) e.apellidos = 'Ingresa tus apellidos.';
  }
  if (paso === 2) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'Ingresa un correo válido.';
    if (!/^9\d{8}$/.test(celularLimpio(v.celular))) e.celular = 'Ingresa un celular de 9 dígitos (empieza con 9).';
  }
  return e;
}

const input =
  'mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-base text-ink outline-none transition-all placeholder:text-ink/35 focus:border-brand-dark focus:ring-4 focus:ring-brand-dark/10 aria-[invalid=true]:border-rose-400 aria-[invalid=true]:ring-4 aria-[invalid=true]:ring-rose-100';

function Campo({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink/80">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

/*
 * Cotizador en 3 pasos (qué necesitas → quién solicita → cómo te contactamos)
 * con barra de progreso, validación por paso y pantalla de gracias. Envía a
 * /api/hub/cotizador (proxy hacia la API central → dashboard Cotizador → Leads).
 */
export function CotizadorForm({ c, interesInicial }: { c: CotizadorContenido; interesInicial?: string }) {
  const opciones = c.intereses.items;
  const inicial = opciones.find((o) => o.title.toLowerCase() === interesInicial?.toLowerCase())?.title ?? '';
  const [v, setV] = useState<Valores>({ ...VACIO, interes: inicial });
  const [paso, setPaso] = useState(0);
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [trampa, setTrampa] = useState('');
  const tope = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paso > 0 || enviado) tope.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [paso, enviado]);

  const set = <K extends keyof Valores>(k: K, val: Valores[K]) => {
    setV((p) => ({ ...p, [k]: val }));
    if (errores[k]) setErrores((p) => ({ ...p, [k]: undefined }));
  };

  const pasos = c.pasos.items;
  const ultimo = paso === 2;
  const juridica = v.tipoPersona === 'JURIDICA';

  async function siguiente() {
    const e = validar(paso, v);
    setErrores(e);
    if (Object.keys(e).length) return;
    if (!ultimo) {
      setPaso(paso + 1);
      return;
    }
    setEnviando(true);
    setErrorGeneral('');
    try {
      const res = await fetch('/api/hub/cotizador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombres: v.nombres.trim(),
          apellidos: v.apellidos.trim(),
          tipoPersona: v.tipoPersona,
          tipoDocumento: juridica ? 'RUC' : 'DNI',
          nroDocumento: v.nroDocumento,
          empresa: v.empresa.trim() || undefined,
          email: v.email.trim(),
          celular: celularLimpio(v.celular),
          interes: v.interes === OTRO ? v.otro.trim() : v.interes,
          mensaje: v.mensaje.trim() || undefined,
          origen: typeof window !== 'undefined' ? window.location.pathname : undefined,
          website: trampa,
        }),
      });
      if (res.ok) {
        setEnviado(true);
        return;
      }
      const cuerpo = (await res.json().catch(() => ({}))) as { message?: string | string[] };
      const msg = Array.isArray(cuerpo.message) ? cuerpo.message[0] : cuerpo.message;
      setErrorGeneral(res.status === 429 ? msg || 'Demasiados intentos. Espera unos minutos.' : msg || 'No pudimos enviar tu solicitud. Intenta de nuevo.');
    } catch {
      setErrorGeneral('No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div ref={tope} className="cot-step flex flex-col items-center py-10 text-center" role="status">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-whatsapp/15 text-whatsapp-dark">
          <CheckCircle2 className="h-11 w-11" strokeWidth={1.8} />
        </span>
        <h2 className="mt-6 font-display text-2xl font-bold text-ink sm:text-3xl">{c.gracias.titulo}</h2>
        <p className="mt-3 max-w-md text-ink/60">{c.gracias.mensaje}</p>
        {c.gracias.botonTexto && (
          <a
            href={c.gracias.botonUrl || '/'}
            className="mt-8 inline-flex h-12 items-center rounded-xl bg-brand-dark px-7 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-brand-primary"
          >
            {c.gracias.botonTexto}
          </a>
        )}
      </div>
    );
  }

  return (
    <div ref={tope} className="scroll-mt-28">
      {/* Progreso */}
      <ol className="mb-8 grid grid-cols-3 gap-3" aria-label={`Paso ${paso + 1} de 3`}>
        {pasos.slice(0, 3).map((p, i) => (
          <li key={i} className="min-w-0">
            <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
              <div className={`h-full rounded-full bg-brand-dark transition-all duration-500 ${i <= paso ? 'w-full' : 'w-0'}`} />
            </div>
            <span className={`mt-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${i <= paso ? 'text-brand-primary' : 'text-ink/35'}`}>
              {i < paso ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <span>{i + 1}</span>}
              <span className="hidden truncate sm:inline">{['Necesidad', 'Tus datos', 'Contacto'][i]}</span>
            </span>
          </li>
        ))}
      </ol>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void siguiente();
        }}
      >
        {/* Honeypot: invisible para personas. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={trampa}
          onChange={(e) => setTrampa(e.target.value)}
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />

        <div key={paso} className="cot-step">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-[1.7rem]">{pasos[paso]?.title}</h2>
          <p className="mt-1.5 text-ink/60">{pasos[paso]?.text}</p>

          {paso === 0 && (
            <div className="mt-6">
              <div role="radiogroup" aria-label="Servicio o producto de interés" className="grid gap-3 sm:grid-cols-2">
                {[...opciones.map((o) => ({ ...o, valor: o.title })), ...(c.intereses.permitirOtro ? [{ title: 'Otro', text: 'Cuéntanos qué necesitas.', valor: OTRO }] : [])].map((o, idx) => {
                  const activo = v.interes === o.valor;
                  return (
                    <button
                      key={o.valor}
                      type="button"
                      role="radio"
                      aria-checked={activo}
                      onClick={() => set('interes', o.valor)}
                      style={{ animationDelay: `${Math.min(idx, 8) * 45}ms` }}
                      className={`cot-step group relative flex flex-col rounded-2xl border-2 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-dark/15 active:scale-[0.98] ${
                        activo ? 'border-brand-dark bg-brand-dark/[0.06] shadow-lg shadow-brand-dark/10' : 'border-ink/10 bg-white hover:border-brand-dark/50'
                      }`}
                    >
                      <span className="pr-7 text-sm font-bold text-ink">{o.title}</span>
                      <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink/55">{o.text}</span>
                      <span
                        className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                          activo ? 'border-brand-dark bg-brand-dark text-white' : 'border-ink/20 text-transparent'
                        }`}
                        aria-hidden
                      >
                        <Check className="h-3 w-3" strokeWidth={3.5} />
                      </span>
                    </button>
                  );
                })}
              </div>
              {errores.interes && (
                <p role="alert" className="mt-3 text-sm font-medium text-rose-600">
                  {errores.interes}
                </p>
              )}
              {v.interes === OTRO && (
                <div className="mt-4">
                  <Campo id="cot-otro" label="¿Qué necesitas cotizar?" error={errores.otro}>
                    <input id="cot-otro" maxLength={120} value={v.otro} onChange={(e) => set('otro', e.target.value)} aria-invalid={!!errores.otro} className={input} placeholder="Ej. Cableado estructurado para una oficina" />
                  </Campo>
                </div>
              )}
            </div>
          )}

          {paso === 1 && (
            <div className="mt-6 space-y-5">
              <div role="radiogroup" aria-label="Tipo de persona" className="grid grid-cols-2 gap-3">
                {(
                  [
                    ['NATURAL', 'Persona natural', 'Con DNI', User],
                    ['JURIDICA', 'Persona jurídica', 'Con RUC', Building2],
                  ] as const
                ).map(([val, titulo, sub, Icon]) => {
                  const activo = v.tipoPersona === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      role="radio"
                      aria-checked={activo}
                      onClick={() => {
                        if (v.tipoPersona !== val) setV((p) => ({ ...p, tipoPersona: val, nroDocumento: '' }));
                        setErrores({});
                      }}
                      className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                        activo ? 'border-brand-dark bg-brand-dark/[0.06] shadow-lg shadow-brand-dark/10' : 'border-ink/10 bg-white hover:border-brand-dark/40'
                      }`}
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${activo ? 'bg-brand-dark text-white' : 'bg-ink/5 text-ink/50'}`}>
                        <Icon className="h-5 w-5" strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-ink">{titulo}</span>
                        <span className="block text-xs text-ink/50">{sub}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <Campo id="cot-doc" label={juridica ? 'RUC' : 'DNI'} error={errores.nroDocumento}>
                <input
                  id="cot-doc"
                  inputMode="numeric"
                  autoComplete="off"
                  value={v.nroDocumento}
                  onChange={(e) => set('nroDocumento', soloDigitos(e.target.value, juridica ? 11 : 8))}
                  aria-invalid={!!errores.nroDocumento}
                  aria-describedby={errores.nroDocumento ? 'cot-doc-err' : undefined}
                  className={`${input} font-mono tracking-wider`}
                  placeholder={juridica ? '20123456789' : '12345678'}
                />
              </Campo>

              <div className="grid gap-5 sm:grid-cols-2">
                <Campo id="cot-nombres" label="Nombres" error={errores.nombres}>
                  <input id="cot-nombres" autoComplete="given-name" maxLength={80} value={v.nombres} onChange={(e) => set('nombres', e.target.value)} aria-invalid={!!errores.nombres} className={input} placeholder="Tus nombres" />
                </Campo>
                <Campo id="cot-apellidos" label="Apellidos" error={errores.apellidos}>
                  <input id="cot-apellidos" autoComplete="family-name" maxLength={80} value={v.apellidos} onChange={(e) => set('apellidos', e.target.value)} aria-invalid={!!errores.apellidos} className={input} placeholder="Tus apellidos" />
                </Campo>
              </div>

              <Campo id="cot-empresa" label={juridica ? 'Empresa' : 'Empresa (opcional)'} error={errores.empresa}>
                <input id="cot-empresa" autoComplete="organization" maxLength={120} value={v.empresa} onChange={(e) => set('empresa', e.target.value)} aria-invalid={!!errores.empresa} className={input} placeholder="Razón social o nombre comercial" />
              </Campo>
            </div>
          )}

          {paso === 2 && (
            <div className="mt-6 space-y-5">
              <Campo id="cot-email" label="Correo electrónico" error={errores.email}>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 mt-[3px] h-5 w-5 -translate-y-1/2 text-ink/35" strokeWidth={1.8} />
                  <input id="cot-email" type="email" inputMode="email" autoComplete="email" maxLength={120} value={v.email} onChange={(e) => set('email', e.target.value)} aria-invalid={!!errores.email} className={`${input} pl-12`} placeholder="correo@empresa.com" />
                </div>
              </Campo>
              <Campo id="cot-celular" label="Celular / WhatsApp" error={errores.celular}>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 mt-[3px] h-5 w-5 -translate-y-1/2 text-ink/35" strokeWidth={1.8} />
                  <input id="cot-celular" type="tel" inputMode="tel" autoComplete="tel" maxLength={16} value={v.celular} onChange={(e) => set('celular', e.target.value)} aria-invalid={!!errores.celular} className={`${input} pl-12`} placeholder="987 654 321" />
                </div>
              </Campo>

              <dl className="rounded-2xl bg-paper p-4 text-sm">
                <div className="flex justify-between gap-4 py-1">
                  <dt className="text-ink/50">Cotización de</dt>
                  <dd className="text-right font-semibold text-ink">{v.interes === OTRO ? v.otro : v.interes}</dd>
                </div>
                <div className="flex justify-between gap-4 py-1">
                  <dt className="text-ink/50">Solicitante</dt>
                  <dd className="text-right font-semibold text-ink">
                    {v.nombres} {v.apellidos}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-1">
                  <dt className="text-ink/50">{juridica ? 'RUC' : 'DNI'}</dt>
                  <dd className="text-right font-mono font-semibold text-ink">{v.nroDocumento}</dd>
                </div>
              </dl>
              <p className="text-xs text-ink/45">Usaremos tus datos solo para responder a tu solicitud de cotización.</p>
            </div>
          )}
        </div>

        {errorGeneral && (
          <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {errorGeneral}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          {paso > 0 ? (
            <button
              type="button"
              onClick={() => {
                setErrores({});
                setPaso(paso - 1);
              }}
              className="inline-flex h-12 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
              Atrás
            </button>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={enviando}
            className="inline-flex h-12 min-w-40 items-center justify-center gap-2 rounded-xl bg-brand-dark px-7 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-brand-dark/25 transition-colors hover:bg-brand-primary disabled:opacity-60"
          >
            {enviando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
              </>
            ) : ultimo ? (
              <>
                Solicitar cotización <Send className="h-4 w-4" strokeWidth={2.2} />
              </>
            ) : (
              <>
                Continuar <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
