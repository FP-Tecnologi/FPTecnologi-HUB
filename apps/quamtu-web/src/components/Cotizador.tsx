'use client';
import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ClipboardList, Loader2, MessageCircle, Minus, Plus, Search, Trash2 } from 'lucide-react';
import { waUrl } from '@/lib/contacto';
import { CDN_PC, EQUIPOS, type Equipo } from '@/lib/equipos';
import { hubJson } from '@/lib/hub';

type Linea = { clave: string; nombre: string; detalle?: string; cantidad: number };
type Tipo = 'JURIDICA' | 'NATURAL';

const TIPOS = ['Todos', ...Array.from(new Set(EQUIPOS.map((e) => e.tipo)))];
const lineaDe = (e: Equipo): Linea => ({ clave: e.codigo, nombre: `${e.modelo} (${e.codigo})`, detalle: [e.cpu, e.ram, e.almacenamiento].join(' · '), cantidad: 1 });

const PLAZOS = ['Lo antes posible', 'En 1 a 2 semanas', 'En 1 mes', 'Solo estoy comparando opciones'];
const campo = 'w-full rounded-lg border border-line bg-bg/60 px-4 py-3 text-base text-white outline-none transition placeholder:text-[color:var(--c-ph)] focus:border-cyan';

export default function Cotizador({ inicial }: { inicial?: string }) {
  const [lineas, setLineas] = useState<Linea[]>(() => {
    const e = inicial ? EQUIPOS.find((x) => x.codigo === inicial) : undefined;
    return e ? [lineaDe(e)] : [];
  });
  const [tipo, setTipo] = useState('Todos');
  const [q, setQ] = useState('');
  const [f, setF] = useState({ tipo: 'JURIDICA' as Tipo, nombres: '', apellidos: '', doc: '', empresa: '', email: '', celular: '', plazo: PLAZOS[0], factura: true, mensaje: '', website: '' });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<null | { guardado: boolean; texto: string }>(null);
  const [errorApi, setErrorApi] = useState('');
  const [paso, setPaso] = useState<1 | 2>(1);

  const irA = (n: 1 | 2) => {
    if (n === 2 && !lineas.length) return setErrores({ lineas: 'Agrega al menos un equipo para continuar.' });
    setErrores({});
    setPaso(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const unidades = lineas.reduce((a, l) => a + l.cantidad, 0);
  const lista = useMemo(() => {
    const t = q.toLowerCase().trim();
    return EQUIPOS.filter((e) => (tipo === 'Todos' || e.tipo === tipo) && (!t || `${e.codigo} ${e.modelo} ${e.cpu} ${e.ram} ${e.almacenamiento}`.toLowerCase().includes(t)));
  }, [tipo, q]);

  const cantidadDe = (clave: string) => lineas.find((l) => l.clave === clave)?.cantidad ?? 0;
  const poner = (l: Linea) => setLineas((ls) => (ls.some((x) => x.clave === l.clave) ? ls.map((x) => (x.clave === l.clave ? { ...x, cantidad: x.cantidad + 1 } : x)) : [...ls, l]));
  const cambiar = (clave: string, d: number) =>
    setLineas((ls) => ls.map((l) => (l.clave === clave ? { ...l, cantidad: Math.max(0, l.cantidad + d) } : l)).filter((l) => l.cantidad > 0));
  const quitar = (clave: string) => setLineas((ls) => ls.filter((l) => l.clave !== clave));

  const validar = () => {
    const e: Record<string, string> = {};
    const celular = f.celular.replace(/[\s+-]/g, '').replace(/^51/, '');
    if (!lineas.length) e.lineas = 'Agrega al menos un equipo a tu cotización.';
    if (f.nombres.trim().length < 2) e.nombres = 'Ingresa tus nombres.';
    if (f.apellidos.trim().length < 2) e.apellidos = 'Ingresa tus apellidos.';
    if (!new RegExp(f.tipo === 'JURIDICA' ? '^\\d{11}$' : '^\\d{8}$').test(f.doc)) e.doc = f.tipo === 'JURIDICA' ? 'El RUC tiene 11 dígitos.' : 'El DNI tiene 8 dígitos.';
    if (f.tipo === 'JURIDICA' && f.empresa.trim().length < 2) e.empresa = 'Ingresa la razón social.';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Correo no válido.';
    if (!/^9\d{8}$/.test(celular)) e.celular = 'Celular de 9 dígitos que empiece con 9.';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const detalleTexto = () => lineas.map((l) => `• ${l.cantidad} × ${l.nombre}${l.detalle ? `\n   ${l.detalle}` : ''}`).join('\n');

  const mensajeWa = () =>
    `Hola Quamtu, solicito una cotización:\n\n*Equipos*\n${detalleTexto()}\n\n*Mis datos*\n${f.nombres} ${f.apellidos}${f.empresa ? ` — ${f.empresa}` : ''}\n${f.tipo === 'JURIDICA' ? 'RUC' : 'DNI'}: ${f.doc}\nCorreo: ${f.email}\nCelular: ${f.celular}\nPlazo: ${f.plazo}\nFactura: ${f.factura ? 'Sí' : 'No'}${f.mensaje ? `\nNotas: ${f.mensaje}` : ''}`;

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
      interes: limpio(`Cotización de ${lineas.length} equipo(s)`).slice(0, 120),
      mensaje: limpio(`${detalleTexto()}\nPlazo: ${f.plazo}. Factura: ${f.factura ? 'sí' : 'no'}.${f.mensaje ? ` Notas: ${f.mensaje}` : ''}`).slice(0, 1000),
      origen: 'quamtu-web/cotizar',
      website: f.website,
    };
    try {
      const res = await hubJson('cotizador/leads', cuerpo);
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
  const chip = (activo: boolean) => `min-h-11 shrink-0 rounded-full border px-4 py-2 font-display text-xs transition ${activo ? 'border-cyan bg-cyan/15 text-claro' : 'border-line text-slate-400 hover:border-slate-500'}`;

  if (resultado)
    return (
      <main className="mx-auto max-w-2xl px-5 pb-24 pt-28 text-center">
        <div className="hud p-8 sm:p-12">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-cyan/20 text-claro"><Check size={32} /></span>
          <h1 className="mt-6 font-display text-3xl font-bold">Cotización lista</h1>
          <p className="mt-3 text-lg text-slate-300">{resultado.texto}</p>
          <p className="mt-2 text-sm text-slate-400">{unidades} unidad(es) · {lineas.length} equipo(s)</p>
          <a href={waUrl(mensajeWa())} target="_blank" rel="noreferrer" className="btn-neon mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-sm">
            <MessageCircle size={18} /> CONTINUAR POR WHATSAPP
          </a>
          <p className="mt-6"><a href="/" className="text-sm text-slate-400 underline hover:text-claro">Volver al inicio</a></p>
        </div>
      </main>
    );

  return (
    <main className="mx-auto max-w-7xl px-4 pb-32 pt-24 sm:px-5 sm:pt-28 lg:pb-24">
      <h1 className="font-display text-3xl font-bold sm:text-4xl md:text-5xl">Cotizador <span className="titulo-neon">de equipos</span></h1>
      <p className="mt-3 max-w-2xl text-slate-400">Elige los equipos, indica las cantidades y déjanos tus datos. Un especialista te enviará la cotización formal con precio final y disponibilidad.</p>

      <ol className="mt-8 flex max-w-md items-center">
        {([[1, 'Equipos'], [2, 'Tus datos']] as const).map(([n, t], i) => (
          <li key={n} className="flex flex-1 items-center last:flex-none">
            <button type="button" onClick={() => irA(n)} className="flex items-center gap-2">
              <span className={`grid h-9 w-9 place-items-center rounded-full border text-sm font-bold transition ${paso === n ? 'border-claro bg-boton text-white shadow-[0_0_16px_rgba(35,141,193,.7)]' : paso > n ? 'border-cyan bg-cyan/20 text-claro' : 'border-line text-slate-400'}`}>
                {paso > n ? <Check size={15} /> : n}
              </span>
              <span className={`font-display text-sm ${paso === n ? 'text-white' : 'text-slate-400'}`}>{t}</span>
            </button>
            {i === 0 && <span className={`mx-3 h-0.5 flex-1 rounded ${paso > 1 ? 'bg-cyan' : 'bg-line'}`} />}
          </li>
        ))}
      </ol>

      <form onSubmit={enviar} noValidate className="mt-6 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-8">
          {/* 1. EQUIPOS */}
          {paso === 1 && (
          <section className="glass rounded-2xl p-4 sm:p-6">
            <h2 className="font-display text-xl font-bold"><span className="text-claro">1.</span> Elige tus equipos</h2>
            <div className="relative mt-4">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar equipo" placeholder="Buscar por código, modelo o procesador…" className={`${campo} pl-11`} />
            </div>
            <div className="sin-barra mt-3 flex gap-2 overflow-x-auto pb-1">
              {TIPOS.map((t) => (
                <button key={t} type="button" onClick={() => setTipo(t)} className={chip(tipo === t)}>{t}</button>
              ))}
            </div>
            <div className="mt-4 grid max-h-[560px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {lista.slice(0, 60).map((e) => {
                const n = cantidadDe(e.codigo);
                return (
                  <div key={e.codigo} className={`flex items-center gap-3 rounded-xl border p-3 ${n ? 'border-cyan bg-cyan/10' : 'border-line bg-bg/50'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={CDN_PC + e.imagen} alt="" loading="lazy" width={56} height={56} className="h-14 w-14 shrink-0 rounded-lg bg-white/5 object-contain" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{e.modelo}</p>
                      <p className="truncate font-mono text-xs text-claro">{e.codigo}</p>
                      <p className="truncate text-xs text-slate-400">{e.cpu} · {e.ram}</p>
                    </div>
                    {n ? (
                      <Paso n={n} onMenos={() => cambiar(e.codigo, -1)} onMas={() => cambiar(e.codigo, 1)} />
                    ) : (
                      <button type="button" onClick={() => poner(lineaDe(e))} aria-label={`Agregar ${e.modelo} ${e.codigo}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-claro/50 text-claro hover:bg-cyan/20"><Plus size={16} /></button>
                    )}
                  </div>
                );
              })}
              {!lista.length && <p className="col-span-full py-6 text-center text-sm text-slate-400">Sin resultados.</p>}
              {lista.length > 60 && <p className="col-span-full py-2 text-center text-xs text-slate-400">Mostrando 60 de {lista.length}: afina la búsqueda para ver otros.</p>}
            </div>
            {errores.lineas && <p className="mt-3 text-sm text-red-400">{errores.lineas}</p>}
            <button type="button" onClick={() => irA(2)} className="btn-neon mt-6 flex items-center gap-2 rounded-full px-8 py-3.5 font-display text-sm">
              CONTINUAR <ArrowRight size={16} />
            </button>
          </section>
          )}

          {/* 2. DATOS */}
          {paso === 2 && (
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
            <button type="button" onClick={() => irA(1)} className="mt-6 flex items-center gap-2 text-sm text-slate-400 hover:text-claro">
              <ArrowLeft size={15} /> Volver a mis equipos
            </button>
          </section>
          )}
        </div>

        {/* RESUMEN */}
        <aside className="glass rounded-2xl p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-bold">Tu cotización</h2>
          {!lineas.length ? (
            <p className="mt-4 text-sm text-slate-400">Aún no agregaste equipos.</p>
          ) : (
            <ul className="mt-4 max-h-[340px] divide-y divide-line/60 overflow-y-auto">
              {lineas.map((l) => (
                <li key={l.clave} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 break-words text-sm font-bold">{l.nombre}</p>
                    <button type="button" onClick={() => quitar(l.clave)} aria-label={`Quitar ${l.nombre}`} className="shrink-0 text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                  <div className="mt-2">
                    <Paso n={l.cantidad} onMenos={() => cambiar(l.clave, -1)} onMas={() => cambiar(l.clave, 1)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
            <span className="text-xs tracking-widest text-slate-400">UNIDADES</span>
            <span className="titulo-neon font-display text-2xl font-bold">{unidades}</span>
          </div>
          {errorApi && <p className="mt-3 text-sm text-red-400">{errorApi}</p>}
          {paso === 1 ? (
            <button type="button" onClick={() => irA(2)} className="btn-neon mt-5 flex w-full items-center justify-center gap-2 rounded-full py-4 font-display text-sm">
              CONTINUAR <ArrowRight size={16} />
            </button>
          ) : (
            <button disabled={enviando} className="btn-neon mt-5 flex w-full items-center justify-center gap-2 rounded-full py-4 font-display text-sm disabled:opacity-60">
              {enviando ? <Loader2 size={18} className="animate-spin" /> : <ClipboardList size={18} />} SOLICITAR COTIZACIÓN
            </button>
          )}
          <p className="mt-3 text-xs text-slate-400">Los equipos se trabajan por cotización: la respuesta incluye precio final, stock y tiempo de entrega.</p>
        </aside>

        {/* Barra fija en celular */}
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur lg:hidden">
          <div>
            <span className="block text-xs tracking-widest text-slate-400">{lineas.length} EQUIPO(S)</span>
            <b className="font-display text-lg text-claro">{unidades} unid.</b>
          </div>
          {paso === 1 ? (
            <button type="button" onClick={() => irA(2)} className="btn-neon rounded-full px-6 py-3 font-display text-xs">CONTINUAR</button>
          ) : (
            <button disabled={enviando} className="btn-neon inline-flex items-center gap-1.5 rounded-full px-6 py-3 font-display text-xs disabled:opacity-60"><ClipboardList size={15} /> SOLICITAR</button>
          )}
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
