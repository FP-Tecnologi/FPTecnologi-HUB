'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, Loader2, Mail, Phone, Printer, Send } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/content';
import type { Proveedor } from '@/lib/proveedorLibro';

/*
 * Hoja de reclamación virtual (Ley N.° 29571 y su reglamento). Envía a /api/hub/libro-reclamaciones,
 * que la registra en la API del HUB con el marcaId del servidor. Mismas reglas que CrearHojaDto.
 */
type TipoDoc = 'DNI' | 'CE' | 'PASAPORTE' | 'RUC';
const limpio = (t: string) => t.replace(/[<>]/g, '');
const fechaLarga = (d: string | Date) => new Date(d).toLocaleDateString('es-PE', { timeZone: 'America/Lima', day: 'numeric', month: 'long', year: 'numeric' });

const input =
  'mt-1.5 block min-h-11 w-full rounded-xl border border-brand-dark/15 bg-paper px-4 py-2.5 text-base text-ink outline-none transition-colors placeholder:text-ink/65 focus:border-brand-dark focus:bg-white focus:ring-2 focus:ring-brand-dark/15 aria-[invalid=true]:border-red-600';
const opcion = 'flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-brand-dark/15 bg-paper px-4 py-2.5 text-sm text-ink has-[:checked]:border-brand-primary has-[:checked]:bg-brand-primary/5';
const boton = 'inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold uppercase tracking-wide transition-colors disabled:opacity-60';
const botonPrimario = `${boton} bg-brand-primary text-white shadow-lg shadow-brand-dark/30 hover:bg-brand-dark`;

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

