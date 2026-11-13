'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Loader2, Lock, RotateCcw, Search } from 'lucide-react';
import BotonHex from '@/components/hex/BotonHex';
import { AbanicoBbva, TarjetaBbva } from './Tarjetas';

type Oferta = { id: number; tarjeta: string; codigo: string; linea: number; moneda: string; tea: number; imagen: string | null };
type Resultado = { consultaId: string | null; nombre: string | null; ofertas: Oferta[]; enlace: string };

const OPERADORES = [
  { v: 'M', label: 'Movistar' },
  { v: 'C', label: 'Claro' },
  { v: 'B', label: 'Bitel' },
  { v: 'E', label: 'Entel' },
] as const;

const campo = 'mt-1 block min-h-11 w-full rounded-lg border border-carbon/60 bg-white px-4 py-2.5 text-base text-tinta';
const VACIO = { dni: '', nacimiento: '', celular: '', operador: '', email: '', aceptaDatos: false };
const ORDEN = ['dni', 'nacimiento', 'celular', 'operador', 'email', 'aceptaDatos'];

const dinero = (n: number, moneda: string) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: moneda, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

/* Formulario de consulta (campos que pide BBVA Cards offer) y lista de tarjetas disponibles. */
export default function FormBbva() {
  const [v, setV] = useState(VACIO);
  const [trampa, setTrampa] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorApi, setErrorApi] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [res, setRes] = useState<Resultado | null>(null);
  const [eligiendo, setEligiendo] = useState<number | null>(null);
  const set = <K extends keyof typeof v>(k: K, val: (typeof v)[K]) => setV((p) => ({ ...p, [k]: val }));

  const resultadoRef = useRef<HTMLDivElement>(null);
  const errorApiRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (res) resultadoRef.current?.focus(); }, [res]);
  useEffect(() => { if (errorApi) errorApiRef.current?.focus(); }, [errorApi]);

  const hoy = new Date();
  const maxNac = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate()).toISOString().slice(0, 10);
  const celularLimpio = v.celular.replace(/\D/g, '').replace(/^51(?=9\d{8}$)/, '');

  function validar() {
    const e: Record<string, string> = {};
    if (!/^\d{8}$/.test(v.dni)) e.dni = 'El DNI debe tener 8 dígitos.';
    if (!v.nacimiento) e.nacimiento = 'Ingresa tu fecha de nacimiento.';
    if (!/^9\d{8}$/.test(celularLimpio)) e.celular = 'Ingresa un celular válido de 9 dígitos.';
    if (!v.operador) e.operador = 'Elige tu operador de celular.';
    if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) e.email = 'Ingresa un correo válido.';
    if (!v.aceptaDatos) e.aceptaDatos = 'Debes aceptar el tratamiento de tus datos personales.';
    setErrores(e);
    const primero = ORDEN.find((k) => e[k]);
    if (primero) document.getElementById(`bb-${primero}`)?.focus();
    return !primero;
  }

  async function consultar(ev: FormEvent) {
    ev.preventDefault();
    setErrorApi('');
    if (!validar()) return;
    setEnviando(true);
    try {
      const r = await fetch('/api/bbva/ofertas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, celular: celularLimpio, email: v.email.trim(), website: trampa || undefined }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'No pudimos hacer la consulta.');
      setRes(j as Resultado);
    } catch (err) {
      setErrorApi(err instanceof Error ? err.message : 'No pudimos hacer la consulta.');
    } finally {
      setEnviando(false);
    }
  }

  function nuevaConsulta() {
    setV(VACIO);
    setTrampa('');
    setErrores({});
    setErrorApi('');
    setRes(null);
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

  const err = (k: string) => (errores[k] ? <p id={`e-${k}`} role="alert" className="mt-1 text-sm text-rojo-hondo">{errores[k]}</p> : null);
  const aria = (k: string) => ({ 'aria-invalid': errores[k] ? true : undefined, 'aria-describedby': errores[k] ? `e-${k}` : undefined });

  if (res) {
    return (
      <div ref={resultadoRef} tabIndex={-1} role="status" className="rounded-2xl bg-gris p-5 outline-none sm:p-8">
        {res.ofertas.length ? (
          <>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-rojo-hondo">Tus ofertas preaprobadas</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold uppercase leading-tight tracking-wide text-carbon sm:text-3xl">
              {res.nombre ? `${res.nombre}, ` : ''}tienes {res.ofertas.length === 1 ? 'una tarjeta disponible' : `${res.ofertas.length} tarjetas disponibles`}
            </h2>
            <p className="mt-2 text-carbon/80">Elige la que prefieras: la solicitud continúa en la web o app de BBVA.</p>
            <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-5">
              {res.ofertas.map((o) => (
                <article key={o.id} className="flex flex-col rounded-2xl bg-white p-5">
                  {o.imagen ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={o.imagen} alt={o.tarjeta} className="mx-auto aspect-[188/304] w-32 object-contain drop-shadow-[0_18px_30px_rgba(0,19,145,0.35)]" />
                  ) : (
                    <TarjetaBbva className="mx-auto w-32" />
                  )}
                  <h3 className="titulo-menor mt-5 text-xl text-carbon">{o.tarjeta}</h3>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-gris p-3">
                      <dt className="text-carbon/80">Línea de crédito</dt>
                      <dd className="whitespace-nowrap text-base font-bold text-carbon">{dinero(o.linea, o.moneda)}</dd>
                    </div>
                    <div className="rounded-xl bg-gris p-3">
                      <dt className="text-carbon/80">TEA referencial</dt>
                      <dd className="whitespace-nowrap text-base font-bold text-carbon">{o.tea}%</dd>
                    </div>
                  </dl>
                  <BotonHex onClick={() => solicitar(o)} disabled={eligiendo !== null} cargando={eligiendo === o.id} icono={eligiendo === o.id ? Loader2 : CreditCard} className="mt-6 w-full">
                    Solicitar esta tarjeta
                  </BotonHex>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center">
            <AbanicoBbva className="mx-auto w-56" />
            <h2 className="mt-6 font-display text-2xl font-extrabold uppercase tracking-wide text-carbon">Por ahora no tienes ofertas preaprobadas</h2>
            <p className="mx-auto mt-2 max-w-md text-carbon/80">Tu perfil puede cambiar con el tiempo. Puedes consultar con otros datos o volver al inicio.</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <BotonHex onClick={nuevaConsulta} icono={RotateCcw}>Consultar con otros datos</BotonHex>
              <BotonHex href="/" variante="contorno" icono={ArrowLeft}>Volver al inicio</BotonHex>
            </div>
          </div>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {res.ofertas.length > 0 && (
            <button type="button" onClick={nuevaConsulta} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-carbon underline-offset-2 hover:text-rojo-hondo hover:underline">
              <RotateCcw aria-hidden="true" size={16} /> Hacer otra consulta
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={consultar} noValidate className="relative grid gap-4 rounded-2xl bg-gris p-5 sm:grid-cols-2 sm:p-8">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trampa} onChange={(e) => setTrampa(e.target.value)} className="hidden" />
      <div className="sm:col-span-2">
        <h2 className="titulo-menor text-2xl text-carbon">Consulta tus tarjetas disponibles</h2>
        <p className="mt-1 text-carbon/80">BBVA evalúa tu perfil y te muestra las tarjetas que puedes solicitar. * obligatorio</p>
      </div>
      <div>
        <label htmlFor="bb-dni" className="text-sm font-medium text-carbon">DNI <span aria-hidden="true">*</span></label>
        <input id="bb-dni" inputMode="numeric" autoComplete="off" maxLength={8} value={v.dni} onChange={(e) => set('dni', e.target.value.replace(/\D/g, ''))} placeholder="12345678" className={campo} aria-required="true" {...aria('dni')} />
        {err('dni')}
      </div>
      <div>
        <label htmlFor="bb-nacimiento" className="text-sm font-medium text-carbon">Fecha de nacimiento <span aria-hidden="true">*</span></label>
        <input id="bb-nacimiento" type="date" max={maxNac} min="1920-01-01" value={v.nacimiento} onChange={(e) => set('nacimiento', e.target.value)} className={campo} aria-required="true" {...aria('nacimiento')} />
        {err('nacimiento')}
      </div>
      <div>
        <label htmlFor="bb-celular" className="text-sm font-medium text-carbon">Celular <span aria-hidden="true">*</span></label>
        <input id="bb-celular" type="tel" inputMode="numeric" autoComplete="tel" maxLength={12} value={v.celular} onChange={(e) => set('celular', e.target.value)} placeholder="9XXXXXXXX" className={campo} aria-required="true" {...aria('celular')} />
        {err('celular')}
      </div>
      <div>
        <label htmlFor="bb-operador" className="text-sm font-medium text-carbon">Operador <span aria-hidden="true">*</span></label>
        <select id="bb-operador" value={v.operador} onChange={(e) => set('operador', e.target.value)} className={campo} aria-required="true" {...aria('operador')}>
          <option value="" disabled>Elige tu operador</option>
          {OPERADORES.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
        </select>
        {err('operador')}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="bb-email" className="text-sm font-medium text-carbon">Correo electrónico <span aria-hidden="true">*</span></label>
        <input id="bb-email" type="email" autoComplete="email" maxLength={120} value={v.email} onChange={(e) => set('email', e.target.value)} placeholder="tucorreo@gmail.com" className={campo} aria-required="true" {...aria('email')} />
        {err('email')}
      </div>
      <div className="sm:col-span-2">
        <div className="flex min-h-11 items-start gap-3 text-sm text-carbon">
          <input id="bb-aceptaDatos" type="checkbox" checked={v.aceptaDatos} onChange={(e) => set('aceptaDatos', e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-boton" aria-required="true" {...aria('aceptaDatos')} />
          <label htmlFor="bb-aceptaDatos">
            Autorizo a Fimav Perú y a BBVA Perú a tratar mis datos personales para consultar y ofrecerme tarjetas de crédito, conforme a la Ley N.° 29733 de Protección de Datos Personales.{' '}
            <Link href="/legal/privacidad" className="font-medium text-rojo-hondo underline underline-offset-2">Política de privacidad</Link> <span aria-hidden="true">*</span>
          </label>
        </div>
        {err('aceptaDatos')}
      </div>
      <div className="sm:col-span-2">
        {errorApi && <p ref={errorApiRef} tabIndex={-1} role="alert" className="mb-3 text-sm text-rojo-hondo">{errorApi}</p>}
        <BotonHex type="submit" disabled={enviando} size="lg" icono={enviando ? Loader2 : Search} cargando={enviando} className="w-full sm:w-auto">
          {enviando ? 'Consultando…' : 'Ver mis tarjetas'}
        </BotonHex>
        <p className="mt-4 flex items-start gap-2 text-sm text-carbon/80">
          <Lock aria-hidden="true" size={16} className="mt-0.5 shrink-0" /> Tus datos viajan cifrados y la consulta no tiene costo.
        </p>
      </div>
    </form>
  );
}
