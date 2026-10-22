'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader2, Mail, MessageCircle, Printer, RotateCcw, Send } from 'lucide-react';
import { waUrl } from '@/lib/contacto';
import type { Proveedor } from '@/lib/proveedor';

type TipoDoc = 'DNI' | 'CE' | 'PASAPORTE' | 'RUC';
const limpio = (t: string) => t.replace(/[<>]/g, '');
const fechaLarga = (d: string | Date) => new Date(d).toLocaleDateString('es-PE', { timeZone: 'America/Lima', day: 'numeric', month: 'long', year: 'numeric' });

// Mismo aspecto de campos que el cotizador, con borde propio que cumple 3:1 en los tres temas.
const campo = 'mt-1 block min-h-11 w-full rounded-lg border border-[color:var(--c-borde)] bg-bg/60 px-4 py-2.5 text-base text-white transition focus:border-claro aria-invalid:border-[color:var(--c-error)]';
const opcion = 'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-[color:var(--c-borde)] px-4 py-2 text-sm text-slate-200 transition has-[:checked]:border-claro has-[:checked]:bg-cyan/10 has-[:checked]:text-white';
const etiqueta = 'text-sm font-medium text-slate-200';
const grupo = 'glass rounded-2xl p-5 sm:p-8';
const tituloGrupo = 'float-left mb-4 w-full font-display text-xl font-bold text-white';

// Mismas reglas que el servicio de la API (validarDocumento).
const REGLAS: Record<TipoDoc, [RegExp, string]> = {
  DNI: [/^\d{8}$/, 'El DNI tiene 8 dígitos.'],
  RUC: [/^\d{11}$/, 'El RUC tiene 11 dígitos.'],
  PASAPORTE: [/^[A-Za-z0-9]{6,15}$/, 'El pasaporte tiene entre 6 y 15 letras o números.'],
  CE: [/^[A-Za-z0-9]{9,12}$/, 'El carné de extranjería tiene entre 9 y 12 letras o números.'],
};
const soloDoc = (t: TipoDoc, v: string) => (t === 'DNI' || t === 'RUC' ? v.replace(/\D/g, '') : v.replace(/[^A-Za-z0-9]/g, ''));
const maxDoc = (t: TipoDoc) => (t === 'DNI' ? 8 : t === 'RUC' ? 11 : t === 'CE' ? 12 : 15);

const inicial = {
  nombres: '', apellidos: '', tipoDocumento: 'DNI' as TipoDoc, nroDocumento: '', domicilio: '', telefono: '', email: '',
  menorEdad: false, repNombres: '', repTipoDocumento: 'DNI' as Exclude<TipoDoc, 'RUC'>, repNroDocumento: '',
  tipoBien: 'PRODUCTO' as 'PRODUCTO' | 'SERVICIO', monto: '', moneda: 'PEN' as 'PEN' | 'USD', descripcionBien: '', nroPedido: '',
  tipo: 'RECLAMO' as 'RECLAMO' | 'QUEJA', detalle: '', pedidoConsumidor: '', medioRespuesta: 'CORREO' as 'CORREO' | 'CARTA',
  acepta: false, website: '',
};
type Datos = typeof inicial;
type Hoja = { codigo?: string; fecha: string; fechaLimite?: string };

const ORDEN = ['nombres', 'apellidos', 'nroDocumento', 'domicilio', 'telefono', 'email', 'repNombres', 'repNroDocumento', 'monto', 'descripcionBien', 'detalle', 'pedidoConsumidor', 'acepta'];

