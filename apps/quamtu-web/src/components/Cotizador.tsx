'use client';
import { useMemo, useState } from 'react';
import { Check, Download, Loader2, MessageCircle, Minus, Plus, Search, Trash2 } from 'lucide-react';
import ImgPieza from './ImgPieza';
import { leerCarrito } from '@/lib/carrito';
import { waUrl } from '@/lib/contacto';
import { BUILDS, CATS, OPCIONES, porId, seleccionDe, total, type Cat } from '@/lib/piezas';

const soles = (n: number) => `S/ ${n.toLocaleString('es-PE')}`;

type Linea = { clave: string; nombre: string; detalle?: string; unit: number; cantidad: number };
type Tipo = 'JURIDICA' | 'NATURAL';

const buildLinea = (i: number): Linea => {
  const b = BUILDS[i];
  const s = seleccionDe(b.ids);
  return { clave: `build-${i}`, nombre: `${b.nombre} (PC armada)`, detalle: b.ids.map((id) => porId(id)?.nombre).join(' · '), unit: total(s), cantidad: 1 };
};
const piezaLinea = (id: string): Linea => {
  const o = porId(id)!;
  return { clave: id, nombre: o.nombre, detalle: o.spec, unit: o.precio, cantidad: 1 };
};

const PLAZOS = ['Lo antes posible', 'En 1 a 2 semanas', 'En 1 mes', 'Solo estoy comparando precios'];
const campo = 'w-full rounded-lg border border-line bg-bg/60 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-cyan';

