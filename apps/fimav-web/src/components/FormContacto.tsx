'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Loader2, Mail, MessageCircle, Send } from 'lucide-react';
import { contacto, waUrl } from '@/lib/contacto';
import BotonHex from './hex/BotonHex';

const limpio = (t: string) => t.replace(/[<>]/g, '');
const campo = 'mt-1 block min-h-11 w-full rounded-lg border border-carbon/60 bg-white px-4 py-2.5 text-base text-tinta';
const MAX_MENSAJE = 3000;
const VACIO = { nombre: '', email: '', celular: '', empresa: '', mensaje: '', acepto: false, website: '' };
const ORDEN = ['nombre', 'email', 'celular', 'mensaje', 'acepto'];

export default function FormContacto() {
  const [f, setF] = useState(VACIO);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<null | 'ok' | 'fallo'>(null);
  const [errorApi, setErrorApi] = useState('');

  const resultadoRef = useRef<HTMLDivElement>(null);
  const errorApiRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (resultado) resultadoRef.current?.focus(); }, [resultado]);
  useEffect(() => { if (errorApi) errorApiRef.current?.focus(); }, [errorApi]);

  const set = (k: keyof typeof f, v: string | boolean) => setF((x) => ({ ...x, [k]: v }));

  const validar = () => {
    const e: Record<string, string> = {};
    const celular = f.celular.replace(/[\s()-]/g, '').replace(/^\+?51(?=9\d{8}$)/, '');
    if (limpio(f.nombre).trim().length < 2) e.nombre = 'Ingresa tus nombres (mínimo 2 letras).';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Ingresa un correo válido.';
    if (celular && !/^9\d{8}$/.test(celular)) e.celular = 'Ingresa un celular de 9 dígitos que empiece con 9, o déjalo en blanco.';
    if (limpio(f.mensaje).trim().length < 2) e.mensaje = 'Escribe tu mensaje.';
    if (!f.acepto) e.acepto = 'Debes aceptar el tratamiento de tus datos para enviar el mensaje.';
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
    const cuerpo = {
      nombre: limpio(f.nombre.trim()), email: f.email.trim(), celular: f.celular.trim() || undefined,
      empresa: limpio(f.empresa.trim()) || undefined, mensaje: limpio(f.mensaje).trim().slice(0, MAX_MENSAJE), website: f.website,
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

  const err = (k: string) => (errores[k] ? <p id={`e-${k}`} role="alert" className="mt-1 text-sm text-rojo-hondo">{errores[k]}</p> : null);
  const aria = (k: string) => ({ 'aria-invalid': errores[k] ? true : undefined, 'aria-describedby': errores[k] ? `e-${k}` : undefined });

  if (resultado)
    return (
      <div ref={resultadoRef} tabIndex={-1} role="status" className="rounded-2xl bg-gris p-6 outline-none sm:p-8">
        {resultado === 'ok' ? (
          <>
            <h3 className="titulo-menor text-2xl text-carbon">Mensaje enviado</h3>
            <p className="mt-3 leading-relaxed text-carbon">Recibimos tu mensaje. Un asesor te responderá pronto.</p>
            <BotonHex variante="contorno" onClick={() => setResultado(null)} className="mt-6">Enviar otro mensaje</BotonHex>
          </>
        ) : (
          <>
            <h3 className="titulo-menor text-2xl text-carbon">No pudimos enviarlo</h3>
            <p className="mt-3 leading-relaxed text-carbon">Tu mensaje no se registró. Escríbenos por WhatsApp o a {contacto.ventas} / {contacto.comercial}.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <BotonHex href={waUrl(`Hola Fimav, soy ${limpio(f.nombre) || 'un cliente'}. ${limpio(f.mensaje)}`.slice(0, 1500))} icono={MessageCircle}>Escribir por WhatsApp</BotonHex>
              <BotonHex href={`mailto:${contacto.ventas}`} icono={Mail} variante="contorno">Escribir por correo</BotonHex>
              <BotonHex variante="contorno" onClick={() => setResultado(null)}>Volver al formulario</BotonHex>
            </div>
          </>
        )}
      </div>
    );

  return (
    <form onSubmit={enviar} noValidate className="grid gap-4 rounded-2xl bg-gris p-5 sm:grid-cols-2 sm:p-8">
      <p className="text-sm text-carbon sm:col-span-2">* obligatorio</p>
      <div>
        <label htmlFor="nombre" className="text-sm font-medium text-carbon">Nombres <span aria-hidden="true">*</span></label>
        <input id="nombre" value={f.nombre} onChange={(e) => set('nombre', e.target.value)} autoComplete="name" maxLength={120} className={campo} aria-required="true" {...aria('nombre')} />
        {err('nombre')}
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-medium text-carbon">Correo <span aria-hidden="true">*</span></label>
        <input id="email" type="email" value={f.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" maxLength={120} className={campo} aria-required="true" {...aria('email')} />
        {err('email')}
      </div>
      <div>
        <label htmlFor="celular" className="text-sm font-medium text-carbon">Celular (opcional)</label>
        <input id="celular" type="tel" value={f.celular} onChange={(e) => set('celular', e.target.value)} autoComplete="tel" maxLength={20} placeholder="9XXXXXXXX" className={campo} {...aria('celular')} />
        {err('celular')}
      </div>
      <div>
        <label htmlFor="empresa" className="text-sm font-medium text-carbon">Empresa (opcional)</label>
        <input id="empresa" value={f.empresa} onChange={(e) => set('empresa', e.target.value)} autoComplete="organization" maxLength={120} className={campo} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="mensaje" className="text-sm font-medium text-carbon">Mensaje <span aria-hidden="true">*</span></label>
        <textarea id="mensaje" value={f.mensaje} onChange={(e) => set('mensaje', e.target.value)} rows={5} maxLength={MAX_MENSAJE} className={campo} aria-required="true" {...aria('mensaje')} />
        <p className="mt-1 text-right text-sm text-carbon">{f.mensaje.length}/{MAX_MENSAJE}</p>
        {err('mensaje')}
      </div>
      <input name="website" value={f.website} onChange={(e) => set('website', e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="sm:col-span-2">
        <div className="flex min-h-11 items-start gap-3 text-sm text-carbon">
          <input id="acepto" type="checkbox" checked={f.acepto} onChange={(e) => set('acepto', e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-boton" aria-required="true" {...aria('acepto')} />
          <label htmlFor="acepto">Acepto el tratamiento de mis datos personales según la <Link href="/legal/privacidad" className="font-medium text-rojo-hondo underline underline-offset-2">política de privacidad</Link>. <span aria-hidden="true">*</span></label>
        </div>
        {err('acepto')}
      </div>

      <div className="sm:col-span-2">
        {errorApi && <p ref={errorApiRef} tabIndex={-1} role="alert" className="mb-3 text-sm text-rojo-hondo">{errorApi}</p>}
        <BotonHex type="submit" disabled={enviando} size="lg" icono={enviando ? Loader2 : Send} cargando={enviando} className="w-full sm:w-auto">
          Enviar mensaje
        </BotonHex>
      </div>
    </form>
  );
}