function Bloque({ n, titulo, children }: { n: number; titulo: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0 rounded-2xl border border-brand-dark/10 p-5 sm:p-6">
      <legend className="flex items-center gap-2 px-2 font-display text-base font-bold text-ink">
        <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary text-xs text-white">{n}</span>
        {titulo}
      </legend>
      <div className="mt-2 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function LibroReclamacionesForm({ proveedor }: { proveedor: Proveedor }) {
  const [f, setF] = useState<Datos>(inicial);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [hoja, setHoja] = useState<Hoja | null>(null);
  const [fallo, setFallo] = useState(false);
  const [errorApi, setErrorApi] = useState('');

  const resultadoRef = useRef<HTMLDivElement>(null);
  const errorApiRef = useRef<HTMLParagraphElement>(null);
  const volver = useRef(false);
  useEffect(() => { if (hoja || fallo) resultadoRef.current?.focus(); }, [hoja, fallo]);
  useEffect(() => { if (errorApi) errorApiRef.current?.focus(); }, [errorApi]);
  useEffect(() => { if (!hoja && !fallo && volver.current) { volver.current = false; document.getElementById('nombres')?.focus(); } }, [hoja, fallo]);

  const set = <K extends keyof Datos>(k: K, v: Datos[K]) => {
    setF((x) => ({ ...x, [k]: v }));
    setErrores((x) => (x[k] ? { ...x, [k]: '' } : x));
  };

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
      aceptaVeracidad: f.acepta, origen: 'web-fptecnologi/libro-de-reclamaciones', website: f.website,
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

  // Al imprimir solo sale la hoja (ver @media print en globals.css).
  const imprimir = () => {
    document.body.dataset.imprimirHoja = '1';
    window.addEventListener('afterprint', () => delete document.body.dataset.imprimirHoja, { once: true });
    window.print();
  };

  const err = (k: string) => (errores[k] ? <p id={`e-${k}`} role="alert" className="mt-1 text-sm font-medium text-red-600">{errores[k]}</p> : null);
  const aria = (k: string) => ({ 'aria-invalid': errores[k] ? true : undefined, 'aria-describedby': errores[k] ? `e-${k}` : undefined, 'aria-required': true as const });
  const lbl = (id: string, t: string, req = true) => (
    <label htmlFor={id} className="block text-sm font-medium text-ink">{t}{req && <span aria-hidden="true" className="text-red-600"> *</span>}</label>
  );
  const docSelect = (id: string, valor: string, cambiar: (v: TipoDoc) => void, ruc: boolean) => (
    <select id={id} value={valor} onChange={(e) => cambiar(e.target.value as TipoDoc)} className={input}>
      <option value="DNI">DNI</option><option value="CE">Carné de extranjería</option><option value="PASAPORTE">Pasaporte</option>{ruc && <option value="RUC">RUC</option>}
    </select>
  );
  const fiscal = [proveedor.razonSocial, proveedor.ruc && `RUC ${proveedor.ruc}`].filter(Boolean).join(' — ') || proveedor.nombreComercial;

  if (fallo)
    return (
      <div ref={resultadoRef} tabIndex={-1} role="status" className="rounded-2xl border border-brand-dark/10 bg-paper p-6 outline-none sm:p-8">
        <h2 className="font-display text-2xl font-bold text-ink">No pudimos registrar tu hoja</h2>
        <p className="mt-3 leading-relaxed text-ink/80">Por un problema temporal no se guardó. Puedes presentarla escribiéndonos o llamándonos; tus datos siguen en el formulario.</p>
        <ul className="mt-4 space-y-1 text-ink">
          <li><a href={`mailto:${proveedor.email}`} className="flex min-h-11 items-center gap-3 break-all hover:underline"><Mail aria-hidden="true" className="h-[18px] w-[18px] shrink-0" /> {proveedor.email}</a></li>
          <li><a href={`tel:${CONTACT_INFO.phoneVentas.replace(/\s/g, '')}`} className="flex min-h-11 items-center gap-3 hover:underline"><Phone aria-hidden="true" className="h-[18px] w-[18px] shrink-0" /> {CONTACT_INFO.phoneVentas}</a></li>
        </ul>
        <button type="button" onClick={() => { volver.current = true; setFallo(false); }} className={`${botonPrimario} mt-4`}>Volver al formulario</button>
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
      <div ref={resultadoRef} tabIndex={-1} role="status" id="hoja-impresion" className="flex flex-col items-center py-6 text-center outline-none print:items-start print:text-left">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-whatsapp-dark text-white shadow-lg shadow-whatsapp/30 print:hidden">
          <CheckCircle2 aria-hidden="true" className="h-7 w-7" strokeWidth={2} />
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold text-ink print:mt-0">{hoja.codigo ? 'Hoja de reclamación registrada' : 'Recibimos tu hoja'}</h2>
        {hoja.codigo ? (
          <div className="mt-2 max-w-md space-y-1 text-ink/80 print:max-w-none">
            <p>Código: <strong className="text-xl text-brand-700">{hoja.codigo}</strong></p>
            <p>Fecha de registro: {fechaLarga(hoja.fecha)}</p>
            {hoja.fechaLimite && <p>Te responderemos como máximo el <strong>{fechaLarga(hoja.fechaLimite)}</strong> (15 días hábiles). Presentar un reclamo no impide acudir a Indecopi.</p>}
          </div>
        ) : <p className="mt-2 text-ink/80">Gracias. Te contactaremos por el medio indicado.</p>}
        <p className="mt-2 max-w-md text-sm text-ink/65 print:hidden">Enviamos una copia a tu correo. Guarda el código para consultar el estado.</p>

        <div className="mt-6 hidden w-full print:block">
          <h3 className="font-display text-lg font-bold">Proveedor</h3>
          <p>{fiscal}</p>
          <p>{proveedor.nombreComercial}. {proveedor.direccion}. {proveedor.email}</p>
        </div>
        <dl className="mt-6 hidden w-full gap-x-6 gap-y-2 text-left print:grid print:grid-cols-[12rem_1fr]">
          {filas.filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="contents"><dt className="font-semibold">{k}</dt><dd className="break-words">{v}</dd></div>
          ))}
        </dl>
        <p className="mt-6 hidden text-sm print:block">Ley 29571, Código de Protección y Defensa del Consumidor, y su reglamento.</p>

        <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
          <button type="button" onClick={imprimir} className={botonPrimario}>
            <Printer aria-hidden="true" className="h-4 w-4" /> Imprimir / guardar PDF
          </button>
          <button type="button" onClick={() => { volver.current = true; setHoja(null); setF(inicial); setErrores({}); }} className={`${boton} border border-brand-dark/25 text-brand-700 hover:bg-paper`}>
            Registrar otro
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-6">
      <p className="text-sm text-ink/65"><span aria-hidden="true" className="text-red-600">*</span> Campo obligatorio</p>
      <Bloque n={1} titulo="Identificación del consumidor">
        <div>{lbl('nombres', 'Nombres')}<input id="nombres" value={f.nombres} onChange={(e) => set('nombres', e.target.value)} autoComplete="given-name" maxLength={80} className={input} {...aria('nombres')} />{err('nombres')}</div>
        <div>{lbl('apellidos', 'Apellidos')}<input id="apellidos" value={f.apellidos} onChange={(e) => set('apellidos', e.target.value)} autoComplete="family-name" maxLength={80} className={input} {...aria('apellidos')} />{err('apellidos')}</div>
        <div>{lbl('tipoDocumento', 'Tipo de documento')}{docSelect('tipoDocumento', f.tipoDocumento, (v) => { setF((x) => ({ ...x, tipoDocumento: v, nroDocumento: '' })); setErrores((x) => ({ ...x, nroDocumento: '' })); }, true)}</div>
        <div>{lbl('nroDocumento', 'N.º de documento')}<input id="nroDocumento" value={f.nroDocumento} onChange={(e) => set('nroDocumento', soloDoc(f.tipoDocumento, e.target.value))} inputMode={f.tipoDocumento === 'DNI' || f.tipoDocumento === 'RUC' ? 'numeric' : 'text'} maxLength={maxDoc(f.tipoDocumento)} className={input} {...aria('nroDocumento')} />{err('nroDocumento')}</div>
        <div className="sm:col-span-2">{lbl('domicilio', 'Domicilio')}<input id="domicilio" value={f.domicilio} onChange={(e) => set('domicilio', e.target.value)} autoComplete="street-address" maxLength={200} className={input} {...aria('domicilio')} />{err('domicilio')}</div>
        <div>{lbl('telefono', 'Teléfono')}<input id="telefono" type="tel" value={f.telefono} onChange={(e) => set('telefono', e.target.value)} autoComplete="tel" maxLength={20} className={input} {...aria('telefono')} />{err('telefono')}</div>
        <div>{lbl('email', 'Correo electrónico')}<input id="email" type="email" value={f.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" maxLength={120} className={input} {...aria('email')} />{err('email')}</div>
        <label className={`${opcion} sm:col-span-2`}>
          <input type="checkbox" checked={f.menorEdad} onChange={(e) => { set('menorEdad', e.target.checked); setErrores((x) => ({ ...x, repNombres: '', repNroDocumento: '' })); }} className="h-4 w-4 accent-brand-primary" /> Soy menor de edad
        </label>
        {f.menorEdad && (
          <>
            <p className="text-sm text-ink/65 sm:col-span-2">Indica los datos de tu padre, madre o apoderado.</p>
            <div className="sm:col-span-2">{lbl('repNombres', 'Nombres y apellidos del padre, madre o apoderado')}<input id="repNombres" value={f.repNombres} onChange={(e) => set('repNombres', e.target.value)} maxLength={120} className={input} {...aria('repNombres')} />{err('repNombres')}</div>
            <div>{lbl('repTipoDocumento', 'Tipo de documento')}{docSelect('repTipoDocumento', f.repTipoDocumento, (v) => { setF((x) => ({ ...x, repTipoDocumento: v as Datos['repTipoDocumento'], repNroDocumento: '' })); setErrores((x) => ({ ...x, repNroDocumento: '' })); }, false)}</div>
            <div>{lbl('repNroDocumento', 'N.º de documento')}<input id="repNroDocumento" value={f.repNroDocumento} onChange={(e) => set('repNroDocumento', soloDoc(f.repTipoDocumento, e.target.value))} inputMode={f.repTipoDocumento === 'DNI' ? 'numeric' : 'text'} maxLength={maxDoc(f.repTipoDocumento)} className={input} {...aria('repNroDocumento')} />{err('repNroDocumento')}</div>
          </>
        )}
      </Bloque>

      <Bloque n={2} titulo="Bien contratado">
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium text-ink">Tipo de bien</legend>
          <div className="mt-1.5 flex flex-wrap gap-3">
            {([['PRODUCTO', 'Producto'], ['SERVICIO', 'Servicio']] as const).map(([v, t]) => (
              <label key={v} className={opcion}><input type="radio" name="tipoBien" checked={f.tipoBien === v} onChange={() => set('tipoBien', v)} className="h-4 w-4 accent-brand-primary" /> {t}</label>
            ))}
          </div>
        </fieldset>
        <div>
          {lbl('monto', 'Monto reclamado (opcional)', false)}
          <div className="flex gap-2">
            <select aria-label="Moneda" value={f.moneda} onChange={(e) => set('moneda', e.target.value as 'PEN' | 'USD')} className={`${input} !w-28 shrink-0`}><option value="PEN">S/</option><option value="USD">US$</option></select>
            <input id="monto" value={f.monto} onChange={(e) => set('monto', e.target.value)} inputMode="decimal" placeholder="0.00" className={`${input} min-w-0`} aria-invalid={errores.monto ? true : undefined} aria-describedby={errores.monto ? 'e-monto' : undefined} />
          </div>
          {err('monto')}
        </div>
        <div>{lbl('nroPedido', 'N.º de pedido o comprobante (opcional)', false)}<input id="nroPedido" value={f.nroPedido} onChange={(e) => set('nroPedido', e.target.value)} maxLength={60} className={input} /></div>
        <div className="sm:col-span-2">{lbl('descripcionBien', 'Descripción del producto o servicio')}<textarea id="descripcionBien" value={f.descripcionBien} onChange={(e) => set('descripcionBien', e.target.value)} rows={2} maxLength={300} className={input} {...aria('descripcionBien')} />{err('descripcionBien')}</div>
      </Bloque>

      <Bloque n={3} titulo="Detalle de la reclamación">
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium text-ink">Tipo de hoja</legend>
          <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
            {([['RECLAMO', 'Reclamo', 'Disconformidad con el producto o servicio.'], ['QUEJA', 'Queja', 'Malestar por la atención al público, sin relación con el producto o servicio.']] as const).map(([v, t, d]) => (
              <label key={v} className={`${opcion} items-start`}>
                <input type="radio" name="tipo" checked={f.tipo === v} onChange={() => set('tipo', v)} className="mt-1 h-4 w-4 accent-brand-primary" />
                <span><span className="block font-semibold">{t}</span><span className="block text-xs text-ink/65">{d}</span></span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="sm:col-span-2">{lbl('detalle', 'Detalle')}<textarea id="detalle" value={f.detalle} onChange={(e) => set('detalle', e.target.value)} rows={5} maxLength={2000} className={input} {...aria('detalle')} />{err('detalle')}</div>
        <div className="sm:col-span-2">{lbl('pedidoConsumidor', 'Pedido del consumidor (qué solicitas)')}<textarea id="pedidoConsumidor" value={f.pedidoConsumidor} onChange={(e) => set('pedidoConsumidor', e.target.value)} rows={3} maxLength={1000} className={input} {...aria('pedidoConsumidor')} />{err('pedidoConsumidor')}</div>
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium text-ink">Medio de respuesta</legend>
          <div className="mt-1.5 flex flex-wrap gap-3">
            {([['CORREO', 'Respuesta por correo'], ['CARTA', 'Respuesta por carta']] as const).map(([v, t]) => (
              <label key={v} className={opcion}><input type="radio" name="medio" checked={f.medioRespuesta === v} onChange={() => set('medioRespuesta', v)} className="h-4 w-4 accent-brand-primary" /> {t}</label>
            ))}
          </div>
        </fieldset>
      </Bloque>

      <input name="website" value={f.website} onChange={(e) => set('website', e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div>
        <label className="flex min-h-11 items-start gap-3 text-sm text-ink">
          <input id="acepta" type="checkbox" checked={f.acepta} onChange={(e) => set('acepta', e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-brand-primary" {...aria('acepta')} />
          <span>Declaro que la información es veraz y corresponde a lo ocurrido. <span aria-hidden="true" className="text-red-600">*</span></span>
        </label>
        {err('acepta')}
        {errorApi && <p ref={errorApiRef} tabIndex={-1} role="alert" className="mt-3 text-sm font-medium text-red-600 outline-none">{errorApi}</p>}
        <div className="mt-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="max-w-md text-xs text-ink/65">
            Responderemos en un plazo máximo de 15 días hábiles. La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante INDECOPI.
          </p>
          <button type="submit" disabled={enviando} className={botonPrimario}>
            {enviando ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Send aria-hidden="true" className="h-4 w-4" strokeWidth={2} />}
            {enviando ? 'Enviando…' : 'Enviar hoja de reclamación'}
          </button>
        </div>
      </div>
    </form>
  );
}
