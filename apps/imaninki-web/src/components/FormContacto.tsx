'use client';
import { useEffect, useRef, useState } from 'react';
import { Building2, Hash, IdCard, Loader2, Mail, MessageCircle, Send, Smartphone, User } from 'lucide-react';
import { contacto, waUrl } from '@/lib/contenido';

const limpio = (t: string) => t.replace(/[<>]/g, '');
const campo = 'block min-h-12 w-full rounded-md border border-carbon/20 bg-white px-4 py-3 text-base text-tinta transition duration-300 placeholder:text-carbon/70 hover:border-rojo/40 focus:border-rojo focus:shadow-[0_0_0_4px_rgb(212_24_42/0.12)] focus:outline-none';
const MAX_MENSAJE = 3000;
const VACIO = { nombre: '', email: '', celular: '', empresa: '', ruc: '', dni: '', mensaje: '', acepto: false, website: '' };
const ORDEN = ['empresa', 'ruc', 'nombre', 'dni', 'email', 'celular', 'mensaje', 'acepto'];
type Tipo = 'persona' | 'empresa';

/** Campo con ícono a la izquierda como identificador. */
const ConIcono = ({ icono: Icono, children }: { icono: typeof User; children: React.ReactNode }) => (
  <div className="group/campo relative mt-1.5">
    <Icono aria-hidden="true" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-carbon/40 transition group-focus-within/campo:text-rojo" />
    {children}
  </div>
);

