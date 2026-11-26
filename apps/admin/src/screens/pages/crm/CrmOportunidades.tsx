'use client';
/*
 * FPTecnologi-HUB — CRM → Oportunidades: lista con filtros (estado, etapa, responsable, origen, búsqueda) y alta
 * manual. ?id=<oportunidad> abre su ficha (lo usa «Ver en CRM» de las bandejas de Leads, Cotizaciones y Contactos).
 */
import { useCallback, useEffect, useState } from 'react';
import { PageHead } from '../../../components/shell/PageHead';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import {
  Alerta, BotonIcono, ETAPAS, NuevaOportunidad, ORIGENES, TIPOS_PROCESO, OportunidadPanel, aFecha, dinero, etapa, fechaCorta, msg, nombreDe, useAsignables, useConfirmar, vencida, type Etapa, type Oportunidad, type Origen, EtiquetaResponsable, useVeTodoCrm, useAlcanceMarcas, SelectorAlcance, EtiquetaMarca, useFichaOportunidad,
} from './comun';
import { teclaFila } from '../../../lib/teclado';
import { descargarCsv } from '../../../lib/csv';
import { Select } from '../../../components/ui/Select';

export function CrmOportunidades({ propio = false }: { propio?: boolean }) {
  const { activeMarcaId, marcas } = useAuth();
  // En la lista consolidada el rol depende de la marca de cada fila.
  const esAdminDe = (marcaId?: string) => marcas.find((m) => m.marcaId === (marcaId ?? activeMarcaId))?.rol.nombre === 'admin';
  const asignables = useAsignables();
  const { veTodo: veTodoRol } = useVeTodoCrm();
  const veTodo = veTodoRol && !propio; // «Mis oportunidades»: siempre solo las mías, sin selector de responsable
  const [lista, setLista] = useState<Oportunidad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [estado, setEstado] = useState<'abiertas' | 'cerradas' | 'todas'>('abiertas');
  const [et, setEt] = useState<'' | Etapa>('');
  const [asignado, setAsignado] = useState('');
  const [origen, setOrigen] = useState<'' | Origen>('');
  const [tipo, setTipo] = useState('');
  const [q, setQ] = useState('');
  const alcance = useAlcanceMarcas();
  const [abierta, setAbierta] = useFichaOportunidad(lista, alcance.todas);
  // ?id=<oportunidad> abre su ficha (enlaces «Ver en CRM» y de la Agenda).
  useEffect(() => { const id = new URLSearchParams(window.location.search).get('id'); if (id) setAbierta(id); }, []);
  const [nueva, setNueva] = useState(false);
  const [ok, setOk] = useState('');
  const { confirmar, dialogo } = useConfirmar();

  // Solo admin (la API también lo exige): para oportunidades mal registradas o duplicadas.
  async function eliminar(o: Oportunidad) {
    if (!(await confirmar('Eliminar oportunidad', `¿Eliminar ${o.numero} «${o.titulo}»? Se borra también su historial. La empresa y el contacto se conservan.`))) return;
    try { await api.delete(`/crm/oportunidades/${o.id}`, { marcaId: alcance.todas ? o.marcaId : undefined }); setOk(`${o.numero} eliminada.`); setError(''); cargar(); } catch (e) { setOk(''); setError(msg(e, 'No se pudo eliminar.')); }
  }

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    const qs = new URLSearchParams({ estado, ...(et ? { etapa: et } : {}), ...(propio ? { asignado: 'yo' } : asignado ? { asignado } : {}), ...(tipo ? { tipoProceso: tipo } : {}), ...(origen ? { origen } : {}), ...(q.trim() ? { q: q.trim() } : {}) });
    try { setLista(await api.get<Oportunidad[]>(`${alcance.ruta}?${qs}`)); setError(''); } catch (e) { setError(msg(e, 'No se pudieron cargar las oportunidades.')); } finally { setCargando(false); }
  }, [activeMarcaId, estado, et, asignado, origen, tipo, propio, q, alcance.ruta]);
  useEffect(() => { const t = setTimeout(cargar, 250); return () => clearTimeout(t); }, [cargar]);

  const exportar = () => descargarCsv('oportunidades',
    ['Número', 'Marca', 'Título', 'Etapa', 'Empresa', 'RUC', 'Contacto', 'Correo', 'Celular', 'Proceso', 'Moneda', 'Monto', 'Responsable', 'Próxima acción', 'Fecha próxima acción', 'Cierre estimado', 'Origen', 'Motivo de pérdida', 'Creada'],
    lista.map((o) => [o.numero, o.marca?.nombre ?? marcas.find((m) => m.marcaId === activeMarcaId)?.marca.nombre, o.titulo, etapa(o.etapa).label, o.empresa?.razonSocial, o.empresa?.ruc, o.contacto?.nombre, o.contacto?.email, o.contacto?.celular,
      o.tipoProceso ? TIPOS_PROCESO[o.tipoProceso] : '', o.moneda, o.monto === null ? '' : Number(o.monto), nombreDe(o.asignado), o.proximaAccion, aFecha(o.proximaAccionAt), o.cierreEstimado?.slice(0, 10), ORIGENES[o.origen], o.motivoPerdida, aFecha(o.createdAt)]));

  return (
    <>
      <PageHead title={propio ? 'Mis oportunidades' : 'Oportunidades'} subtitle={propio ? 'Tus prospectos y ventas en curso, con su monto y próxima acción.' : 'Prospectos y ventas en curso de la marca, con su responsable, monto y próxima acción.'} actions={
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
          <button type="button" className="ax-btn ax-btn--secondary" disabled={lista.length === 0} onClick={exportar} title="Descarga lo que muestran los filtros"><span className="ax-btn__label">Exportar CSV</span></button>
          <button type="button" className="ax-btn ax-btn--primary" onClick={() => setNueva(true)}><span className="ax-btn__label">Nueva oportunidad</span></button>
        </div>
      } />
      {error && <div style={{ marginBlockEnd: 'var(--ax-space-4)' }}><Alerta>{error}</Alerta></div>}
      {ok && <div style={{ marginBlockEnd: 'var(--ax-space-4)' }}><Alerta tono="success">{ok}</Alerta></div>}

      <div>
        <section className="ax-card" aria-label="Oportunidades">
          <div className="ax-card__body">
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'wrap' }}>
              <SelectorAlcance alcance={alcance} />
              <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Estado">
                {(['abiertas', 'cerradas', 'todas'] as const).map((v) => (
                  <button key={v} type="button" role="radio" aria-checked={estado === v} className={`ax-btn ax-btn--sm${estado === v ? ' is-selected' : ''}`} onClick={() => { setEstado(v); setEt(''); }}>{v[0]!.toUpperCase() + v.slice(1)}</button>
                ))}
              </div>
              <Select className="ax-select" aria-label="Etapa" value={et} onChange={(e) => setEt(e.target.value as '' | Etapa)} style={{ maxWidth: 190 }}>
                <option value="">Todas las etapas</option>{ETAPAS.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}
              </Select>
              {veTodo && (
                <Select className="ax-select" aria-label="Responsable" value={asignado} onChange={(e) => setAsignado(e.target.value)} style={{ maxWidth: 200 }}>
                  <option value="">Todos los responsables</option><option value="yo">Mías</option><option value="sin">Sin asignar</option>
                  {asignables.map((u) => <option key={u.id} value={u.id}>{nombreDe(u)}</option>)}
                </Select>
              )}
              <Select className="ax-select" aria-label="Tipo de proceso" value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ maxWidth: 190 }}>
                <option value="">Todos los procesos</option>{Object.entries(TIPOS_PROCESO).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
              <Select className="ax-select" aria-label="Origen" value={origen} onChange={(e) => setOrigen(e.target.value as '' | Origen)} style={{ maxWidth: 210 }}>
                <option value="">Todos los orígenes</option>{(Object.keys(ORIGENES) as Origen[]).map((o) => <option key={o} value={o}>{ORIGENES[o]}</option>)}
              </Select>
              <input type="search" className="ax-input" placeholder="Buscar cliente, empresa, n.º…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" style={{ maxWidth: 260 }} />
            </div>
          </div>
          <div className="ax-table-wrap">
            <table className="ax-table ax-table--hover">
              <thead className="ax-table__head">
                <tr>
                  <th className="ax-table__th" scope="col">Oportunidad</th>
                  <th className="ax-table__th" scope="col">Cliente</th>
                  <th className="ax-table__th" scope="col">Proceso</th>
                  <th className="ax-table__th" scope="col">Etapa</th>
                  <th className="ax-table__th" scope="col">Monto</th>
                  <th className="ax-table__th" scope="col">Responsable</th>
                  <th className="ax-table__th" scope="col">Próxima acción</th>
                  <th className="ax-table__th" scope="col">Origen</th>
                  <th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? <tr><td className="ax-table__td" colSpan={9}>Cargando…</td></tr> : lista.length === 0 ? (
                  <tr><td className="ax-table__td" colSpan={9}style={{ color: 'var(--ax-text-muted)' }}>No hay oportunidades con estos filtros. Las solicitudes de la web (cotizador, cotizaciones, contacto, presupuestos) aparecen aquí solas.</td></tr>
                ) : lista.map((o) => (
                  <tr key={o.id} className="ax-table__row" onClick={() => setAbierta(o.id)} tabIndex={0} onKeyDown={teclaFila(() => setAbierta(o.id))} style={{ cursor: 'pointer' }}>
                    <td className="ax-table__td">
                      <div style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>{o.titulo}</div>
                      <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{o.numero} · {fechaCorta(o.createdAt)}</div>
                      {o.marca && <div style={{ marginBlockStart: 4 }}><EtiquetaMarca m={o.marca} /></div>}
                    </td>
                    <td className="ax-table__td">
                      <div>{o.empresa?.razonSocial ?? o.contacto?.nombre ?? '—'}</div>
                      {o.empresa && o.contacto && <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{o.contacto.nombre}</div>}
                    </td>
                    <td className="ax-table__td" style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>{o.tipoProceso ? TIPOS_PROCESO[o.tipoProceso] : '—'}</td>
                    <td className="ax-table__td"><span className={`ax-badge ax-badge--soft ax-badge--sm ${etapa(o.etapa).badge}`}>{etapa(o.etapa).label}</span></td>
                    <td className="ax-table__td ax-num">{dinero(o.monto, o.moneda)}</td>
                    <td className="ax-table__td"><EtiquetaResponsable u={o.asignado} /></td>
                    <td className="ax-table__td" style={{ fontSize: 'var(--ax-text-sm)', color: vencida(o.proximaAccionAt) ? 'var(--ax-danger-500)' : 'var(--ax-text-muted)' }}>
                      {o.proximaAccion ? <>{o.proximaAccion}{o.proximaAccionAt ? <div style={{ fontSize: 'var(--ax-text-xs)' }}>{fechaCorta(o.proximaAccionAt)}{vencida(o.proximaAccionAt) ? ' · vencida' : ''}</div> : null}</> : '—'}
                    </td>
                    <td className="ax-table__td" style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>{ORIGENES[o.origen]}</td>
                    <td className="ax-table__td" onClick={(e) => e.stopPropagation()}>
                      <div className="ax-cluster" style={{ gap: 'var(--ax-space-1)', flexWrap: 'nowrap', justifyContent: 'flex-end' }}>
                        <BotonIcono icono="edit" label={`Editar ${o.numero}`} onClick={() => setAbierta(o.id)} />
                        {esAdminDe(o.marcaId) && <BotonIcono icono="trash" label={`Eliminar ${o.numero}`} peligro onClick={() => eliminar(o)} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {abierta && <OportunidadPanel id={abierta} onClose={() => setAbierta(null)} onCambio={cargar} />}
      {dialogo}
      {nueva && <NuevaOportunidad key={activeMarcaId} onClose={() => setNueva(false)} onCreada={(id) => { setNueva(false); cargar(); setAbierta(id); }} />}
    </>
  );
}

export default CrmOportunidades;
