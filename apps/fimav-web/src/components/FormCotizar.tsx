'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, MessageCircle } from 'lucide-react';
import { categorias } from '@/lib/categorias';
import { contacto, waUrl } from '@/lib/contacto';

type Tipo = 'NATURAL' | 'JURIDICA';
const limpio = (t: string) => t.replace(/[<>]/g, '');
const campo = 'mt-1 block min-h-11 w-full rounded-lg border border-carbon/40 bg-white px-4 py-2.5 text-base text-tinta';
const OTRO = 'Otro';

export default function FormCotizar() {
  const cat = useSearchParams().get('categoria');
  const inicial = categorias.find((c) => c.slug === cat)?.nombre ?? categorias[0].nombre;
  const [f, setF] = useState({ tipo: 'JURIDICA' as Tipo, nombres: '', apellidos: '', doc: '', empresa: '', email: '', celular: '', interes: inicial, mensaje: '', website: '' });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<null | { guardado: boolean; texto: string }>(null);
  const [errorApi, setErrorApi] = useState('');

  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));
  const juridica = f.tipo === 'JURIDICA';

  const validar = () => {
    const e: Record<string, string> = {};
    const celular = f.celular.replace(/[\s()-]/g, '').replace(/^\+?51(?=9\d{8}$)/, '');
    if (f.nombres.trim().length < 2) e.nombres = 'Ingresa tus nombres (mínimo 2 letras).';
    if (f.apellidos.trim().length < 2) e.apellidos = 'Ingresa tus apellidos (mínimo 2 letras).';
    if (!new RegExp(juridica ? '^\\d{11}$' : '^\\d{8}$').test(f.doc)) e.doc = juridica ? 'El RUC tiene 11 dígitos.' : 'El DNI tiene 8 dígitos.';
    if (juridica && f.empresa.trim().length < 2) e.empresa = 'Indica el nombre de la empresa.';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Ingresa un correo válido.';
    if (!/^9\d{8}$/.test(celular)) e.celular = 'Ingresa un celular de 9 dígitos que empiece con 9.';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const mensajeWa = () =>
    `Hola Fimav, solicito una cotización:\n\n*Interés:* ${f.interes}\n*Datos*\n${f.nombres} ${f.apellidos}${f.empresa ? ` — ${f.empresa}` : ''}\n${juridica ? 'RUC' : 'DNI'}: ${f.doc}\nCorreo: ${f.email}\nCelular: ${f.celular}${f.mensaje ? `\nMensaje: ${f.mensaje}` : ''}`;

  const enviar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErrorApi('');
    if (!validar()) return;
    setEnviando(true);
    const cuerpo = {
      nombres: limpio(f.nombres.trim()), apellidos: limpio(f.apellidos.trim()),
      tipoPersona: f.tipo, tipoDocumento: f.tipo === 'JURIDICA' ? 'RUC' : 'DNI', nroDocumento: f.doc,
      empresa: limpio(f.empresa.trim()) || undefined, email: f.email.trim(), celular: f.celular.trim(),
      interes: limpio(f.interes).slice(0, 120), mensaje: limpio(f.mensaje).slice(0, 1000) || undefined,
      origen: 'fimav-web/cotizar', website: f.website,
    };
    const fallo = { guardado: false, texto: `No pudimos registrar la solicitud. Escríbenos por WhatsApp o a ${contacto.ventas}` };
    try {
      const res = await fetch('/api/hub/cotizador', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
      if (res.ok) setResultado({ guardado: true, texto: 'Recibimos tu solicitud. Un asesor te contactará pronto.' });
      else if (res.status >= 500) setResultado(fallo);
      else {
        const j = await res.json().catch(() => ({}));
        setErrorApi(Array.isArray(j.message) ? j.message.join(' ') : j.message ?? 'No pudimos enviar la solicitud.');
      }
    } catch {
      setResultado(fallo);
    } finally {
      setEnviando(false);
    }
  };

  const err = (k: string) => (errores[k] ? <p id={`e-${k}`} role="alert" className="mt-1 text-sm text-rojo-hondo">{errores[k]}</p> : null);
  const aria = (k: string) => ({ 'aria-invalid': errores[k] ? true : undefined, 'aria-describedby': errores[k] ? `e-${k}` : undefined });

  if (resultado)
    return (
      <div role="status" className="rounded-2xl bg-gris p-6 sm:p-8">
        <h2 className="text-2xl font-medium text-carbon">{resultado.guardado ? 'Solicitud enviada' : 'Casi listo'}</h2>
        <p className="mt-3 leading-relaxed text-carbon">{resultado.texto}</p>
        {!resultado.guardado && (
          <a href={waUrl(mensajeWa())} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-boton px-6 py-3 text-white hover:bg-rojo-hondo">
            <MessageCircle aria-hidden="true" size={18} /> Enviar por WhatsApp
          </a>
        )}
      </div>
    );

  return (
    <form onSubmit={enviar} noValidate className="grid gap-4 rounded-2xl bg-gris p-5 sm:grid-cols-2 sm:p-8">
      <fieldset className="sm:col-span-2">
        <legend className="text-sm font-medium text-carbon">Tipo de persona</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {([['JURIDICA', 'Empresa o entidad'], ['NATURAL', 'Persona natural']] as const).map(([v, t]) => (
            <label key={v} className="flex min-h-11 items-center gap-2 rounded-lg border border-carbon/40 bg-white px-4 text-carbon">
              <input type="radio" name="tipo" value={v} checked={f.tipo === v} onChange={() => setF((x) => ({ ...x, tipo: v, doc: '' }))} className="h-4 w-4 accent-boton" /> {t}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="nombres" className="text-sm font-medium text-carbon">Nombres</label>
        <input id="nombres" value={f.nombres} onChange={(e) => set('nombres', e.target.value)} autoComplete="given-name" maxLength={80} className={campo} {...aria('nombres')} />
        {err('nombres')}
      </div>
      <div>
        <label htmlFor="apellidos" className="text-sm font-medium text-carbon">Apellidos</label>
        <input id="apellidos" value={f.apellidos} onChange={(e) => set('apellidos', e.target.value)} autoComplete="family-name" maxLength={80} className={campo} {...aria('apellidos')} />
        {err('apellidos')}
      </div>
      <div>
        <label htmlFor="doc" className="text-sm font-medium text-carbon">{juridica ? 'RUC (11 dígitos)' : 'DNI (8 dígitos)'}</label>
        <input id="doc" value={f.doc} onChange={(e) => set('doc', e.target.value.replace(/\D/g, ''))} inputMode="numeric" maxLength={juridica ? 11 : 8} className={campo} {...aria('doc')} />
        {err('doc')}
      </div>
      {juridica && (
        <div>
          <label htmlFor="empresa" className="text-sm font-medium text-carbon">Empresa o entidad</label>
          <input id="empresa" value={f.empresa} onChange={(e) => set('empresa', e.target.value)} autoComplete="organization" maxLength={120} className={campo} {...aria('empresa')} />
          {err('empresa')}
        </div>
      )}
      <div>
        <label htmlFor="email" className="text-sm font-medium text-carbon">Correo</label>
        <input id="email" type="email" value={f.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" className={campo} {...aria('email')} />
        {err('email')}
      </div>
      <div>
        <label htmlFor="celular" className="text-sm font-medium text-carbon">Celular</label>
        <input id="celular" type="tel" value={f.celular} onChange={(e) => set('celular', e.target.value)} autoComplete="tel" placeholder="9XXXXXXXX" className={campo} {...aria('celular')} />
        {err('celular')}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="interes" className="text-sm font-medium text-carbon">Categoría de interés</label>
        <select id="interes" value={f.interes} onChange={(e) => set('interes', e.target.value)} className={campo}>
          {categorias.map((c) => <option key={c.slug}>{c.nombre}</option>)}
          <option>{OTRO}</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="mensaje" className="text-sm font-medium text-carbon">Mensaje (opcional)</label>
        <textarea id="mensaje" value={f.mensaje} onChange={(e) => set('mensaje', e.target.value)} rows={4} maxLength={1000} className={campo} />
      </div>
      <input name="website" value={f.website} onChange={(e) => set('website', e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="sm:col-span-2">
        {errorApi && <p role="alert" className="mb-3 text-sm text-rojo-hondo">{errorApi}</p>}
        <button disabled={enviando} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-boton px-8 py-3 text-white hover:bg-rojo-hondo disabled:opacity-60 sm:w-auto">
          {enviando && <Loader2 aria-hidden="true" size={18} className="animate-spin" />} Solicitar cotización
        </button>
      </div>
    </form>
  );
}