export default function Cotizador({ inicial }: { inicial?: { tipo: 'build' | 'pieza'; id: string } }) {
  const [lineas, setLineas] = useState<Linea[]>(() => (inicial ? [inicial.tipo === 'build' ? buildLinea(Number(inicial.id)) : piezaLinea(inicial.id)] : []));
  const [pestana, setPestana] = useState<'equipos' | 'componentes'>(inicial?.tipo === 'pieza' ? 'componentes' : 'equipos');
  const [cat, setCat] = useState<Cat | ''>('');
  const [q, setQ] = useState('');
  const [f, setF] = useState({ tipo: 'JURIDICA' as Tipo, nombres: '', apellidos: '', doc: '', empresa: '', email: '', celular: '', plazo: PLAZOS[0], factura: true, mensaje: '', website: '' });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<null | { guardado: boolean; texto: string }>(null);
  const [errorApi, setErrorApi] = useState('');

  const totalRef = lineas.reduce((a, l) => a + l.unit * l.cantidad, 0);
  const lista = useMemo(() => {
    const t = q.toLowerCase().trim();
    return OPCIONES.filter((o) => (!cat || o.cat === cat) && (!t || `${o.nombre} ${o.spec}`.toLowerCase().includes(t)));
  }, [cat, q]);

  const cantidadDe = (clave: string) => lineas.find((l) => l.clave === clave)?.cantidad ?? 0;
  const poner = (l: Linea) => setLineas((ls) => (ls.some((x) => x.clave === l.clave) ? ls.map((x) => (x.clave === l.clave ? { ...x, cantidad: x.cantidad + 1 } : x)) : [...ls, l]));
  const cambiar = (clave: string, d: number) =>
    setLineas((ls) => ls.map((l) => (l.clave === clave ? { ...l, cantidad: Math.max(0, l.cantidad + d) } : l)).filter((l) => l.cantidad > 0));
  const quitar = (clave: string) => setLineas((ls) => ls.filter((l) => l.clave !== clave));

  const importarCarrito = () => {
    leerCarrito().forEach((it, i) => {
      if (it.tipo === 'pieza') poner({ ...piezaLinea(it.ids[0]), cantidad: it.cantidad ?? 1 });
      else
        poner({
          clave: `carrito-${i}`,
          nombre: it.modo === 'repuestos' ? 'Componentes seleccionados' : 'PC armada a medida',
          detalle: it.ids.map((id) => porId(id)?.nombre).join(' · '),
          unit: it.total,
          cantidad: 1,
        });
    });
  };

  const validar = () => {
    const e: Record<string, string> = {};
    const celular = f.celular.replace(/[\s+-]/g, '').replace(/^51/, '');
    if (!lineas.length) e.lineas = 'Agrega al menos un producto a tu cotización.';
    if (f.nombres.trim().length < 2) e.nombres = 'Ingresa tus nombres.';
    if (f.apellidos.trim().length < 2) e.apellidos = 'Ingresa tus apellidos.';
    if (!new RegExp(f.tipo === 'JURIDICA' ? '^\\d{11}$' : '^\\d{8}$').test(f.doc)) e.doc = f.tipo === 'JURIDICA' ? 'El RUC tiene 11 dígitos.' : 'El DNI tiene 8 dígitos.';
    if (f.tipo === 'JURIDICA' && f.empresa.trim().length < 2) e.empresa = 'Ingresa la razón social.';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Correo no válido.';
    if (!/^9\d{8}$/.test(celular)) e.celular = 'Celular de 9 dígitos que empiece con 9.';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const detalleTexto = () =>
    lineas.map((l) => `• ${l.cantidad} × ${l.nombre} — ${soles(l.unit * l.cantidad)}${l.detalle ? `\n   ${l.detalle}` : ''}`).join('\n');

  const mensajeWa = () =>
    `Hola Quamtu, solicito una cotización:\n\n*Productos*\n${detalleTexto()}\n\n*Total referencial: ${soles(totalRef)}*\n\n*Mis datos*\n${f.nombres} ${f.apellidos}${f.empresa ? ` — ${f.empresa}` : ''}\n${f.tipo === 'JURIDICA' ? 'RUC' : 'DNI'}: ${f.doc}\nCorreo: ${f.email}\nCelular: ${f.celular}\nPlazo: ${f.plazo}\nFactura: ${f.factura ? 'Sí' : 'No'}${f.mensaje ? `\nNotas: ${f.mensaje}` : ''}`;

  const enviar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErrorApi('');
    if (!validar()) return;
    setEnviando(true);
    const limpio = (t: string) => t.replace(/[<>]/g, '');
    const cuerpo = {
      nombres: limpio(f.nombres.trim()),
      apellidos: limpio(f.apellidos.trim()),
      tipoPersona: f.tipo,
      tipoDocumento: f.tipo === 'JURIDICA' ? 'RUC' : 'DNI',
      nroDocumento: f.doc,
      empresa: limpio(f.empresa.trim()) || undefined,
      email: f.email.trim(),
      celular: f.celular.trim(),
      interes: limpio(`Cotización de ${lineas.length} producto(s) — total ref. ${soles(totalRef)}`).slice(0, 120),
      mensaje: limpio(`${detalleTexto()}\nPlazo: ${f.plazo}. Factura: ${f.factura ? 'sí' : 'no'}.${f.mensaje ? ` Notas: ${f.mensaje}` : ''}`).slice(0, 1000),
      origen: 'quamtu-web/cotizar',
      website: f.website,
    };
    try {
      const res = await fetch('/api/hub/cotizador', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
      if (res.ok) setResultado({ guardado: true, texto: 'Recibimos tu solicitud. Un especialista te contactará pronto.' });
      else if (res.status === 503 || res.status >= 500) setResultado({ guardado: false, texto: 'Tu cotización está lista. Envíala por WhatsApp para que un especialista te atienda ahora mismo.' });
      else {
        const j = await res.json().catch(() => ({}));
        setErrorApi(Array.isArray(j.message) ? j.message.join(' ') : j.message ?? 'No pudimos enviar la solicitud.');
      }
    } catch {
      setResultado({ guardado: false, texto: 'Tu cotización está lista. Envíala por WhatsApp para que un especialista te atienda ahora mismo.' });
    } finally {
      setEnviando(false);
    }
  };

  const set = (k: keyof typeof f, v: string | boolean) => setF((x) => ({ ...x, [k]: v }));
  const err = (k: string) => (errores[k] ? <p className="mt-1 text-xs text-red-400">{errores[k]}</p> : null);
  const chip = (activo: boolean) => `shrink-0 rounded-full border px-4 py-2 font-display text-xs transition ${activo ? 'border-cyan bg-cyan/15 text-claro' : 'border-line text-slate-400 hover:border-slate-500'}`;

  if (resultado)
    return (
      <main className="mx-auto max-w-2xl px-5 pb-24 pt-28 text-center">
        <div className="hud p-8 sm:p-12">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-cyan/20 text-claro"><Check size={32} /></span>
          <h1 className="mt-6 font-display text-3xl font-bold">Cotización lista</h1>
          <p className="mt-3 text-lg text-slate-300">{resultado.texto}</p>
          <p className="mt-2 text-sm text-slate-500">Total referencial: {soles(totalRef)} · {lineas.length} producto(s)</p>
          <a href={waUrl(mensajeWa())} target="_blank" rel="noreferrer" className="btn-neon mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-sm">
            <MessageCircle size={18} /> CONTINUAR POR WHATSAPP
          </a>
          <p className="mt-6"><a href="/" className="text-sm text-slate-400 underline hover:text-claro">Volver al inicio</a></p>
        </div>
      </main>
    );

  return (
    <main className="mx-auto max-w-7xl px-4 pb-32 pt-24 sm:px-5 sm:pt-28 lg:pb-24">
      <h1 className="font-display text-3xl font-bold sm:text-4xl md:text-5xl">Cotizador <span className="titulo-neon">avanzado</span></h1>
      <p className="mt-3 max-w-2xl text-slate-400">Elige equipos y componentes, indica las cantidades y déjanos tus datos. Un especialista te enviará la cotización formal con precio final y disponibilidad.</p>

      <form onSubmit={enviar} noValidate className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-8">
          {/* 1. PRODUCTOS */}
          <section className="glass rounded-2xl p-4 sm:p-6">
            <h2 className="font-display text-xl font-bold"><span className="text-claro">1.</span> Elige tus productos</h2>
            <div className="sin-barra mt-4 flex gap-2 overflow-x-auto pb-1">
              <button type="button" onClick={() => setPestana('equipos')} className={chip(pestana === 'equipos')}>Equipos armados</button>
              <button type="button" onClick={() => setPestana('componentes')} className={chip(pestana === 'componentes')}>Componentes</button>
              <button type="button" onClick={importarCarrito} className={`${chip(false)} ml-auto flex items-center gap-1.5`}><Download size={13} /> Importar mi carrito</button>
            </div>

            {pestana === 'equipos' ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {BUILDS.map((b, i) => {
                  const l = buildLinea(i);
                  const n = cantidadDe(l.clave);
                  return (
                    <div key={b.nombre} className="rounded-xl border border-line bg-bg/50 p-4">
                      <span className="font-display text-[10px] tracking-[0.25em] text-claro">{b.linea}</span>
                      <h3 className="font-display text-lg font-bold">{b.nombre}</h3>
                      <p className="text-sm text-slate-400">{b.para}</p>
                      <p className="mt-2 text-xs leading-relaxed text-slate-500">{l.detalle}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <b className="font-display text-lg text-claro">{soles(l.unit)}</b>
                        {n ? (
                          <Paso n={n} onMenos={() => cambiar(l.clave, -1)} onMas={() => cambiar(l.clave, 1)} />
                        ) : (
                          <button type="button" onClick={() => poner(l)} className="btn-neon rounded-full px-4 py-2 font-display text-[11px]">AGREGAR</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                <div className="relative mt-4">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar componente…" className={`${campo} pl-11`} />
                </div>
                <div className="sin-barra mt-3 flex gap-2 overflow-x-auto pb-1">
                  <button type="button" onClick={() => setCat('')} className={chip(!cat)}>Todo</button>
                  {CATS.map((c) => (
                    <button key={c.id} type="button" onClick={() => setCat(c.id)} className={chip(cat === c.id)}>{c.titulo}</button>
                  ))}
                </div>
                <div className="mt-4 grid max-h-[520px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {lista.map((o) => {
                    const n = cantidadDe(o.id);
                    return (
                      <div key={o.id} className={`flex items-center gap-3 rounded-xl border p-3 ${n ? 'border-cyan bg-cyan/10' : 'border-line bg-bg/50'}`}>
                        <ImgPieza id={o.id} cat={o.cat} color={o.color} className="h-14 w-14 shrink-0 rounded-lg" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{o.nombre}</p>
                          <p className="truncate text-xs text-slate-500">{o.spec}</p>
                          <b className="font-display text-sm text-claro">{soles(o.precio)}</b>
                        </div>
                        {n ? (
                          <Paso n={n} onMenos={() => cambiar(o.id, -1)} onMas={() => cambiar(o.id, 1)} />
                        ) : (
                          <button type="button" onClick={() => poner(piezaLinea(o.id))} aria-label={`Agregar ${o.nombre}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-claro/50 text-claro hover:bg-cyan/20"><Plus size={16} /></button>
                        )}
                      </div>
                    );
                  })}
                  {!lista.length && <p className="col-span-full py-6 text-center text-sm text-slate-500">Sin resultados.</p>}
                </div>
              </>
            )}
            {errores.lineas && <p className="mt-3 text-sm text-red-400">{errores.lineas}</p>}
          </section>

          {/* 2. DATOS */}
          <section className="glass rounded-2xl p-4 sm:p-6">
            <h2 className="font-display text-xl font-bold"><span className="text-claro">2.</span> Tus datos</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {([['JURIDICA', 'Empresa o institución'], ['NATURAL', 'Persona natural']] as const).map(([v, t]) => (
                <button key={v} type="button" onClick={() => set('tipo', v)} className={`rounded-xl border p-3 text-sm font-bold transition ${f.tipo === v ? 'border-cyan bg-cyan/10 text-white' : 'border-line text-slate-400 hover:border-slate-500'}`}>{t}</button>
              ))}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">Nombres<input value={f.nombres} onChange={(e) => set('nombres', e.target.value)} autoComplete="given-name" className={`${campo} mt-1`} />{err('nombres')}</label>
              <label className="block text-sm">Apellidos<input value={f.apellidos} onChange={(e) => set('apellidos', e.target.value)} autoComplete="family-name" className={`${campo} mt-1`} />{err('apellidos')}</label>
              <label className="block text-sm">{f.tipo === 'JURIDICA' ? 'RUC' : 'DNI'}<input value={f.doc} onChange={(e) => set('doc', e.target.value.replace(/\D/g, ''))} inputMode="numeric" maxLength={f.tipo === 'JURIDICA' ? 11 : 8} className={`${campo} mt-1`} />{err('doc')}</label>
              {f.tipo === 'JURIDICA' && <label className="block text-sm">Razón social<input value={f.empresa} onChange={(e) => set('empresa', e.target.value)} autoComplete="organization" className={`${campo} mt-1`} />{err('empresa')}</label>}
              <label className="block text-sm">Correo<input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" className={`${campo} mt-1`} />{err('email')}</label>
              <label className="block text-sm">Celular<input type="tel" value={f.celular} onChange={(e) => set('celular', e.target.value)} autoComplete="tel" placeholder="9XXXXXXXX" className={`${campo} mt-1`} />{err('celular')}</label>
              <label className="block text-sm">¿Para cuándo lo necesitas?
                <select value={f.plazo} onChange={(e) => set('plazo', e.target.value)} className={`${campo} mt-1`}>
                  {PLAZOS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-3 self-end rounded-lg border border-line px-4 py-3 text-sm">
                <input type="checkbox" checked={f.factura} onChange={(e) => set('factura', e.target.checked)} className="h-4 w-4 accent-[#238DC1]" /> Necesito factura
              </label>
            </div>
            <label className="mt-4 block text-sm">Notas o requerimientos (opcional)
              <textarea value={f.mensaje} onChange={(e) => set('mensaje', e.target.value)} rows={3} maxLength={600} placeholder="Uso del equipo, software, cantidad de oficinas, lugar de entrega…" className={`${campo} mt-1 resize-y`} />
            </label>
            {/* honeypot */}
            <input value={f.website} onChange={(e) => set('website', e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          </section>
        </div>

        {/* RESUMEN */}
        <aside className="glass rounded-2xl p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-bold">Tu cotización</h2>
          {!lineas.length ? (
            <p className="mt-4 text-sm text-slate-500">Aún no agregaste productos.</p>
          ) : (
            <ul className="mt-4 max-h-[340px] divide-y divide-line/60 overflow-y-auto">
              {lineas.map((l) => (
                <li key={l.clave} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 text-sm font-bold">{l.nombre}</p>
                    <button type="button" onClick={() => quitar(l.clave)} aria-label={`Quitar ${l.nombre}`} className="shrink-0 text-slate-500 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <Paso n={l.cantidad} onMenos={() => cambiar(l.clave, -1)} onMas={() => cambiar(l.clave, 1)} />
                    <b className="font-display text-claro">{soles(l.unit * l.cantidad)}</b>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
            <span className="text-xs tracking-widest text-slate-500">TOTAL REFERENCIAL</span>
            <span className="titulo-neon font-display text-2xl font-bold">{soles(totalRef)}</span>
          </div>
          {errorApi && <p className="mt-3 text-sm text-red-400">{errorApi}</p>}
          <button disabled={enviando} className="btn-neon mt-5 flex w-full items-center justify-center gap-2 rounded-full py-4 font-display text-sm disabled:opacity-60">
            {enviando ? <Loader2 size={18} className="animate-spin" /> : null} SOLICITAR COTIZACIÓN
          </button>
          <p className="mt-3 text-xs text-slate-500">Precios referenciales. La cotización formal incluye precio final, stock y tiempo de entrega.</p>
        </aside>

        {/* Barra fija en celular: total y envío siempre a la vista */}
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur lg:hidden">
          <div>
            <span className="block text-[10px] tracking-widest text-slate-500">{lineas.length} PRODUCTO(S)</span>
            <b className="font-display text-lg text-claro">{soles(totalRef)}</b>
          </div>
          <button disabled={enviando} className="btn-neon rounded-full px-6 py-3 font-display text-xs disabled:opacity-60">SOLICITAR</button>
        </div>
      </form>
    </main>
  );
}

function Paso({ n, onMenos, onMas }: { n: number; onMenos: () => void; onMas: () => void }) {
  return (
    <div className="flex shrink-0 items-center rounded-full border border-line">
      <button type="button" onClick={onMenos} aria-label="Menos" className="grid h-9 w-9 place-items-center text-slate-300 hover:text-claro"><Minus size={14} /></button>
      <span className="w-6 text-center text-sm font-bold">{n}</span>
      <button type="button" onClick={onMas} aria-label="Más" className="grid h-9 w-9 place-items-center text-slate-300 hover:text-claro"><Plus size={14} /></button>
    </div>
  );
}
