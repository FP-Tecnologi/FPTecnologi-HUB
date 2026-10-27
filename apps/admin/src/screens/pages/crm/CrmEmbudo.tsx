'use client';
/*
 * FPTecnologi-HUB — CRM → Embudo: tablero por etapas (Nuevo → Contactado → Propuesta → Negociación → Ganado /
 * Perdido), en dos vistas: Tablero (columnas; se arrastra una tarjeta para cambiar su etapa) y Lista (una tabla por
 * etapa, más compacta). En ambas, el selector de etapa de cada fila/tarjeta también mueve (teclado y celular) y arriba
 * va el resumen del embudo. Clic = ficha completa. Las solicitudes de la web entran solas en «Nuevo»; el resto es manual.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../../components/shell/PageHead';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import {
  Alerta, ETAPAS, NuevaOportunidad, OportunidadPanel, dinero, etapa, msg, montos, nombreDe, pedirMotivo, vencida, fechaCorta, type Etapa, type Oportunidad,
} from './comun';

type Vista = 'tablero' | 'lista';
const CLAVE_VISTA = 'crm:vista-embudo';
const sumar = (lista: Oportunidad[]) => lista.reduce<Record<string, number>>((a, o) => ((a[o.moneda] = (a[o.moneda] ?? 0) + Number(o.monto ?? 0)), a), {});

export function CrmEmbudo() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Oportunidad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mias, setMias] = useState(false);
  const [cerradas, setCerradas] = useState(false);
  const [q, setQ] = useState('');
  const [abierta, setAbierta] = useState<string | null>(null);
  // ?id=<oportunidad> abre su ficha (enlaces «Ver en CRM» y de la Agenda).
  useEffect(() => { const id = new URLSearchParams(window.location.search).get('id'); if (id) setAbierta(id); }, []);
  const [nueva, setNueva] = useState(false);
  const [arrastrando, setArrastrando] = useState<string | null>(null);
  const [sobre, setSobre] = useState<Etapa | null>(null);
  const [vista, setVistaEstado] = useState<Vista>('tablero');
  // La vista elegida se recuerda en este navegador (si el almacenamiento no está disponible, queda el tablero).
  useEffect(() => { try { if (localStorage.getItem(CLAVE_VISTA) === 'lista') setVistaEstado('lista'); } catch { /* sin almacenamiento */ } }, []);
  const setVista = (v: Vista) => { setVistaEstado(v); try { localStorage.setItem(CLAVE_VISTA, v); } catch { /* sin almacenamiento */ } };

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try {
      const qs = new URLSearchParams({ estado: cerradas ? 'todas' : 'abiertas', ...(mias ? { asignado: 'yo' } : {}) });
      setLista(await api.get<Oportunidad[]>(`/crm/oportunidades?${qs}`));
      setError('');
    } catch (e) { setError(msg(e, 'No se pudo cargar el embudo.')); } finally { setCargando(false); }
  }, [activeMarcaId, mias, cerradas]);
  useEffect(() => { cargar(); }, [cargar]);

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? lista.filter((o) => [o.numero, o.titulo, o.empresa?.razonSocial, o.contacto?.nombre, o.contacto?.email].some((v) => v?.toLowerCase().includes(t))) : lista;
  }, [lista, q]);
  const columnas = ETAPAS.filter((e) => cerradas || !['GANADO', 'PERDIDO'].includes(e.v));

  async function mover(id: string, destino: Etapa) {
    const o = lista.find((x) => x.id === id);
    if (!o || o.etapa === destino) return;
    const motivoPerdida = destino === 'PERDIDO' ? pedirMotivo() : undefined;
    if (destino === 'PERDIDO' && !motivoPerdida) return;
    setLista((l) => l.map((x) => (x.id === id ? { ...x, etapa: destino } : x)));
    try { await api.patch(`/crm/oportunidades/${id}/etapa`, { etapa: destino, motivoPerdida }); } catch (e) { setError(msg(e, 'No se pudo mover.')); }
    cargar();
  }

  return (
    <>
      <PageHead title="Embudo comercial" subtitle="Oportunidades por etapa. Muévelas arrastrando la tarjeta o con su selector de etapa; las solicitudes de la web entran solas en «Nuevo»." actions={<button type="button" className="ax-btn ax-btn--primary" onClick={() => setNueva(true)}><span className="ax-btn__label">Nueva oportunidad</span></button>} />
      {error && <div style={{ marginBlockEnd: 'var(--ax-space-4)' }}><Alerta>{error}</Alerta></div>}

      <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', marginBlockEnd: 'var(--ax-space-4)', flexWrap: 'wrap' }}>
        <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Vista">
          <button type="button" role="radio" aria-checked={vista === 'tablero'} className={`ax-btn ax-btn--sm${vista === 'tablero' ? ' is-selected' : ''}`} onClick={() => setVista('tablero')}>Tablero</button>
          <button type="button" role="radio" aria-checked={vista === 'lista'} className={`ax-btn ax-btn--sm${vista === 'lista' ? ' is-selected' : ''}`} onClick={() => setVista('lista')}>Lista</button>
        </div>
        <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="De quién">
          <button type="button" role="radio" aria-checked={!mias} className={`ax-btn ax-btn--sm${!mias ? ' is-selected' : ''}`} onClick={() => setMias(false)}>Todas</button>
          <button type="button" role="radio" aria-checked={mias} className={`ax-btn ax-btn--sm${mias ? ' is-selected' : ''}`} onClick={() => setMias(true)}>Mías</button>
        </div>
        <label className="ax-cluster" style={{ gap: 'var(--ax-space-2)', fontSize: 'var(--ax-text-sm)' }}>
          <input type="checkbox" checked={cerradas} onChange={(e) => setCerradas(e.target.checked)} /> Ver ganadas y perdidas
        </label>
        <input type="search" className="ax-input" placeholder="Buscar cliente, empresa, n.º…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar oportunidades" style={{ maxWidth: 280 }} />
      </div>

      {/* Resumen del embudo: cantidad y monto por etapa (el ancho de cada tramo sigue a la cantidad). */}
      <div>
        <section aria-label="Resumen del embudo" className="ax-card" style={{ padding: 'var(--ax-space-3)' }}>
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
            {columnas.map((col) => {
              const items = visibles.filter((o) => o.etapa === col.v);
              return (
                <div key={col.v} style={{ flex: `${Math.max(items.length, 1)} 1 120px`, minWidth: 120, borderRadius: 'var(--ax-radius-md)', padding: 'var(--ax-space-2) var(--ax-space-3)', background: 'var(--ax-surface-subtle)', borderInlineStart: `4px solid ${col.color}` }}>
                  <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)' }}>{col.label}</div>
                  <div className="ax-num" style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>{items.length} · {montos(sumar(items))}</div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {vista === 'lista' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
          {columnas.map((col) => {
            const items = visibles.filter((o) => o.etapa === col.v);
            return (
              <details key={col.v} open={items.length > 0} className="ax-card" style={{ borderInlineStart: `4px solid ${col.color}` }}>
                <summary className="ax-card__body ax-cluster" style={{ cursor: 'pointer', gap: 'var(--ax-space-3)', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>{col.label} <span className="ax-badge ax-badge--soft ax-badge--sm">{items.length}</span></span>
                  <span className="ax-num" style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>{montos(sumar(items))}</span>
                </summary>
                {items.length === 0 ? <p style={{ margin: 0, padding: '0 var(--ax-space-5) var(--ax-space-4)', fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-subtle)' }}>Sin oportunidades.</p> : (
                  <div className="ax-table-wrap">
                    <table className="ax-table ax-table--hover">
                      <thead className="ax-table__head"><tr>
                        <th className="ax-table__th" scope="col">Oportunidad</th><th className="ax-table__th" scope="col">Cliente</th><th className="ax-table__th" scope="col">Monto</th>
                        <th className="ax-table__th" scope="col">Responsable</th><th className="ax-table__th" scope="col">Próxima acción</th><th className="ax-table__th" scope="col">Etapa</th>
                      </tr></thead>
                      <tbody>
                        {items.map((o) => (
                          <tr key={o.id} className="ax-table__row" onClick={() => setAbierta(o.id)} style={{ cursor: 'pointer' }}>
                            <td className="ax-table__td"><div style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>{o.titulo}</div><div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{o.numero}</div></td>
                            <td className="ax-table__td">{o.empresa?.razonSocial ?? o.contacto?.nombre ?? '—'}</td>
                            <td className="ax-table__td ax-num">{dinero(o.monto, o.moneda)}</td>
                            <td className="ax-table__td" style={{ color: o.asignado ? undefined : 'var(--ax-text-subtle)' }}>{nombreDe(o.asignado)}</td>
                            <td className="ax-table__td" style={{ fontSize: 'var(--ax-text-sm)', color: vencida(o.proximaAccionAt) ? 'var(--ax-danger-500)' : 'var(--ax-text-muted)' }}>
                              {o.proximaAccion ? `${o.proximaAccion}${o.proximaAccionAt ? ` · ${fechaCorta(o.proximaAccionAt)}` : ''}` : '—'}
                            </td>
                            <td className="ax-table__td" onClick={(e) => e.stopPropagation()}>
                              <select aria-label={`Mover ${o.numero} a otra etapa`} className="ax-select" value={o.etapa} onChange={(e) => mover(o.id, e.target.value as Etapa)} style={{ minWidth: 170 }}>
                                {ETAPAS.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </details>
            );
          })}
        </div>
      ) : (
      <div style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(250px, 1fr)', gap: 'var(--ax-space-3)', overflowX: 'auto', paddingBlockEnd: 'var(--ax-space-3)' }}>
        {columnas.map((col) => {
          const items = visibles.filter((o) => o.etapa === col.v);
          return (
            <section key={col.v} aria-label={col.label} className="ax-card ax-card--flat"
              onDragOver={(e) => { e.preventDefault(); setSobre(col.v); }} onDragLeave={() => setSobre((s) => (s === col.v ? null : s))}
              onDrop={(e) => { e.preventDefault(); setSobre(null); const id = e.dataTransfer.getData('text/plain'); if (id) mover(id, col.v); }}
              style={{ padding: 'var(--ax-space-3)', minHeight: 320, borderTop: `3px solid ${col.color}`, outline: sobre === col.v && arrastrando ? '2px dashed var(--ax-accent)' : undefined }}>
              <header style={{ marginBlockEnd: 'var(--ax-space-3)' }}>
                <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
                  <h2 style={{ margin: 0, fontSize: 'var(--ax-text-sm)', fontWeight: 'var(--ax-weight-semibold)' }}>{col.label}</h2>
                  <span className="ax-badge ax-badge--soft ax-badge--sm">{items.length}</span>
                </div>
                <div className="ax-num" style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)' }}>{montos(sumar(items))}</div>
              </header>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-2)' }}>
                {cargando ? <p style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-subtle)' }}>Cargando…</p> : items.length === 0 ? (
                  <p style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)', margin: 0 }}>Sin oportunidades.</p>
                ) : items.map((o) => (
                  <article key={o.id} draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', o.id); setArrastrando(o.id); }} onDragEnd={() => setArrastrando(null)}
                    className="ax-card" style={{ padding: 'var(--ax-space-3)', cursor: 'grab', opacity: arrastrando === o.id ? 0.5 : 1 }}>
                    <button type="button" onClick={() => setAbierta(o.id)} style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%' }} aria-label={`Abrir ${o.numero} ${o.titulo}`}>
                      <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{o.numero}</div>
                      <div style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)', lineHeight: 1.3 }}>{o.titulo}</div>
                      <div style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>{o.empresa?.razonSocial ?? o.contacto?.nombre ?? '—'}</div>
                      <div className="ax-cluster" style={{ justifyContent: 'space-between', marginBlockStart: 'var(--ax-space-2)', fontSize: 'var(--ax-text-xs)' }}>
                        <b className="ax-num">{dinero(o.monto, o.moneda)}</b>
                        <span style={{ color: o.asignado ? 'var(--ax-text-muted)' : 'var(--ax-warning-600, var(--ax-viz-amber))' }}>{nombreDe(o.asignado)}</span>
                      </div>
                      {o.proximaAccion && (
                        <div style={{ marginBlockStart: 'var(--ax-space-2)', fontSize: 'var(--ax-text-xs)', color: vencida(o.proximaAccionAt) ? 'var(--ax-danger-500)' : 'var(--ax-text-muted)' }}>
                          {vencida(o.proximaAccionAt) ? '⚠ ' : '→ '}{o.proximaAccion}{o.proximaAccionAt ? ` · ${fechaCorta(o.proximaAccionAt)}` : ''}
                        </div>
                      )}
                    </button>
                    <select aria-label={`Mover ${o.numero} a otra etapa`} className="ax-select" value={o.etapa} onChange={(e) => mover(o.id, e.target.value as Etapa)}
                      style={{ marginBlockStart: 'var(--ax-space-2)', fontSize: 'var(--ax-text-xs)', minHeight: 30, padding: '2px 8px' }}>
                      {ETAPAS.map((e) => <option key={e.v} value={e.v}>{etapa(e.v).label}</option>)}
                    </select>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      )}

      {abierta && <OportunidadPanel id={abierta} onClose={() => setAbierta(null)} onCambio={cargar} />}
      {nueva && <NuevaOportunidad onClose={() => setNueva(false)} onCreada={(id) => { setNueva(false); cargar(); setAbierta(id); }} />}
    </>
  );
}

export default CrmEmbudo;