export default function FormReclamacion({ proveedor }: { proveedor: Proveedor }) {
  const [f, setF] = useState<Datos>(inicial);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [hoja, setHoja] = useState<Hoja | null>(null);
  const [fallo, setFallo] = useState(false);
  const [errorApi, setErrorApi] = useState('');
  const [hoy, setHoy] = useState('');

  const resultadoRef = useRef<HTMLDivElement>(null);
  const errorApiRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => setHoy(fechaLarga(new Date())), []);
  useEffect(() => { if (hoja || fallo) resultadoRef.current?.focus(); }, [hoja, fallo]);
  useEffect(() => { if (errorApi) errorApiRef.current?.focus(); }, [errorApi]);

  const set = <K extends keyof Datos>(k: K, v: Datos[K]) => {
    setF((x) => ({ ...x, [k]: v }));
    setErrores((x) => (x[k] ? { ...x, [k]: '' } : x));
  };
  const volver = useRef(false);
  useEffect(() => { if (!hoja && !fallo && volver.current) { volver.current = false; document.getElementById('nombres')?.focus(); } }, [hoja, fallo]);

  const validar = () => {
    const e: Record<string, string> = {};
    const min = (k: keyof Datos, n: number, msg: string) => { if (limpio(String(f[k])).trim().length < n) e[k] = msg; };
    min('nombres', 2, 'Ingresa tus nombres (mínimo 2 letras).');
    min('apellidos', 2, 'Ingresa tus apellidos (mínimo 2 letras).');
    if (!REGLAS[f.tipoDocumento][0].test(f.nroDocumento)) e.nroDocumento = REGLAS[f.tipoDocumento][1];
    min('domicilio', 5, 'Ingresa tu domicilio (mínimo 5 caracteres).');
    if (!/^[0-9+()\s-]{6,20}$/.test(f.telefono.trim())) e.telefono = 'Ingresa un teléfono válido (6 a 20 dígitos).';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Ingresa un correo válido.';
    if (f.menorEdad) {
      min('repNombres', 2, 'Ingresa los nombres del padre, madre o apoderado.');
      if (!REGLAS[f.repTipoDocumento][0].test(f.repNroDocumento)) e.repNroDocumento = REGLAS[f.repTipoDocumento][1];
    }
    if (f.monto.trim() && !(/^\d+(\.\d{1,2})?$/.test(f.monto.trim()) && Number(f.monto) <= 100_000_000)) e.monto = 'Ingresa un monto válido, con hasta 2 decimales.';
    min('descripcionBien', 3, 'Describe el producto o servicio (mínimo 3 caracteres).');
    min('detalle', 10, 'Cuéntanos el detalle (mínimo 10 caracteres).');
    min('pedidoConsumidor', 5, 'Indica qué solicitas (mínimo 5 caracteres).');
    if (!f.acepta) e.acepta = 'Debes declarar que la información es veraz.';
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
    const t = (v: string) => limpio(v).trim();
    // Solo los campos del DTO de la API (forbidNonWhitelisted).
    const cuerpo = {
      nombres: t(f.nombres), apellidos: t(f.apellidos), tipoDocumento: f.tipoDocumento, nroDocumento: f.nroDocumento,
      domicilio: t(f.domicilio), telefono: f.telefono.trim(), email: f.email.trim(), menorEdad: f.menorEdad,
      ...(f.menorEdad ? { repNombres: t(f.repNombres), repTipoDocumento: f.repTipoDocumento, repNroDocumento: f.repNroDocumento } : {}),
      tipoBien: f.tipoBien, ...(f.monto.trim() ? { montoReclamado: Number(f.monto) } : {}), moneda: f.moneda,
      descripcionBien: t(f.descripcionBien), ...(t(f.nroPedido) ? { nroPedido: t(f.nroPedido) } : {}),
      tipo: f.tipo, detalle: t(f.detalle), pedidoConsumidor: t(f.pedidoConsumidor), medioRespuesta: f.medioRespuesta,
      aceptaVeracidad: f.acepta, origen: 'quamtu-web/libro-de-reclamaciones', website: f.website,
    };
    try {
      const res = await fetch('/api/hub/libro-reclamaciones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        const d = j.data ?? j;
        setHoja({ ...d, fecha: d.fecha ?? new Date().toISOString() });
      } else if (res.status >= 500) setFallo(true);
      else setErrorApi(Array.isArray(j.message) ? j.message.join(' ') : j.message ?? 'No pudimos registrar la hoja.');
    } catch {
      setFallo(true);
    } finally {
      setEnviando(false);
    }
  };

  const err = (k: string) => (errores[k] ? <p id={`e-${k}`} role="alert" className="mt-1 text-sm text-[color:var(--c-error)]">{errores[k]}</p> : null);
  const aria = (k: string) => ({ 'aria-invalid': errores[k] ? true : undefined, 'aria-describedby': errores[k] ? `e-${k}` : undefined });
  const lbl = (id: string, t: string, req = true) => <label htmlFor={id} className={etiqueta}>{t} {req && <span aria-hidden="true">*</span>}</label>;

  if (fallo)
    return (
      <div ref={resultadoRef} tabIndex={-1} role="status" className="hud p-6 sm:p-10">
        <h2 className="font-display text-2xl font-bold">No pudimos registrar tu hoja</h2>
        <p className="mt-3 leading-relaxed text-slate-300">Por un problema temporal no se guardó. Puedes presentarla escribiéndonos por WhatsApp{proveedor.email ? ' o por correo' : ''}; tus datos siguen en el formulario.</p>
        <ul className="mt-4 space-y-1">
          <li><a href={waUrl('Hola Quamtu, quiero presentar un reclamo o una queja.')} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-3 text-slate-200 underline underline-offset-4 hover:text-claro"><MessageCircle aria-hidden="true" size={18} className="shrink-0 text-claro" /> Escribir por WhatsApp</a></li>
          {proveedor.email && <li><a href={`mailto:${proveedor.email}`} className="flex min-h-11 items-center gap-3 break-all text-slate-200 underline underline-offset-4 hover:text-claro"><Mail aria-hidden="true" size={18} className="shrink-0 text-claro" /> {proveedor.email}</a></li>}
        </ul>
        <button type="button" onClick={() => { volver.current = true; setFallo(false); }} className="btn-neon mt-5 inline-flex min-h-12 items-center gap-2 rounded-full px-8 py-3.5 font-display text-sm">
          <RotateCcw aria-hidden="true" size={16} /> VOLVER AL FORMULARIO
        </button>
      </div>
    );

  if (hoja) {
    const filas: [string, string | null][] = [
      ['Consumidor', `${f.nombres.trim()} ${f.apellidos.trim()}`], ['Documento', `${f.tipoDocumento} ${f.nroDocumento}`],
      ['Domicilio', f.domicilio.trim()], ['Teléfono', f.telefono.trim()], ['Correo', f.email.trim()],
      ['Padre, madre o apoderado', f.menorEdad ? `${f.repNombres.trim()} — ${f.repTipoDocumento} ${f.repNroDocumento}` : null],
      ['Bien contratado', `${f.tipoBien === 'PRODUCTO' ? 'Producto' : 'Servicio'}: ${f.descripcionBien.trim()}`],
      ['Monto reclamado', f.monto.trim() ? `${f.moneda === 'PEN' ? 'S/' : 'US$'} ${f.monto.trim()}` : null],
      ['N.º de pedido o comprobante', f.nroPedido.trim() || null],
      ['Tipo', f.tipo === 'RECLAMO' ? 'Reclamo' : 'Queja'], ['Detalle', f.detalle.trim()], ['Pedido del consumidor', f.pedidoConsumidor.trim()],
      ['Medio de respuesta', f.medioRespuesta === 'CORREO' ? 'Correo electrónico' : 'Carta'],
    ];
    return (
      <div ref={resultadoRef} tabIndex={-1} role="status" className="hud p-6 sm:p-10 print:p-0">
        <h2 className="font-display text-2xl font-bold">{hoja.codigo ? 'Hoja de reclamación registrada' : 'Recibimos tu hoja'}</h2>
        {hoja.codigo ? (
          <>
            <p className="mt-3 text-slate-300">Código: <strong className="font-display text-xl text-claro">{hoja.codigo}</strong></p>
            <p className="mt-1 text-slate-300">Fecha de registro: {fechaLarga(hoja.fecha)}</p>
            {hoja.fechaLimite && <p className="mt-1 text-slate-300">Te responderemos como máximo el <strong className="text-white">{fechaLarga(hoja.fechaLimite)}</strong> (15 días hábiles). Presentar un reclamo no impide acudir a Indecopi.</p>}
          </>
        ) : <p className="mt-3 text-slate-300">Gracias. Te contactaremos por el medio indicado.</p>}
        <p className="mt-2 text-sm text-slate-400 print:hidden">Enviamos una copia a tu correo. Guarda el código para consultar el estado.</p>

        <div className="mt-6 hidden print:block">
          <h3 className="font-display text-lg font-bold">Proveedor</h3>
          <p className="text-slate-300">{proveedor.razonSocial ?? proveedor.nombreComercial}{proveedor.ruc ? ` — RUC ${proveedor.ruc}` : ''}</p>
          <p className="text-slate-300">{proveedor.razonSocial ? `${proveedor.nombreComercial}. ` : ''}{proveedor.direccion}{proveedor.email ? `. ${proveedor.email}` : ''}</p>
        </div>
        <dl className="mt-6 hidden gap-x-6 gap-y-2 print:grid print:grid-cols-[12rem_1fr]">
          {filas.filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="contents"><dt className="font-bold text-white">{k}</dt><dd className="break-words text-slate-300">{v}</dd></div>
          ))}
        </dl>
        <p className="mt-6 hidden text-sm text-slate-400 print:block">Ley 29571, Código de Protección y Defensa del Consumidor, y su reglamento.</p>

        <div className="mt-6 flex flex-wrap gap-3 print:hidden">
          <button type="button" onClick={() => window.print()} className="btn-neon inline-flex min-h-12 items-center gap-2 rounded-full px-8 py-3.5 font-display text-sm"><Printer aria-hidden="true" size={16} /> IMPRIMIR / GUARDAR PDF</button>
          <button type="button" onClick={() => { volver.current = true; setHoja(null); setF(inicial); setErrores({}); }} className="btn-borde inline-flex min-h-12 items-center gap-2 rounded-full px-8 py-3.5 font-display text-sm">REGISTRAR OTRO</button>
        </div>
      </div>
    );
  }

  const docSelect = (id: string, valor: string, cambiar: (v: TipoDoc) => void, ruc: boolean) => (
    <select id={id} value={valor} onChange={(e) => cambiar(e.target.value as TipoDoc)} className={campo}>
      <option value="DNI">DNI</option><option value="CE">Carné de extranjería</option><option value="PASAPORTE">Pasaporte</option>{ruc && <option value="RUC">RUC</option>}
    </select>
  );

  return (
    <form onSubmit={enviar} noValidate className="grid gap-6">
      <section aria-labelledby="h-prov" className="hud p-5 sm:p-8">
        <h2 id="h-prov" className="font-display text-xl font-bold">Datos del proveedor</h2>
        <p className="mt-2 text-slate-200">{proveedor.nombreComercial}{proveedor.razonSocial && proveedor.razonSocial !== proveedor.nombreComercial ? ` — ${proveedor.razonSocial}` : ''}</p>
        {proveedor.ruc ? <p className="text-slate-300">RUC {proveedor.ruc}</p> : <p className="text-slate-300">Razón social y RUC: por confirmar.</p>}
        <p className="text-slate-300">{proveedor.direccion}</p>
        {proveedor.email && <p className="break-all text-slate-300">{proveedor.email}</p>}
        <p className="mt-2 text-sm text-slate-400">Fecha: {hoy || '—'}</p>
      </section>

      <fieldset className={`${grupo} grid gap-4 sm:grid-cols-2`}>
        <legend className={tituloGrupo}><span className="text-claro">1.</span> Identificación del consumidor</legend>
        <p className="text-sm text-slate-400 sm:col-span-2">* obligatorio</p>
        <div>{lbl('nombres', 'Nombres')}<input id="nombres" value={f.nombres} onChange={(e) => set('nombres', e.target.value)} autoComplete="given-name" maxLength={80} className={campo} aria-required="true" {...aria('nombres')} />{err('nombres')}</div>
        <div>{lbl('apellidos', 'Apellidos')}<input id="apellidos" value={f.apellidos} onChange={(e) => set('apellidos', e.target.value)} autoComplete="family-name" maxLength={80} className={campo} aria-required="true" {...aria('apellidos')} />{err('apellidos')}</div>
        <div>{lbl('tipoDocumento', 'Tipo de documento')}{docSelect('tipoDocumento', f.tipoDocumento, (v) => { setF((x) => ({ ...x, tipoDocumento: v, nroDocumento: '' })); setErrores((x) => ({ ...x, nroDocumento: '' })); }, true)}</div>
        <div>{lbl('nroDocumento', 'N.º de documento')}<input id="nroDocumento" value={f.nroDocumento} onChange={(e) => set('nroDocumento', soloDoc(f.tipoDocumento, e.target.value))} inputMode={f.tipoDocumento === 'DNI' || f.tipoDocumento === 'RUC' ? 'numeric' : 'text'} maxLength={maxDoc(f.tipoDocumento)} className={campo} aria-required="true" {...aria('nroDocumento')} />{err('nroDocumento')}</div>
        <div className="sm:col-span-2">{lbl('domicilio', 'Domicilio')}<input id="domicilio" value={f.domicilio} onChange={(e) => set('domicilio', e.target.value)} autoComplete="street-address" maxLength={200} className={campo} aria-required="true" {...aria('domicilio')} />{err('domicilio')}</div>
        <div>{lbl('telefono', 'Teléfono')}<input id="telefono" type="tel" value={f.telefono} onChange={(e) => set('telefono', e.target.value)} autoComplete="tel" maxLength={20} className={campo} aria-required="true" {...aria('telefono')} />{err('telefono')}</div>
        <div>{lbl('email', 'Correo')}<input id="email" type="email" value={f.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" maxLength={120} className={campo} aria-required="true" {...aria('email')} />{err('email')}</div>
        <label className={`${opcion} sm:col-span-2`}>
          <input type="checkbox" checked={f.menorEdad} onChange={(e) => { set('menorEdad', e.target.checked); setErrores((x) => ({ ...x, repNombres: '', repNroDocumento: '' })); }} className="h-5 w-5 shrink-0 accent-cyan" /> Soy menor de edad
        </label>
        {f.menorEdad && (
          <>
            <p className="text-sm text-slate-300 sm:col-span-2">Indica los datos de tu padre, madre o apoderado.</p>
            <div className="sm:col-span-2">{lbl('repNombres', 'Nombres y apellidos del padre, madre o apoderado')}<input id="repNombres" value={f.repNombres} onChange={(e) => set('repNombres', e.target.value)} maxLength={120} className={campo} aria-required="true" {...aria('repNombres')} />{err('repNombres')}</div>
            <div>{lbl('repTipoDocumento', 'Tipo de documento')}{docSelect('repTipoDocumento', f.repTipoDocumento, (v) => { setF((x) => ({ ...x, repTipoDocumento: v as Datos['repTipoDocumento'], repNroDocumento: '' })); setErrores((x) => ({ ...x, repNroDocumento: '' })); }, false)}</div>
            <div>{lbl('repNroDocumento', 'N.º de documento')}<input id="repNroDocumento" value={f.repNroDocumento} onChange={(e) => set('repNroDocumento', soloDoc(f.repTipoDocumento, e.target.value))} inputMode={f.repTipoDocumento === 'DNI' ? 'numeric' : 'text'} maxLength={maxDoc(f.repTipoDocumento)} className={campo} aria-required="true" {...aria('repNroDocumento')} />{err('repNroDocumento')}</div>
          </>
        )}
      </fieldset>

      <fieldset className={`${grupo} grid gap-4 sm:grid-cols-2`}>
        <legend className={tituloGrupo}><span className="text-claro">2.</span> Bien contratado</legend>
        <fieldset className="sm:col-span-2">
          <legend className={etiqueta}>Tipo de bien</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {([['PRODUCTO', 'Producto'], ['SERVICIO', 'Servicio']] as const).map(([v, t]) => (
              <label key={v} className={opcion}><input type="radio" name="tipoBien" checked={f.tipoBien === v} onChange={() => set('tipoBien', v)} className="h-5 w-5 accent-cyan" /> {t}</label>
            ))}
          </div>
        </fieldset>
        <div>
          {lbl('monto', 'Monto reclamado (opcional)', false)}
          <div className="flex gap-2">
            <select aria-label="Moneda" value={f.moneda} onChange={(e) => set('moneda', e.target.value as 'PEN' | 'USD')} className={`${campo.replace('w-full', 'w-28')} shrink-0`}><option value="PEN">S/</option><option value="USD">US$</option></select>
            <input id="monto" value={f.monto} onChange={(e) => set('monto', e.target.value)} inputMode="decimal" className={`${campo} min-w-0`} {...aria('monto')} />
          </div>
          {err('monto')}
        </div>
        <div>{lbl('nroPedido', 'N.º de pedido o comprobante (opcional)', false)}<input id="nroPedido" value={f.nroPedido} onChange={(e) => set('nroPedido', e.target.value)} maxLength={60} className={campo} /></div>
        <div className="sm:col-span-2">{lbl('descripcionBien', 'Descripción del producto o servicio')}<textarea id="descripcionBien" value={f.descripcionBien} onChange={(e) => set('descripcionBien', e.target.value)} rows={2} maxLength={300} className={campo} aria-required="true" {...aria('descripcionBien')} />{err('descripcionBien')}</div>
      </fieldset>

      <fieldset className={`${grupo} grid gap-4`}>
        <legend className={tituloGrupo}><span className="text-claro">3.</span> Detalle de la reclamación</legend>
        <fieldset>
          <legend className={etiqueta}>Tipo de hoja</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {([['RECLAMO', 'Reclamo', 'Disconformidad con el producto o servicio.'], ['QUEJA', 'Queja', 'Malestar por la atención al público, sin relación con el producto o servicio.']] as const).map(([v, t, d]) => (
              <label key={v} className={`${opcion} items-start py-3`}>
                <input type="radio" name="tipo" checked={f.tipo === v} onChange={() => set('tipo', v)} className="mt-0.5 h-5 w-5 shrink-0 accent-cyan" />
                <span><strong>{t}</strong><br /><span className="text-slate-300">{d}</span></span>
              </label>
            ))}
          </div>
        </fieldset>
        <div>{lbl('detalle', 'Detalle')}<textarea id="detalle" value={f.detalle} onChange={(e) => set('detalle', e.target.value)} rows={5} maxLength={2000} className={campo} aria-required="true" {...aria('detalle')} />{err('detalle')}</div>
        <div>{lbl('pedidoConsumidor', 'Pedido del consumidor')}<textarea id="pedidoConsumidor" value={f.pedidoConsumidor} onChange={(e) => set('pedidoConsumidor', e.target.value)} rows={3} maxLength={1000} className={campo} aria-required="true" {...aria('pedidoConsumidor')} />{err('pedidoConsumidor')}</div>
        <fieldset>
          <legend className={etiqueta}>Medio de respuesta</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {([['CORREO', 'Respuesta por correo'], ['CARTA', 'Respuesta por carta']] as const).map(([v, t]) => (
              <label key={v} className={opcion}><input type="radio" name="medio" checked={f.medioRespuesta === v} onChange={() => set('medioRespuesta', v)} className="h-5 w-5 accent-cyan" /> {t}</label>
            ))}
          </div>
        </fieldset>
      </fieldset>

      <input name="website" value={f.website} onChange={(e) => set('website', e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div>
        <label className="flex min-h-11 cursor-pointer items-start gap-3 text-slate-200">
          <input id="acepta" type="checkbox" checked={f.acepta} onChange={(e) => set('acepta', e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-cyan" aria-required="true" {...aria('acepta')} />
          <span>Declaro que la información es veraz y corresponde a lo ocurrido. <span aria-hidden="true">*</span></span>
        </label>
        {err('acepta')}
        <p className="mt-3 text-sm text-slate-400">Responderemos en un plazo máximo de 15 días hábiles. Presentar un reclamo no impide acudir a Indecopi.</p>
        {errorApi && <p ref={errorApiRef} tabIndex={-1} role="alert" className="mt-3 text-sm text-[color:var(--c-error)]">{errorApi}</p>}
        <button type="submit" disabled={enviando} className="btn-neon mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-8 py-4 font-display text-sm disabled:opacity-60 sm:w-auto">
          {enviando ? <Loader2 aria-hidden="true" size={18} className="animate-spin" /> : <Send aria-hidden="true" size={18} />} ENVIAR HOJA DE RECLAMACIÓN
        </button>
      </div>
    </form>
  );
}
