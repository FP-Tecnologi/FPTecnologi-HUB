'use client';
import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, Check, ExternalLink, MessageCircle, Pencil, Receipt, ShoppingCart, X } from 'lucide-react';
import PcEscena from './PcEscena';
import ImgPieza from './ImgPieza';
import { agregarAlCarrito, mensajeWhatsApp, type ItemCarrito } from '@/lib/carrito';
import { waUrl } from '@/lib/contacto';
import { CATS, avisoFuente, incompatible, porCat, seleccionDe, total, type Opcion, type Seleccion } from '@/lib/piezas';

const soles = (n: number) => `S/ ${n.toLocaleString('es-PE')}`;
type Modo = 'pc' | 'repuestos';

// Total sobre el gabinete: el número corre hasta el nuevo valor y un "+S/ x" / "-S/ x" avisa el cambio.
function PrecioVivo({ valor }: { valor: number }) {
  const [mostrado, setMostrado] = useState(valor);
  const [delta, setDelta] = useState(0);
  const actual = useRef(valor);
  const previo = useRef(valor);

  useEffect(() => {
    const d = valor - previo.current;
    previo.current = valor;
    let fin: ReturnType<typeof setTimeout> | undefined;
    if (d !== 0) {
      setDelta(d);
      fin = setTimeout(() => setDelta(0), 1800);
    }
    const desde = actual.current;
    const t0 = performance.now();
    let raf = 0;
    const paso = (t: number) => {
      const k = Math.min(1, (t - t0) / 700);
      actual.current = Math.round(desde + (valor - desde) * (1 - Math.pow(1 - k, 3)));
      setMostrado(actual.current);
      if (k < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fin);
    };
  }, [valor]);

  return (
    <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 text-center">
      <span className="block text-[10px] tracking-[0.35em] text-slate-400">PRESUPUESTO</span>
      <div className="relative inline-block">
        <span className="titulo-neon font-display text-4xl font-bold md:text-5xl">{soles(mostrado)}</span>
        {delta !== 0 && (
          <span
            key={previo.current}
            className={`absolute -right-3 top-0 translate-x-full whitespace-nowrap rounded-full px-2.5 py-1 font-display text-xs font-bold ${delta > 0 ? 'bg-cyan/25 text-claro' : 'bg-red-500/20 text-red-300'}`}
          >
            {delta > 0 ? '+' : '−'} {soles(Math.abs(delta))}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Builder({ inicial = [] }: { inicial?: string[] }) {
  const [sel, setSel] = useState<Seleccion>(() => seleccionDe(inicial));
  const [paso, setPaso] = useState(0); // 0..7 = piezas; 8 = presupuesto
  const [ultima, setUltima] = useState<string | undefined>();
  const [modo, setModo] = useState<Modo>('pc');
  const [agregado, setAgregado] = useState(false);

  const FIN = CATS.length;
  const enResumen = paso === FIN;
  const cat = CATS[Math.min(paso, FIN - 1)];
  const elegidas = CATS.filter((c) => sel[c.id]);
  const faltan = CATS.filter((c) => !sel[c.id]);
  const aviso = avisoFuente(sel);
  const pcLista = faltan.length === 0 && !aviso;
  const puedeComprar = modo === 'pc' ? pcLista : elegidas.length > 0;

  // Al cambiar de paso desaparece la etiqueta de la última pieza elegida.
  const ir = (n: number) => {
    setUltima(undefined);
    setPaso(Math.max(0, Math.min(FIN, n)));
  };

  const elegir = (o: Opcion) => {
    setAgregado(false);
    const quita = sel[o.cat]?.id === o.id;
    setUltima(quita ? undefined : o.id);
    setSel((s) => ({ ...s, [o.cat]: quita ? undefined : o }));
  };

  const item = (): ItemCarrito => ({ tipo: 'build', ids: elegidas.map((c) => sel[c.id]!.id), total: total(sel), modo });
  const alCarrito = () => {
    agregarAlCarrito(item());
    setAgregado(true);
  };
  const whatsapp = (intro: string) => waUrl(mensajeWhatsApp([item()], intro));

  return (
    <main className="min-h-screen pt-16">
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[minmax(0,560px)_1fr]">
        {/* ASISTENTE (izquierda) */}
        <section className="order-2 flex flex-col border-line bg-panel/40 lg:order-1 lg:h-[calc(100vh-4rem)] lg:border-r">
          {/* Encabezado + progreso */}
          <div className="border-b border-line px-5 pb-4 pt-5 lg:px-7">
            <div className="flex items-baseline justify-between">
              <h1 className="font-display text-xl font-bold">Arma tu <span className="text-claro">setup</span></h1>
              <span className="text-xs tracking-widest text-slate-500">{enResumen ? 'PRESUPUESTO' : `PASO ${paso + 1} DE ${FIN}`}</span>
            </div>
            <ol className="mt-4 flex items-center">
              {CATS.map((c, i) => {
                const hecho = !!sel[c.id];
                const actual = i === paso;
                return (
                  <li key={c.id} className="flex flex-1 items-center">
                    <button
                      onClick={() => ir(i)}
                      aria-label={c.titulo}
                      aria-current={actual ? 'step' : undefined}
                      title={c.titulo}
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[11px] font-bold transition ${
                        actual ? 'scale-110 border-claro bg-cyan text-white shadow-[0_0_16px_rgba(35,141,193,.7)]'
                        : hecho ? 'border-cyan bg-cyan/20 text-claro' : 'border-line text-slate-500 hover:border-slate-500'
                      }`}
                    >
                      {hecho && !actual ? <Check size={14} /> : c.paso}
                    </button>
                    <span className={`mx-1 h-0.5 flex-1 rounded transition-colors ${hecho ? 'bg-cyan' : 'bg-line'}`} />
                  </li>
                );
              })}
              <li>
                <button
                  onClick={() => ir(FIN)}
                  aria-label="Presupuesto"
                  title="Presupuesto"
                  className={`grid h-8 w-8 place-items-center rounded-full border transition ${
                    enResumen ? 'scale-110 border-claro bg-cyan text-white shadow-[0_0_16px_rgba(35,141,193,.7)]' : 'border-line text-slate-500 hover:border-slate-500'
                  }`}
                >
                  <Receipt size={14} />
                </button>
              </li>
            </ol>
          </div>

          {/* Contenido del paso */}
          <div className="flex-1 overflow-y-auto px-5 py-6 lg:px-7">
            {!enResumen ? (
              <>
                <h2 className="font-display text-2xl font-bold md:text-3xl">Elige tu <span className="titulo-neon">{cat.titulo.toLowerCase()}</span></h2>
                <p className="mt-2 text-slate-400">{cat.ayuda}</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {porCat(cat.id).map((o) => {
                    const activo = sel[o.cat]?.id === o.id;
                    const bloqueo = incompatible(o, sel);
                    const compatible = !bloqueo && !!o.socket && !!(o.cat === 'placa' ? sel.cpu : o.cat === 'cpu' ? sel.placa : undefined);
                    const datos = [...o.spec.split(' · '), ...(o.watts ? [o.cat === 'fuente' ? `${o.watts} W` : `~${o.watts} W`] : [])];
                    return (
                      <article
                        key={o.id}
                        role="button"
                        tabIndex={bloqueo ? -1 : 0}
                        aria-pressed={activo}
                        aria-disabled={!!bloqueo}
                        onClick={() => !bloqueo && elegir(o)}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !bloqueo && (e.preventDefault(), elegir(o))}
                        className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-bg/50 text-left transition ${
                          activo ? 'bg-cyan/10' : 'border-line hover:-translate-y-0.5 hover:border-slate-500'
                        } ${bloqueo ? 'cursor-not-allowed opacity-45' : ''}`}
                        style={activo ? { borderColor: o.color, boxShadow: `0 0 28px ${o.color}45` } : undefined}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-panel to-bg">
                          <ImgPieza id={o.id} cat={o.cat} color={o.color} className="h-full w-full" />
                          {activo && (
                            <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-cyan px-2.5 py-1 text-[10px] font-bold tracking-wider text-white">
                              <Check size={12} /> ELEGIDO
                            </span>
                          )}
                          {compatible && !activo && (
                            <span className="absolute left-2.5 top-2.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold tracking-wider text-emerald-300">✓ COMPATIBLE</span>
                          )}
                          <a
                            href={`/producto/${o.id}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Ver detalles de ${o.nombre}`}
                            className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-bg/70 text-slate-300 opacity-0 backdrop-blur transition hover:text-claro group-hover:opacity-100 focus:opacity-100"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                          <b className="font-display text-[15px] leading-snug">{o.nombre}</b>
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {datos.map((d) => (
                              <span key={d} className="rounded-md border border-line bg-panel px-2 py-0.5 text-[11px] text-slate-300">{d}</span>
                            ))}
                          </div>
                          {bloqueo && <p className="mt-2 text-xs text-amber-300/90">{bloqueo}</p>}
                          <div className="mt-auto flex items-end justify-between pt-4">
                            <span className="font-display text-xl font-bold text-claro">{soles(o.precio)}</span>
                            <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wider ${activo ? 'bg-cyan text-white' : 'border border-claro/50 text-claro'}`}>
                              {activo ? 'QUITAR' : 'ELEGIR'}
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold md:text-3xl">Tu <span className="titulo-neon">presupuesto</span></h2>

                {/* PC armada o solo repuestos */}
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {([
                    ['pc', 'PC armada por Quamtu', 'Ensamblaje, pruebas de estrés y garantía. Requiere las 8 piezas.'],
                    ['repuestos', 'Solo componentes', 'Compra únicamente las piezas que elegiste, como repuestos.'],
                  ] as const).map(([m, t, d]) => (
                    <button
                      key={m}
                      onClick={() => setModo(m)}
                      className={`rounded-xl border p-4 text-left transition ${modo === m ? 'border-cyan bg-cyan/10 shadow-[0_0_22px_rgba(35,141,193,.3)]' : 'border-line hover:border-slate-500'}`}
                    >
                      <b className="flex items-center justify-between">{t}{modo === m && <Check size={16} className="text-claro" />}</b>
                      <span className="mt-1 block text-sm text-slate-400">{d}</span>
                    </button>
                  ))}
                </div>

                <ul className="mt-6 divide-y divide-line rounded-xl border border-line">
                  {CATS.map((c, i) => {
                    const o = sel[c.id];
                    return (
                      <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                        <span className="w-24 shrink-0 text-xs tracking-wider text-slate-500">{c.titulo.toUpperCase()}</span>
                        {o ? (
                          <>
                            <span className="min-w-0 flex-1 truncate">{o.nombre}</span>
                            <span className="font-display text-sm text-claro">{soles(o.precio)}</span>
                          </>
                        ) : (
                          <span className="flex-1 text-amber-300/80">Sin elegir</span>
                        )}
                        <button onClick={() => ir(i)} aria-label={`${o ? 'Cambiar' : 'Elegir'} ${c.titulo}`} className="text-slate-500 hover:text-claro">
                          <Pencil size={14} />
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {aviso && (
                  <p className="mt-4 flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-300">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {aviso}
                  </p>
                )}
                {modo === 'pc' && faltan.length > 0 && (
                  <p className="mt-4 flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-300">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    Faltan {faltan.length} piezas para armar la PC completa. Complétalas o cambia a “Solo componentes”.
                  </p>
                )}

                <div className="glass mt-6 rounded-2xl p-5">
                  <div className="flex items-end justify-between">
                    <span className="text-xs tracking-widest text-slate-500">TOTAL REFERENCIAL</span>
                    <span className="titulo-neon font-display text-3xl font-bold">{soles(total(sel))}</span>
                  </div>
                  <div className="mt-5 grid gap-3">
                    <a
                      href={puedeComprar ? whatsapp(modo === 'pc' ? 'Hola Quamtu, quiero comprar esta PC armada a medida:' : 'Hola Quamtu, quiero comprar estos componentes:') : undefined}
                      target="_blank"
                      rel="noreferrer"
                      aria-disabled={!puedeComprar}
                      className={`btn-neon flex items-center justify-center gap-2 rounded-full py-4 font-display text-sm ${puedeComprar ? '' : 'pointer-events-none opacity-40'}`}
                    >
                      <MessageCircle size={18} /> COMPRAR POR WHATSAPP
                    </a>
                    <button
                      disabled={!puedeComprar}
                      onClick={alCarrito}
                      className="btn-borde flex items-center justify-center gap-2 rounded-full py-4 font-display text-sm disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ShoppingCart size={16} /> {agregado ? 'AÑADIDO AL CARRITO ✓' : 'AÑADIR AL CARRITO'}
                    </button>
                    <a
                      href={puedeComprar ? whatsapp('Hola Quamtu, necesito una cotización para mi empresa con esta configuración:') : undefined}
                      target="_blank"
                      rel="noreferrer"
                      aria-disabled={!puedeComprar}
                      className={`text-center text-sm text-slate-400 underline hover:text-claro ${puedeComprar ? '' : 'pointer-events-none opacity-40'}`}
                    >
                      Cotizar para mi empresa
                    </a>
                  </div>
                </div>
                <button onClick={() => { setSel({}); setUltima(undefined); ir(0); setAgregado(false); }} className="mx-auto mt-5 flex items-center gap-1 text-xs text-slate-500 hover:text-red-400">
                  <X size={12} /> Empezar de nuevo
                </button>
              </>
            )}
          </div>

          {/* Barra de navegación fija */}
          <div className="flex items-center gap-3 border-t border-line bg-bg/80 px-5 py-4 backdrop-blur lg:px-7">
            <button
              onClick={() => ir(paso - 1)}
              disabled={paso === 0}
              className="btn-borde flex items-center gap-1 rounded-full px-5 py-3 font-display text-xs disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowLeft size={14} /> ATRÁS
            </button>
            <div className="flex-1 text-center">
              <span className="block text-[10px] tracking-widest text-slate-500">TOTAL</span>
              <b className="font-display text-lg text-claro">{soles(total(sel))}</b>
            </div>
            {!enResumen && (
              <button onClick={() => ir(paso + 1)} className="btn-neon flex items-center gap-1 rounded-full px-5 py-3 font-display text-xs">
                {paso === FIN - 1 ? 'VER PRESUPUESTO' : sel[cat.id] ? 'SIGUIENTE' : 'OMITIR'} <ArrowRight size={14} />
              </button>
            )}
          </div>
        </section>

        {/* VISOR 3D (derecha): se va armando a medida que eliges */}
        <section className="relative order-1 h-[44vh] lg:sticky lg:top-16 lg:order-2 lg:h-[calc(100vh-4rem)]">
          <div className="rejilla absolute inset-0 -z-10" />
          <div className="absolute left-1/2 top-1/3 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan/15 blur-[120px]" />
          <PcEscena sel={sel} etiquetas foco={ultima} className="h-full" />
          <PrecioVivo valor={total(sel)} />
          <div className="pointer-events-none absolute bottom-4 left-5 hidden text-xs tracking-widest text-slate-500 lg:block">
            ARRASTRA PARA GIRAR · PASA EL MOUSE SOBRE UNA PIEZA
          </div>
          <div className="pointer-events-none absolute right-5 top-4 text-right">
            <span className="block text-[10px] tracking-widest text-slate-500">PIEZAS</span>
            <b className="font-display text-2xl text-claro">{elegidas.length}<span className="text-slate-600">/{FIN}</span></b>
          </div>
        </section>
      </div>
    </main>
  );
}