/** Formulario de contacto: envía a la API del HUB por /api/hub/contacto; si no responde, ofrece WhatsApp y correo. */
export default function FormContacto() {
  const [tipo, setTipo] = useState<Tipo>('persona');
  const [f, setF] = useState(VACIO);
  const esEmpresa = tipo === 'empresa';
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<null | 'ok' | 'fallo'>(null);
  const [errorApi, setErrorApi] = useState('');
  const resultadoRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (resultado) resultadoRef.current?.focus(); }, [resultado]);

  const set = (k: keyof typeof f, v: string | boolean) => setF((x) => ({ ...x, [k]: v }));

  const validar = () => {
    const e: Record<string, string> = {};
    const celular = f.celular.replace(/[\s()-]/g, '').replace(/^\+?51(?=9\d{8}$)/, '');
    if (esEmpresa && limpio(f.empresa).trim().length < 2) e.empresa = 'Ingresa la razón social o el nombre de la entidad.';
    if (esEmpresa && f.ruc.trim() && !/^(10|15|17|20)\d{9}$/.test(f.ruc.trim())) e.ruc = 'El RUC tiene 11 dígitos (ej. 20123456789), o déjalo en blanco.';
    if (!esEmpresa && limpio(f.nombre).trim().length < 2) e.nombre = 'Ingresa tus nombres y apellidos.';
    if (!esEmpresa && f.dni.trim() && !/^\d{8}$/.test(f.dni.trim())) e.dni = 'El DNI tiene 8 dígitos (ej. 45678912), o déjalo en blanco.';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Ingresa un correo válido.';
    if (celular && !/^9\d{8}$/.test(celular)) e.celular = 'Ingresa un celular de 9 dígitos que empiece con 9, o déjalo en blanco.';
    if (limpio(f.mensaje).trim().length < 2) e.mensaje = 'Escribe tu mensaje.';
    if (!f.acepto) e.acepto = 'Debes aceptar el uso de tus datos para responderte.';
    setErrores(e);
    const primero = ORDEN.find((k) => e[k]);
    if (primero) document.getElementById(primero)?.focus();
    return !primero;
  };

  const enviar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErrorApi('');
    if (!validar()) return;
    setEnviando(true);
    // La API solo tiene nombre y empresa: el DNI viaja junto al nombre y el RUC junto a la razón social.
    const razon = `${limpio(f.empresa.trim())}${f.ruc.trim() ? ` (RUC ${f.ruc.trim()})` : ''}`.slice(0, 120);
    const cuerpo = {
      nombre: esEmpresa ? limpio(f.empresa.trim()) : `${limpio(f.nombre.trim())}${f.dni.trim() ? ` (DNI ${f.dni.trim()})` : ''}`.slice(0, 120), email: f.email.trim(), celular: f.celular.trim() || undefined,
      empresa: esEmpresa ? razon : undefined, mensaje: limpio(f.mensaje).trim().slice(0, MAX_MENSAJE), website: f.website,
    };
    try {
      const res = await fetch('/api/hub/contacto', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
      if (res.ok) { setResultado('ok'); setF(VACIO); setErrores({}); }
      else if (res.status >= 500) setResultado('fallo');
      else {
        const j = await res.json().catch(() => ({}));
        setErrorApi(Array.isArray(j.message) ? j.message.join(' ') : j.message ?? 'No pudimos enviar el mensaje.');
      }
    } catch {
      setResultado('fallo');
    } finally {
      setEnviando(false);
    }
  };

  const err = (k: string) => (errores[k] ? <p id={`e-${k}`} role="alert" className="mt-1 text-sm text-red-700">{errores[k]}</p> : null);
  const aria = (k: string) => ({ 'aria-invalid': errores[k] ? true : undefined, 'aria-describedby': errores[k] ? `e-${k}` : undefined });
  const boton = 'boton inline-flex h-12 items-center justify-center gap-2 rounded-md px-6 font-semibold';

  if (resultado)
    return (
      <div ref={resultadoRef} tabIndex={-1} role="status" className="entrada rounded-md bg-niebla p-8 outline-none">
        {resultado === 'ok' ? (
          <>
            <h3 className="text-2xl font-extrabold">¡Mensaje enviado!</h3>
            <p className="mt-3 leading-relaxed">Recibimos tu mensaje. Un asesor de Imaninki te responderá pronto.</p>
            <button type="button" onClick={() => setResultado(null)} className={`${boton} mt-6 bg-rojo/10 text-rojo-hondo hover:bg-rojo/20`}>Enviar otro mensaje</button>
          </>
        ) : (
          <>
            <h3 className="text-2xl font-extrabold">No pudimos enviarlo</h3>
            <p className="mt-3 leading-relaxed">Tu mensaje no se registró. Escríbenos por WhatsApp o a {contacto.correo}.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={waUrl(`Hola Imaninki, soy ${limpio(esEmpresa ? f.empresa : f.nombre) || 'un cliente'}. ${limpio(f.mensaje)}`.slice(0, 1500))} target="_blank" rel="noopener noreferrer" className={`${boton} bg-rojo text-white hover:bg-rojo-hondo`}><MessageCircle aria-hidden="true" size={18} />WhatsApp</a>
              <a href={`mailto:${contacto.correo}`} className={`${boton} bg-rojo/10 text-rojo-hondo hover:bg-rojo/20`}><Mail aria-hidden="true" size={18} />Correo</a>
              <button type="button" onClick={() => setResultado(null)} className={`${boton} text-carbon hover:bg-white`}>Volver</button>
            </div>
          </>
        )}
      </div>
    );

  return (
    <form id="contacto-form" onSubmit={enviar} noValidate className="grid gap-5 rounded-md bg-niebla p-6 sm:grid-cols-2 sm:p-8">
      <fieldset className="sm:col-span-2">
        <legend className="text-sm font-semibold text-tinta">¿Quién nos escribe?</legend>
        <div className="mt-2 grid grid-cols-2 gap-1 rounded-md bg-white p-1 shadow-sm shadow-rojo-hondo/5 ring-1 ring-carbon/10 sm:inline-grid">
          {([['persona', 'Persona natural', User], ['empresa', 'Empresa o entidad', Building2]] as const).map(([valor, texto, Icono]) => (
            <label key={valor} className="relative flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-carbon transition duration-300 hover:text-rojo-hondo has-[:checked]:bg-rojo has-[:checked]:text-white has-[:checked]:shadow-md has-[:checked]:shadow-rojo-hondo/25 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-rojo has-[:focus-visible]:ring-offset-2">
              <input type="radio" name="tipo" value={valor} checked={tipo === valor} onChange={() => { setTipo(valor); setErrores({}); }} className="sr-only" />
              <Icono aria-hidden="true" size={17} />{texto}
            </label>
          ))}
        </div>
      </fieldset>
      {esEmpresa ? (
        <>
          <div>
            <label htmlFor="empresa" className="text-sm font-semibold text-tinta">Razón social o entidad <span aria-hidden="true" className="text-rojo">*</span></label>
            <ConIcono icono={Building2}><input id="empresa" name="empresa" value={f.empresa} onChange={(e) => set('empresa', e.target.value)} autoComplete="organization" maxLength={100} placeholder="Ej. Constructora Andina S.A.C." className={`${campo} pl-11`} aria-required="true" {...aria('empresa')} /></ConIcono>
            {err('empresa')}
          </div>
          <div>
            <label htmlFor="ruc" className="text-sm font-semibold text-tinta">RUC <span className="font-normal text-carbon/70">(opcional)</span></label>
            <ConIcono icono={Hash}><input id="ruc" name="ruc" value={f.ruc} onChange={(e) => set('ruc', e.target.value.replace(/\D/g, ''))} inputMode="numeric" maxLength={11} placeholder="Ej. 20123456789" className={`${campo} pl-11`} {...aria('ruc')} /></ConIcono>
            {err('ruc')}
          </div>
        </>
      ) : (
        <>
          <div>
            <label htmlFor="nombre" className="text-sm font-semibold text-tinta">Nombres y apellidos <span aria-hidden="true" className="text-rojo">*</span></label>
            <ConIcono icono={User}><input id="nombre" name="nombre" value={f.nombre} onChange={(e) => set('nombre', e.target.value)} autoComplete="name" maxLength={100} placeholder="Ej. Juan Pérez Quispe" className={`${campo} pl-11`} aria-required="true" {...aria('nombre')} /></ConIcono>
            {err('nombre')}
          </div>
          <div>
            <label htmlFor="dni" className="text-sm font-semibold text-tinta">DNI <span className="font-normal text-carbon/70">(opcional)</span></label>
            <ConIcono icono={IdCard}><input id="dni" name="dni" value={f.dni} onChange={(e) => set('dni', e.target.value.replace(/\D/g, ''))} inputMode="numeric" maxLength={8} placeholder="Ej. 45678912" className={`${campo} pl-11`} {...aria('dni')} /></ConIcono>
            {err('dni')}
          </div>
        </>
      )}
      <div>
        <label htmlFor="email" className="text-sm font-semibold text-tinta">{esEmpresa ? 'Correo corporativo' : 'Correo electrónico'} <span aria-hidden="true" className="text-rojo">*</span></label>
        <ConIcono icono={Mail}><input id="email" name="email" type="email" value={f.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" maxLength={120} placeholder={esEmpresa ? 'Ej. compras@empresa.com.pe' : 'Ej. juan.perez@gmail.com'} className={`${campo} pl-11`} aria-required="true" {...aria('email')} /></ConIcono>
        {err('email')}
      </div>
      <div>
        <label htmlFor="celular" className="text-sm font-semibold text-tinta">Celular <span className="font-normal text-carbon/70">(opcional)</span></label>
        <ConIcono icono={Smartphone}><input id="celular" name="celular" type="tel" value={f.celular} onChange={(e) => set('celular', e.target.value)} autoComplete="tel" maxLength={20} placeholder="Ej. 987 654 321" className={`${campo} pl-11`} {...aria('celular')} /></ConIcono>
        {err('celular')}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="mensaje" className="text-sm font-semibold text-tinta">Mensaje <span aria-hidden="true" className="text-rojo">*</span></label>
        <textarea id="mensaje" name="mensaje" value={f.mensaje} onChange={(e) => set('mensaje', e.target.value)} rows={5} maxLength={MAX_MENSAJE} placeholder={esEmpresa ? 'Ej. Necesitamos 40 galones de pintura de tráfico para señalizar 2 km de vía en Arequipa.' : 'Ej. Quisiera cotizar 2 galones de látex mate color blanco para mi casa.'} className={`${campo} mt-1.5`} aria-required="true" aria-describedby={errores.mensaje ? 'e-mensaje' : 'cont-mensaje'} aria-invalid={errores.mensaje ? true : undefined} />
        <p id="cont-mensaje" className="mt-1 text-right text-xs text-carbon/70">{f.mensaje.length}/{MAX_MENSAJE}</p>
        {err('mensaje')}
      </div>
      <input name="website" value={f.website} onChange={(e) => set('website', e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="sm:col-span-2">
        <label htmlFor="acepto" className="flex min-h-11 cursor-pointer items-start gap-3 text-sm text-carbon">
          <input id="acepto" name="acepto" type="checkbox" checked={f.acepto} onChange={(e) => set('acepto', e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-rojo" aria-required="true" {...aria('acepto')} />
          Acepto que Imaninki use mis datos para responder esta consulta. <span aria-hidden="true" className="text-rojo">*</span>
        </label>
        {err('acepto')}
      </div>
      <div className="sm:col-span-2">
        {errorApi && <p role="alert" className="mb-3 text-sm text-red-700">{errorApi}</p>}
        <button type="submit" disabled={enviando} className={`${boton} w-full bg-rojo text-white shadow-lg shadow-rojo-hondo/30 hover:bg-rojo-hondo disabled:opacity-70 sm:w-auto`}>
          {enviando ? <Loader2 aria-hidden="true" size={18} className="animate-spin" /> : <Send aria-hidden="true" size={18} className="icono-avanza" />}
          {enviando ? 'Enviando…' : 'Enviar mensaje'}
        </button>
      </div>
    </form>
  );
}
